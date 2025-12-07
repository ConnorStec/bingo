# AGENTS.md

## Build / Test Commands
- `npm run build` – build production artifacts
- `npm run lint` – run the TypeScript linter (eslint.config.mjs)
- `npm run test` – run all tests with coverage
- `npm run test:watch` – watch for test changes
- `npx jest -t "<test-name>"` – run a single test by name pattern

## Code Style
- **Imports**: absolute paths (e.g., `import { X } from '@/components/X'`)
- **Formatting**: Prettier with 2‑space indentation
- **Types**: use TypeScript interfaces/generics where appropriate
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Errors**: wrap risky code in try/catch, use clear messages
- **React**: function components, hooks, and TypeScript
- **Tailwind**: utility‑first classes, keep class lists concise

## Tools
- `rg` for code searches
- `task` for complex multi‑step operations
- `bash` for system commands
- `read` / `write` for file operations
