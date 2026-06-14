"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface WasmState {
  ready: boolean;
  loading: boolean;
  progress: number;
  error: string;
}

export function useWasmLoader() {
  const [state, setState] = useState<WasmState>({
    ready: false,
    loading: true,
    progress: 0,
    error: "",
  });
  const cancelled = useRef(false);

  const runCode = useCallback(
    (code: string, stdin: string): { output: string; error?: string } => {
      if (!(window as any).runGoCode) {
        return { error: "WASM not loaded", output: "" };
      }
      return (window as any).runGoCode(code, stdin);
    },
    []
  );

  useEffect(() => {
    cancelled.current = false;

    const script = document.createElement("script");
    script.src = "/wasm_exec.js";
    script.async = false;
    document.head.appendChild(script);

    async function load() {
      const pollGo = () =>
        new Promise<void>((resolve) => {
          const check = () => {
            if ((window as any).Go) return resolve();
            setTimeout(check, 10);
          };
          check();
        });

      await pollGo();
      if (cancelled.current) return;

      try {
        const resp = await fetch("/goyae.wasm");
        const total = Number(resp.headers.get("Content-Length") || 0);
        const reader = resp.body!.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (total) {
            setState((s) => ({
              ...s,
              progress: Math.round((received / total) * 100),
            }));
          }
        }

        const wasmBytes = new Uint8Array(received);
        let pos = 0;
        for (const c of chunks) {
          wasmBytes.set(c, pos);
          pos += c.length;
        }

        const go = new (window as any).Go();
        const result = await WebAssembly.instantiate(wasmBytes, go.importObject);
        go.run(result.instance);

        await new Promise<void>((resolve) => {
          const check = () => {
            if (cancelled.current) return;
            if ((window as any).goWasmReady) {
              resolve();
            } else {
              setTimeout(check, 50);
            }
          };
          check();
        });

        if (!cancelled.current) {
          setState({ ready: true, loading: false, progress: 100, error: "" });
        }
      } catch (e: any) {
        if (!cancelled.current) {
          setState({ ready: false, loading: false, progress: 0, error: String(e) });
        }
      }
    }

    load();

    return () => {
      cancelled.current = true;
    };
  }, []);

  return { ...state, runCode };
}
