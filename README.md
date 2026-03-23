# misctools

[![Deploy GitHub Pages](https://github.com/1lifebqrious/misctools/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/1lifebqrious/misctools/actions/workflows/deploy-pages.yml)

Small web tools for learning, play, and everyday utility live in this repository as separate apps under `projects/`.

## Structure

- `projects/`: deployable apps
- `packages/`: shared code when reuse appears across apps
- `AGENTS.md`: repo conventions for future tool work

## Current tools

- `projects/isometric-drawing-tool`: an isometric drawing canvas for children learning 3D sketching on dot grids
- `projects/algebra-balance-lab`: a graph-first algebra lab for linear equations and intersections

## Development

This repo uses a `pnpm` workspace.

```bash
pnpm install
pnpm dev:isometric
pnpm dev:algebra
```

## GitHub Pages

This repo is prepared to publish to GitHub Pages at:

- Root site: `https://www.dobetterwithai.com/`
- Isometric tool: `https://www.dobetterwithai.com/isometric-drawing-tool/`
- Algebra lab: `https://www.dobetterwithai.com/algebra-balance-lab/`

The Pages build creates a landing page at the site root and places the app under its own subpath.

```bash
pnpm build:pages
```

That command generates the final static site tree in `dist/`.

## First-time GitHub setup

1. Open the repository settings in GitHub.
2. Go to `Pages`.
3. Set the source to `GitHub Actions`.
4. Push to `main` or rerun the Pages workflow.
5. Verify the root site and the isometric tool subpath both load correctly.

## Deployment

The repository is organized for static-first deployment:

- GitHub Pages can host any tool that builds to static assets.
- A VPS can serve the same built assets directly with a simple web server.
- If a future tool needs backend behavior, keep that concern isolated to that tool instead of changing the whole repo model.

GitHub Pages deployment is handled by the workflow in `.github/workflows/deploy-pages.yml`.
