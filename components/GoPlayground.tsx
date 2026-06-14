"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import EditorPane from "./EditorPane";
import OutputPanel from "./OutputPanel";
import StdinPanel from "./StdinPanel";
import ProgressBar from "./ProgressBar";
import ThemeToggle from "./ThemeToggle";
import { useResizable } from "@/hooks/useResizable";
import { useWasmLoader } from "@/hooks/useWasmLoader";

function parseErrorLine(err: string): number | null {
  const m1 = err.match(/(\d+):(\d+):/);
  if (m1) return parseInt(m1[1]);
  const m2 = err.match(/line (\d+):/i);
  if (m2) return parseInt(m2[1]);
  return null;
}

export default function GoPlayground() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [runTime, setRunTime] = useState<number | null>(null);
  const [stdin, setStdin] = useState("");
  const runCodeRef = useRef<() => void>(() => {});
  const { leftPercent, onMouseDown } = useResizable(60, 30, 85);
  const wasm = useWasmLoader();

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const handleEditorMount = useCallback(
    (editor: any, monaco?: any) => {
      editorRef.current = editor;
      if (monaco) monacoRef.current = monaco;
      (window as any).__gobloxSetCode = (code: string) => {
        editor.setValue(code);
      };
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        runCodeRef.current();
      });
      editor.focus();
    },
    []
  );

  const runCode = useCallback(async () => {
    if (!editorRef.current || !wasm.ready) return;

    setRunning(true);
    setOutput("");
    setError("");
    setRunTime(null);
    if (monacoRef.current && editorRef.current) {
      monacoRef.current.editor.setModelMarkers(
        editorRef.current.getModel(),
        "goblox",
        []
      );
    }

    const code = editorRef.current.getValue();
    const start = performance.now();

    try {
      const result = wasm.runCode(code, stdin);
      const elapsed = Math.round(performance.now() - start);
      setRunTime(elapsed);

      if (result.error) {
        setError(result.error);
        const line = parseErrorLine(result.error);
        if (line && monacoRef.current && editorRef.current) {
          const m = monacoRef.current.editor;
          m.setModelMarkers(
            editorRef.current.getModel(),
            "goblox",
            [{
              severity: m.MarkerSeverity.Error,
              message: result.error,
              startLineNumber: line,
              startColumn: 1,
              endLineNumber: line,
              endColumn: 100,
            }]
          );
        }
      }
      if (result.output) setOutput(result.output);
    } catch (e: any) {
      setError(`Runtime error: ${e}`);
    } finally {
      setRunning(false);
    }
  }, [wasm, stdin]);

  useEffect(() => {
    runCodeRef.current = runCode;
  }, [runCode]);

  const clearOutput = useCallback(() => {
    setOutput("");
    setError("");
    setRunTime(null);
    if (monacoRef.current && editorRef.current) {
      monacoRef.current.editor.setModelMarkers(
        editorRef.current.getModel(),
        "goblox",
        []
      );
    }
  }, []);

  const isDark = theme === "dark";
  const bg = isDark ? "bg-zinc-900" : "bg-zinc-50";
  const headerBg = isDark ? "bg-zinc-800" : "bg-zinc-100";
  const textColor = isDark ? "text-zinc-100" : "text-zinc-900";
  const separator = isDark ? "bg-zinc-700" : "bg-zinc-300";
  const btnBg = isDark
    ? "bg-zinc-700 hover:bg-zinc-600"
    : "bg-zinc-800 hover:bg-zinc-700";

  return (
    <div
      className={`h-dvh w-screen flex flex-col ${bg} ${textColor} overflow-hidden`}
    >
      <header
        className={`flex items-center justify-between px-5 h-12 ${headerBg} shrink-0 select-none`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`nabla text-lg leading-none px-2 py-1 rounded transition-colors ${isDark ? "" : "bg-zinc-900"}`}
          >
            goblox
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {wasm.loading && <ProgressBar progress={wasm.progress} />}
          {wasm.error && (
            <span className="text-red-400 text-xs">{wasm.error}</span>
          )}
          <button
            data-testid="run-button"
            onClick={runCode}
            disabled={running || !wasm.ready}
            className={`px-4 py-1.5 text-xs font-medium tracking-wider uppercase rounded transition-colors text-zinc-100 ${btnBg} disabled:opacity-30 disabled:pointer-events-none`}
          >
            {running ? "running..." : "run"}
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div style={{ width: `${leftPercent}%` }} className="flex flex-col">
          <div className="flex-1">
            <EditorPane theme={theme} onMount={handleEditorMount} />
          </div>
        </div>

        <div
          className={`w-px shrink-0 cursor-col-resize hover:w-[2px] ${separator} transition-all`}
          onMouseDown={onMouseDown}
        />

        <div style={{ width: `${100 - leftPercent}%` }} className="flex flex-col">
          <div className="flex-1">
            <OutputPanel
              output={output}
              error={error}
              runTime={runTime}
              onClear={clearOutput}
              theme={theme}
            />
          </div>
          <StdinPanel value={stdin} onChange={setStdin} theme={theme} />
        </div>
      </div>
    </div>
  );
}
