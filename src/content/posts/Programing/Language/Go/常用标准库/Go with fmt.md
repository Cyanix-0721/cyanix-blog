---
tags:
  - Language
  - Go
---

# Go with Fmt

## 1 Go 中 `fmt` 包的详细用法

在 Go 语言中，`fmt` 包是进行格式化 I/O 操作的核心工具。除了基本的输出功能外，`fmt` 还支持各种格式化占位符和输入函数。以下是对 `fmt` 包的详细说明，包括输出函数、格式化占位符和输入函数的使用。

## 2 基本输出函数

- **`fmt.Print`**：将内容输出到标准输出，不自动换行。
- **`fmt.Println`**：将内容输出到标准输出，并在末尾自动添加换行符。
- **`fmt.Printf`**：根据格式化说明符将内容输出到标准输出，不自动换行。
- **`fmt.Fprint`**：将内容输出到指定的 `io.Writer`。
- **`fmt.Sprint`**：将内容格式化为字符串，并返回该字符串。
- **`fmt.Errorf`**：格式化错误信息并返回 `error` 类型的错误。

```go
fmt.Print("Hello, ")        // 输出：Hello,
fmt.Println("World!")       // 输出：World! （并换行）
fmt.Printf("Pi is %f\n", 3.14159) // 输出：Pi is 3.14 （并换行）

// 使用 Fprint 将内容输出到一个 io.Writer
var buf bytes.Buffer
fmt.Fprint(&buf, "Buffered ")
fmt.Println(buf.String()) // 输出：Buffered

// 使用 Sprintf 格式化并存储字符串
name := "Alice"
age := 30
message := fmt.Sprintf("Name: %s, Age: %d", name, age)
fmt.Println(message) // 输出：Name: Alice, Age: 30

// 使用 Errorf 创建格式化的错误信息
err := fmt.Errorf("an error occurred: %s", "something went wrong")
fmt.Println(err) // 输出：an error occurred: something went wrong
```

## 3 格式化输出

`fmt.Printf` 是格式化输出的核心函数，使用格式化说明符对输出内容进行控制。

### 3.1 通用占位符

- **`%v`**：按变量的默认格式输出。
- **`%+v`**：在结构体时，会添加字段名。
- **`%#v`**：输出变量的 Go 语法表示。
- **`%T`**：输出变量的类型。
- **`%%`**：输出百分号 `%` 本身。

```go
type Person struct {
    Name string
    Age  int
}

p := Person{"Alice", 30}
fmt.Printf("%v\n", p)   // 输出：{Alice 30}
fmt.Printf("%+v\n", p)  // 输出：{Name:Alice Age:30}
fmt.Printf("%#v\n", p)  // 输出：main.Person{Name:"Alice", Age:30}
fmt.Printf("%T\n", p)   // 输出：main.Person
fmt.Printf("%%\n")      // 输出：%
```

### 3.2 布尔值

- **`%t`**：输出 `true` 或 `false`。

```go
fmt.Printf("%t\n", true)  // 输出：true
fmt.Printf("%t\n", false) // 输出：false
```

### 3.3 整数

- **`%b`**：二进制表示。
- **`%c`**：相应 Unicode 码点的字符。
- **`%d`**：十进制表示。
- **`%o`**：八进制表示。
- **`%x`**：十六进制表示，使用小写字母。
- **`%X`**：十六进制表示，使用大写字母。
- **`%U`**：Unicode 格式：U+1234。

```go
n := 42
fmt.Printf("%b\n", n)  // 输出：101010
fmt.Printf("%c\n", n)  // 输出：*
fmt.Printf("%d\n", n)  // 输出：42
fmt.Printf("%o\n", n)  // 输出：52
fmt.Printf("%x\n", n)  // 输出：2a
fmt.Printf("%X\n", n)  // 输出：2A
fmt.Printf("%U\n", n)  // 输出：U+002A
```

### 3.4 浮点数与复数

- **`%f`**：十进制格式。
- **`%e`**：科学计数法格式，使用小写 `e`。
- **`%E`**：科学计数法格式，使用大写 `E`。
- **`%g`**：根据实际情况选择 `%%e` 或 `%%f`。
- **`%G`**：根据实际情况选择 `%%E` 或 `%%F`。

```go
f := 3.14159
fmt.Printf("%f\n", f)   // 输出：3.141590
fmt.Printf("%e\n", f)   // 输出：3.141590e+00
fmt.Printf("%E\n", f)   // 输出：3.141590E+00
fmt.Printf("%g\n", f)   // 输出：3.14159
fmt.Printf("%G\n", f)   // 输出：3.14159
```

### 3.5 字符串与字节切片

- **`%s`**：输出字符串或字节切片。
- **`%q`**：输出带双引号的字符串。
- **`%x`**：将字符串或字节切片转换为十六进制，并以字节为单位输出。
- **`%X`**：同 `%x`，但使用大写字母。

```go
str := "Hello"
fmt.Printf("%s\n", str)   // 输出：Hello
fmt.Printf("%q\n", str)   // 输出："Hello"
fmt.Printf("%x\n", str)   // 输出：48656c6c6f
fmt.Printf("%X\n", str)   // 输出：48656C6C6F
```

### 3.6 宽度与精度控制

可以通过指定宽度和精度对格式化输出进行更精细的控制：

- **`%5d`**：输出宽度为 5 的整数，右对齐。
- **`%-5d`**：输出宽度为 5 的整数，左对齐。
- **`%f`**：保留两位小数的浮点数。
- **`%7.2f`**：输出宽度为 7 的浮点数，其中包含两位小数。

