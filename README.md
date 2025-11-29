# text-editor

A PWA alternative to Caret-T.

## Why?

ChromeOS is ending support for Chrome apps, which includes Caret, a popular text editor for ChromeOS. This project aims to provide a supported alternative with improvements.

## Features

- Better syntax highlighting.
- Enhanced intellisense for HTML, CSS, JavaScript, and Typescript.
- Support for opening and saving files using the File System Access API.
- Editor tabs
- File creation
- Offline functionality

## Features not implemented yet

- Syntax highlighting for more languages
- Custom language support
- Custom themes
- Web manifest (PWA support)

## Limitations

- Although the editor looks similar to VS Code, ~~it does not support extensions~~ it does support extensions, but only language definitions and syntax highlighting are supported, and extensions can only be added internally by adding to the source. As of now, there is no way to add extensions through the UI.
- As this editor is intended to serve as a Caret replacement for ChromeOS, support for Firefox and Safari is not planned.

## Development

- Make sure you have [`bun`](https://bun.com) installed
- Clone the repo
- Compile the workers and language extensions

```bash
bun run compile-workers
bun run compile-extensions
```

- Run `bun run dev` to start the development server
