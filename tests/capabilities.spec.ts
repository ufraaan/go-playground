import { test, expect, Page } from "@playwright/test";

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto("/playground");
  // Wait for WASM to finish loading (run button enabled)
  await page.waitForSelector('[data-testid="run-button"]:not([disabled])', {
    timeout: 120000,
  });
});

test.afterAll(async () => {
  await page.close();
});

async function runCode(code: string): Promise<string> {
  await page.evaluate((c: string) => (window as any).__gobloxSetCode(c), code);
  await page.waitForTimeout(200);
  await page.click('[data-testid="run-button"]');
  // Wait for output pre element to appear with content
  const pre = await page.waitForSelector("pre", { timeout: 30000 });
  return (await pre.textContent()) || "";
}

// ── Algorithms & data structures ──────────────────────────────────────────────

test("algorithms: sort and heap", async () => {
  const out = await runCode(`package main
import "fmt"
import "sort"
import "container/heap"
type H []int
func (h H) Len() int { return len(h) }
func (h H) Less(i,j int) bool { return h[i] < h[j] }
func (h H) Swap(i,j int) { h[i],h[j] = h[j],h[i] }
func (h *H) Push(x any) { *h = append(*h, x.(int)) }
func (h *H) Pop() any { o:=*h; n:=len(o); x:=o[n-1]; *h=o[:n-1]; return x }
func main() {
  n:=[]int{3,1,4,1,5}; sort.Ints(n); fmt.Println("sorted:",n)
  h:=&H{2,1,5}; heap.Init(h); heap.Push(h,3); fmt.Println("pop:",heap.Pop(h))
}`);
  expect(out).toContain("sorted:");
  expect(out).toContain("pop:");
});

// ── Goroutines & channels ─────────────────────────────────────────────────────

test("goroutines and channels", async () => {
  const out = await runCode(`package main
import "fmt"
func main() {
  ch:=make(chan string,1); ch<-"ping"; fmt.Println("chan:",<-ch)
  done:=make(chan bool)
  go func() { fmt.Println("goroutine"); done<-true }()
  <-done
}`);
  expect(out).toContain("chan: ping");
  expect(out).toContain("goroutine");
});

// ── JSON ──────────────────────────────────────────────────────────────────────

test("json marshal/unmarshal", async () => {
  const out = await runCode(`package main
import "encoding/json"
import "fmt"
type P struct{Name string;Age int}
func main() {
  p:=P{"Alice",30}
  b,_:=json.Marshal(p); fmt.Println("json:",string(b))
  var p2 P; json.Unmarshal(b,&p2); fmt.Println("name:",p2.Name)
}`);
  expect(out).toContain('"Alice"');
  expect(out).toContain("name: Alice");
});

// ── regexp ────────────────────────────────────────────────────────────────────

test("regexp", async () => {
  const out = await runCode(`package main
import "regexp"
import "fmt"
func main() {
  r:=regexp.MustCompile("^h\\\\w+")
  fmt.Println("match:",r.FindString("hello world"))
}`);
  expect(out).toContain("match: hello");
});

// ── strings / bytes ───────────────────────────────────────────────────────────

test("strings and bytes", async () => {
  const out = await runCode(`package main
import "fmt"
import "strings"
import "bytes"
func main() {
  fmt.Println("upper:",strings.ToUpper("hello"))
  var b bytes.Buffer; b.WriteString("buffer"); fmt.Println("buf:",b.String())
}`);
  expect(out).toContain("upper: HELLO");
  expect(out).toContain("buf: buffer");
});

// ── math ──────────────────────────────────────────────────────────────────────

test("math", async () => {
  const out = await runCode(`package main
import "fmt"
import "math"
import "math/big"
func main() {
  fmt.Println("sqrt:",math.Sqrt(16))
  fmt.Println("pi:",math.Pi)
  n:=big.NewInt(1<<62); fmt.Println("big:",n)
}`);
  expect(out).toContain("sqrt: 4");
  expect(out).toContain("pi:");
  expect(out).toContain("big:");
});

// ── crypto ────────────────────────────────────────────────────────────────────

