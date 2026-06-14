<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# goblox — browser-based Go IDE

## Commands

| Action | Command |
|---|---|
| Dev server | `npm run dev` |
| Typecheck | `npx tsc --noEmit` (or `npm run build`) |
| Lint | `npm run lint` |
| Test (E2E, headless) | `npm test` |
| Test (headed) | `npm run test:headed` |
| Build | `npm run build` |

## Key facts

- **Package manager:** npm (not pnpm/yarn). Lockfile: `package-lock.json`.
- **ESLint v9 flat config** — `eslint.config.mjs`, not `.eslintrc.*`.
- **Tailwind CSS v4** — uses `@tailwindcss/postcss` plugin and `@import "tailwindcss"` in CSS, NOT v3 directives.
- **Prettier** — semicolons, double quotes, trailing commas everywhere, print width 100, tab width 2.
- **`@/*` path alias** maps to project root (e.g. `@/components/EditorPane`).
- **No CI pipeline**, no `.env` files tracked.
- **Playwright E2E only** (no unit tests). Tests rely on a `window.__gobloxSetCode` hook injected by `GoPlayground.tsx`. WASM load can take up to 120s — tests wait for `[data-testid="run-button"]` to become enabled.

## WASM / Go

- The Go interpreter (yaegi) runs as WASM in-browser, no server.
- Source: `go-wasm/main.go` (Go 1.26). Rebuild:
  ```
  cd go-wasm && GOOS=js GOARCH=wasm go build -o ../public/goyae.wasm
  cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" ../public/
  ```
- Output (`goyae.wasm`, `wasm_exec.js`) lives in `public/` and is git-tracked. `wasm_exec.js` is loaded via `<script>` tag; WASM is fetched via streaming in `useWasmLoader` hook.

## Architecture

- **`app/`** — Next.js App Router pages (layout, landing, playground, capabilities)
- **`components/`** — React client components with `"use client"`. Monaco editor loaded from CDN.
- **`hooks/`** — `useWasmLoader` (WASM lifecycle), `useResizable` (split-pane drag)
- **`public/`** — static assets including WASM binary
- **`tests/`** — Playwright spec files

## Restrictions

- **No server-side code.** This is a fully client-side app. No API routes, no server actions, no server components that do I/O.
- **Stdin is pre-filled.** Go's `fmt.Scan` blocks; all input must be provided upfront before clicking Run.
