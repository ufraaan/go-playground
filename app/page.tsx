import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col bg-zinc-900 text-zinc-100">
      <header className="px-6 py-4" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        <div className="text-center max-w-md">
          <h1 className="nabla text-7xl sm:text-8xl font-bold tracking-tight mb-4">
            goblox
          </h1>
          <p className="unica text-zinc-100 text-xl leading-relaxed mb-8">
            Write and run Go code right in your browser.
          </p>
          <Link
            href="/playground"
            className="text-zinc-500 hover:text-zinc-300 text-sm cursor-pointer transition-colors"
          >
            start coding
          </Link>
          <div className="mt-6">
            <Link
              href="/capabilities"
              className="text-zinc-600 hover:text-zinc-400 text-xs cursor-pointer transition-colors"
            >
              capabilities
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
