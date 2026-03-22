# Isometric Drawing Tool

An isometric dot-grid drawing app for children learning how 3D shapes are constructed from straight isometric lines and colored faces.

## Audience

- Children using tablets or desktops
- Parents and teachers who want a simple drawing surface without app clutter

## Supported devices

- Desktop browsers
- iPad and other tablets with touch support
- Phone-sized viewports are intentionally blocked

## V1 scope

- Infinite-feeling isometric canvas with pan and bounded zoom
- Pen tool constrained to snapped isometric lines
- Eraser tool for line removal
- Rectangle and lasso multi-selection for lines and filled faces
- Face fill tool for closed shapes
- Color palette with opacity from 0 to 100

## Architecture

- `src/lib/`: geometry, hit-testing, face detection, rendering helpers
- `src/store/`: editor state and actions
- `src/components/`: toolbar, canvas, accessibility UI
- `src/`: React shell, types, constants, styling

The document model is independent from React so future save/export features can reuse the same core structures.

## Commands

```bash
pnpm install
pnpm --filter @misctools/isometric-drawing-tool dev
pnpm --filter @misctools/isometric-drawing-tool build
pnpm --filter @misctools/isometric-drawing-tool build:pages
pnpm --filter @misctools/isometric-drawing-tool test
pnpm --filter @misctools/isometric-drawing-tool test:e2e
```

## Deployment URL

- GitHub Pages path: `https://www.dobetterwithai.com/isometric-drawing-tool/`

The normal `build` command keeps local preview behavior unchanged. The `build:pages` command uses the GitHub Pages asset base path so the app works when served from the repo subdirectory.

## Deferred

- Save/load
- Export
- Collaboration
- Undo/redo history persistence
