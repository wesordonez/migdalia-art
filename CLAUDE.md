# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static website for Migdalia Art, deployed via GitHub Pages from the repo root (main branch). No build step, no package manager, no framework — plain HTML/CSS/JS served as-is. `.nojekyll` is present so files deploy verbatim without Jekyll processing.

## Local preview

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Architecture notes

- `index.html` is the entry point; CSS lives in `css/`, JS in `js/`. Asset paths are relative so the site works both at a user/org root and at `username.github.io/migdalia-art/`.
- Keep it dependency-free unless explicitly asked — adding a bundler/framework would require reconfiguring the GitHub Pages deployment.
