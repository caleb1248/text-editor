/// <reference path="types/services.d.ts" />
import { IQuickInputService } from 'monaco-editor-core/esm/vs/platform/quickinput/common/quickInput';
import { ILanguageService } from 'monaco-editor-core/esm/vs/editor/common/languages/language';
import * as monaco from 'monaco-editor-core';

export function addLanguageSelection(editor: monaco.editor.IStandaloneCodeEditor) {
  const selectLanguageCommand = editor.addCommand(0, (accessor, { model, resolve, reject }) => {
    let quickInputService = accessor.get(IQuickInputService);
    let languageService = accessor.get(ILanguageService);

    const languages = languageService._registry._languages;

    const picks = Object.entries(languageService._registry._nameMap).map(
      ([languageName, languageId]: any) => {
        const language = languages[languageId];
        const extensions = language.extensions.join(' ');
        let description: string;
        if (languages[model.getLanguageId()].name === languageName) {
          description = `(${languageName}) - Configured Language`;
        } else {
          description = languageId;
        }

        return {
          id: languageId,
          label: languageName,
          meta: extensions,
          description,
        };
      }
    );

    quickInputService.pick(picks).then(resolve, reject);
  })!;

  editor.addAction({
    id: 'model.changeLanguage',
    label: 'Set Current File Language',

    async run(editor, ...args) {
      const model = editor.getModel();
      if (!model) return;

      const result = await new Promise<{ id: string }>((resolve, reject) => {
        editor.trigger('', selectLanguageCommand, { model, resolve, reject });
      });

      if (!result) return;

      monaco.editor.setModelLanguage(model, result.id);
    },
  });
}
