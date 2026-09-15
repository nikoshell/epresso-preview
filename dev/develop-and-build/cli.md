# CLI

epresso ships a single `epresso` command with subcommands:

| Command | Description |
|---------|-------------|
| `epresso init` | Scaffold a blank project |
| `epresso new [template] [dest]` | Scaffold a project (interactive, or pass a template/theme/git URL/directory) |
| `epresso dev` | Development server with live reload |
| `epresso build` | Deterministic + incremental production build |
| `epresso preview` | Build then serve `dist/` (production preview) |
| `epresso docs` | Build + serve the documentation (port 4321) |
| `epresso clean` | Remove `dist/` and the build cache |
| `epresso check` | Validate config + content, list routes |
| `epresso fmt` | Format `.ep` files to the canonical section structure |
| `epresso inspect` | Inspect the build graph (routes + content → route edges) |
| `epresso deploy` | Build and deploy (GitHub Pages by default) |
| `epresso version` | Print the version |

## `epresso fmt`

Formats `.ep` files to the canonical structure: **frontmatter → HTML body →
`<script>` → `<style>`**, each section separated by a single blank line, plus
basic whitespace hygiene (strip trailing whitespace, ensure one trailing newline).
Section *content* (markup, CSS, JS, frontmatter Python) is preserved verbatim.

```bash
epresso fmt                 # format all .ep under the current directory
epresso fmt components/ pages/      # format specific files/dirs
epresso fmt --check .       # report files that would change; don't write (exit 1 if any)
epresso fmt --expand .      # reflow the body: one child per line (no extra deps)
epresso fmt --full .        # also format section contents (frontmatter/HTML/CSS/JS)
```

Layouts (`{% extends %}` or a document shell with `<html>/<head>/<body>`) are
only whitespace-normalised — their `<style>`/`<script>` are positional and never
reordered. `--check` is CI-friendly: it exits non-zero when any file needs
formatting.

### `epresso fmt --expand`

`--expand` reflows the HTML body: an element whose content is **markup only**
(no literal text) gets one child per line, Jinja blocks spread across lines, and
a lone interpolation moves onto its own line. No blank lines are added.

```epresso
---
---
<div class="card">
    {% if props.icon %}<Icon name={tone.icon} />{% endif %}
    <p>{{ props.title }}</p>
</div>
```

becomes

```epresso
---
---
<div class="card">
    {% if props.icon %}
        <Icon name={tone.icon} />
    {% endif %}
    <p>
        {{ props.title }}
    </p>
</div>
```

Elements that contain **literal text** (`<p>Hello <b>world</b></p>`) are left
alone, so prose keeps its line wrapping, and `<pre>` / `<script>` / `{% raw %}`
bodies are never re-indented. Siblings that the author glued together with no
whitespace are kept glued, because that whitespace is significant.

This changes the whitespace in the *rendered* HTML — harmless inside block and
flex/grid containers, but visible between inline elements. It is therefore
off by default; `--full` implies it. The reflow is conservative: if the result
would change any non-whitespace character, the file is left untouched.

### `epresso fmt --full`

`--full` additionally formats each section's **content** by reusing dedicated
tools, shipped as the optional `[fmt]` extra:

| Section | Tool |
|---------|------|
| frontmatter (Python) | `ruff format` |
| HTML body | `--expand` reflow + `djhtml` |
| CSS (`<style>`) | `cssbeautifier` |
| JS (`<script>`) | `jsbeautifier` |

`--full` implies `--expand`.

```bash
pip install -e .[fmt]
epresso fmt --full .
```

Jinja (`{{ }}`/`{% %}`/`{# #}`) is preserved throughout. If the `[fmt]` deps are
missing, `--full` formats whatever is available and skips the rest.
