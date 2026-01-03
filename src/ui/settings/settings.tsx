import './settings.css';
import { clickTarget, registerEvent } from '../../events';
import { themeService } from '../../theme-support/themeService';
import * as monaco from 'monaco-editor-core';
import { openThemeDialog } from './custom-theme-dialog';
import { element } from '../jsx-runtime';
import { themeIdToNameMap } from '@/theme-support/tm-theme-support';
import { getSettings, setSetting } from '@/settings-persistence';

const initialSettings = getSettings();

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

      <SettingControl label="Theme">
        <select
          class="theme-select"
          onchange={(e) => {
            const select = e.target as HTMLSelectElement;
            const selectedTheme = select.value;
            monaco.editor.setTheme(selectedTheme);
            setSetting('theme', selectedTheme);

            // Sometimes changing the theme messes up syntax highlighting. Retokenizing the model fixes this problem.
            for (const model of monaco.editor.getModels()) {
              (model as any).tokenization.resetTokenization();
            }
          }}
        ></select>
      </SettingControl>

      <div>
        Custom themes
        <div style="height:0.75rem"></div>
        <button onclick={openThemeDialog}>Import</button>
      </div>

      <SettingControl label="Font Size">
        <input
          type="number"
          value={initialSettings.fontSize}
          min="6"
          max="100"
          style="width: 150px;"
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
      </SettingControl>
      <SettingControl label="Tab Size">
        <input
          type="number"
          value={initialSettings.tabSize}
          min="1"
          max="16"
          style="width: 150px;"
          oninput={(e) => {
            const parsed = parseInt((e.target as HTMLInputElement).value, 10);
            if (!isNaN(parsed) && parsed > 0) {
              setSetting('tabSize', parsed);
              for (const model of monaco.editor.getModels()) {
                model.updateOptions({ tabSize: parsed });
              }
            }
          }}
        />
      </SettingControl>
    </div>
  </dialog>
) as HTMLDialogElement;

function SettingControl({ label, children }: { label: string; children: JSX.Element }) {
  return (
    <label>
      {label}
      <div style="height:0.75rem"></div>
      {children}
    </label>
  );
}

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
