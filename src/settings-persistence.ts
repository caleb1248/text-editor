import type { editor } from 'monaco-editor-core';

interface Settings {
  theme: string;
  userThemes: {
    themes: { id: string; name: string; data: editor.IStandaloneThemeData }[];
    currentIdCounter: number;
  };
  tabSize: number;
  fontSize: number;
}

const defaultSettings: Settings = {
  theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-plus' : 'light-plus',
  userThemes: { themes: [], currentIdCounter: 0 },
  tabSize: 2,
  fontSize: 14,
};

export function getSettings(): Settings {
  const settingsJson = localStorage.getItem('userSettings');
  if (settingsJson) return JSON.parse(settingsJson);
  return defaultSettings;
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  const settings = getSettings();
  settings[key] = value;
  localStorage.setItem('userSettings', JSON.stringify(settings));
}

export function addUserTheme(id: string, name: string, data: editor.IStandaloneThemeData) {
  const settings = getSettings();
  settings.userThemes.themes.push({ id, name, data });
  settings.userThemes.currentIdCounter++;
  settings.theme = id;
  localStorage.setItem('userSettings', JSON.stringify(settings));
}
