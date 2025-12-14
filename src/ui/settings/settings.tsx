import './settings.css';
import { clickTarget, registerEvent } from '../../events';
import { themeService } from '../../theme-support/themeService';
import * as monaco from 'monaco-editor-core';
import { openThemeDialog } from './custom-theme-dialog';
import { element } from '../jsx-runtime';
import { themeIdToNameMap } from '@/theme-support/tm-theme-support';
import { setSetting } from '@/settings-persistence';

const settingsUI = element(
  <dialog
    id="settings-container"
    class="dialog"
    onclick={(e) => {
      if (e.target === e.currentTarget) {
        settingsUI.close();
      }
    }}
  >
    <div>
      <h1>Settings</h1>
      <label>
        Font size
        <input
          type="number"
          oninput={(e) => {
            const parsed = parseInt((e.target as HTMLInputElement).value, 10);
            if (!isNaN(parsed) && parsed > 0) {
              setSetting('fontSize', parsed);
              for (const editor of monaco.editor.getEditors()) {
                editor.updateOptions({ fontSize: parsed });
              }
            }
          }}
        />
      </label>
      <label>
        Theme
        <div style="height:0.75rem"></div>
        <select
          class="theme-select"
          onchange={(e) => {
            const select = e.target as HTMLSelectElement;
            const selectedTheme = select.value;
            monaco.editor.setTheme(selectedTheme);

            setSetting('theme', selectedTheme);
          }}
        ></select>
      </label>
      <div>
        Custom themes
        <div style="height:0.75rem"></div>
        <button onclick={openThemeDialog}>Import</button>
      </div>
    </div>
  </dialog>
) as HTMLDialogElement;
document.querySelector('#dialogs')!.appendChild(settingsUI);

const themeSelector = settingsUI.querySelector<HTMLSelectElement>('.theme-select')!;

function updateThemeList() {
  themeSelector.innerHTML = Array.from(themeIdToNameMap.keys())
    .map((theme) => `<option value="${theme}">${themeIdToNameMap.get(theme)}</option>`)
    .join('');

  themeSelector.value = themeService.getColorTheme().themeName;
}

updateThemeList();

registerEvent(() => {
  settingsUI.showModal();
  updateThemeList();
}, [clickTarget('preferences.open')]);

themeService.onDidColorThemeChange(() => {
  updateThemeList();
});
