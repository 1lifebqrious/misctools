# AGENTS

## Repo conventions

- Each tool lives in its own folder under `projects/`.
- Default to static-first deployments that can run on GitHub Pages and a basic VPS.
- Use TypeScript for application code.
- Interactive tools must support accessibility, touch input, and tablet-first responsiveness.
- Do not target phone layouts unless the tool explicitly requires them.
- Introduce shared code under `packages/` only when duplication is real.

## Working style

- Keep document models and geometry logic framework-agnostic when possible.
- Prefer small, composable modules instead of one large editor file.
- Add tests for geometry, interaction state, and critical user flows.
