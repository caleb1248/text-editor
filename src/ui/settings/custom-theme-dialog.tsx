import { element, state, derive } from '../jsx-runtime';
import * as monaco from 'monaco-editor-core';
import './custom-theme-dialog.css';
import { parse, ParseError } from 'jsonc-parser';
import { convertTheme } from '@/theme-support/theme-converter';
import { themeIdToNameMap } from '@/theme-support/tm-theme-support';
import { addUserTheme, getSettings, setSetting } from '@/settings-persistence';

const themeInputDiv = element(<div id="theme-input-editor"></div>);

const themeName = state('');
const jsonIsValid = state(false);
const confirmDisabled = derive(() => !jsonIsValid.value || themeName.value.trim().length === 0);

confirmDisabled.subscribe((v) => {
  console.log('confirm disabled changed', !jsonIsValid.value, themeName.value.trim().length === 0);
});

console.log('disabled', confirmDisabled.value);

export const themeDialog = element(
  <dialog
    class="dialog"
    id="theme-dialog"
    onclick={(e) => {
      if (e.target === themeDialog) themeDialog.close();
    }}
  >
    <div style="min-height:0;">
      <div style="grid-area: a; display: flex; justify-content: space-between; align-items:center;">
        <h1>Import a custom theme</h1>
        <button class="icon-button" onclick={() => themeDialog.close()} title="Close">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            style="display: block;"
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </button>
      </div>
      <div style="grid-area: b;">
        <ol style="font-size: 1.1rem; line-height: 1.4;">
          <li>Go to VSCode and select a theme of your choice</li>
          <li>
            Press <kbd>Ctrl+Shift+P</kbd> and type{' '}
            <code style="background-color: #7f7f7f22; padding: 2px 4px; border-radius: 4px;">
              Developer: Generate Color Theme From Current Settings
            </code>
          </li>
          <li>A JSON file will appear in the editor. Copy and paste its contents below.</li>
          <li>Enter a theme name</li>
        </ol>
      </div>
      <div style="grid-area: c; display:grid;gap:1rem;grid-template-rows:min-content minmax(0,1fr);height:100%;">
        <div class="bar" style="display:flex; gap:10px;">
          <input
            type="text"
            placeholder="Enter a theme name"
            style="position:relative;padding-right: 2rem;padding-left:1rem;border-radius: 999px;"
            value={themeName}
            oninput={(e) => (themeName.value = (e.target as HTMLInputElement).value)}
          />
          <div id="theme-dialog-buttons">
            <button
              class="confirm"
              disabled={confirmDisabled}
              title={derive(() =>
                confirmDisabled.value ? 'Please enter a valid theme JSON' : 'Confirm'
              )}
              onclick={registerTheme}
            >
              Import
            </button>
          </div>
        </div>
        {themeInputDiv}
      </div>
    </div>
  </dialog>
) as HTMLDialogElement;

const themeInputEditor = monaco.editor.create(themeInputDiv as HTMLDivElement, {
  language: 'jsonc',
  // automaticLayout: true,
  minimap: { enabled: false },
  scrollbar: {
    alwaysConsumeMouseWheel: false,
  },
  scrollBeyondLastLine: false,
});

themeInputEditor.onDidChangeModelContent(() => {
  const value = themeInputEditor.getValue();
  const errors: ParseError[] = [];
  const result = parse(value, errors, { allowTrailingComma: true });
  if (
    !errors.length &&
    result.colors &&
    result.tokenColors &&
    ['light', 'dark', 'hcDark', 'hcLight'].includes(result.type)
  ) {
    console.log('yay?');
    jsonIsValid.value = true;
  } else jsonIsValid.value = false;
  console.log(errors, result);
});

function registerTheme() {
  const themeId = `userTheme-${getSettings().userThemes.currentIdCounter}`;
  themeIdToNameMap.set(themeId, themeName.value);

  const parsedTheme = parse(themeInputEditor.getValue(), [], { allowTrailingComma: true });

  const converted = convertTheme(parsedTheme);
  monaco.editor.defineTheme(themeId, converted);
  monaco.editor.setTheme(themeId);

  for (const model of monaco.editor.getModels()) {
    (model as any).tokenization.resetTokenization();
  }

  addUserTheme(themeId, themeName.value, converted);

  themeDialog.close();
  console.log('Registered theme', themeId);
}

addEventListener('resize', () => {
  themeInputEditor.layout();
});

export function openThemeDialog() {
  themeDialog.showModal();
  themeInputEditor.layout();
}
document.querySelector('#dialogs')!.appendChild(themeDialog);
