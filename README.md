# text-editor

A PWA alternative to Caret.

## Why?

ChromeOS ended support for Chrome apps, which includes Caret, a popular text editor for ChromeOS. This project aims to:

- Support newer versions of ChromeOS
- Provide a better editing experience

## Features

- Support for opening and saving files
- Better syntax highlighting for an extensive list of languages. All languages supported by default in VSCode are also supported in this editor, as well as additional languages such as sass, svelte, postcss, stylus, ripple, and vue.
- Enhanced intellisense for HTML, CSS, JavaScript, and Typescript
- Editor tabs
- File creation
- Custom themes
- Offline functionality
- PWA support (installable as an app)

## Features not implemented yet

- Custom language support

## Limitations

- Although the editor looks similar to VS Code, ~~it does not support extensions~~ it does support extensions, but only language definitions and syntax highlighting are supported, and extensions can only be added internally by adding to the source. As of now, there is no way to add extensions through the UI.
- As this editor is intended to serve as a Caret replacement for ChromeOS, there is no plan to support other browsers such as Edge, Firefox and Safari.

## Issues

If you find a bug, please file a Github issue.
Features requests for new languages or improvements are also welcome.

## Development

- Make sure you have the latest version of [`bun`](https://bun.com) installed
- Clone the repo
- run `bun install` to install the required dependencies and compile things

- Run `bun run dev` to start the development server
