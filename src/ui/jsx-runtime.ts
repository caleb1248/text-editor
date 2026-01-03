declare global {
  namespace JSX {
    type IntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: {
        children?: ChildType | ChildType[];
      } & Partial<
        Pick<
          HTMLElementTagNameMap[K],
          Exclude<keyof HTMLElementTagNameMap[K], "children"> & `on${string}`
        >
      > & { [key: string]: any };
    } & {
      [K in keyof SVGElementTagNameMap]: {
        children?: ChildType | ChildType[];
      } & Partial<
        Pick<
          SVGElementTagNameMap[K],
          Exclude<keyof SVGElementTagNameMap[K], "children"> & `on${string}`
        >
      > & { [key: string]: any };
    };

    type Element = {
      tag: string;
      ns: string | null;
      props?: {
        children?: ChildType | ChildType[];
        [key: string]: any;
      };
    };
  }
}

const stateIdentifier = Symbol("state");

const noop = () => {};

type MaybeState<T> = T | State<T>;

type ChildType = MaybeState<JSX.Element | Node | string>;

function isState<T>(obj: any): obj is State<T> {
  return obj && obj[stateIdentifier] === true;
}

export function element(jsxElement: JSX.Element, parentNamespace?: string | null): Element {
  const ns = jsxElement.ns ?? parentNamespace;
  const elem: Element = ns
    ? document.createElementNS(ns, jsxElement.tag)
    : document.createElement(jsxElement.tag);

  const { props } = jsxElement;

  if (props) {
    for (const key in props) {
      const value = props[key];

      if (key === "children") {
        function convertChild(child: string | Node | JSX.Element): Node {
          if (typeof child === "string") {
            return document.createTextNode(child);
          } else if (child instanceof Node) {
            return child;
          } else {
            return element(child, elem.namespaceURI);
          }
        }

        for (const child of value) {
          if (isState<string | Node | JSX.Element>(child)) {
            const converted = elem.appendChild(convertChild(child.value));
            child.subscribe((newValue) => {
              const newChild = convertChild(newValue);
              elem.replaceChild(newChild, converted);
            });
          } else if (Array.isArray(child)) {
            for (const nestedChild of child) {
              elem.appendChild(convertChild(nestedChild));
            }
          } else {
            elem.appendChild(convertChild(child));
          }
        }
        continue;
      }

      if (key.startsWith("on") && typeof value === "function") {
        const eventName = key.slice(2).toLowerCase();
        elem.addEventListener(eventName, value as EventListener);
        continue;
      }

      if (isState(value)) {
        value.subscribe((newValue: unknown) => {
          if (newValue === true) {
            elem.setAttribute(key, "");
          } else if (newValue === false) {
            elem.removeAttribute(key);
          } else if (newValue || newValue === "") {
            elem.setAttribute(key, newValue.toString());
          }
        }, true);
        continue;
      }

      if (value === true) {
        elem.setAttribute(key, "");
      } else if (value || value === "") {
        elem.setAttribute(key, value.toString());
      }
    }
  }

  return elem;
}

function toArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

export function jsx(tag: string | Function, props: any, ...children: ChildType[]): JSX.Element {
  const _props = props ? { ...props } : {};

  _props.children = toArray(props?.children ?? children);

  if (typeof tag === "function") return tag(_props);

  return {
    tag: tag as string,
    props: _props,
    ns: props?.xmlns ?? (tag === "svg" ? "http://www.w3.org/2000/svg" : null),
  } as JSX.Element;
}

interface Disposer {
  (): void;
}

export interface State<T> {
  [stateIdentifier]: true;
  value: T;
  subscribe(listener: (newValue: T) => void, initial?: boolean): Disposer;
  onDispose(listener: () => void): void;
  dispose: Disposer;
}

class StateImpl<T> implements State<T> {
  [stateIdentifier] = true as const;
  private _listeners: Array<(newValue: T) => void> = [];
  private _disposeListeners: Array<() => void> = [];
  private _disposed = false;

  dispose() {
    if (this._disposed) return;

    for (const listener of this._disposeListeners) listener();

    this._listeners.length = 0;
    this._disposeListeners.length = 0;
    this._disposed = true;
  }

  onDispose(listener: () => void) {
    if (this._disposed) return;
    this._disposeListeners.push(listener);
  }

  public get value() {
    addDeriveDependency?.(this);
    addEffectDependency?.(this);
    return this._value;
  }

  public set value(newValue: T) {
    if (this._value !== newValue) {
      this._value = newValue;
      for (const listener of this._listeners) listener(newValue);
    }
  }
  private _value: T;
  constructor(value: T) {
    this._value = value;
  }

  subscribe(listener: (newValue: T) => void, initial?: boolean) {
    if (this._disposed) return noop;
    this._listeners.push(listener);
    if (initial) listener(this.value);
    return () => {
      const index = this._listeners.indexOf(listener);
      if (index > -1) {
        this._listeners.splice(index, 1);
      }
    };
  }
}

export const state = <T>(initialValue: T): State<T> => {
  return new StateImpl<T>(initialValue);
};

let addDeriveDependency: ((dep: State<any>) => void) | null = null;

export function derive<T>(fn: () => T): State<T> {
  const deps = new Set<State<any>>();

  function addDep(dep: State<any>) {
    if (!deps.has(dep)) {
      deps.add(dep);
    }
  }

  addDeriveDependency = addDep;
  const computedState = state(fn());
  addDeriveDependency = null;

  function onDepChange() {
    addDeriveDependency = addDep;
    computedState.value = fn();
    addDeriveDependency = null;
  }

  const disposers: Disposer[] = [];

  for (const dep of deps) {
    disposers.push(dep.subscribe(onDepChange));

    dep.onDispose(() => {
      if (deps.has(dep)) deps.delete(dep);
      if (deps.size === 0) computedState.dispose();
    });
  }

  computedState.onDispose(() => {
    for (const dispose of disposers) dispose();
  });

  return computedState;
}

let addEffectDependency: ((dep: State<any>) => void) | null = null;

export function effect(fn: () => void): Disposer {
  const deps: State<any>[] = [];
  addEffectDependency = (dep: State<any>) => deps.push(dep);
  fn();
  addEffectDependency = null;
  const disposers = deps.map((dep) => dep.subscribe(() => fn()));

  return () => {
    for (const dispose of disposers) dispose();
  };
}

export const jsxs = jsx;
