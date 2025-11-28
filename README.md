# text-editor

A PWA alternative to Caret.

## Why?

ChromeOS is ending support for Chrome apps, which includes Caret, a popular text editor for ChromeOS. This project aims to provide a supported alternative with improvements.

## Features

- Better syntax highlighting.
- Intellisense for HTML, CSS, JavaScript, and Typescript.
- Support for opening and saving files using the File System Access API.
- Editor tabs
- File creation

## Features not implemented yet

- Syntax highlighting for more languages
- Custom language support
- Custom themes
- Offline functionality
- Web manifest (PWA support)

## Limitations

- Although the editor looks similar to the VS Code editor, ~~it does not support extensions~~ it does support extensions, but only language definitions and syntax highlighting are supported, and extensions can only be added internally by adding to the source. As of now, there is no way to add extensions through the UI.
- As this editor is intended to serve as a Caret replacement, support for Firefox and Safari is not planned.
