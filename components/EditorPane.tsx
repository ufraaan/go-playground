"use client";

import { useCallback } from "react";
import Editor, { loader } from "@monaco-editor/react";

loader.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" } });

const DEFAULT_CODE = `package main

import "fmt"

func main() {
	fmt.Println("Hello, goblox!")
}
`;

const GO_KEYWORDS = [
  "break", "case", "chan", "const", "continue", "default", "defer",
  "else", "fallthrough", "for", "func", "go", "goto", "if", "import",
  "interface", "map", "package", "range", "return", "select", "struct",
  "switch", "type", "var",
];

const GO_TYPES = [
  "bool", "byte", "complex64", "complex128", "error", "float32", "float64",
  "int", "int8", "int16", "int32", "int64", "rune", "string",
  "uint", "uint8", "uint16", "uint32", "uint64", "uintptr",
  "any", "comparable",
];

interface PkgEntry {
  label: string;
  detail: string;
}

const PACKAGE_MEMBERS: Record<string, PkgEntry[]> = {
  fmt: [
    { label: "Print", detail: "func(a ...any) (n int, err error)" },
    { label: "Printf", detail: "func(format string, a ...any) (n int, err error)" },
    { label: "Println", detail: "func(a ...any) (n int, err error)" },
    { label: "Sprint", detail: "func(a ...any) string" },
    { label: "Sprintf", detail: "func(format string, a ...any) string" },
    { label: "Sprintln", detail: "func(a ...any) string" },
    { label: "Fprint", detail: "func(w io.Writer, a ...any) (n int, err error)" },
    { label: "Fprintf", detail: "func(w io.Writer, format string, a ...any) (n int, err error)" },
    { label: "Fprintln", detail: "func(w io.Writer, a ...any) (n int, err error)" },
    { label: "Errorf", detail: "func(format string, a ...any) error" },
    { label: "Scan", detail: "func(a ...any) (n int, err error)" },
    { label: "Scanf", detail: "func(format string, a ...any) (n int, err error)" },
    { label: "Scanln", detail: "func(a ...any) (n int, err error)" },
    { label: "Sscan", detail: "func(str string, a ...any) (n int, err error)" },
    { label: "Sscanf", detail: "func(str string, format string, a ...any) (n int, err error)" },
    { label: "Sscanln", detail: "func(str string, a ...any) (n int, err error)" },
  ],
  strings: [
    { label: "Contains", detail: "func(s, substr string) bool" },
    { label: "ContainsAny", detail: "func(s, chars string) bool" },
    { label: "Count", detail: "func(s, substr string) int" },
    { label: "Cut", detail: "func(s, sep string) (before, after string, found bool)" },
    { label: "Fields", detail: "func(s string) []string" },
    { label: "HasPrefix", detail: "func(s, prefix string) bool" },
    { label: "HasSuffix", detail: "func(s, suffix string) bool" },
    { label: "Index", detail: "func(s, substr string) int" },
    { label: "Join", detail: "func(elems []string, sep string) string" },
    { label: "LastIndex", detail: "func(s, substr string) int" },
    { label: "Repeat", detail: "func(s string, count int) string" },
    { label: "Replace", detail: "func(s, old, new string, n int) string" },
    { label: "ReplaceAll", detail: "func(s, old, new string) string" },
    { label: "Split", detail: "func(s, sep string) []string" },
    { label: "SplitN", detail: "func(s, sep string, n int) []string" },
    { label: "ToLower", detail: "func(s string) string" },
    { label: "ToUpper", detail: "func(s string) string" },
    { label: "Trim", detail: "func(s, cutset string) string" },
    { label: "TrimSpace", detail: "func(s string) string" },
  ],
  strconv: [
    { label: "Atoi", detail: "func(s string) (int, error)" },
    { label: "Itoa", detail: "func(i int) string" },
    { label: "FormatInt", detail: "func(i int64, base int) string" },
    { label: "FormatFloat", detail: "func(f float64, fmt byte, prec, bitSize int) string" },
    { label: "ParseInt", detail: "func(s string, base int, bitSize int) (int64, error)" },
    { label: "ParseFloat", detail: "func(s string, bitSize int) (float64, error)" },
    { label: "ParseBool", detail: "func(s string) (bool, error)" },
    { label: "FormatBool", detail: "func(b bool) string" },
    { label: "Quote", detail: "func(s string) string" },
    { label: "Unquote", detail: "func(s string) (string, error)" },
  ],
  math: [
    { label: "Abs", detail: "func(x float64) float64" },
    { label: "Ceil", detail: "func(x float64) float64" },
    { label: "Floor", detail: "func(x float64) float64" },
    { label: "Round", detail: "func(x float64) float64" },
    { label: "Sqrt", detail: "func(x float64) float64" },
    { label: "Pow", detail: "func(x, y float64) float64" },
    { label: "Sin", detail: "func(x float64) float64" },
    { label: "Cos", detail: "func(x float64) float64" },
    { label: "Tan", detail: "func(x float64) float64" },
    { label: "Exp", detail: "func(x float64) float64" },
    { label: "Log", detail: "func(x float64) float64" },
    { label: "Max", detail: "func(x, y float64) float64" },
    { label: "Min", detail: "func(x, y float64) float64" },
    { label: "Pi", detail: "const Pi float64 = 3.1415..." },
    { label: "E", detail: "const E float64 = 2.7182..." },
  ],
  os: [
    { label: "Open", detail: "func(name string) (*File, error)" },
    { label: "Create", detail: "func(name string) (*File, error)" },
    { label: "ReadFile", detail: "func(name string) ([]byte, error)" },
    { label: "WriteFile", detail: "func(name string, data []byte, perm FileMode) error" },
    { label: "Getenv", detail: "func(key string) string" },
    { label: "Setenv", detail: "func(key, value string) error" },
    { label: "Getwd", detail: "func() (dir string, err error)" },
    { label: "Stat", detail: "func(name string) (FileInfo, error)" },
    { label: "Stdin", detail: "var Stdin *File" },
    { label: "Stdout", detail: "var Stdout *File" },
    { label: "Stderr", detail: "var Stderr *File" },
    { label: "Exit", detail: "func(code int)" },
    { label: "Args", detail: "var Args []string" },
    { label: "IsNotExist", detail: "func(err error) bool" },
  ],
  io: [
    { label: "ReadAll", detail: "func(r Reader) ([]byte, error)" },
    { label: "ReadFull", detail: "func(r Reader, buf []byte) (n int, err error)" },
    { label: "WriteString", detail: "func(w Writer, s string) (n int, err error)" },
    { label: "Copy", detail: "func(dst Writer, src Reader) (written int64, err error)" },
    { label: "CopyN", detail: "func(dst Writer, src Reader, n int64) (written int64, err error)" },
    { label: "EOF", detail: "var EOF = errors.New(\"EOF\")" },
    { label: "Discard", detail: "var Discard Writer" },
    { label: "NopCloser", detail: "func(r Reader) ReadCloser" },
  ],
  json: [
    { label: "Marshal", detail: "func(v any) ([]byte, error)" },
    { label: "Unmarshal", detail: "func(data []byte, v any) error" },
    { label: "NewEncoder", detail: "func(w io.Writer) *Encoder" },
    { label: "NewDecoder", detail: "func(r io.Reader) *Decoder" },
    { label: "Compact", detail: "func(dst *bytes.Buffer, src []byte) error" },
    { label: "Indent", detail: "func(dst *bytes.Buffer, src []byte, prefix, indent string) error" },
  ],
  time: [
    { label: "Now", detail: "func() Time" },
    { label: "Sleep", detail: "func(d Duration)" },
    { label: "Since", detail: "func(t Time) Duration" },
    { label: "Until", detail: "func(t Time) Duration" },
    { label: "Parse", detail: "func(layout, value string) (Time, error)" },
    { label: "Format", detail: "func(t Time, layout string) string" },
    { label: "After", detail: "func(d Duration) <-chan Time" },
    { label: "Tick", detail: "func(d Duration) <-chan Time" },
    { label: "NewTimer", detail: "func(d Duration) *Timer" },
    { label: "NewTicker", detail: "func(d Duration) *Ticker" },
    { label: "Second", detail: "const Second Duration = 1e9" },
    { label: "Millisecond", detail: "const Millisecond Duration = 1e6" },
    { label: "Nanosecond", detail: "const Nanosecond Duration = 1" },
  ],
  sort: [
    { label: "Ints", detail: "func(x []int)" },
    { label: "Strings", detail: "func(x []string)" },
    { label: "Float64s", detail: "func(x []float64)" },
    { label: "Slice", detail: "func(x any, less func(i, j int) bool)" },
    { label: "Reverse", detail: "func(data Interface) Interface" },
    { label: "SearchInts", detail: "func(a []int, x int) int" },
    { label: "SearchStrings", detail: "func(a []string, x string) int" },
  ],
  errors: [
    { label: "New", detail: "func(text string) error" },
    { label: "Unwrap", detail: "func(err error) error" },
    { label: "Is", detail: "func(err, target error) bool" },
    { label: "As", detail: "func(err error, target any) bool" },
    { label: "Join", detail: "func(errs ...error) error" },
  ],
  bytes: [
    { label: "Buffer", detail: "type Buffer struct" },
    { label: "NewBuffer", detail: "func(buf []byte) *Buffer" },
    { label: "NewReader", detail: "func(b []byte) *Reader" },
    { label: "Contains", detail: "func(b, subslice []byte) bool" },
    { label: "Join", detail: "func(s [][]byte, sep []byte) []byte" },
    { label: "Split", detail: "func(s, sep []byte) [][]byte" },
    { label: "Replace", detail: "func(s, old, new []byte, n int) []byte" },
  ],
  sync: [
    { label: "Mutex", detail: "type Mutex struct" },
    { label: "RWMutex", detail: "type RWMutex struct" },
    { label: "WaitGroup", detail: "type WaitGroup struct" },
    { label: "Once", detail: "type Once struct" },
    { label: "Map", detail: "type Map struct" },
    { label: "Pool", detail: "type Pool struct" },
    { label: "NewCond", detail: "func(l Locker) *Cond" },
  ],
  context: [
    { label: "Background", detail: "func() Context" },
    { label: "TODO", detail: "func() Context" },
    { label: "WithCancel", detail: "func(parent Context) (Context, CancelFunc)" },
    { label: "WithDeadline", detail: "func(parent Context, deadline time.Time) (Context, CancelFunc)" },
    { label: "WithTimeout", detail: "func(parent Context, timeout time.Duration) (Context, CancelFunc)" },
    { label: "WithValue", detail: "func(parent Context, key, val any) Context" },
  ],
  http: [
    { label: "Get", detail: "func(url string) (resp *Response, err error)" },
    { label: "Post", detail: "func(url, contentType string, body io.Reader) (resp *Response, err error)" },
    { label: "Handle", detail: "func(pattern string, handler Handler)" },
    { label: "HandleFunc", detail: "func(pattern string, handler func(ResponseWriter, *Request))" },
    { label: "ServeMux", detail: "type ServeMux struct" },
    { label: "ListenAndServe", detail: "func(addr string, handler Handler) error" },
    { label: "StatusOK", detail: "const StatusOK = 200" },
    { label: "StatusNotFound", detail: "const StatusNotFound = 404" },
  ],
  regexp: [
    { label: "Compile", detail: "func(expr string) (*Regexp, error)" },
    { label: "MustCompile", detail: "func(expr string) *Regexp" },
    { label: "Match", detail: "func(pattern string, b []byte) (bool, error)" },
    { label: "MatchString", detail: "func(pattern string, s string) (bool, error)" },
  ],
  log: [
    { label: "Print", detail: "func(v ...any)" },
    { label: "Printf", detail: "func(format string, v ...any)" },
    { label: "Println", detail: "func(v ...any)" },
    { label: "Fatal", detail: "func(v ...any)" },
    { label: "Fatalf", detail: "func(format string, v ...any)" },
    { label: "Fatalln", detail: "func(v ...any)" },
    { label: "Panic", detail: "func(v ...any)" },
    { label: "Panicf", detail: "func(format string, v ...any)" },
    { label: "Panicln", detail: "func(v ...any)" },
  ],
  crypto: [
    { label: "sha256", detail: "package crypto/sha256" },
    { label: "md5", detail: "package crypto/md5" },
    { label: "rand", detail: "package crypto/rand" },
    { label: "aes", detail: "package crypto/aes" },
    { label: "rsa", detail: "package crypto/rsa" },
    { label: "tls", detail: "package crypto/tls" },
    { label: "x509", detail: "package crypto/x509" },
  ],
  slices: [
    { label: "Sort", detail: "func[S ~[]E, E constraints.Ordered](x S)" },
    { label: "SortFunc", detail: "func[S ~[]E, E any](x S, cmp func(a, b E) int)" },
    { label: "Clone", detail: "func[S ~[]E, E any](s S) S" },
    { label: "Contains", detail: "func[S ~[]E, E comparable](s S, v E) bool" },
    { label: "Index", detail: "func[S ~[]E, E comparable](s S, v E) int" },
    { label: "Insert", detail: "func[S ~[]E, E any](s S, i int, v ...E) S" },
    { label: "Delete", detail: "func[S ~[]E, E any](s S, i, j int) S" },
  ],
  maps: [
    { label: "Copy", detail: "func[M1 ~map[K]V, M2 ~map[K]V](dst M1, src M2)" },
    { label: "Clone", detail: "func[M ~map[K]V, K comparable, V any](m M) M" },
    { label: "Keys", detail: "func[M ~map[K]V, K comparable, V any](m M) []K" },
    { label: "Values", detail: "func[M ~map[K]V, K comparable, V any](m M) []V" },
    { label: "Equal", detail: "func[M1, M2 ~map[K]V, K, V comparable](m1 M1, m2 M2) bool" },
  ],
  encoding: [
    { label: "json", detail: "package encoding/json" },
    { label: "base64", detail: "package encoding/base64" },
    { label: "hex", detail: "package encoding/hex" },
    { label: "csv", detail: "package encoding/csv" },
    { label: "xml", detail: "package encoding/xml" },
  ],
  net: [
    { label: "http", detail: "package net/http" },
    { label: "url", detail: "package net/url" },
    { label: "smtp", detail: "package net/smtp" },
  ],
  cmp: [
    { label: "Compare", detail: "func[T Ordered](x, y T) int" },
    { label: "Less", detail: "func[T Ordered](x, y T) bool" },
    { label: "Or", detail: "func[T comparable](vals ...T) T" },
  ],
  reflect: [
    { label: "TypeOf", detail: "func(i any) Type" },
    { label: "ValueOf", detail: "func(i any) Value" },
    { label: "DeepEqual", detail: "func(a, b any) bool" },
  ],
  bufio: [
    { label: "NewScanner", detail: "func(r io.Reader) *Scanner" },
    { label: "NewReader", detail: "func(r io.Reader) *Reader" },
    { label: "NewWriter", detail: "func(w io.Writer) *Writer" },
    { label: "ScanLines", detail: "func(data []byte, atEOF bool) (advance int, token []byte, err error)" },
    { label: "ScanWords", detail: "func(data []byte, atEOF bool) (advance int, token []byte, err error)" },
  ],
};