test("crypto", async () => {
  const out = await runCode(`package main
import "fmt"
import "crypto/sha256"
import "encoding/base64"
func main() {
  h:=sha256.Sum256([]byte("data")); fmt.Printf("sha256: %x\\n",h[:4])
  s:=base64.StdEncoding.EncodeToString([]byte("hello")); fmt.Println("b64:",s)
}`);
  expect(out).toContain("sha256:");
  expect(out).toContain("b64: aGVsbG8=");
});

// ── time ──────────────────────────────────────────────────────────────────────

test("time", async () => {
  const out = await runCode(`package main
import "fmt"
import "time"
func main() {
  now:=time.Now(); fmt.Println("year:",now.Year())
  fmt.Println("dur:",time.Duration(3*time.Second))
}`);
  expect(out).toContain("year: 2026");
  expect(out).toContain("dur: 3s");
});

// ── CSV ───────────────────────────────────────────────────────────────────────

test("csv", async () => {
  const out = await runCode(`package main
import "fmt"
import "encoding/csv"
import "strings"
func main() {
  r:=csv.NewReader(strings.NewReader("a,b,c"))
  rec,_:=r.Read(); fmt.Println("csv:",rec)
}`);
  expect(out).toContain("csv: [a b c]");
});

// ── errors ────────────────────────────────────────────────────────────────────

test("errors Join/Is/As", async () => {
  const out = await runCode(`package main
import "fmt"
import "errors"
func main() {
  e1:=errors.New("a"); e2:=errors.New("b")
  j:=errors.Join(e1,e2)
  fmt.Println("Is:",errors.Is(j,e1))
  fmt.Println("As:",errors.As(j,&e1))
}`);
  expect(out).toContain("Is: true");
  expect(out).toContain("As: true");
});

// ── context ───────────────────────────────────────────────────────────────────

test("context cancel", async () => {
  const out = await runCode(`package main
import "fmt"
import "context"
func main() {
  ctx:=context.Background()
  fmt.Println("err:",ctx.Err())
  ctx2,cancel:=context.WithCancel(ctx); cancel()
  fmt.Println("cancel err:",ctx2.Err())
}`);
  expect(out).toContain("err: <nil>");
  expect(out).toContain("cancel err: context canceled");
});

// ── sync ──────────────────────────────────────────────────────────────────────

test("sync Mutex and Once", async () => {
  const out = await runCode(`package main
import "fmt"
import "sync"
func main() {
  var mu sync.Mutex; mu.Lock(); mu.Unlock(); fmt.Println("mutex ok")
  var once sync.Once; once.Do(func(){fmt.Println("once ran")})
  once.Do(func(){fmt.Println("should not print")})
}`);
  expect(out).toContain("mutex ok");
  expect(out).toContain("once ran");
  expect(out).not.toContain("should not print");
});

// ── text/template ─────────────────────────────────────────────────────────────

test("text/template", async () => {
  const out = await runCode(`package main
import "fmt"
import "text/template"
import "bytes"
func main() {
  t,_:=template.New("x").Parse("Hello {{.}}")
  var b bytes.Buffer; t.Execute(&b,"World"); fmt.Println("tpl:",b.String())
}`);
  expect(out).toContain("tpl: Hello World");
});

// ── reflect ───────────────────────────────────────────────────────────────────

test("reflect TypeOf ValueOf", async () => {
  const out = await runCode(`package main
import "fmt"
import "reflect"
func main() {
  x:=42
  fmt.Println("type:",reflect.TypeOf(x).Name())
  fmt.Println("val:",reflect.ValueOf(x).Int())
}`);
  expect(out).toContain("type: int");
  expect(out).toContain("val: 42");
});

// ── container/list ────────────────────────────────────────────────────────────

test("container/list", async () => {
  const out = await runCode(`package main
import "fmt"
import "container/list"
func main() {
  l:=list.New()
  l.PushBack("a"); l.PushBack("b")
  fmt.Println("front:",l.Front().Value)
  fmt.Println("back:",l.Back().Value)
}`);
  expect(out).toContain("front: a");
  expect(out).toContain("back: b");
});
