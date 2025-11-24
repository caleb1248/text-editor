import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const tabsElement = document.getElementById('tabs')!;

const tabTemplate = document.createElement('li');
tabTemplate.className = 'tab';
tabTemplate.innerHTML = `<span> </span>
<button class="close-btn">
  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px">
    <path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"/>
  </svg>
</button>
`;

export const tabs: Tab[] = [];

export const activeTab = {
  get current() {
    return _activeTab;
  },

  set current(index: number | null) {
    if (_activeTab !== null && tabs[_activeTab]) {
      tabs[_activeTab].setActive(false);
    }
    _activeTab = index;
    if (_activeTab !== null && tabs[_activeTab]) {
      tabs[_activeTab].setActive(true);
    }
  },
};

let _activeTab: number | null = null;

export class Tab {
  private _element: HTMLElement;
  private _displayName: string;
  constructor(
    private _editor: monaco.editor.IStandaloneCodeEditor,
    public model: monaco.editor.ITextModel,
    public handle?: FileSystemFileHandle
  ) {
    this._element = tabTemplate.cloneNode(true) as HTMLElement;

    const spanElement = this._element.firstChild!;
    spanElement.firstChild!.nodeValue = this._displayName =
      handle?.name || model.uri.path.split('/').pop() || 'untitled';

    const closeButton = spanElement.nextSibling?.nextSibling;
    closeButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    this._element.addEventListener('click', this._onClick.bind(this));
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
    if (activeTab.current === currentIndex) {
      if (tabs.length === 0) {
        this._editor.setModel(null);
        activeTab.current = null;
      } else {
        activeTab.current = Math.min(currentIndex, tabs.length - 1);
      }
    } else if (activeTab.current! > currentIndex) {
      activeTab.current!--;
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

  setActive(isActive: boolean) {
    if (isActive) {
      this._element.classList.add('active');
      this._editor.setModel(this.model);
    } else {
      this._element.classList.remove('active');
    }
  }
}
