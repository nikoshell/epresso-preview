# Editor setup

epresso ships editor support for the `.ep` file format (Python frontmatter +
Jinja body + optional `<style>` / `<script>`).

## Neovim / Vim

Syntax highlighting is bundled under `extras/nvim/`. Add it to your runtimepath
once:

```lua
-- ~/.config/nvim/init.lua
vim.opt.rtp:append("/path/to/epresso/extras/nvim")
```

This provides filetype detection, syntax highlighting, indentation, and
ftplugin settings for `.ep` files. See `extras/nvim/README.md` for LazyVim
instructions.

## VS Code

Syntax highlighting and formatting are bundled under `extras/vscode/` (a
zero-dependency extension contributing a TextMate grammar plus a formatter).

Run it from source — open `extras/vscode/` in VS Code and press `F5` to launch an
Extension Development Host — or package it once:

```bash
cd extras/vscode
npx @vscode/vsce package            # → epresso-0.1.0.vsix
code --install-extension epresso-0.1.0.vsix
```

**Formatting** runs the `epresso` CLI, which must be installed and on `PATH`
(or set `epresso.format.executablePath`). Enable format-on-save for the language:

```json
"[epresso]": {
  "editor.formatOnSave": true
}
```

The extension covers Python frontmatter, HTML + Jinja, component tags
(`<Card>`, `<slot/>`, `<Fragment>`), `{expr}` props and the `<style>`/`<script>`
sidecars. See `extras/vscode/README.md` for settings and the scope reference.

## Other editors

The `.ep` grammar ships as standard TextMate JSON at
`extras/vscode/syntaxes/epresso.tmLanguage.json` (plus an injection grammar), so
any editor that reads `.tmLanguage.json` — Sublime Text, TextMate, IntelliJ,
Zed, … — can reuse it directly. The `.ep` format combines Python (frontmatter)
with Jinja/HTML (body); pointing such an editor at the TextMate grammar (or at a
Python + Jinja/HTML grammar) gives a close approximation.
