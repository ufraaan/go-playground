import Link from "next/link";

const works = [
  { label: "Algorithms & data structures", detail: "Any pure Go code" },
  { label: "Goroutines & channels", detail: "Cooperatively scheduled, work fine" },

  { label: "JSON / XML / CSV / base64 / hex / gob", detail: "encoding/json, encoding/xml, encoding/csv, etc." },
  { label: "regexp / strings / bytes / strconv", detail: "Full stdlib string and text processing" },
  { label: "math / math/big / math/rand / crypto/*", detail: "sha256, aes, rsa, ecdsa, md5, and more" },
  { label: "text/template / html/template", detail: "Templating engines" },
  { label: "time / sort / slices / maps", detail: "Utility packages" },
  { label: "container/heap / container/list / container/ring", detail: "Data structure implementations" },
  { label: "In-memory file I/O", detail: "os.Open, os.Create on synthetic WASM file system" },
  { label: "sync (Mutex, WaitGroup, Once, Map, Pool, Cond)", detail: "Concurrency primitives" },
  { label: "context", detail: "Context propagation and cancellation" },
  { label: "reflect", detail: "TypeOf, ValueOf, DeepEqual (limited)" },
];

const doesntWork = [
  { label: "net.Listen / TCP servers", detail: "Go WASM can't bind sockets" },
  { label: "os/exec", detail: "No subprocesses in the browser" },
  { label: "unsafe / syscall / CGo", detail: "Platform-specific / ffi not available" },
  { label: "Persistent file storage", detail: "WASM file system is ephemeral (lost on refresh)" },
  { label: "net low-level socket ops", detail: "net/http client also not available — async fetch causes Go program to exit before response arrives" },
  { label: "os.Signal / os.Process", detail: "No OS-level signals or process control" },
  { label: "Interactive stdin", detail: "fmt.Scan blocks; all input must be provided upfront in the Stdin panel before clicking Run" },
  { label: "go test / testing framework", detail: "No test runner UI" },
  { label: "go build / go install", detail: "No compiler toolchain" },
];

export default function Capabilities() {
  return (
    <div className="min-h-dvh flex flex-col bg-zinc-900 text-zinc-100">
      <header className="px-6 py-4">
        <Link href="/" className="nabla text-lg hover:opacity-80 transition-opacity">
          goblox
        </Link>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 pb-16">
        <h1 className="unica text-2xl mb-2">capabilities</h1>
        <p className="text-zinc-400 text-sm mb-8">
          goblox runs go code in the browser using the{" "}
          <a href="https://github.com/traefik/yaegi" target="_blank" rel="noreferrer" className="text-zinc-300 underline underline-offset-2 decoration-zinc-600 hover:decoration-zinc-300 transition-colors">yaegi</a>{" "}interpreter compiled to WebAssembly.
          Not everything from the standard library works — here&apos;s what does and doesn&apos;t.
        </p>

        <section className="mb-10">
          <h2 className="text-xs tracking-widest uppercase text-zinc-500 mb-4">Works</h2>
          <div className="space-y-2">
            {works.map((item) => (
              <div key={item.label} className="flex items-start gap-3 text-sm">
                <span className="text-emerald-400 mt-0.5 shrink-0">+</span>
                <div>
                  <span className="text-zinc-100">{item.label}</span>
                  <span className="text-zinc-500 ml-2">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs tracking-widest uppercase text-zinc-500 mb-4">Doesn&apos;t Work</h2>
          <div className="space-y-2">
            {doesntWork.map((item) => (
              <div key={item.label} className="flex items-start gap-3 text-sm">
                <span className="text-red-400 mt-0.5 shrink-0">-</span>
                <div>
                  <span className="text-zinc-100">{item.label}</span>
                  <span className="text-zinc-500 ml-2">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
