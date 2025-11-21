# Repository Guidelines

## Project Structure & Module Organization
App Router pages, layouts, and route handlers live in `src/app`. Shared UI and form primitives stay in `src/components`; React contexts in `src/contexts`. API clients, React Query hooks, and Zod schemas belong to `src/lib`. Mock data and MSW handlers stay under `src/mocks` and tie to `NEXT_PUBLIC_USE_MOCKS`. Create feature folders that mirror dashboard areas (surat masuk, surat keluar, reports) so table configs, filters, and services remain colocated.

## Build, Test, and Development Commands
- `npm install` installs dependencies; rerun after schema-heavy updates.
- `npm run dev` starts the Next.js dev server and auto-registers MSW when mocks are enabled.
- `npm run build` compiles the production bundle; pair with `npm run start` to verify before releasing.
- `npm run lint` runs ESLint (Next + TypeScript).
- `npx jest --watch` and `npx playwright test --project=chromium` run unit/component and end-to-end suites.

## Coding Style & Naming Conventions
Use TypeScript, ES modules, and 2-space indentation. `camelCase` variables/hooks, `PascalCase` components, and `kebab-case` file names unless Next.js demands otherwise. Favor function components with React Query for data and `react-hook-form` + Zod for forms. Keep enums and validation in `src/lib/schemas` to sync mocks, clients, and UI. Tailwind utilities are standard; extract reusable recipes into helpers like `src/lib/utils.ts`. Run `npm run lint -- --fix` or rely on your editor ESLint integration before committing.

## Testing Guidelines
Component tests rely on Jest + Testing Library; name files `<Component>.test.tsx` beside the source. Mock HTTP calls with MSW instead of stubbing `fetch`. Target ≥80% coverage for authentication, surat CRUD, and reporting filters. Use Playwright for smoke flows (login, filter combinations, surat export) via `npx playwright test --project=chromium`.

## Commit & Pull Request Guidelines
History follows `<type>: <summary>` (`refactor: dashboard data consume api`, `feat: add sorting functionality`). Keep subjects imperative and under ~60 characters. Every PR should state purpose, linked issues, screenshots or GIFs for UI deltas, and confirmation that `npm run lint`, Jest, and Playwright passed. Document any new env vars or migrations (e.g., updating `NEXT_PUBLIC_API_BASE_URL`) in the PR description.

## Security & Configuration Tips
Store secrets inside `.env.local`; keep `.env.production.example` updated. Enable mocks with `NEXT_PUBLIC_USE_MOCKS=true`; switch to the Laravel backend by setting it to `false` plus `NEXT_PUBLIC_API_BASE_URL=https://api.example.com`. After toggling, clear service worker caches (hard refresh or unregister) so stale MSW handlers do not intercept live calls.
