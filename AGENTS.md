<!-- BEGIN:nextjs-agent-rules -->
Next.js 16 has breaking changes from the version in your training data. Read `node_modules/next/dist/docs/01-app/` before writing framework code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SportTracker — PWA для учёта тренировок

## Stack

- **Next.js 16** (App Router) + **TypeScript 6**
- **SCSS Modules** (CSS modules with Sass) — `globals.scss` for resets/variables, `*.module.scss` per component
- Black-and-white scheme, `border-radius: 0` everywhere
- **Zustand** with `persist` middleware → localStorage key `training-storage`
- **uuid** (`v4`) for all entity IDs
- Custom `Button`, `Input`, `Card` in `src/components/ui/` (shadcn/ui style)

## Commands

| Command | What |
|---|---|
| `npm run dev` | Dev server → `http://localhost:3000` |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint (flat config, `eslint-config-next/core-web-vitals`) |

No test framework exists.

## Architecture

- **Pages** (App Router): `/` (start), `/training`, `/history`. Manifest at `src/app/manifest.ts` → `/manifest.webmanifest`
- **No API routes, no server actions, no database** — fully client-side
- **State**: single Zustand store (`src/lib/store.ts`), persists to `localStorage`
- **PWA**: Service Worker at `public/sw.js` (hybrid: network-first for navigation, cache-first for static assets)
- **Path alias**: `@/*` → `./src/*`
- **On `finishTraining()`**: exercises with empty names (`name.trim() === ''`) are silently filtered out from history

## Quirks

- TypeScript 6 is in use — verify compatibility before adopting new TS features
- `zod`, `react-hook-form`, `@hookform/resolvers` are installed but reserved for future use
- `app_backup/` is excluded from TS compilation (`tsconfig.json` exclude)
