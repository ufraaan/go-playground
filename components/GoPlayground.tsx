"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";

loader.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" } });

const DEFAULT_CODE = `package main

import "fmt"

func main() {
	fmt.Println("Hello, Go playground!")
}
`;

export default function GoPlayground() {
  const editorRef = useRef<any>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [wasmReady, setWasmReady] = useState(false);
  const [wasmLoading, setWasmLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/wasm_exec.js";
    script.async = false;
    document.head.appendChild(script);

    let cancelled = false;

    async function loadWasm() {
      const pollGo = () =>
        new Promise<void>((resolve) => {
          const check = () => {
            if ((window as any).Go) return resolve();
            setTimeout(check, 10);
          };
          check();
        });

      await pollGo();
      if (cancelled) return;

      try {
        const go = new (window as any).Go();
        const resp = await fetch("/goyae.wasm");
        const wasmBytes = await resp.arrayBuffer();
        const result = await WebAssembly.instantiate(wasmBytes, go.importObject);
        go.run(result.instance);

        await new Promise<void>((resolve) => {
          const check = () => {
            if (cancelled) return;
            if ((window as any).goWasmReady) {
              resolve();
            } else {
              setTimeout(check, 50);
            }
          };
          check();
        });

        if (!cancelled) {
          setWasmReady(true);
          setWasmLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(`Failed to load WASM: ${e}`);
          setWasmLoading(false);
        }
      }
    }

    loadWasm();
    return () => { cancelled = true; };
  }, []);

  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  const runCode = useCallback(async () => {
    if (!editorRef.current || !wasmReady) return;
    setRunning(true);
    setOutput("");
    setError("");

    const code = editorRef.current.getValue();

    try {
      const result = (window as any).runGoCode(code);
      if (result.output) setOutput(result.output);
      if (result.error) setError(result.error);
    } catch (e) {
      setError(`Runtime error: ${e}`);
    } finally {
      setRunning(false);
    }
  }, [wasmReady]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    },
    [runCode]
  );

  return (
    <div
      className="h-dvh w-screen flex flex-col bg-[#1e1e1e] text-white overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      <header className="flex items-center justify-between px-4 h-11 bg-[#2d2d2d] border-b border-[#3c3c3c] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-blue-400 font-bold text-base">Go</span>
          <span className="text-gray-400 text-sm">Playground</span>
        </div>
        <div className="flex items-center gap-3">
          {wasmLoading && (
            <span className="text-yellow-400 text-xs flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Loading interpreter (~8 MB)...
            </span>
          )}
          <button
            onClick={runCode}
            disabled={running || !wasmReady}
            className="px-4 py-1 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:text-gray-400 rounded text-white font-medium transition-colors"
          >
            {running ? "Running..." : "Run"}
          </button>
          <span className="text-gray-600 text-xs hidden sm:inline">
            Ctrl+Enter
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="go"
            defaultValue={DEFAULT_CODE}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
              automaticLayout: true,
            }}
          />
        </div>

        <div className="w-96 shrink-0 bg-[#1e1e1e] border-l border-[#3c3c3c] flex flex-col">
          <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wider bg-[#2d2d2d] border-b border-[#3c3c3c]">
            Output
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-sm whitespace-pre-wrap">
            {output && <pre className="text-green-400 m-0">{output}</pre>}
            {error && <pre className="text-red-400 m-0">{error}</pre>}
            {!output && !error && wasmReady && (
              <span className="text-gray-500">Run your Go code to see output here</span>
            )}
            {wasmLoading && (
              <span className="text-gray-500">Loading Go interpreter...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
