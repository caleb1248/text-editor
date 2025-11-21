import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const tabsElement = document.getElementById('tabs')!;

const closeButton = document.createElement('button');
closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3">
  <path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"/>
</svg>`;
closeButton.className = 'close-btn';

export const tabs: Tab[] = [];
export let activeTab: number | null = null;

export class Tab {
  private _element: HTMLElement;
  constructor(
    private _editor: monaco.editor.IStandaloneCodeEditor,
    public model: monaco.editor.ITextModel,
    public name: string
  ) {
    this._element = Tab.createElement(name, this._onClick.bind(this), this.close.bind(this));
  }

  public updateName(newName: string) {
    this.name = newName;
    this._element.firstChild!.textContent = newName;
  }

  // Closes the tab
  // If the tab is active, the editor will switch to the tab to the right, if any.
  // If there are no tabs, the editor will set the model to null,
  // which will trigger the editor to hide (see the onDidChangeModel callback in main.ts)
  public close() {
    const currentIndex = tabs.indexOf(this);
    tabs.splice(currentIndex, 1);
    if (this._editor.getModel() === this.model) {
      if (tabs.length === 0) {
        this._editor.setModel(null);
      } else {
        const nextTab = tabs[currentIndex] || tabs[currentIndex - 1];
        this._editor.setModel(nextTab.model);
      }
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
    } else {
      this._element.classList.remove('active');
    }

    return isActive;
  }

  private static createElement(
    name: string,
    onClick: () => void,
    onClose: () => void
  ): HTMLElement {
    const tabElement = document.createElement('div');
    tabElement.className = 'tab';

    const titleElement = document.createElement('span');
    titleElement.innerText = name;
    tabElement.appendChild(titleElement);

    const closeBtn = tabElement.appendChild(closeButton.cloneNode(true) as HTMLElement);
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClose();
    });

    tabElement.addEventListener('click', () => {
      onClick();
    });

    return tabElement;
  }
}