const IMPORT_PATHS = [
  "fmt", "io", "os", "strings", "strconv", "errors",
  "math", "math/rand", "sort", "time",
  "encoding/json", "encoding/base64", "encoding/csv", "encoding/xml", "encoding/hex",
  "bytes", "reflect", "sync", "context",
  "net/http", "net/url", "net/smtp",
  "path", "path/filepath",
  "regexp", "log", "bufio", "cmp", "maps", "slices",
  "crypto/sha256", "crypto/md5", "crypto/rand",
  "html", "html/template",
  "image", "image/png", "image/jpeg", "image/gif",
];

function defineThemes(monaco: any) {
  monaco.editor.defineTheme("goblox-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "818cf8" },
      { token: "type", foreground: "22d3ee" },
      { token: "string", foreground: "34d399" },
      { token: "number", foreground: "fbbf24" },
      { token: "comment", foreground: "71717a", fontStyle: "italic" },
      { token: "function", foreground: "a78bfa" },
      { token: "identifier", foreground: "f4f4f5" },
      { token: "delimiter", foreground: "d4d4d8" },
      { token: "tag", foreground: "818cf8" },
      { token: "attribute", foreground: "22d3ee" },
      { token: "keyword.go", foreground: "818cf8" },
      { token: "type.go", foreground: "22d3ee" },
      { token: "string.go", foreground: "34d399" },
      { token: "number.go", foreground: "fbbf24" },
      { token: "comment.line.double-slash", foreground: "71717a", fontStyle: "italic" },
      { token: "comment.block", foreground: "71717a", fontStyle: "italic" },
    ],
    colors: {
      "editor.background": "#18181b",
      "editor.foreground": "#f4f4f5",
      "editor.lineHighlightBackground": "#27272a",
      "editor.selectionBackground": "#3f3f46",
      "editor.inactiveSelectionBackground": "#27272a",
      "editorCursor.foreground": "#a1a1aa",
      "editorLineNumber.foreground": "#52525b",
      "editorLineNumber.activeForeground": "#a1a1aa",
      "editor.selectionHighlightBackground": "#3f3f4670",
      "editorBracketMatch.background": "#27272a",
      "editorBracketMatch.border": "#52525b",
      "editorIndentGuide.background": "#27272a",
      "editorIndentGuide.activeBackground": "#3f3f46",
      "editorWidget.background": "#18181b",
      "editorWidget.border": "#3f3f46",
      "input.background": "#27272a",
      "input.foreground": "#f4f4f5",
      "input.border": "#3f3f46",
      "focusBorder": "#52525b",
      "list.activeSelectionBackground": "#3f3f46",
      "list.hoverBackground": "#27272a",
    },
  });

  monaco.editor.defineTheme("goblox-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "4f46e5" },
      { token: "type", foreground: "0891b2" },
      { token: "string", foreground: "059669" },
      { token: "number", foreground: "d97706" },
      { token: "comment", foreground: "a1a1aa", fontStyle: "italic" },
      { token: "function", foreground: "7c3aed" },
      { token: "identifier", foreground: "18181b" },
      { token: "delimiter", foreground: "3f3f46" },
      { token: "tag", foreground: "4f46e5" },
      { token: "attribute", foreground: "0891b2" },
      { token: "keyword.go", foreground: "4f46e5" },
      { token: "type.go", foreground: "0891b2" },
      { token: "string.go", foreground: "059669" },
      { token: "number.go", foreground: "d97706" },
      { token: "comment.line.double-slash", foreground: "a1a1aa", fontStyle: "italic" },
      { token: "comment.block", foreground: "a1a1aa", fontStyle: "italic" },
    ],
    colors: {
      "editor.background": "#fafafa",
      "editor.foreground": "#18181b",
      "editor.lineHighlightBackground": "#f4f4f5",
      "editor.selectionBackground": "#d4d4d8",
      "editor.inactiveSelectionBackground": "#e4e4e7",
      "editorCursor.foreground": "#52525b",
      "editorLineNumber.foreground": "#d4d4d8",
      "editorLineNumber.activeForeground": "#71717a",
      "editor.selectionHighlightBackground": "#d4d4d870",
      "editorBracketMatch.background": "#f4f4f5",
      "editorBracketMatch.border": "#d4d4d8",
      "editorIndentGuide.background": "#e4e4e7",
      "editorIndentGuide.activeBackground": "#d4d4d8",
      "editorWidget.background": "#fafafa",
      "editorWidget.border": "#d4d4d8",
      "input.background": "#f4f4f5",
      "input.foreground": "#18181b",
      "input.border": "#d4d4d8",
      "focusBorder": "#a1a1aa",
      "list.activeSelectionBackground": "#d4d4d8",
      "list.hoverBackground": "#e4e4e7",
    },
  });
}

