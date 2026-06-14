"use client";

export default function OutputPanel({
  output,
  error,
  runTime,
  onClear,
  theme,
}: {
  output: string;
  error: string;
  runTime: number | null;
  onClear: () => void;
  theme: "dark" | "light";
}) {
  const isDark = theme === "dark";
  const bg = isDark ? "bg-zinc-900" : "bg-zinc-50";
  const text = isDark ? "text-zinc-100" : "text-zinc-800";
  const label = isDark ? "text-zinc-500" : "text-zinc-400";
  const muted = isDark ? "text-zinc-600" : "text-zinc-300";
  const clearBtn = isDark
    ? "text-zinc-600 hover:text-zinc-300"
    : "text-zinc-400 hover:text-zinc-700";

  return (
    <div className={`${bg} flex flex-col h-full`}>
      <div
        className={`flex items-center justify-between px-4 py-2 text-[10px] tracking-widest uppercase ${label} shrink-0`}
      >
        <span>output</span>
        <div className="flex items-center gap-3">
          {runTime !== null && (
            <span className="font-mono">{runTime}ms</span>
          )}
          <button onClick={onClear} className={clearBtn}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm whitespace-pre-wrap">
        {output && <pre className={`${text} m-0`}>{output}</pre>}
        {error && <pre className="text-red-400 m-0">{error}</pre>}
        {!output && !error && (
          <span className={muted}>run your code to see output here</span>
        )}
      </div>
    </div>
  );
}
