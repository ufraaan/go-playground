# Go Playground

A Go IDE that runs entirely in the browser — no server-side compilation needed.

Built with [Next.js](https://nextjs.org/), [Monaco Editor](https://microsoft.github.io/monaco-editor/), and [Yaegi](https://github.com/traefik/yaegi) (a Go interpreter compiled to WebAssembly).

## How it works

- **Monaco Editor** provides code editing with Go syntax highlighting
- **Yaegi** runs as WebAssembly in the browser, interpreting Go code client-side
- No API calls, no serverless functions — everything happens in your browser

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

No special configuration needed — the WASM binary is served as a static asset.

## Project structure

```
app/              - Next.js App Router pages
components/       - React components (GoPlayground)
go-wasm/          - Go source for the WASM interpreter
public/           - Static assets (WASM binary, wasm_exec.js)
```

## Building the WASM binary (optional)

Requires Go 1.21+:

```bash
cd go-wasm
GOOS=js GOARCH=wasm go build -o ../public/goyae.wasm .
```

## Limitations

- Yaegi is a Go interpreter, not a full compiler. Most standard library packages work, but some features may differ from `go build`.
- The WASM binary is ~38MB (8MB gzipped). It's cached by the browser after the first load.
