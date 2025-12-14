const stateIdentifier = Symbol('state');

type MaybeState<T> = T | State<T>;

type ChildType = JSX.Element | Element | MaybeState<string>;

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

      if (key === 'children') {
        for (const child of value) {
          console.log(child instanceof SVGElement);
          if (typeof child === 'string') {
            elem.appendChild(document.createTextNode(child));
          } else if (isState<string>(child)) {
            const textNode = document.createTextNode(child.value);
            elem.appendChild(textNode);

            child.subscribe((newValue) => {
              textNode.nodeValue = newValue;
            });
          } else if (child instanceof Element) {
            console.log('Appending child Element', child);
            elem.appendChild(child);
          } else {
            elem.appendChild(element(child, elem.namespaceURI));
          }
        }
        continue;
      }

      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        elem.addEventListener(eventName, value as EventListener);
        continue;
      }

      if (isState(value)) {
        value.subscribe((newValue: unknown) => {
          if (newValue === true) {
            elem.setAttribute(key, '');
          } else if (newValue === false) {
            elem.removeAttribute(key);
          } else if (newValue || newValue === '') {
            elem.setAttribute(key, newValue.toString());
          }
        }, true);
        continue;
      }

      if (value === true) {
        elem.setAttribute(key, '');
      } else if (value || value === '') {
        elem.setAttribute(key, value.toString());
      }
    }
  }

  return elem;
}

function toArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

export function jsx(tag: string, props: any, ...children: ChildType[]): JSX.Element {
  const _props = props ? { ...props } : {};

  _props.children = toArray(props?.children ?? children);

  return {
    tag: tag as string,
    props: _props,
    ns: props?.xmlns ?? (tag === 'svg' ? 'http://www.w3.org/2000/svg' : null),
  } as JSX.Element;
}

class State<T> {
  [stateIdentifier] = true as const;
  private _listeners: Array<(newValue: T) => void> = [];
  public get value() {
    return this._value;
  }
  public set value(newValue: T) {
    if (this._value !== newValue) {
      this._value = newValue;
      this._listeners.forEach((listener) => listener(newValue));
    }
  }
  private _value: T;
  constructor(value: T) {
    this._value = value;
  }

  subscribe(listener: (newValue: T) => void, initial?: boolean) {
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

export const state = <T>(initialValue: T) => {
  return new State<T>(initialValue);
};

export function derive<T>(fn: () => T, ...deps: State<any>[]): State<T> {
  const computedState = new State<T>(fn());

  for (const dep of deps) dep.subscribe(() => (computedState.value = fn()));

  return computedState;
}

declare global {
  namespace JSX {
    type IntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: {
        children?: ChildType | ChildType[];
      } & Partial<
        Pick<
          HTMLElementTagNameMap[K],
          Exclude<keyof HTMLElementTagNameMap[K], 'children'> & `on${string}`
        >
      > & { [key: string]: any };
    } & {
      [K in keyof SVGElementTagNameMap]: {
        children?: ChildType | ChildType[];
      } & Partial<
        Pick<
          SVGElementTagNameMap[K],
          Exclude<keyof SVGElementTagNameMap[K], 'children'> & `on${string}`
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

export const jsxs = jsx;