function registerCompletions(monaco: any) {
  monaco.languages.registerCompletionItemProvider("go", {
    triggerCharacters: [".", '"', " "],

    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const textUntilPos = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const dotIdx = textUntilPos.lastIndexOf(".");
      if (dotIdx !== -1) {
        const beforeDot = textUntilPos.slice(0, dotIdx).trim();
        const pkgName = beforeDot.split(/\s+/).pop() || "";
        const members = PACKAGE_MEMBERS[pkgName];
        if (members) {
          const afterDot = textUntilPos.slice(dotIdx + 1);
          return {
            suggestions: members
              .filter((m) => m.label.startsWith(afterDot))
              .map((m) => ({
                label: m.label,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: m.label,
                detail: m.detail,
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: dotIdx + 2,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column,
                },
              })),
          };
        }
      }

      const lastChar = textUntilPos.trimEnd().at(-1);
      if (lastChar === '"') {
        const line = model.getLineContent(position.lineNumber);
        const beforeQuote = line.slice(0, textUntilPos.lastIndexOf('"'));
        if (beforeQuote.trimEnd().endsWith("import")) {
          return {
            suggestions: IMPORT_PATHS.map((pkg) => ({
              label: pkg,
              kind: monaco.languages.CompletionItemKind.Module,
              insertText: pkg,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            })),
          };
        }
      }

      if (!word || word.endColumn !== position.column) return;

      const kwSuggestions = GO_KEYWORDS
        .filter((k) => k.startsWith(word.word))
        .map((k) => ({
          label: k,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: k,
          range: {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
        }));

      const typeSuggestions = GO_TYPES
        .filter((t) => t.startsWith(word.word))
        .map((t) => ({
          label: t,
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: t,
          range: {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
        }));

      const pkgSuggestions = Object.keys(PACKAGE_MEMBERS)
        .filter((p) => p.startsWith(word.word))
        .map((p) => ({
          label: p,
          kind: monaco.languages.CompletionItemKind.Module,
          insertText: p,
          range: {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
        }));

      return {
        suggestions: [...kwSuggestions, ...typeSuggestions, ...pkgSuggestions],
      };
    },
  });
}

export default function EditorPane({
  theme,
  onMount,
}: {
  theme: "dark" | "light";
  onMount: (editor: any, monaco: any) => void;
}) {
  const handleBeforeMount = useCallback((monaco: any) => {
    defineThemes(monaco);
  }, []);

  const handleMount = useCallback(
    (editor: any, monaco: any) => {
      registerCompletions(monaco);
      onMount(editor, monaco);
    },
    [onMount]
  );

  return (
    <Editor
      height="100%"
      defaultLanguage="go"
      defaultValue={DEFAULT_CODE}
      theme={theme === "dark" ? "goblox-dark" : "goblox-light"}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 12 },
        fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
        automaticLayout: true,
        lineNumbers: "on",
        glyphMargin: false,
        folding: true,
      }}
    />
  );
}
