# migdalia-art

Migdalia Art website source code — static HTML, CSS, and JavaScript for [GitHub Pages](https://pages.github.com/).

## Structure

```
├── index.html      # Entry page (served at site root)
├── css/styles.css
├── js/main.js
└── .nojekyll       # Disables Jekyll so plain static files deploy as-is
```

## GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment**
3. Source: **Deploy from a branch**
4. Branch: **main** (or your default branch), folder: **/ (root)**

For a project site (`username.github.io/repo-name/`), use relative paths for assets (already set up). For a user/org site (`username.github.io` repo), the same files work at the domain root.

## Local preview

```bash
# Python 3
python3 -m http.server 8000
# Then open http://localhost:8000
```

Or use any static file server / Live Server extension in your editor.
