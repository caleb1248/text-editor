import { element, state, type State, derive, effect } from '@/ui/jsx-runtime';
import './tabs.css';
import * as monaco from 'monaco-editor-core';

const tabsElement = document.getElementById('tabs')!;

const createTab = (
  label: string,
  state: { saved: State<boolean>; active: State<boolean> },
  onClose: () => void
) =>
  element(
    <li
      class={derive(
        () =>
          'tab ' + (state.saved.value ? 'saved' : 'unsaved') + (state.active.value ? ' active' : '')
      )}
    >
      <span>{label}</span>
      <button
        class="close-btn"
        onclick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px">
          <path
            class="icon-x"
            d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"
          />
          <path
            class="icon-unsaved"
            d="M 480 -290 A 190 190 0 1 0 480 -670 A 190 190 0 1 0 480 -290"
          />
        </svg>
      </button>
    </li>
  );

export const tabs: Tab[] = [];

export const activeTab = state<number | null>(null);

export class Tab {
  private _element: HTMLElement;
  private _displayName: string;
  public saved: State<boolean>;
  public active: State<boolean>;

  constructor(
    private _editor: monaco.editor.IStandaloneCodeEditor,
    public model: monaco.editor.ITextModel,
    public handle?: FileSystemFileHandle
  ) {
    this.saved = state(true);
    this.active = derive(() => activeTab.value !== null && tabs[activeTab.value] === this);
    this._displayName = handle?.name || model.uri.path.split('/').pop() || 'untitled';

    this._element = createTab(
      this._displayName,
      { saved: this.saved, active: this.active },
      this.close.bind(this)
    ) as HTMLElement;
    this._element.addEventListener('click', this._onClick.bind(this));

    model.onDidChangeContent(() => {
      this.saved.value = false;
    });
  }

  public get displayName() {
    return this._displayName;
  }

  public set displayName(name: string) {
    this._displayName = name;
    this._element.firstChild!.firstChild!.nodeValue = name;
  }

  // Closes the tab
  // If the tab is active, the editor will switch to the tab to the right, if any.
  // If there are no tabs, the editor will set the model to null,
  // which will trigger the editor to hide (see the onDidChangeModel callback in main.ts)
  public close() {
    const currentIndex = tabs.indexOf(this);
    tabs.splice(currentIndex, 1);
    if (activeTab.value === currentIndex) {
      if (tabs.length === 0) {
        this._editor.setModel(null);
        activeTab.value = null;
      } else {
        activeTab.value = Math.min(currentIndex, tabs.length - 1);
      }
    } else if (activeTab.value! > currentIndex) {
      activeTab.value!--;
    }

    tabsElement.removeChild(this._element);
  }

  /**
   * Inserts the tab at a given index
   */
  public insert(index: number) {
    tabs.splice(index, 0, this);
    if (index >= tabsElement.children.length) {
      tabsElement.appendChild(this._element);
    } else {
      tabsElement.insertBefore(this._element, tabsElement.children[index]);
    }
  }

  private _onClick() {
    this._editor.setModel(this.model);
  }
}
