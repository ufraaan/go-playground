"use client";

import { useState } from "react";

export default function StdinPanel({
  value,
  onChange,
  theme,
}: {
  value: string;
  onChange: (v: string) => void;
  theme: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";
  const bg = isDark ? "bg-zinc-800/50" : "bg-zinc-100/80";
  const text = isDark ? "text-zinc-500" : "text-zinc-400";
  const inputBg = isDark ? "bg-zinc-900" : "bg-white";
  const inputText = isDark ? "text-zinc-100" : "text-zinc-900";
  const inputBorder = isDark ? "border-zinc-700" : "border-zinc-200";

  return (
    <div className={`${bg}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-4 py-2 text-[10px] tracking-widest uppercase ${text} transition-colors w-full text-left`}
      >
        <svg
          className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        stdin
      </button>
      {open && (
        <div className="px-4 pb-3">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Example: 5 7"
            rows={2}
            className={`w-full text-xs font-mono p-2.5 rounded border resize-none focus:outline-none focus:border-zinc-500 transition-colors ${inputBg} ${inputText} ${inputBorder}`}
          />
        </div>
      )}
    </div>
  );
}
