package main

import (
	"bytes"
	"fmt"
	"io"
	"runtime"
	"strings"
	"syscall/js"

	"github.com/traefik/yaegi/interp"
	"github.com/traefik/yaegi/stdlib"
)

func runCode(code string, stdin string) (string, string) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	var stdinReader io.Reader
	if stdin != "" {
		stdinReader = strings.NewReader(stdin)
	}

	i := interp.New(interp.Options{
		Stdout: stdout,
		Stderr: stderr,
		Stdin:  stdinReader,
	})
	i.Use(stdlib.Symbols)

	var evalErr error
	func() {
		defer func() {
			if r := recover(); r != nil {
				buf := make([]byte, 4096)
				n := runtime.Stack(buf, false)
				stderr.WriteString(fmt.Sprintf("panic: %v\n%s", r, buf[:n]))
			}
		}()
		_, evalErr = i.Eval(code)
	}()

	if evalErr != nil {
		stderr.WriteString(fmt.Sprintf("error: %v", evalErr))
	}

	return stdout.String(), stderr.String()
}

func main() {
	c := make(chan struct{}, 0)

	js.Global().Set("runGoCode", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		code := ""
		stdin := ""
		if len(args) > 0 {
			code = args[0].String()
		}
		if len(args) > 1 {
			stdin = args[1].String()
		}
		out, err := runCode(code, stdin)
		if err != "" {
			return map[string]interface{}{"error": err, "output": out}
		}
		return map[string]interface{}{"output": out}
	}))

	js.Global().Set("goWasmReady", js.ValueOf(true))
	<-c
}
