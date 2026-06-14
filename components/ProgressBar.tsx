"use client";

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <span className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono">
      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {progress}%
    </span>
  );
}