```go
n := 42
f := 3.14159

fmt.Printf("%5d\n", n)   // 输出：   42
fmt.Printf("%-5d\n", n)  // 输出：42   
fmt.Printf("%f\n", f)    // 输出：3.141590
fmt.Printf("%7.2f\n", f) // 输出：   3.14
```

### 3.7 指针

- **`%p`**：输出指针的值（地址）。

```go
ptr := &n
fmt.Printf("%p\n", ptr)  // 输出类似：0x1040a124
```

### 3.8 格式化占位符的补充

- **`+` 标志**：对整数输出符号，正数加 `+`，负数加 `-`。对字符串 `%q`，`+` 标志会将字符串中的非 ASCII 字符（如 "世界"）以 Unicode 码点的形式输出。例如 "世" 对应的 Unicode 码点是 `\u4e16`，"界" 对应 `\u754c`。
- **`0` 标志**：将数字填充到指定宽度，使用前导零。
- **`-` 标志**：左对齐输出内容。
- **`#` 标志**：用于显示进制前缀，如 `0x` 表示十六进制。
- **`'` 标志**：为数字添加千位分隔符。
- **`_` 标志**：为浮点数的指数部分增加下划线分隔符，便于区分大数。

```go
package main

import (
    "fmt"
)

func main() {
    n := 12345
    f := 12345.67890
    str := "Hello\nWorld"
    
    // 使用 %+v, %#v, +, #, 0, - 标志符进行格式化输出
    fmt.Printf("%+d\n", n)    // 输出：+12345
    fmt.Printf("%05d\n", n)   // 输出：12345（不补零）
    fmt.Printf("%-8d|\n", n)  // 左对齐，输出：12345   |
    fmt.Printf("%#x\n", n)    // 输出：0x3039 (十六进制)
    fmt.Printf("%#q\n", str)  // 输出："Hello\nWorld" (带转义)
    fmt.Printf("%'d\n", n)    // 输出：12,345 (千分位)
    
    // 使用 _ 标志符，改善浮点数输出
    fmt.Printf("%_e\n", f)    // 输出：1.234567890e+04 (下划线分隔符)
    
    // + 对 %q 的作用，显示字符串的 Unicode 码点和转义字符
    fmt.Printf("%+q\n", str) // 输出："Hello\u4e16\u754c\n"
}
```

### 3.9 获取输入

- **`fmt.Scan`**：从标准输入读取数据并赋值给变量，遇到空格或换行时结束。
- **`fmt.Scanf`**：根据格式化说明符从标准输入读取数据并赋值给变量。
- **`fmt.Scanln`**：从标准输入读取数据直到遇到换行符。
- **`fmt.Fscan`**：从指定的 `io.Reader` 读取数据并赋值给变量。
- **`fmt.Fscanf`**：根据格式化说明符从 `io.Reader` 读取数据并赋值给变量。
- **`fmt.Fscanln`**：从 `io.Reader` 读取数据直到遇到换行符。
- **`fmt.Sscan`**：从字符串读取数据并赋值给变量。
- **`fmt.Sscanf`**：根据格式化说明符从字符串中读取数据并赋值给变量。
- **`fmt.Sscanln`**：从字符串读取数据直到遇到换行符。
- **`bufio.NewReader`**：创建一个新的 `bufio.Reader`，可以用来逐行或逐字符读取输入。

```go
package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

func main() {
    var name string
    var age int

    fmt.Print("Enter your name: ")
    fmt.Scan(&name) // 从标准输入读取名字

    fmt.Print("Enter your age: ")
    fmt.Scanf("%d", &age) // 从标准输入读取年龄

    fmt.Printf("Name: %s, Age: %d\n", name, age)

    // 使用 bufio.NewReader 逐行读取输入
    reader := bufio.NewReader(os.Stdin)
    fmt.Print("Enter some text: ")
    text, _ := reader.ReadString('\n') // 读取直到换行符
    fmt.Printf("You entered: %s", text)

    // 使用 fmt.Fscan 从文件读取数据
    f, _ := os.Open("input.txt") // 假设文件 input.txt 存在
    defer f.Close()
    var fileName string
    fmt.Fscan(f, &fileName)
    fmt.Printf("Read from file: %s\n", fileName)

    // 使用 fmt.Fscanf 读取并格式化数据
    f.Seek(0, 0) // 将文件指针重置到文件开头
    var formattedStr string
    fmt.Fscanf(f, "%s", &formattedStr)
    fmt.Printf("Formatted read from file: %s\n", formattedStr)

    // 使用 fmt.Fscanln 从文件读取数据直到换行符
    f.Seek(0, 0) // 重置文件指针
    var line string
    fmt.Fscanln(f, &line)
    fmt.Printf("Line from file: %s\n", line)

    // 使用 fmt.Sscan 从字符串读取数据
    inputStr := "Alice 25"
    var personName string
    var personAge int
    fmt.Sscan(inputStr, &personName, &personAge)
    fmt.Printf("From string - Name: %s, Age: %d\n", personName, personAge)

    // 使用 fmt.Sscanf 从字符串中按格式读取数据
    inputStrFormatted := "Bob is 30 years old"
    var name2 string
    var age2 int
    fmt.Sscanf(inputStrFormatted, "%s is %d", &name2, &age2)
    fmt.Printf("Formatted from string - Name: %s, Age: %d\n", name2, age2)

    // 使用 fmt.Sscanln 从字符串读取数据直到换行符
    inputStrWithNewline := "Hello World\n"
    var word1, word2 string
    fmt.Sscanln(inputStrWithNewline, &word1, &word2)
    fmt.Printf("Words from string: %s, %s\n", word1, word2)
}
```
