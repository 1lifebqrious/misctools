# misctools

Small web tools for learning, play, and everyday utility live in this repository as separate apps under `projects/`.

## Structure

- `projects/`: deployable apps
- `packages/`: shared code when reuse appears across apps
- `AGENTS.md`: repo conventions for future tool work

## Current tools

- `projects/isometric-drawing-tool`: an isometric drawing canvas for children learning 3D sketching on dot grids

## Development

This repo uses a `pnpm` workspace.

```bash
pnpm install
pnpm dev:isometric
```

## Deployment

The repository is organized for static-first deployment:

- GitHub Pages can host any tool that builds to static assets.
- A VPS can serve the same built assets directly with a simple web server.
- If a future tool needs backend behavior, keep that concern isolated to that tool instead of changing the whole repo model.
