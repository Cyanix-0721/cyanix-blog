---
tags:
  - Go
  - Language
---

# Go

> [!important]  
>
> 该 Markdown 基于 [Go语言学习之路/Go语言教程 | 李文周的博客](https://www.liwenzhou.com/posts/Go/golang-menu/)学习编写

下面是一个关于如何在 Windows 系统上配置 Go 开发环境的基础文档，从使用 Chocolatey 安装 Go 到 Go mod 的相关配置步骤。

## 1 安装 Go

1. **[官方](https://golang.google.cn/)下载安装**
2. **使用 Chocolatey 安装 Go**：
   - 在管理员权限的 PowerShell 终端中，执行以下命令安装 Go：

	 ```powershell
     choco install golang -y
     ```

   - 安装完成后，验证 Go 是否安装成功：

	 ```powershell
     go version
     ```

	 正常情况下会输出 Go 的版本信息，表示安装成功。

## 2 配置环境变量

安装完成后，Chocolatey 会自动将 Go 的安装路径添加到系统环境变量中，通常无需手动配置。但如果你需要手动配置或检查环境变量，可以按照以下步骤操作：

1. **打开环境变量设置**：
   - 右键点击“此电脑” -> “属性” -> “高级系统设置” -> “环境变量”。

2. **检查或添加 `GOROOT` 和 `GOPATH`**：
   - `GOROOT`：表示 Go 的安装目录，通常在 `C:\Program Files\Go`。
   - `GOPATH`：表示 Go 的工作区，建议设置为你常用的开发目录，比如 `C:\Users\你的用户名\go`。

3. **添加到 `PATH` 环境变量**：
   - 将 `GOROOT\bin` 和 `GOPATH\bin` 路径添加到 `PATH` 环境变量中，以便在终端中全局使用 `go` 命令。

## 3 Go 基础应用

### 3.1 使用Go Mod管理依赖

Go modules（Go mod）是Go语言用于管理项目依赖的工具，支持版本化、模块化开发。以下是Go mod的一些常用命令及其参数的详细说明。

1. **初始化项目**：
   - 在新建项目目录后，使用以下命令初始化模块：

	 ```shell
     go mod init <module_name>
     ```

	 - `<module_name>`：模块名称，通常是项目的导入路径。例如，`github.com/user/myproject`。

2. **常用`go mod`命令**：

   - `go mod tidy`：
	 - 该命令会清理`go.mod`文件，删除未使用的依赖，并添加缺少的依赖包。
	 - 参数：
	   - `-e`：报告错误后继续执行，尽可能地更新`go.mod`文件。
	   - `-v`：显示被修剪的包和模块信息。

   - `go mod vendor`：
	 - 将所有依赖包下载到`vendor`目录，以便在构建时离线使用。
	 - 参数：
	   - `-v`：显示下载和处理的依赖包信息。

   - `go mod download`：
	 - 下载`go.mod`文件中列出的所有依赖包。
	 - 参数：
	   - `-x`：显示下载的详细命令。
	   - `-json`：以JSON格式输出下载的信息。

   - `go mod graph`：
	 - 显示模块依赖图，输出格式为`module1 -> module2`的依赖关系。
	 - 参数：
	   - 无特定参数，直接输出依赖关系图。

   - `go mod verify`：
	 - 验证`go.sum`文件中列出的模块是否在本地正确缓存，并确保没有篡改。

   - `go mod why`：
	 - 解释为什么需要一个特定的依赖模块。
	 - 参数：
	   - `<package>`：需要解释的依赖包。

   - `go mod edit`：
	 - 该命令用于直接编辑`go.mod`文件，可以修改模块的依赖、版本等。
	 - 参数：
	   - `-require=<module@version>`：添加一个模块依赖。例如：`go mod edit -require=example.com/somepkg@v1.2.3`。
	   - `-droprequire=<module>`：删除一个模块依赖。
	   - `-replace=<old>@<version>=<new>@<newversion>`：替换依赖模块。例如：`go mod edit -replace=oldmodule@v1.0.0=newmodule@v2.0.0`。
	   - `-exclude=<module@version>`：从模块的依赖中排除特定版本的模块。
	   - `-fmt`：格式化该文件。

3. `go get`：
	- 该命令用于下载并安装指定的模块或包，同时更新`go.mod`文件。对于现有模块，它会升级、降级或保持模块的版本。
	- 参数：
		- `package`：指定要安装或更新的模块路径。例如：`go get github.com/user/package`。
		- `-u`：更新模块到最新版本。例如：`go get -u github.com/user/package`。
		- `-u=patch`：仅更新到最新的小版本更新（补丁版本），例如：`go get -u=patch github.com/user/package`。
		- `-d`：只下载不安装，通常用于准备好依赖但不编译它们，例如：`go get -d github.com/user/package`。
		- `-insecure`：允许使用不安全的HTTP连接，而非HTTPS（不推荐），例如：`go get -insecure github.com/user/package`。

> [!note] 版本号
>
> 在 Go 语言中，模块版本号有多种写法。以下是对版本号的不同写法的支持说明：
>
> 1. **`v1.2`**：表示具体的版本号。这是最常见的形式，用于指定一个稳定版本。
>
> 	```sh  
> 	go get example.com/module@v1.2  
> 	```
>
> 1. **`@main`**：表示模块的最新主分支版本。适用于从主分支获取最新的开发版本。
>
> 	```sh  
> 	go get example.com/module@main  
> 	```
>
> 1. **`@e3702bed2`**：表示一个具体的提交哈希值。用于获取某个特定提交的版本，通常用于调试或特定的需求。
>
> 	```sh  
> 	go get example.com/module@e3702bed2  
> 	```
>
> 这些不同的版本号写法使得 Go 的模块系统具有灵活性，可以根据需要获取稳定的版本、最新的开发版本或某个特定的提交版本。

### 3.2 常用的Go命令

Go语言提供了多种命令来编译、运行和安装项目代码。以下是这些命令的详细使用说明。

1. **构建（build）**：
   - `go build`用于编译Go代码，生成可执行文件。
   - 示例：

	 ```shell
     go build
     ```

	 这会在当前目录下生成一个与目录名或主文件名相同的可执行文件。

   - 参数：
	 - `-o <output>`：指定输出文件名。例如：`go build -o myapp`。
	 - `-a`：强制重新编译所有包，不管它们是否已经是最新的。
	 - `-v`：显示正在编译的包的名称。
	 - `-race`：启用数据竞争检测（适用于支持的操作系统和架构）。

2. **运行（run）**：
   - `go run`用于编译并立即运行Go代码，而不生成可执行文件。
   - 示例：

	 ```shell
     go run main.go
     ```

   - 这会编译并立即执行`main.go`中的代码。

   - 参数：
	 - `-race`：启用数据竞争检测。

3. **安装（install）**：
   - `go install`用于编译并安装包或命令。
   - 示例：

	 ```shell
     go install
     ```

	 这会将编译后的可执行文件安装到`$GOPATH/bin`目录中（对于模块化项目则安装到`$GOBIN`目录中）。

   - 参数：
	 - `-v`：显示被安装的包信息。

4. **清理（clean）**：
   - `go clean`用于删除与构建相关的文件。
   - 示例：

	 ```shell
     go clean
     ```

	 这会清理当前模块下的构建缓存、临时文件等。

   - 参数：
	 - `-i`：删除安装的二进制文件。
	 - `-r`：递归清理指定目录及其子目录中的所有包。

### 3.3 `go.mod`

> [!example] `go.mod`
>
> ```go
> module example.com/myapp
> 
> go 1.18
> 
> require (
>     github.com/gin-gonic/gin v1.7.4
>     github.com/jinzhu/gorm v1.9.16
> )
> 
> replace (
>     github.com/jinzhu/gorm => gorm.io/gorm v1.0.0
> )
> ```

`go.mod` 文件是 Go 语言模块的配置文件，用于定义模块的依赖关系和其他相关信息。

1. **module**:
   - 这一行定义了模块的路径，通常是一个 URL 格式的路径，指向模块的根目录。这个路径在 Go 生态系统中是唯一的，通常与代码托管服务（如 GitHub）上的路径相对应。

2. **go**:
   - 这一行指定了模块所使用的 Go 语言版本。在这个示例中，`go 1.18` 表示该模块使用 Go 1.18 版本。这个信息有助于确保代码在特定版本的 Go 环境中编译和运行。

3. **require**:
   - 这一部分列出了模块所依赖的其他模块及其版本。在这个示例中，`github.com/gin-gonic/gin` 和 `github.com/jinzhu/gorm` 是两个依赖模块，后面跟着它们的版本号。Go 会自动下载这些依赖并将其包含在构建中。

4. **replace**:
   - 这一部分用于替换某个依赖模块的路径或版本。在这个示例中，`github.com/jinzhu/gorm` 被替换为 `gorm.io/gorm`，并指定了一个新的版本 `v1.0.0`。这在以下情况下非常有用：
	 - 当你需要使用一个模块的不同版本时。
	 - 当你需要从一个不同的源（例如本地路径或私有仓库）获取模块时。
	 - 当你需要修复某个依赖的 bug 或者使用一个 fork 版本时。

### 3.4 使用 Go Module 导入包

#### 3.4.1 前提

假设我们有两个包：`moduledemo` 和 `mypackage`，其中 `moduledemo` 包中会导入 `mypackage` 包并使用它的 `New` 方法。

`mypackage/mypackage.go` 内容如下：

```go
package mypackage

import "fmt"

func New() {
    fmt.Println("mypackage.New")
}
```

#### 3.4.2 在同一个项目下

在同一个项目下，我们可以定义多个包。以下是目录结构：

```
moduledemo
├── go.mod
├── main.go
└── mypackage
    └── mypackage.go
```

##### 3.4.2.1 导入包

在 `moduledemo/go.mod` 中按如下定义：

```go
module moduledemo

go 1.23.0
```

然后在 `moduledemo/main.go` 中按如下方式导入 `mypackage`：

```go
package main

import (
    "fmt"
    "moduledemo/mypackage"  // 导入同一项目下的 mypackage 包
)

func main() {
    mypackage.New()
    fmt.Println("main")
}
```

#### 3.4.3 不在同一个项目下

如果 `mypackage` 不在同一个项目路径下，目录结构如下：

```
├── moduledemo
│   ├── go.mod
│   └── main.go
└── mypackage
    ├── go.mod
    └── mypackage.go
```

##### 3.4.3.1 导入包

在 `mypackage` 中也需要进行模块初始化，即拥有一个属于自己的 `go.mod` 文件，内容如下：

```go
module mypackage

go 1.23.0
```

然后在 `moduledemo/main.go` 中按如下方式导入：

```go
package main

import (
    "fmt"
    "mypackage"
)

func main() {
    mypackage.New()
    fmt.Println("main")
}
```

##### 3.4.3.2 使用 `replace` 指令

由于这两个包不在同一个项目路径下，且这些包没有发布到远程的 GitHub 或其他代码仓库地址，我们需要在 `moduledemo/go.mod` 文件中使用 `replace` 指令。

在 `moduledemo/go.mod` 中按如下方式指定使用相对路径来寻找 `mypackage` 包：

```go
module moduledemo

go 1.23.0

require mypackage v0.0.0
replace mypackage => ../mypackage
```

## 4 标识符 & 关键字 & 保留字

> [!note] 命名规则
>
> ### 包名
>
> 1. **简短且有意义**：包名应该简短且能反映包的功能。例如，[`fmt`](vscode-file://vscode-app/d:/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html "Go to definition") 包用于格式化 I/O，`http` 包用于处理 HTTP 请求。
> 2. **小写字母**：包名应该全部使用小写字母，不使用下划线或驼峰命名法。
> 3. **避免与标准库冲突**：尽量避免使用与标准库包名相同的名称，以免引起冲突。
>
> ### 变量名和函数名
>
> 1. **驼峰命名法**：变量名和函数名通常使用驼峰命名法（CamelCase），例如 `userName`、`calculateSum`。
> 2. **首字母大小写**：
> 	- **小写字母开头**：如果变量或函数只在包内可见，使用小写字母开头。
> 	- **大写字母开头**：如果变量或函数需要导出（在包外可见），使用大写字母开头。
> 1. **有意义且简洁**：变量名和函数名应该有意义且简洁，能清楚地表达其用途。例如，`count` 比 `c` 更有意义，但 `numberOfItemsCounted` 可能过于冗长。
> ### 文件名
>
> 1. **小写字母**：文件名应该全部使用小写字母，不使用空格或特殊字符。可以使用下划线分隔单词，例如 `main_test.go`。
> 2. **与包名相关**：文件名通常与包名相关，以便于识别。例如，`http` 包中的文件可以命名为 `client.go`、`server.go`。
> 3. **测试文件**：测试文件以 `_test.go` 结尾，例如 `main_test.go`。

### 4.1 标识符

在编程语言中，标识符是程序员定义的具有特殊意义的词，比如变量名、常量名、函数名等。Go 语言中的标识符由字母、数字和下划线 `_` 组成，并且只能以字母和 `_` 开头。

### 4.2 关键字

| 关键字        | 说明                                                           |
| ------------- | -------------------------------------------------------------- |
| `break`       | 中断循环或条件块，跳出最内层的循环或 `switch`、`select` 语句。 |
| `default`     | `switch` 语句中默认执行的分支。                                |
| `func`        | 定义函数或方法。                                               |
| `interface`   | 定义接口类型，接口是方法签名的集合。                           |
| `select`      | 用于处理多个通道操作的选择结构。                               |
| `case`        | `switch` 或 `select` 语句中的分支条件。                        |
| `defer`       | 延迟执行某个函数或方法，通常用于资源清理操作。                 |
| `go`          | 启动一个新的 goroutine，实现并发。                             |
| `map`         | 定义映射类型，键值对集合。                                     |
| `struct`      | 定义结构体类型，由零个或多个字段组成的数据集合。               |
| `chan`        | 定义通道类型，用于 goroutine 间通信。                          |
| `else`        | `if` 语句中的条件分支，不成立时执行的代码块。                  |
| `goto`        | 跳转到同一函数中的指定标签位置。                               |
| `package`     | 定义包，每个 Go 源文件都属于一个包。                           |
| `switch`      | 条件分支语句，根据表达式的值选择分支。                         |
| `const`       | 声明常量，值在编译时确定，运行期间不变。                       |
| `fallthrough` | `switch` 语句中继续执行后续分支的关键字。                      |
| `if`          | 条件判断语句，条件为 `true` 时执行代码块。                     |
| `range`       | 遍历数组、切片、映射、通道等数据结构。                         |
| `type`        | 定义新类型或类型别名。                                         |
| `continue`    | 跳过当前循环的剩余代码，开始下一次迭代。                       |
| `for`         | 定义循环结构，唯一的循环结构。                                 |
| `import`      | 导入其他包的代码。                                             |
| `return`      | 从函数中返回结果并退出函数执行。                               |
| `var`         | 声明变量，外部声明的为全局变量。                               |

### 4.3 保留字

| 保留字       | 分类 | 说明                                                                               |
| ------------ | ---- | ---------------------------------------------------------------------------------- |
| `true`       | 常量 | 布尔类型的真值。                                                                   |
| `false`      | 常量 | 布尔类型的假值。                                                                   |
| `iota`       | 常量 | 常量生成器，常用于定义枚举类型。                                                   |
| `nil`        | 常量 | 表示指针、通道、函数、接口、映射或切片的零值。                                     |
| `int`        | 类型 | 有符号整型，大小与平台有关。                                                       |
| `int8`       | 类型 | 8 位有符号整型。                                                                   |
| `int16`      | 类型 | 16 位有符号整型。                                                                  |
| `int32`      | 类型 | 32 位有符号整型。                                                                  |
| `int64`      | 类型 | 64 位有符号整型。                                                                  |
| `uint`       | 类型 | 无符号整型，大小与平台有关。                                                       |
| `uint8`      | 类型 | 8 位无符号整型，也叫 `byte`。                                                      |
| `uint16`     | 类型 | 16 位无符号整型。                                                                  |
| `uint32`     | 类型 | 32 位无符号整型。                                                                  |
| `uint64`     | 类型 | 64 位无符号整型。                                                                  |
| `uintptr`    | 类型 | 用于存放一个指针的无符号整型。                                                     |
| `float32`    | 类型 | 32 位 IEEE-754 浮点数。                                                            |
| `float64`    | 类型 | 64 位 IEEE-754 浮点数。                                                            |
| `complex64`  | 类型 | 32 位实数和虚数部分组成的复数。                                                    |
| `complex128` | 类型 | 64 位实数和虚数部分组成的复数。                                                    |
| `bool`       | 类型 | 布尔型，只能取 `true` 或 `false`，默认 `false`, 不参与数值运算且不与其他类型转换。 |
| `byte`       | 类型 | 等同于 `uint8`，表示一个字节。                                                     |
| `rune`       | 类型 | 等同于 `int32`，表示一个 Unicode 码点。                                            |
| `string`     | 类型 | 字符串类型。                                                                       |
| `error`      | 类型 | 内建接口类型，表示错误情况。                                                       |
| `make`       | 函数 | 创建切片、映射和通道，返回已初始化的值。                                           |
| `len`        | 函数 | 获取字符串、数组、切片、映射或通道的长度。                                         |
| `cap`        | 函数 | 获取切片或通道的容量。                                                             |
| `new`        | 函数 | 分配内存，返回指向新分配类型零值的指针。                                           |
| `append`     | 函数 | 向切片添加元素，返回新的切片。                                                     |
| `copy`       | 函数 | 复制切片的内容。                                                                   |
| `close`      | 函数 | 关闭通道。                                                                         |
| `delete`     | 函数 | 删除映射中的键值对。                                                               |
| `complex`    | 函数 | 构建复数。                                                                         |
| `real`       | 函数 | 获取复数的实部。                                                                   |
| `imag`       | 函数 | 获取复数的虚部。                                                                   |
| `panic`      | 函数 | 生成一个运行时错误，通常会导致程序崩溃。                                           |
| `recover`    | 函数 | 恢复 panic 产生的错误，使程序继续运行。                                            |

## 5 变量

> [!warning]
>
> - 函数外的每个语句都必须以关键字开始（`var`、`const`、`func` 等）。
> - `:=` 不能在函数外使用。
> - `_` 多用于占位，表示忽略值。

- **声明和初始化**：在 Go 中，变量声明与初始化可以分开或一起完成。与 Java 类似，但类型在变量名后面。

  ```go
  var name string = "Q1mi"  // 显式声明和初始化
  var age = 18              // 类型推导
  ```

- **批量声明**：可以一次性声明多个变量。

  ```go
  var (
      a string
      b int
  )
  ```

- **短变量声明**：在函数内部可以使用 `:=` 进行简洁声明，这有点像 Java 中的局部变量声明，不过没有类型。

  ```go
  n := 10
  ```

- **匿名变量**：用 `_` 来忽略某些返回值，相当于 Java 中的占位符。

  ```go
  _, y := foo()  // 忽略第一个返回值
  ```

> [!tip] `_`
>
> 在 Go 语言中，除了可以用 `_` 作为匿名变量来忽略返回值外， `_` 还可以用于在数字字面量中作为分隔符，增强数字的可读性。使用 `_` 分隔数字不会影响数字的值，只是为了使代码更清晰，尤其是在处理较大的数值时。
>
> 例如：
>
> ```go
> var largeNumber int = 1_000_000  // 等同于 1000000
> ```
>
> 在这个例子中，`1_000_000` 和 `1000000` 是相同的数值，但前者通过使用 `_` 使数字的每三位数以 `_` 分隔，使其更易读。这种表示法在表示大数字或多个数字时特别有用。

## 6 常量

Go 的常量使用 `const` 声明，一旦声明，其值不能改变。类似于 Java 的 `final` 关键字。

  ```go
  const pi = 3.1415
  ```

### 6.1 Iota

- `iota` 是 Go 语言的常量计数器，通常用于简化常量定义。
- `iota` 在 `const` 声明块中每新增一行时递增。在下一个 `const` 出现时重置为 0。
- 使用 `_` 作为变量名可以跳过 `iota` 的当前值，不进行赋值。
- 直接写变量名不进行赋值则自动赋值 `iota`。

> [!example]
>
> ```go
> const (
>     a = iota  // 0
>     b         // 1
>     _         // 跳过 2
>     d         // 3
> )
> ```
>
> ```go
> x, _ := foo() // 忽略第二个返回值
> _, y := foo() // 忽略第一个返回值
> ```

是的，在 Go 语言中，除了使用 `fmt` 包进行不同进制的输出，还可以在赋值时通过添加前缀直接指定数值的进制。

## 7 类型

### 7.1 数字前缀表示不同进制

- **赋值时**：通过 `0b`、`0`、`0x` 前缀表示二进制、八进制和十六进制数值。
- **输出时**：使用 `fmt` 包配合 `%b`、`%o`、`%x`、`%X` 等格式化动词进行不同进制的输出，并可通过 `#` 添加前缀。

> [!eexample]
>
> ```go
> package main
> 
> import (
>     "fmt"
> )
> 
> func main() {
>     // 不同进制的赋值方式
>     decimal := 42            // 十进制
>     binary := 0b101010       // 二进制
>     octal := 052             // 八进制
>     hexadecimalLower := 0x2a // 十六进制（小写）
>     hexadecimalUpper := 0X2A // 十六进制（大写）
> 
>     // 使用 fmt 包输出
>     fmt.Printf("Decimal: %d\n", decimal)               // 十进制输出
>     fmt.Printf("Binary: %b, with prefix: %#b\n", binary, binary)   // 二进制输出
>     fmt.Printf("Octal: %o, with prefix: %#o\n", octal, octal)      // 八进制输出
>     fmt.Printf("Hexadecimal (lowercase): %x, with prefix: %#x\n", hexadecimalLower, hexadecimalLower) // 十六进制输出（小写）
>     fmt.Printf("Hexadecimal (uppercase): %X, with prefix: %#X\n", hexadecimalUpper, hexadecimalUpper) // 十六进制输出（大写）
> }
>```
>
> 运行该代码，你会得到如下输出：
>
> ```
> Decimal: 42
> Binary: 101010, with prefix: 0b101010
> Octal: 52, with prefix: 052
> Hexadecimal (lowercase): 2a, with prefix: 0x2a
> Hexadecimal (uppercase): 2A, with prefix: 0X2A
> ```

### 7.2 字符串基础知识

#### 7.2.1 字符串转义符

Go 支持标准的字符串转义字符，用于表示特殊字符或控制字符。

- `\r`：回车符
- `\n`：换行符
- `\t`：制表符
- `\'`：单引号
- `\"`：双引号
- `\\`：反斜杠

#### 7.2.2 多行字符串

Go 支持两种定义字符串的方式：**双引号**（`""`）和 **反引号**（``` ` ```）。

- **双引号**：用于定义单行字符串，支持转义符。
- **反引号**：用于定义多行字符串，原样输出，不支持转义符。

示例：

```go
singleLine := "Hello, World!"
multiLine := `Hello,
World!`
fmt.Println(singleLine)
fmt.Println(multiLine)
```

### 7.3 字符串常用操作

#### 7.3.1 获取字符串长度

使用 `len()` 函数可以获取字符串的字节长度。

- **语法**：

  ```go
  len(s string) int
  ```

- **示例**：

  ```go
  str := "Hello, 世界"
  fmt.Println(len(str))  // 输出：13（因为汉字在 UTF-8 编码中占3个字节）
  ```

#### 7.3.2 字符串拼接

可以使用 `+` 号拼接字符串。

- **语法**：

  ```go
  str := str1 + str2
  ```

- **示例**：

  ```go
  str1 := "Hello,"
  str2 := " World!"
  result := str1 + str2
  fmt.Println(result)  // 输出：Hello, World!
  ```

`strings.Join` 用于将一个字符串切片中的元素连接成一个单独的字符串，并在每两个元素之间插入指定的分隔符。

- **语法**：

  ```go
  strings.Join(elems []string, sep string) string
  ```

- **示例**：

  ```go
  import "strings"

  strSlice := []string{"Hello", "World", "Go"}
  result := strings.Join(strSlice, ", ")
  fmt.Println(result)  // 输出：Hello, World, Go
  ```

#### 7.3.3 字符串包含判断

使用 `strings.Contains()` 可以判断一个字符串是否包含另一个字符串。

- **语法**：

  ```go
  strings.Contains(s string, substr string) bool
  ```

- **示例**：

  ```go
  import "strings"

  str := "Hello, World!"
  fmt.Println(strings.Contains(str, "World"))  // 输出：true
  ```

#### 7.3.4 字符串前缀/后缀判断

使用 `strings.HasPrefix()` 和 `strings.HasSuffix()` 判断字符串是否有特定的前缀或后缀。

- **语法**：

  ```go
  strings.HasPrefix(s string, prefix string) bool
  strings.HasSuffix(s string, suffix string) bool
  ```

- **示例**：

  ```go
  fmt.Println(strings.HasPrefix(str, "Hello")) // 输出：true
  fmt.Println(strings.HasSuffix(str, "World!")) // 输出：true
  ```

#### 7.3.5 字符串切割

使用 `strings.Split()` 可以按指定分隔符切割字符串。

- **语法**：

  ```go
  strings.Split(s string, sep string) []string
  ```

- **示例**：

  ```go
  str := "a,b,c"
  result := strings.Split(str, ",")
  fmt.Println(result)  // 输出：[a b c]
  ```

#### 7.3.6 字符串替换

使用 `strings.ReplaceAll()` 可以替换字符串中的指定内容。

- **语法**：

  ```go
  strings.ReplaceAll(s string, old string, new string) string
  ```

- **示例**：

  ```go
  str := "Hello, World!"
  result := strings.ReplaceAll(str, "World", "Go")
  fmt.Println(result)  // 输出：Hello, Go!
  ```

#### 7.3.7 字符串索引

Go 提供了 `strings.Index` 和 `strings.LastIndex` 方法，用于查找子字符串在另一个字符串中首次或最后一次出现的位置。

- **`strings.Index`**：用于查找子字符串在目标字符串中首次出现的位置，返回该位置的索引。如果未找到，则返回 `-1`。

  - **语法**：

	```go
    strings.Index(s string, substr string) int
    ```

  - **示例**：

	```go
    import "strings"

    str := "Hello, World!"
    index := strings.Index(str, "World")
    fmt.Println(index)  // 输出：7

    notFound := strings.Index(str, "Go")
    fmt.Println(notFound)  // 输出：-1
    ```

- **`strings.LastIndex`**：用于查找子字符串在目标字符串中最后一次出现的位置，返回该位置的索引。如果未找到，则返回 `-1`。

  - **语法**：

	```go
    strings.LastIndex(s string, substr string) int
    ```

  - **示例**：

	```go
    import "strings"

    str := "Hello, Hello, World!"
    lastIndex := strings.LastIndex(str, "Hello")
    fmt.Println(lastIndex)  // 输出：7

    notFound := strings.LastIndex(str, "Go")
    fmt.Println(notFound)  // 输出：-1
    ```

#### 7.3.8 字符串修改

##### 7.3.8.1 `byte`

- `byte` 是 `uint8` 的别名，表示一个字节（8位）。
- 字符串实际上是 `byte` 的序列，所以可以通过索引访问字符串的 `byte` 值。

```go
str := "Go"
b := str[0]
fmt.Printf("%c\n", b)  // 输出：G
```

##### 7.3.8.2 `rune`

- `rune` 是 `int32` 的别名，表示一个 Unicode 码点。
- 在 Go 中，`rune` 通常用来表示单个字符，因为它支持 Unicode 字符集，能够表示多字节字符。

```go
str := "世界"
for _, r := range str {
    fmt.Printf("%c\n", r)  // 逐个输出：世 界
}
```

##### 7.3.8.3 示例

> [!example] 字符串修改
>
> ```go
> package main
> 
> import (
>     "fmt"
> )
> 
> func main() {
>     // 原始字符串
>     str := "Hello, 世界"
> 
>     // 方法1：使用 []byte 修改字符串
>     // 将字符串转换为 []byte
>     byteSlice := []byte(str)
> 
>     // 修改字节切片中的内容（将 'H' 改为 'h'）
>     byteSlice[0] = 'h'
> 
>     // 将修改后的 []byte 转回字符串
>     modifiedStr1 := string(byteSlice)
>     fmt.Println("Modified using []byte:", modifiedStr1)  // 输出：hello, 世界
> 
>     // 方法2：使用 []rune 修改字符串
>     // 将字符串转换为 []rune
>     runeSlice := []rune(str)
> 
>     // 修改 rune 切片中的内容（将 '世' 改为 '界'）
>     runeSlice[7] = '界'
>     runeSlice[8] = '世'
> 
>     // 将修改后的 []rune 转回字符串
>     modifiedStr2 := string(runeSlice)
>     fmt.Println("Modified using []rune:", modifiedStr2)  // 输出：Hello, 界世
> 
>     // 注意：上述转换和修改操作都会重新分配内存并复制字节数组
> }
> ```
>
> 1. **字符串不可变**：在 Go 中，字符串一旦创建就无法修改。因此，任何对字符串的“修改”实际上都是创建了一个新的字符串。
>
> 2. **转换并修改**：
>    - **`[]byte`**：适用于处理 ASCII 字符或单字节字符。每个字符占用一个字节，因此可以直接通过索引访问并修改。
>    - **`[]rune`**：适用于处理 Unicode 字符或多字节字符。每个 `rune` 对应一个 Unicode 码点，因此对于多字节字符（如汉字），需要转换为 `rune` 才能正确处理。
>
> 3. **内存重新分配**：每次转换（`string` 转 `[]byte` 或 `[]rune`）都会重新分配内存并复制字符串的字节数组，转换回 `string` 也是如此。这种内存重新分配是因为字符串在 Go 中是只读的，而切片是可变的。
>
> 4. **强制类型转换**：Go 中的这些转换操作都是通过强制类型转换来完成的，字符串不能直接修改，只能通过转换为 `[]byte` 或 `[]rune` 来实现间接修改。

## 8 运算符

### 8.1 算术运算符

算术运算符用于执行基本的数学运算。

| 运算符 | 描述                 | 示例                        |
| ------ | -------------------- | --------------------------- |
| `+`    | 加法                 | `a + b`                     |
| `-`    | 减法                 | `a - b`                     |
| `*`    | 乘法                 | `a * b`                     |
| `/`    | 除法                 | `a / b`                     |
| `%`    | 取余                 | `a % b`                     |
| `++`   | 自增（只能用于变量） | `a++`（等价于 `a = a + 1`） |
| `--`   | 自减（只能用于变量） | `a--`（等价于 `a = a - 1`） |

> [!important] `++` & `--`
>
> 在Go语言中，`++` 和 `--` 操作符有一些特殊之处，主要体现在以下几个方面：
>
> 1. **只能作为语句使用**：
>
> 	- `++` 和 `--` 只能作为独立的语句使用，不能作为表达式的一部分。
> 	- 例如，`i++` 是合法的，但 `j = i++` 或 `k = i + (j++)` 是非法的。
> 1. **没有前置形式**：
>
> 	- Go语言中没有前置的 `++` 和 `--` 操作符（如 `++i` 或 `--i`），只有后置形式（如 `i++` 和 `i--`）。
> 1. **只能用于变量**：
>
> 	- `++` 和 `--` 操作符只能用于变量，不能用于常量或表达式。
> 	- 例如，`i++` 是合法的，但 `1++` 或 `(i + j)++` 是非法的。

### 8.2 关系运算符

关系运算符用于比较两个值，并返回布尔值（`true` 或 `false`）。

| 运算符 | 描述     | 示例     |
| ------ | -------- | -------- |
| `==`   | 等于     | `a == b` |
| `!=`   | 不等于   | `a != b` |
| `>`    | 大于     | `a > b`  |
| `<`    | 小于     | `a < b`  |
| `>=`   | 大于等于 | `a >= b` |
| `<=`   | 小于等于 | `a <= b` |

### 8.3 逻辑运算符

逻辑运算符用于对布尔值进行逻辑运算，通常用于条件语句中。

| 运算符 | 描述   | 示例       |
| ------ | ------ | ---------- |
| `&&`   | 逻辑与 | `a && b`   |
| `\|\|` | 逻辑或 | `a \|\| b` |
| `!`    | 逻辑非 | `!a`       |

### 8.4 位运算符

位运算符用于二进制位的操作，通常用于底层编程。

| 运算符 | 描述             | 示例     |
| ------ | ---------------- | -------- |
| `&`    | 按位与           | `a & b`  |
| `\|`   | 按位或           | `a \| b` |
| `^`    | 按位异或         | `a ^ b`  |
| `&^`   | 按位清除（与非） | `a &^ b` |
| `<<`   | 左移             | `a << 2` |
| `>>`   | 右移             | `a >> 2` |

### 8.5 赋值运算符

赋值运算符用于给变量赋值。Go 支持常规的赋值运算符以及结合算术运算符的赋值运算符。

| 运算符 | 描述           | 示例                             |
| ------ | -------------- | -------------------------------- |
| `=`    | 简单赋值       | `a = b`                          |
| `+=`   | 加后赋值       | `a += b`（等价于 `a = a + b`）   |
| `-=`   | 减后赋值       | `a -= b`（等价于 `a = a - b`）   |
| `*=`   | 乘后赋值       | `a *= b`（等价于 `a = a * b`）   |
| `/=`   | 除后赋值       | `a /= b`（等价于 `a = a / b`）   |
| `%=`   | 取余后赋值     | `a %= b`（等价于 `a = a % b`）   |
| `<<=`  | 左移后赋值     | `a <<= 2`（等价于 `a = a << 2`） |
| `>>=`  | 右移后赋值     | `a >>= 2`（等价于 `a = a >> 2`） |
| `&=`   | 按位与后赋值   | `a &= b`（等价于 `a = a & b`）   |
| `\|=`  | 按位或后赋值   | `a \|= b`（等价于 `a = a \| b`） |
| `^=`   | 按位异或后赋值 | `a ^= b`（等价于 `a = a ^ b`）   |
| `&^=`  | 按位清除后赋值 | `a &^= b`（等价于 `a = a &^ b`） |

## 9 流程控制

### 9.1 条件判断

Go 语言的条件判断语句包括 `if`、`else if`、`else` 和 `switch` 结构。

**`if` 语句**

`if` 语句用于根据条件表达式的布尔值来决定代码块是否执行。与 Java 类似，Go 的 `if` 语句不需要将条件表达式括在圆括号中。

```go
if condition {
    // 执行代码
}
```

可以在 `if` 语句中初始化变量：

```go
if x := 10; x > 5 {
    fmt.Println("x 大于 5")
}
```

**`if-else` 语句**

`if-else` 语句在条件表达式为 `false` 时执行 `else` 块。

```go
if condition {
    // 如果条件为 true，执行此块
} else {
    // 如果条件为 false，执行此块
}
```

**`else if` 语句**

`else if` 语句用于检测多个条件，只要有一个条件为 `true`，相应的代码块将被执行。

```go
if condition1 {
    // 执行代码
} else if condition2 {
    // 执行代码
} else {
    // 执行代码
}
```

### 9.2 `switch` 语句

`switch` 语句用于替代多个 `if-else` 的情况，判断变量的值并执行对应的代码块。Go 的 `switch` 语句无需 `break`，因为默认情况下每个 `case` 执行后会自动终止，不会“贯穿”到下一个 `case`，除非使用 `fallthrough` 关键字。

```go
switch variable {
case value1:
    // 执行代码
case value2:
    // 执行代码
default:
    // 执行代码
}
```

可以省略 `switch` 后的变量名，这样就相当于多个 `if-else` 的替代方案：

```go
switch {
case x > 0:
    fmt.Println("x 是正数")
case x < 0:
    fmt.Println("x 是负数")
default:
    fmt.Println("x 是零")
}
```

### 9.3 循环

在 Go 语言中，`for` 循环的三个参数（初始语句、条件表达式和递增语句）都可以被省略，但只有在仅使用条件表达式时可以不写分号 (`;`)。

**完整的 `for` 循环**：

```go
for init; condition; post {
	// 循环体
}
```

**省略初始语句和递增语句**：

```go
for ; condition; {
	// 循环体
}
```

**省略初始语句和条件表达式**：

```go
for ; ; post {
	// 循环体
}
```

**省略条件表达式和递增语句**：

```go
for init; ; {
	// 循环体
}
```

**仅使用条件表达式**（可以省略分号）：

```go
for condition {
	// 循环体
}
```

**无限循环**（省略所有部分）：

```go
for {
	// 循环体
}
```

> [!example]
>
> ```go
> package main
>
> import "fmt"
> 
> func main() {
>     // 完整的 for 循环
>     for i := 0; i < 5; i++ {
>         fmt.Println(i)
>     }
> 
>     // 省略初始语句和递增语句
>     j := 0
>     for ; j < 5; {
>         fmt.Println(j)
>         j++
>     }
> 
>     // 省略初始语句和条件表达式
>     k := 0
>     for ; ; k++ {
>         if k >= 5 {
>             break
>         }
>         fmt.Println(k)
>     }
> 
>     // 省略条件表达式和递增语句
>     l := 0
>     for l < 5 {
>         fmt.Println(l)
>         l++
>     }
> 
>     // 仅使用条件表达式
>     m := 0
>     for m < 5 {
>         fmt.Println(m)
>         m++
>     }
> 
>     // 无限循环
>     n := 0
>     for {
>         if n >= 5 {
>             break
>         }
>         fmt.Println(n)
>         n++
>     }
> }
> ```

### 9.4 `for range` 语句

> [!tip] `for range`
>
> - 对于数组/切片/字符串，`for range` 返回的索引是从 0 开始的整数，值是元素的副本，而不是对原数组/切片/字符串的引用。
> - 对于映射，`for range` 遍历的顺序是随机的，每次迭代的顺序可能不同。
> - 对于通道，`for range` 将一直接收数据，直到通道被关闭。

在 Go 语言中，`for range` 语句是一种常见的遍历数据结构的方式，用于迭代*数组、切片、映射、字符串、通道*等数据类型。它简化了对集合类型的遍历，避免了手动维护索引的麻烦。

```go
for key, value := range collection {
    // 循环体
}
```

**遍历数组或切片**：

```go
arr := []int{1, 2, 3, 4}
for index, value := range arr {
    fmt.Println(index, value)
}
```

**遍历映射（map）**：

```go
m := map[string]int{"a": 1, "b": 2}
for key, value := range m {
    fmt.Println(key, value)
}
```

**遍历字符串**：

```go
str := "hello"
for index, char := range str {
    fmt.Printf("index: %d, char: %c\n", index, char)
}
```

在遍历字符串时，`char` 是 Unicode 字符，可以用 `%c` 格式化打印。

**遍历通道（channel）**：

```go
ch := make(chan int, 2)
ch <- 1
ch <- 2
close(ch)
for value := range ch {
    fmt.Println(value)
}
```

在遍历通道时，`range` 会从通道中接收值，直到通道被关闭。

#### 9.4.1 忽略索引或值

在某些情况下，您可能只需要索引或值，可以使用匿名变量 `_` 来忽略不需要的部分。

- **忽略索引**：

```go
for _, value := range arr {
    fmt.Println(value)
}
```

- **忽略值**：

```go
for index := range arr {
    fmt.Println(index)
}
```

### 9.5 跳转语句

Go 语言中的跳转语句包括 `break`、`continue` 和 `goto`。这些语句用于控制程序的执行流程，提供了在循环和选择结构中跳转的能力。

> [!tip] 标签通常用于 `for`、`switch`、`select` 语句中，以便在复杂条件下实现跳转，但并不强制要求标签必须定义在这些语句上。尽量避免过度使用标签和 `goto`，以保持代码的可读性。

#### 9.5.1 `break` 语句

`break` 语句用于终止当前的循环或跳出 `switch` 语句。当 `break` 语句被执行时，程序会立即跳出循环或 `switch`，继续执行后续代码。

```go
for i := 0; i < 10; i++ {
    if i == 5 {
        break  // 当 i 等于 5 时，终止循环
    }
    fmt.Println(i)
}
```

#### 9.5.2 `continue` 语句

`continue` 语句用于跳过当前循环的剩余部分，立即进入下一次循环。`continue` 语句只能用于 `for` 循环，不能在其他控制结构中使用。

```go
for i := 0; i < 10; i++ {
    if i%2 == 0 {
        continue  // 跳过偶数
    }
    fmt.Println(i)  // 只打印奇数
}
```

#### 9.5.3 `goto` 语句

`goto` 语句用于无条件跳转到代码中的某个标签。标签是一行代码的标识符，后跟冒号 `:`。`goto` 语句在实际编程中使用较少，因为它可能使代码难以理解和维护。

```go
func main() {
    i := 0
Label:
    fmt.Println(i)
    i++
    if i < 5 {
        goto Label  // 跳转到标签 Label，重新开始循环
    }
}
```

### 9.6 `select` 语句

`select` 是 Go 语言中的一种特殊控制结构，用于处理多个通道（channel）操作的同时选择。`select` 语句会监听在 `case` 中列出的通道操作，选择一个已经准备好的通道进行处理。如果多个通道同时准备好，`select` 会随机选择一个执行。如果没有通道操作准备好，`select` 会阻塞，直到有通道操作准备好为止。

#### 9.6.1 基本语法

```go
select {
case <-chan1:
    // 当 chan1 可读时执行
case chan2 <- value:
    // 当 chan2 可写时执行
default:
    // 当所有通道都不可用时执行
}
```

#### 9.6.2 示例

```go
func main() {
    ch1 := make(chan int)
    ch2 := make(chan int)

    go func() {
        ch1 <- 1
    }()

    go func() {
        ch2 <- 2
    }()

    select {
    case msg1 := <-ch1:
        fmt.Println("Received", msg1)
    case msg2 := <-ch2:
        fmt.Println("Received", msg2)
    default:
        fmt.Println("No channel operation was ready")
    }
}
```

在这个例子中，`select` 会监听 `ch1` 和 `ch2` 的读取操作，并根据哪个通道先收到数据来决定执行哪个 `case`。

**注意**:
- `select` 语句中的每个 `case` 必须包含一个通道操作。
- `default` 分支是可选的，当没有通道准备好时，它可以防止 `select` 语句阻塞。

## 10 数组

在 Go 语言中，数组是具有固定长度的同类型元素的集合。数组是一种值类型数据结构，它可以存储相同数据类型的多个元素。数组的长度在定义后无法改变，因此在使用数组时，必须指定其长度。

### 10.1 数组的声明与初始化

在 Go 中，数组的声明需要指定长度和元素类型，语法格式如下：

```go
var arrayName [size]elementType
```

**示例：**

```go
var arr1 [5]int          // 声明一个长度为5的整数数组，元素默认值为0
var arr2 = [3]string{"Go", "Java", "Python"}  // 声明并初始化一个字符串数组
var arr3 = […]float64{1.1, 2.2, 3.3}  // 通过初始化内容推导数组长度
```

### 10.2 数组的访问

数组中的元素可以通过索引来访问，索引从 `0` 开始，最后一个元素的索引为 `数组长度 - 1`。使用数组的语法如下：

```go
arrayName[index]
```

**示例：**

```go
var arr = [3]int{1, 2, 3}
fmt.Println(arr[0])  // 输出：1
fmt.Println(arr[1])  // 输出：2
fmt.Println(arr[2])  // 输出：3

arr[1] = 20
fmt.Println(arr[1])  // 输出：20
```

### 10.3 数组的遍历

在 Go 中，可以使用 `for` 循环或 `for range` 语句来遍历数组。

**使用 `for` 循环遍历：**

```go
var arr = [3]int{1, 2, 3}
for i := 0; i < len(arr); i++ {
    fmt.Println(arr[i])
}
```

**使用 `for range` 遍历：**

```go
var arr = [3]int{1, 2, 3}
for index, value := range arr {
    fmt.Printf("Index: %d, Value: %d\n", index, value)
}
```

**注意：** 在 `for range` 语句中，`index` 是数组的索引，`value` 是数组元素的值。如果只想使用 `value` 而忽略 `index`，可以使用 `_` 占位符。

```go
for _, value := range arr {
    fmt.Println(value)
}
```

### 10.4 多维数组

> [!iimportant] 在 Go 语言中，只有第一层的数组长度可以使用 `…` 让编译器根据初始化的元素数量来推导数组的长度。对于多维数组的其他维度，必须明确指定长度。
>
> ```go
> // 正确用法：第一层使用 … 推导数组长度
>
> arr := […][2]int{  
> 	{1, 2},  
> 	{3, 4},  
> 	{5, 6},  
> }
>
> // 错误用法：第二层使用 … 会导致编译错误  
> // arr := [3][…]int{  
> // {1, 2},  
> // {3, 4},  
> // {5, 6},  
> // }
> ```

Go 语言支持多维数组，常见的是二维数组。声明方式与一维数组类似，只需增加维度。

```go
var matrix [3][4]int  // 声明一个 3x4 的二维数组
```

**初始化二维数组：**

```go
var matrix = [2][3]int{
    {1, 2, 3},
    {4, 5, 6},
}
```

**访问二维数组元素：**

```go
fmt.Println(matrix[0][1])  // 输出：2
fmt.Println(matrix[1][2])  // 输出：6
```

**遍历二维数组：**

```go
for i := 0; i < len(matrix); i++ {
    for j := 0; j < len(matrix[i]); j++ {
        fmt.Printf("matrix[%d][%d] = %d\n", i, j, matrix[i][j])
    }
}
```

**使用 `for range` 遍历二维数组：**

```go
for i, row := range matrix {
    for j, value := range row {
        fmt.Printf("matrix[%d][%d] = %d\n", i, j, value)
    }
}
```

### 10.5 数组的特点

- **固定长度**：数组长度在声明时就确定，不能动态改变。
- **同类型元素**：数组中的所有元素必须是相同的数据类型。
- **值类型**：数组是值类型，赋值或传递时会拷贝整个数组。
- - **支持 `==` / `!=`**：所有数组元素在声明时会自动初始化为其类型的零值。

**示例：**

```go
arr1 := [3]int{1, 2, 3}
arr2 := arr1       // 拷贝整个数组
arr2[0] = 100      // 修改 arr2 不会影响 arr1
fmt.Println(arr1)  // 输出：[1 2 3]
fmt.Println(arr2)  // 输出：[100 2 3]
```

> [!note] 指针数组与数组指针
>
> - **指针数组 `[n]*T`**：表示一个长度为 `n` 的数组，数组中的每个元素都是指向类型 `T` 的指针。例如，`[3]*int` 是一个包含 3 个 `int` 类型指针的数组。
> - **数组指针 `*[n]T`**：表示一个指向长度为 `n` 的数组的指针。也就是说，整个数组本身是通过一个指针来引用的。例如，`*[3]int` 是一个指向包含 3 个 `int` 类型元素数组的指针。
>
> ```go
> // 指针数组：[n]*T
> arr1 := [3]*int{new(int), new(int), new(int)}
> *arr1[0] = 1
> *arr1[1] = 2
> *arr1[2] = 3
> 
> // 数组指针：*[n]T
> arr2 := [3]int{1, 2, 3}
> ptr := &arr2
> fmt.Println(ptr)  // 输出数组指针的值
> ```
>
> - 在 `arr1` 中，数组中的每个元素是指向 `int` 类型的指针。
> - 在 `arr2` 中，`ptr` 是指向整个数组的指针，可以通过它间接访问数组元素。

### 10.6 数组与切片的区别

- **数组是固定长度的，而切片是动态的，可以根据需要增减元素。**
- **数组是值类型，而切片是引用类型。**

**示例：**

```go
arr := [3]int{1, 2, 3}
slice := arr[:]

slice[0] = 100    // 修改切片也会影响原数组
fmt.Println(arr)  // 输出：[100 2 3]
fmt.Println(slice) // 输出：[100 2 3]
```

## 11 切片

切片（Slice）是 Go 语言中的一种重要数据结构，是对数组的抽象和封装。切片是一个*动态数组*，它的长度可以改变。相比数组，切片更为灵活且使用频率更高。

- **底层数组**：切片是对底层数组的一种引用。
- **长度和容量**：切片有 `len` 和 `cap` 两个属性，分别表示切片的长度和容量。长度是切片中*元素的数量*，而容量是从切片*起始位置到底层数组末尾的元素数量*。

### 11.1 切片的创建

#### 11.1.1 通过数组或切片生成

通过数组或现有的切片创建新切片。

```go
arr := [5]int{1, 2, 3, 4, 5}
s1 := arr[1:4] // 包含元素 2, 3, 4
s2 := s1[1:2]  // 包含元素 3
```

- 切片 `s1` 包含数组 `arr` 中从索引 1 开始到索引 4 之前的元素（即 `arr[1]` 到 `arr[3]`）。
- 切片 `s2` 基于 `s1` 创建，只包含 `s1[1]` 对应的元素。

#### 11.1.2 使用 `make` 函数创建

使用 `make` 函数创建切片，可以指定切片的长度和容量。

```go
s := make([]int, 5, 10)
```

- `s` 是一个长度为 5，容量为 10 的 `int` 类型切片。
- `make([]T, len, cap)`：`len` 是切片的长度，`cap` 是切片的容量（可选，默认为 `len`）。

#### 11.1.3 通过字面量创建

直接通过切片字面量创建切片。

```go
s := []int{1, 2, 3, 4, 5}
```

- `s` 是一个包含 5 个元素的 `int` 类型切片。

### 11.2 切片的操作

#### 11.2.1 切片表达式

##### 11.2.1.1 基本语法

切片表达式是通过指定范围来创建子切片的方式。其基本形式为 `s[low:high]`，其中 `low` 是起始索引，`high` 是结束索引（不包含该索引对应的元素）。切片表达式会创建一个新的切片，指向与原切片相同的底层数组。

```go
s := []int{1, 2, 3, 4, 5}
subSlice := s[1:3] // 包含 s[1] 和 s[2]，但不包含 s[3]
fmt.Println(subSlice) // 输出 [2, 3]
```

- `low` 是切片的起始索引，包含该位置的元素。
- `high` 是切片的结束索引，不包含该位置的元素。

##### 11.2.1.2 `low` 和 `high` 的默认值

在切片表达式中，`low` 和 `high` 都可以省略。默认情况下：

- 省略 `low` 时，表示从切片的起始位置开始。
- 省略 `high` 时，表示直到切片的末尾。

```go
s := []int{1, 2, 3, 4, 5}

subSlice1 := s[:3] // 等同于 s[0:3]，输出 [1, 2, 3]
subSlice2 := s[2:] // 等同于 s[2:5]，输出 [3, 4, 5]
subSlice3 := s[:]  // 等同于 s[0:5]，输出 [1, 2, 3, 4, 5]
```

##### 11.2.1.3 切片的 `len` 和 `cap`

在创建新的切片时：

- 新切片的长度 `len` 为 `high - low`。
- 新切片的容量 `cap` 为从 `low` 到底层数组末尾的元素个数，即 `cap = cap(s) - low`。

```go
s := []int{1, 2, 3, 4, 5}
subSlice := s[1:3]
fmt.Printf("subSlice:%v len(subSlice):%v cap(subSlice):%v\n", subSlice, len(subSlice), cap(subSlice))
// 输出 subSlice:[2 3] len(subSlice):2 cap(subSlice):4
```

在这个例子中，`subSlice` 的长度是 `2`，因为包含两个元素 `[2, 3]`。而容量是 `4`，因为它从索引 `1`（即 `2`）到数组的末尾 `[2, 3, 4, 5]`。

##### 11.2.1.4 索引越界

在使用切片表达式时，索引 `low` 和 `high` 必须在合法范围内(`0 <= low <= high <= len()`)，否则会引发运行时错误。如果 ` low > high `，也会导致错误。尤其需要注意，不能访问切片之外的内存空间。

```go
s := []int{1, 2, 3, 4, 5}
// subSlice := s[4:6] // 会引发错误：panic: runtime error: slice bounds out of range
```

##### 11.2.1.5 常量索引必须为非负值

如果使用常量作为索引，Go 语言要求该索引必须为非负值，否则编译时会报错。

```go
s := []int{1, 2, 3, 4, 5}
// subSlice := s[-1:3] // 编译时会报错：invalid slice index -1 (index must be non-negative)
```

##### 11.2.1.6 完整切片表达式

Go 语言还支持完整的切片表达式，其形式为 `s[low:high:max]`。其中，`max` 决定了新切片的最大容量，即 `cap = max - low`。这允许你在创建新切片时限制其容量。

```go
s := []int{1, 2, 3, 4, 5}
subSlice := s[1:3:4]
fmt.Printf("subSlice:%v len(subSlice):%v cap(subSlice):%v\n", subSlice, len(subSlice), cap(subSlice))
// 输出 subSlice:[2 3] len(subSlice):2 cap(subSlice):3
```

在这个例子中，`subSlice` 的容量被限制为 `3`（`4 - 1`），虽然原始切片的容量从索引 `1` 开始本可以达到 `4`。

##### 11.2.1.7 多维切片

Go 语言支持多维切片，可以使用嵌套切片来创建多维数据结构。

```go
mdSlice := [][]int{
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9},
}
fmt.Println(mdSlice) // 输出 [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
```

**注意**：多维切片的每一维度可以是不同长度，这与数组不同。

---

通过以上内容，你可以更好地理解和运用切片表达式，灵活操作数据结构。

#### 11.2.2 访问与遍历元素

与数组一样，切片可以通过索引访问其中的元素。

```go
s := []int{1, 2, 3, 4, 5}
fmt.Println(s[0]) // 输出 1
```

##### 11.2.2.1 遍历切片

你可以使用 `for` 循环或 `for range` 循环遍历切片中的所有元素。

**使用传统 `for` 循环**：

```go
for i := 0; i < len(s); i++ {
    fmt.Println(s[i])
}
```

**使用 `for range` 循环**：

```go
for index, value := range s {
    fmt.Printf("Index: %d, Value: %d\n", index, value)
}
```

`for range` 循环不仅返回元素的值，还返回元素的索引。如果只需要元素的值，可以省略索引变量：

```go
for _, value := range s {
    fmt.Println(value)
}
```

#### 11.2.3 空切片的判断

判断一个切片是否为空可以通过检查其长度或与 `nil` 比较来实现。

##### 11.2.3.1 检查长度 (`len`)

使用 `len(s) == 0` 来判断切片是否为空。即使切片被初始化为长度为零的切片（`len(s) == 0`），它仍然不是 `nil`。

```go
if len(s) == 0 {
    fmt.Println("切片为空")
}
```

##### 11.2.3.2 检查 `nil`

一个未初始化的切片（值为 `nil`）和一个长度为 0 的切片是不同的。`nil` 切片没有底层数组，而长度为 0 的切片有一个指向空数组的指针。

```go
var s []int // s 是 nil
if s == nil {
    fmt.Println("切片是 nil")
}
```

你可以同时检查 `len(s) == 0` 和 `s == nil`，以确保切片是空的：

```go
if s == nil || len(s) == 0 {
    fmt.Println("切片为空或 nil")
}
```

通过以上内容，你可以理解如何访问、遍历切片中的元素，以及如何有效地判断切片是否为空。

#### 11.2.4 修改元素

切片是引用类型，修改切片的元素会影响底层数组。

```go
s := []int{1, 2, 3, 4, 5}
s[1] = 20
fmt.Println(s) // 输出 [1, 20, 3, 4, 5]
```

#### 11.2.5 切片的长度和容量

可以使用 `len()` 和 `cap()` 函数获取切片的长度和容量，`cap >= len`，默认 `=len`。

```go
s := []int{1, 2, 3, 4, 5}
fmt.Println(len(s)) // 输出 5
fmt.Println(cap(s)) // 输出 5
```

#### 11.2.6 切片的复制

使用 `copy` 函数复制切片中的元素到另一个切片。

```go
src := []int{1, 2, 3}
dst := make([]int, 2)
copy(dst, src)
fmt.Println(dst) // 输出 [1, 2]
```

- `copy(dst, src)`：将 `src` 切片的元素复制到 `dst` 切片中。`copy` 函数返回复制的元素个数。

#### 11.2.7 切片的追加

在 Go 语言中，可以使用 `append` 函数向切片追加元素。即使是用 `var` 声明的零值切片，也可以直接使用 `append` 进行操作。

**零值切片的 `append`**

如果通过 `var` 声明了一个切片，它的初始值是 `nil`，但仍然可以直接使用 `append` 函数：

```go
var s []int
s = append(s, 1, 2, 3)
fmt.Println(s) // 输出 [1, 2, 3]
```

`append` 函数会根据需要自动分配内存并扩展切片的容量。因此，即使是零值切片（即 `nil`），也可以直接通过 `append` 添加元素。

**切片的扩容策略**

当切片的容量不够用时，`append` 函数会自动扩容。扩容的策略如下：

1. **小于 1024 个元素时**，新切片的容量通常是旧切片的两倍。
2. **大于等于 1024 个元素时**，新切片的容量将增加原来容量的 25%。

例如，假设一个切片的容量是 4：

```go
s := make([]int, 0, 4)
fmt.Printf("cap: %d\n", cap(s)) // 输出 cap: 4
s = append(s, 1, 2, 3, 4)
fmt.Printf("cap: %d\n", cap(s)) // 输出 cap: 4
s = append(s, 5)
fmt.Printf("cap: %d\n", cap(s)) // 输出 cap: 8
```

在上面的例子中，切片的初始容量为 4。当添加第五个元素时，容量会扩展到 8，遵循的是容量翻倍的扩容策略。

> [!warning] 扩容会涉及内存的重新分配和数据的复制，这可能会带来性能开销。在需要高性能或特定内存管理的场景中，预先设定足够的容量以减少扩容次数是一个好的实践。

#### 11.2.8 切片的删除

##### 11.2.8.1 删除切片中的一个元素

要删除切片中的一个元素，可以使用切片的分片操作，将要删除元素前后的部分连接起来：

> [!warning] 在 `append` 函数中使用 `…` 的目的是将切片的元素展开为单独的参数，以便将它们逐个添加到原始切片中

```go
s := []int{1, 2, 3, 4, 5}
// 删除索引为 2 的元素（即值 3）
s = append(s[:2], s[3:]…)
fmt.Println(s) // 输出 [1, 2, 4, 5]
```

这个操作的核心是 `append`，将 `s[:2]`（即删除元素前的部分）与 `s[3:]`（即删除元素后的部分）连接在一起，从而删除了元素。

##### 11.2.8.2 删除切片中的多个元素

删除多个连续元素的方式类似，可以通过调整切片的范围来实现：

```go
s := []int{1, 2, 3, 4, 5}
// 删除从索引 1 到 3（不包括 3）的元素，即值 2 和 3
s = append(s[:1], s[3:]…)
fmt.Println(s) // 输出 [1, 4, 5]
```

##### 11.2.8.3 删除切片中的第一个元素

如果要删除切片中的第一个元素，可以简单地通过将切片向后移动来实现：

```go
s := []int{1, 2, 3, 4, 5}
// 删除第一个元素
s = s[1:]
fmt.Println(s) // 输出 [2, 3, 4, 5]
```

##### 11.2.8.4 删除切片中的最后一个元素

同样地，删除切片的最后一个元素也很简单：

```go
s := []int{1, 2, 3, 4, 5}
// 删除最后一个元素
s = s[:len(s)-1]
fmt.Println(s) // 输出 [1, 2, 3, 4]
```

##### 11.2.8.5 注意事项

- 删除操作不会自动缩减切片的容量 (`cap`)。
- 删除操作在性能上可能会有开销，特别是对于大切片，建议谨慎使用。
- 如果在切片上频繁执行删除操作，考虑使用 `list`（双向链表）或其他数据结构来提高性能。

### 11.3 切片的内存管理

#### 11.3.1 切片扩容与内存重新分配

当切片的长度增长超过其容量时，Go 可能会重新分配内存，创建新的底层数组，并将旧数组的内容复制到新数组中。这样操作的结果是，之前的切片引用不再影响新数组的内容。

**内存管理注意事项**：
- **大切片的引用**：长时间持有大切片的引用可能导致不必要的内存消耗，即使只需要切片中的一部分数据。
- **释放内存**：使用 `copy` 函数或重新分配切片可以释放不再需要的底层数组内存。

## 12 映射（Map）

Go 语言中的映射（Map）是一种内置的数据结构，用于存储键值对（key-value pairs）。它的性能优越，查找和插入操作平均都能在常数时间内完成。映射的键可以是任何可比较的类型，比如整数、字符串等，而值可以是任意类型。

### 12.1 声明和初始化映射

#### 12.1.1 使用 `make` 函数

`make` 函数是声明和初始化映射的常用方式：

```go
m := make(map[key]value, [cap])
```

这行代码创建了一个空的映射 `m`，`cap` 是可选参数 => `map` 容量。

#### 12.1.2 使用字面量初始化

可以在声明映射的同时使用字面量对其进行初始化：

```go
m := map[string]int{
    "apple":  5,
    "banana": 3,
    "orange": 2,
}
```

这段代码创建了一个映射，其中 `apple`、`banana` 和 `orange` 是键，对应的 `5`、`3` 和 `2` 是值。

### 12.2 操作映射

#### 12.2.1 添加和更新元素

向映射中添加或更新元素时，只需要通过键来访问并赋值：

```go
m["pear"] = 4 // 添加新键值对 "pear": 4
m["apple"] = 6 // 更新键 "apple" 的值为 6
```

#### 12.2.2 访问元素

可以通过键访问映射中的元素：

```go
count := m["apple"]
fmt.Println(count) // 输出 6
```

#### 12.2.3 删除元素

可以使用 `delete` 函数从映射中删除指定的键值对：

```go
delete(m, "banana") // 删除键 "banana" 的键值对
```

#### 12.2.4 判断键是否存在

在访问映射中的元素时，可以通过检查第二个返回值来判断键是否存在：

```go
value, exists := m["banana"]
if exists {
    fmt.Println("banana:", value)
} else {
    fmt.Println("banana 不存在")
}
```

如果键存在，`exists` 会返回 `true`，否则返回 `false`。

### 12.3 映射的遍历

> [!help] [[#9 .4 `for range` 语句|for range]]  

可以使用 `for`…`range` 语句遍历映射的所有键值对：

```go
for key, value := range m {
    fmt.Printf("%s: %d\n", key, value)
}
```

需要注意的是，映射的遍历顺序是随机的，每次遍历的顺序可能都不同。

#### 12.3.1 顺序遍历映射

在 Go 语言中，`map` 的遍历顺序是随机的，无法直接按照键或值的顺序遍历 `map`。这是因为 `map` 的底层实现并不保证顺序，因此每次遍历时，元素的顺序可能不同。

然而，如果你想按照指定顺序（例如键的顺序）遍历 `map`，你可以采取以下步骤：

1. **将键提取到一个切片中。**
2. **对切片进行排序。**
3. **按照排序后的切片顺序访问 `map`。**

以下是按照键的顺序遍历 `map` 的示例代码：

```go
package main

import (
	"fmt"
	"sort"
)

func main() {
	// 示例map
	m := map[string]int{
		"apple":  5,
		"banana": 2,
		"cherry": 7,
		"date":   3,
	}

	// 提取键到切片
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}

	// 对键切片进行排序
	sort.Strings(keys)

	// 按排序后的键顺序遍历map
	for _, k := range keys {
		fmt.Printf("%s: %d\n", k, m[k])
	}
}
```

**代码解析：**

- **提取键到切片**：通过遍历 `map`，将所有的键放入一个切片中。
- **排序键切片**：使用 `sort.Strings` 对键的切片进行排序。如果键是 `int` 或其他类型，可以使用相应的排序函数，如 `sort.Ints`。
- **按顺序遍历 `map`**：按照排序后的键顺序，访问并输出 `map` 中对应的值。

### 12.4 映射的长度

可以使用 `len` 函数获取映射中键值对的数量：

```go
fmt.Println(len(m)) // 输出映射中的元素数量
```

### 12.5 映射的特性

#### 12.5.1 映射的键类型要求

映射的键类型必须是可比较的类型，例如，整数、浮点数、字符串和指针。不能使用切片、映射和函数作为映射的键，因为它们是不可比较的。

#### 12.5.2 映射是引用类型

映射是引用类型，多个映射变量指向相同的底层数据时，对其中一个变量的修改会影响其他变量。

```go
m1 := map[string]int{"one": 1}
m2 := m1
m2["one"] = 10
fmt.Println(m1["one"]) // 输出 10
```

在这个例子中，修改 `m2` 也会影响 `m1`，因为它们引用了相同的数据。

#### 12.5.3 映射的零值

映射的零值是 `nil`。一个 `nil` 映射既不能存储键值对，也不能删除键值对。如果要操作一个 `nil` 映射，需要首先使用 `make` 函数进行初始化。

```go
var m map[string]int // m 是一个 nil 映射
// m["one"] = 1 // 这行代码会引发运行时错误
m = make(map[string]int) // 初始化映射
m["one"] = 1 // 现在可以正常使用
```

### 12.6 切片的元素为 `map`

在 Go 语言中，切片的元素类型可以是 `map`。这允许你创建一个动态大小的 `map` 集合。每个 `map` 都可以有不同的键值对结构。

```go
package main

import "fmt"

func main() {
    // 创建一个切片，元素类型为map[string]int
    sliceOfMaps := make([]map[string]int, 3)

    // 初始化每个map
    sliceOfMaps[0] = map[string]int{"a": 1, "b": 2}
    sliceOfMaps[1] = map[string]int{"c": 3, "d": 4}
    sliceOfMaps[2] = map[string]int{"e": 5, "f": 6}

    // 遍历切片并打印每个map
    for i, m := range sliceOfMaps {
        fmt.Printf("Map %d: %v\n", i, m)
    }
}
```

**代码解析：**

- 创建一个 `map[string]int` 类型的切片，每个切片元素都可以是一个 `map`。
- 使用 `make` 函数来初始化切片中的每个 `map`。
- 通过 `range` 遍历切片，访问和输出每个 `map` 的内容。

### 12.7 `map` 的值为切片

同样，Go 语言中的 `map` 值也可以是切片。这允许你为每个键存储一个值列表。

```go
package main

import "fmt"

func main() {
    // 创建一个map，值类型为[]int
    mapOfSlices := make(map[string][]int)

    // 为每个键初始化切片并赋值
    mapOfSlices["numbers"] = []int{1, 2, 3}
    mapOfSlices["squares"] = []int{1, 4, 9}
    mapOfSlices["primes"] = []int{2, 3, 5, 7}

    // 遍历map并打印每个键和对应的切片
    for key, slice := range mapOfSlices {
        fmt.Printf("%s: %v\n", key, slice)
    }
}
```

**代码解析：**

- 创建一个 `map[string][]int`，其中键为 `string`，值为 `[]int`。
- 使用 `make` 函数初始化 `map`，然后为每个键赋值一个整数切片。
- 通过 `range` 遍历 `map`，访问和输出每个键对应的切片内容。

 > [!example] 结合使用：切片的元素为 `map` 和 `map` 的值为切片
>
> 有时，你可能需要同时使用切片和 `map`，例如创建一个 `map` 列表，或者存储多个键对应的值列表。
>
> ```go
> package main
> 
> import "fmt"
> 
> func main() {
>     // 切片的元素为map
>     sliceOfMaps := make([]map[string]int, 2)
>     sliceOfMaps[0] = map[string]int{"a": 1, "b": 2}
>     sliceOfMaps[1] = map[string]int{"c": 3, "d": 4}
> 
>     // map的值为切片
>     mapOfSlices := make(map[string][]int)
>     mapOfSlices["even"] = []int{2, 4, 6}
>     mapOfSlices["odd"] = []int{1, 3, 5}
> 
>     // 输出切片的元素为map
>     fmt.Println("Slice of Maps:")
>     for i, m := range sliceOfMaps {
>         fmt.Printf("Map %d: %v\n", i, m)
>     }
> 
>     // 输出map的值为切片
>     fmt.Println("\nMap of Slices:")
>     for key, slice := range mapOfSlices {
>         fmt.Printf("%s: %v\n", key, slice)
>     }
> }
> ```

## 13 函数

### 13.1 函数声明与调用

函数的基本声明格式如下：

```go
func functionName(parameters) returnType {
    // 函数体
}
```

**示例**：

```go
func add(x int, y int) int {
    return x + y
}

result := add(3, 4) // 调用函数，result = 7
```

### 13.2 多返回值

Go 语言支持函数返回多个值。

```go
func swap(x, y string) (string, string) {
    return y, x
}

a, b := swap("hello", "world") // a = "world", b = "hello"
```

### 13.3 命名返回值

在函数声明时可以为返回值命名，相当于在函数体中声明了一个变量，函数结束时会自动返回这些变量的值。

```go
func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return
}
```

### 13.4 可变参数

Go 支持函数定义可变参数，即参数数量不固定。可变参数通过 `…` 语法实现，类似于 Java 的可变参数。

```go
func sum(numbers …int) int {
    total := 0
    for _, num := range numbers {
        total += num
    }
    return total
}

result := sum(1, 2, 3, 4) // result = 10
```

### 13.5 变量作用域

在 Go 语言中，变量的作用域由其定义的位置决定。主要包括以下几种作用域：

- **包级作用域**：在包内定义的变量或常量在整个包中都可以访问。
- **函数级作用域**：在函数内定义的变量只在该函数内有效。
- **代码块作用域**：在代码块 `{}` 内定义的变量只在该块内有效。

**示例**：

```go
package main

var x int = 1 // 包级作用域

func foo() {
    var y int = 2 // 函数级作用域
    if y > 1 {
        var z int = 3 // 代码块作用域
        fmt.Println(z) // 输出 3
    }
    // fmt.Println(z) // 编译错误，z 作用域在 if 语句块内
}
```

### 13.6 函数类型与变量

Go 语言中的函数是一等公民，可以赋值给变量，并通过该变量调用函数。函数类型的定义可以显式指定。

**示例**：

```go
// 定义函数类型
type operation func(int, int) int

// 函数变量
var op operation = func(a, b int) int {
    return a + b
}

result := op(3, 4) // 调用函数，result = 7
```

### 13.7 函数作为参数和返回值

**示例：函数作为参数**

```go
func operate(x int, y int, op func(int, int) int) int {
    return op(x, y)
}

add := func(a, b int) int { return a + b }
result := operate(3, 4, add) // result = 7
```

**示例：函数作为返回值**

```go
func multiplier(factor int) func(int) int {
    return func(x int) int {
        return x * factor
    }
}

double := multiplier(2)
fmt.Println(double(3)) // 输出：6
```

### 13.8 匿名函数与闭包

Go 支持匿名函数，也就是没有名字的函数。匿名函数可以直接定义并调用，或者赋值给一个变量。在 Go 中，函数是一等公民，函数可以作为参数传递或返回。

```go
// 匿名函数的定义与调用
sum := func(a, b int) int {
    return a + b
}
result := sum(3, 4) // result = 7
```

匿名函数可以形成闭包，闭包是可以引用其外部作用域变量的函数。

```go
func adder() func(int) int {
    sum := 0
    return func(x int) int {
        sum += x
        return sum
    }
}

pos, neg := adder(), adder()
fmt.Println(pos(1)) // 输出：1
fmt.Println(pos(2)) // 输出：3
fmt.Println(neg(-1)) // 输出：-1
```

- 每个通过 `adder` 创建的闭包函数都有自己独立的 `sum` 变量，它们在多次调用时能够保持和更新自己的状态。
- 闭包函数可以记住并访问它们被创建时的上下文，即使这些上下文中的变量已经超出了作用域。

### 13.9 Defer 语句

`defer` 语句用于延迟执行某个函数，直到*当前函数执行完毕后再执行*。通常用于*释放资源*。

```go
func main() {
    defer fmt.Println("world")
    fmt.Println("hello")
}
// 输出：
// hello
// world
```

### 13.10 内置函数 `panic` 和 `recover`

Go 语言内置的 `panic` 和 `recover` 函数用于处理运行时错误，类似于 Java 中的异常处理机制。

- **`panic`**：用于引发一个运行时错误，导致程序崩溃。
- **`recover`**：用于捕获 `panic` 引发的错误，阻止程序崩溃。必须搭配 `defer` 使用。

> [!warning] `recover()` 必须与 `defer` 一起使用，是因为 `panic` 发生后，Go 会立即停止当前函数的执行，并沿调用栈回溯。在回溯过程中，`defer` 注册的函数会被依次执行。只有在 `defer` 中调用 `recover()` 才能捕获并处理 `panic`，使程序恢复正常执行。如果不使用 `defer`，`recover()` 将没有机会执行，`panic` 也无法被捕获。

**示例：`panic` 与 `recover`**：

```go
func mayPanic() {
    panic("something went wrong")
}

func main() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered from", r)
        }
    }()
    
    mayPanic()
    fmt.Println("This will not print")
}
// 输出：
// Recovered from something went wrong
```

在这个示例中，`mayPanic` 函数触发了 `panic`，但通过 `recover` 函数成功捕获了这个错误，因此程序没有崩溃。

## 14 指针

在 Go 语言中，指针是一种变量，用于存储另一个变量的内存地址。与 C/C++ 不同，Go 不支持指针运算，且没有显式的指针释放操作，因为 Go 拥有垃圾回收机制（GC）来自动管理内存。

### 14.1 声明指针

指针的声明方式是在变量类型前加上 `*`，表示这是一个指向该类型的指针。

```go
var p *int  // 声明一个指向 int 类型的指针 p
```

### 14.2 获取变量地址

可以使用 `&` 操作符获取一个变量的内存地址。

```go
var a int = 10
var p *int = &a  // p 指向 a 的内存地址
```

在这个例子中，`p` 指向 `a` 的内存地址，因此 `p` 是一个指向 `int` 类型的指针。

### 14.3 解引用指针

通过使用 `*` 操作符，可以获取指针所指向的变量的值，称为解引用。

```go
var a int = 10
var p *int = &a  // p 是指向 a 的指针
fmt.Println(*p)  // 输出 10
```

在这里，`*p` 获取了 `p` 所指向的变量 `a` 的值，即 `10`。

### 14.4 修改指针指向的值

通过指针，可以直接修改其所指向的变量的值。

```go
var a int = 10
var p *int = &a  // p 是指向 a 的指针
*p = 20          // 修改 p 所指向的变量的值
fmt.Println(a)   // 输出 20
```

在这个例子中，通过 `*p` 修改了 `a` 的值为 `20`。

### 14.5 指针与函数

Go 语言支持将指针作为函数参数传递，从而在函数内修改外部变量的值。这与 Java 中的引用类型类似，但 Java 的基本类型无法通过引用传递，而 Go 可以。

```go
func increment(x *int) {
    *x++
}

func main() {
    a := 10
    increment(&a) // 传递 a 的指针
    fmt.Println(a) // 输出 11
}
```

在这个例子中，`increment` 函数接受一个 `int` 类型的指针参数，并修改其指向的值。

### 14.6 指针的零值

指针的零值为 `nil`，即指针未指向任何变量。可以通过比较指针与 `nil` 来检查指针是否为空。

```go
var p *int
fmt.Println(p == nil) // 输出 true
```

### 14.7 指针数组与数组指针

- **指针数组**：数组中的元素为指针类型。

  ```go
  var arr [3]*int
  ```

- **数组指针**：指针指向一个数组。

  ```go
  var arr [3]int
  var p *[3]int = &arr
  ```

### 14.8 注意事项

- **不能对空指针解引用**：如果指针为 `nil`，对其 `*` 解引用将会导致程序崩溃。
  
- **指针间的比较**：可以通过 `==` 或 `!=` 来比较两个指针，判断它们是否指向同一个地址。

- **函数传递指针与值的区别**：传递指针使得函数内部可以修改外部变量的值，而传递值则不会影响外部变量。

> [!note] `==` & `!=`
>
> 在 Go 语言中，不同类型的值在比较时有不同的规则。具体来说，以下类型可以进行 `==` 和 `!=` 运算：
>
> ### 数组
> - **支持** `==` 和 `!=` 运算。
> - 数组的比较是基于逐元素的比较，只有在两个数组长度相同且对应元素相等时，数组才相等。
>
>   ```go
>   a := [3]int{1, 2, 3}
>   b := [3]int{1, 2, 3}
>   c := [3]int{3, 2, 1}
>   fmt.Println(a == b) // 输出 true
>   fmt.Println(a == c) // 输出 false
>   ```
>
> ### 切片
> - **不支持** `==` 和 `!=` 运算。
> - 切片只能与 `nil` 进行比较，判断切片是否为空。
> - 要比较两个切片的内容，需要手动逐元素比较。
>
>   ```go
>   var s1 []int
>   s2 := []int{}
>   s3 := []int{1, 2, 3}
>   fmt.Println(s1 == nil) // 输出 true
>   fmt.Println(s2 == nil) // 输出 false
> 
>   // s1 == s2 或 s2 == s3 都是不合法的操作
>   ```
>
> ### 映射（map）
> - **不支持** `==` 和 `!=` 运算。
> - 与切片类似，映射只能与 `nil` 进行比较，判断映射是否为空。
> - 要比较两个映射的内容，需要手动遍历映射并逐项比较。
>
>   ```go
>   var m1 map[string]int
>   m2 := make(map[string]int)
>   fmt.Println(m1 == nil) // 输出 true
>   fmt.Println(m2 == nil) // 输出 false
> 
>   // m1 == m2 是不合法的操作
>   ```
>
> ### 指针
> - **支持** `==` 和 `!=` 运算。
> - 指针可以比较是否指向相同的内存地址。
>
>   ```go
>   a := 10
>   p1 := &a
>   p2 := &a
>   p3 := new(int)
>   fmt.Println(p1 == p2) // 输出 true，指向相同地址
>   fmt.Println(p1 == p3) // 输出 false，指向不同地址
>   ```
>
> ### 总结
> - **支持** `==` 和 `!=` 运算：数组、指针。
> - **不支持** `==` 和 `!=` 运算：切片、映射（只能与 `nil` 比较）。

## 15 类型定义和别名

### 15.1 类型定义

使用 `type` 关键字可以定义一个新的类型。类型定义会创建一个与原类型具有相同底层表示的新类型，但它们是不同的类型，无法直接进行赋值或比较。

```go
type MyInt int

var a MyInt = 5
var b int = 5

// 编译错误，不能直接将 b 赋值给 a
// a = b

a = MyInt(b) // 需要显式类型转换
```

**类型定义的作用：**
- 提高代码可读性：可以为相同底层类型提供不同的语义。
- 增强类型安全性：防止意外将不同用途的类型混淆。

### 15.2 类型别名

使用 `type` 关键字也可以为类型创建别名。类型别名只是一个新的名字，本质上与原类型是完全相同的类型，可以互相赋值。

```go
type MyString = string

var s1 MyString = "hello"
var s2 string = "world"

s1 = s2 // 类型别名与原类型可以互相赋值
```

**类型别名的作用：**
- 简化复杂类型：为复杂的类型声明一个简短的别名，便于代码书写。
- 与外部代码兼容：可以通过别名使用某些复杂或长名称的类型，而不改变底层类型。

### 15.3 类型定义 Vs 类型别名

- **类型定义** 创建一个新的类型，与原类型不同。
- **类型别名** 仅是原类型的另一种表示，两者完全相同。

```go
// 类型定义
type Celsius float64

// 类型别名
type MyFloat = float64

func main() {
    var temp Celsius = 36.5
    var distance MyFloat = 100.5

    // 需要类型转换，Celsius 是新类型
    fmt.Println(float64(temp) + 10) 

    // 直接赋值，MyFloat 是别名，与 float64 完全相同
    fmt.Println(distance + 10)
}
```

在这个例子中，`Celsius` 是基于 `float64` 的新类型，因此无法直接与 `float64` 进行运算。而 `MyFloat` 是 `float64` 的别名，可以直接使用 `float64` 的所有操作。

### 15.4 使用场景

- **类型定义** 常用于在项目中为不同的概念创建明确的区分，例如可以定义 `Celsius` 和 `Fahrenheit` 两种类型，尽管它们的底层表示都是 `float64`，但这样可以避免在函数中混淆温度单位。
  
- **类型别名** 更适合用于兼容外部库或简化复杂类型定义的场景。

### 15.5 小结

- 类型定义创建了一个新的类型，有助于增加代码的可读性和类型安全性。
- 类型别名与原类型相同，适用于简化代码或兼容性需求。

## 16 结构体（Struct）

Go 语言中的**结构体**是聚合数据类型，用于将不同类型的数据组合成更复杂的数据结构。结构体类似于 Java 的类，但不包含方法或继承。

### 16.1 定义结构体

使用 `type` 关键字定义结构体，`struct` 表示结构体。

```go
type Person struct {
    Name string
    Age  int
}
```

结构体可以将同类型字段写在同一行：

```go
type Point struct {
    X, Y int
}
```

### 16.2 创建结构体实例

1. **按字段顺序赋值**

	```go
	p := Person{"Alice", 30}
	```

2. **按字段名赋值**

	```go
	p := Person{Name: "Bob", Age: 25}
	```

3. **只初始化部分字段**

	未指定的字段会使用其类型的零值：

	```go
	p := Person{Name: "Charlie"}
	// 输出：{Charlie 0}，Age 字段使用零值 0
	```

4. **匿名结构体**

   匿名结构体可以在没有具体类型的情况下创建：

   ```go
   person := struct {
       Name string
       Age  int
   }{
       Name: "Alice",
       Age:  30,
   }
   ```

5. **指针类型结构体**

   可以通过 `new` 关键字或取地址符 `&` 来创建结构体指针实例：

   ```go
	p := new(Person)
	p.Name = "Bob"
	p.Age = 25
	```

6. **取地址符创建结构体指针**

	直接使用取地址符 `&` 初始化结构体指针：

	```go
	p := &Person{"Charlie", 28}
	```

7. **键值对/值列表初始化**

   - **键值对初始化**：通过字段名初始化更安全：

	 ```go
     p := Person{Name: "Dave", Age: 40}
     ```

   - **值列表初始化**：按字段声明顺序赋值，但容易出错：

	 ```go
     p := Person{"Eve", 35}
     ```

### 16.3 访问和修改字段

通过 `.` 操作符访问和修改结构体字段。

```go
p := Person{Name: "Dave", Age: 20}
p.Age = 21
```

### 16.4 匿名字段（内嵌字段）

Go 支持嵌入其他结构体类型作为匿名字段。

```go
type Address struct {
    City, State string
}

type Employee struct {
    Name    string
    Address
    Salary  int
}
```

匿名字段类似于 Java 的继承。

### 16.5 结构体比较

结构体支持 `==` 和 `!=` 运算，所有字段可比较时才可使用。

```go
type Point struct {
    X, Y int
}

p1 := Point{1, 2}
p2 := Point{1, 2}
p1 == p2 // true
```

### 16.6 结构体的指针

通过结构体指针避免复制数据，Go 自动解引用。

```go
p := Person{Name: "Frank", Age: 40}
pPtr := &p
pPtr.Age = 41
```

### 16.7 结构体与函数

Go 可以通过方法将功能与结构体关联。

```go
func (p Person) Greet() {
    fmt.Printf("Hello, my name is %s\n", p.Name)
}

func (p *Person) SetAge(age int) {
    p.Age = age
}
```

### 16.8 结构体的空间布局

结构体中的字段在内存中按声明顺序排列，不同类型的字段可能因为内存对齐而产生空隙。为了节省空间，建议将相同类型的字段放在一起。

```go
type EfficientStruct struct {
    A int32  // 4 字节
    B int64  // 8 字节
    C int32  // 4 字节
}
```

在该例中，`A` 和 `C` 都是 `int32` 类型，可以合并放在一起，减少内存空隙。

#### 16.8.1 空结构体

空结构体 `struct{}` 是一种特殊的结构体，它不包含任何字段，因此在内存中**不占用任何空间**。可以用于表示一种信号或标签，例如在并发中的同步操作。

```go
var x struct{}
fmt.Println(unsafe.Sizeof(x)) // 输出 0，表示空结构体不占用空间
```

### 16.9 结构体的构造函数

在 Go 语言中，虽然没有像其他语言中的构造函数（`constructor`）的概念，但可以通过编写一个返回结构体实例的函数来模拟构造函数。这类函数通常以 `New` 开头，用于初始化结构体并返回实例。

```go
type Person struct {
    Name string
    Age  int
}

// 模拟构造函数
func NewPerson(name string, age int) *Person {
    return &Person{
        Name: name,
        Age:  age,
    }
}

func main() {
    p := NewPerson("Alice", 30)
    fmt.Println(p) // 输出 &{Alice 30}
}
```

由于**结构体是值类型**，当结构体在函数之间传递时，会进行**值拷贝**。为了避免性能开销较大的拷贝操作，推荐使用**指针类型**作为返回值。这不仅可以避免结构体的复制，还可以在调用者中直接修改结构体的字段，从而提高程序的性能。

### 16.10 结构体的"继承"

Go 中没有类的继承，但可以通过嵌入结构体实现类似的功能。嵌入的结构体可以被外部结构体访问，类似于 Java 中的父类与子类。

```go
type Animal struct {
    Name string
}

func (a Animal) Speak() {
    fmt.Println(a.Name, "makes a sound.")
}

type Dog struct {
    Animal // 嵌入 Animal 结构体
    Breed  string
}

func main() {
    d := Dog{Animal: Animal{Name: "Buddy"}, Breed: "Golden Retriever"}
    d.Speak() // 输出 Buddy makes a sound.
}
```

通过嵌入结构体，`Dog` 类型可以继承 `Animal` 的字段和方法，类似于面向对象编程中的继承。

### 16.11 方法和接收者

Go 支持为任意类型定义方法，其中**接收者**用于指定方法属于哪个类型。与 Java 类似，接收者相当于 `this`。

- **值接收者**：方法对接收者对象进行的是值拷贝，无法修改原对象的字段。
- **指针接收者**：可以修改接收者的字段，适合拷贝代价大的对象。

#### 16.11.1 值接收者

```go
type Person struct {
    Name string
    Age  int
}

// 值接收者
func (p Person) Greet() {
    fmt.Printf("Hello, my name is %s\n", p.Name)
}

func main() {
    p := Person{"Bob", 25}
    p.Greet() // 输出：Hello, my name is Bob
}
```

#### 16.11.2 指针接收者

使用指针接收者可以修改结构体的字段。

```go
func (p *Person) SetAge(age int) {
    p.Age = age
}

func main() {
    p := Person{"Charlie", 20}
    p.SetAge(21)
    fmt.Println(p.Age) // 输出 21
}
```

### 16.12 任意类型添加方法

不仅仅是结构体，Go 允许为任何自定义类型添加方法。下面例子展示了为自定义类型 `MyInt` 添加方法。

```go
type MyInt int

// 为自定义类型 MyInt 添加方法
func (m MyInt) IsEven() bool {
    return m%2 == 0
}

func main() {
    var num MyInt = 10
    fmt.Println(num.IsEven()) // 输出 true
}
```

### 16.13 结构体字段的可见性

Go 中，结构体字段的可见性由字段名称的首字母决定：

- **大写首字母**：字段是**导出的**，在包外可见。
- **小写首字母**：字段是**未导出的**，仅在包内可见。

```go
type Person struct {
    Name string // 可导出
    age  int    // 不可导出
}

func main() {
    p := Person{Name: "Eve", age: 25}
    fmt.Println(p.Name) // 输出 Eve
    // fmt.Println(p.age)  // 编译错误，age 不可导出
}
```

在包外，不能直接访问小写字母开头的字段。

### 16.14 结构体与 JSON 序列化

在 Go 语言中，标准库 `encoding/json` 提供了将结构体与 JSON 之间进行转换的能力，即 **序列化** 和 **反序列化**。

#### 16.14.1 结构体序列化为 JSON

**序列化** 是将 Go 结构体转换为 JSON 格式的过程，使用 `json.Marshal` 函数可以将结构体转换为 JSON。

```go
package main

import (
	"encoding/json"
	"fmt"
)

type Person struct {
	Name string
	Age  int
}

func main() {
	p := Person{Name: "Alice", Age: 30}
	// 序列化
	jsonData, err := json.Marshal(p)
	if err != nil {
		fmt.Println("JSON 序列化错误:", err)
		return
	}
	// 将 JSON 数据转换为字符串并打印
	fmt.Println(string(jsonData)) // 输出：{"Name":"Alice","Age":30}
}
```

#### 16.14.2 JSON 反序列化为结构体

**反序列化** 是将 JSON 字符串转换回 Go 结构体的过程，使用 `json.Unmarshal` 函数可以将 JSON 转换为结构体。

```go
func main() {
	jsonStr := `{"Name":"Alice","Age":30}`
	var p Person
	// 反序列化
	err := json.Unmarshal([]byte(jsonStr), &p)
	if err != nil {
		fmt.Println("JSON 反序列化错误:", err)
		return
	}
	fmt.Println(p) // 输出：{Alice 30}
}
```

### 16.15 结构体标签（Struct Tags）

Go 语言允许在结构体字段上使用 **标签（Tag）**，标签是对结构体字段的元数据，常用于 JSON 或数据库的字段映射。标签必须写在字段声明的同一行，并且使用反引号包裹。

#### 16.15.1 JSON 标签

在结构体字段上可以定义 JSON 标签，用于指定 JSON 编码时的键名、字段的可选性等。标签格式为 `json:"字段名,选项"`。

```go
type Person struct {
	Name string `json:"name"` // JSON 字段名为 "name"
	Age  int    `json:"age"`  // JSON 字段名为 "age"
}

func main() {
	p := Person{Name: "Alice", Age: 30}
	// 序列化
	jsonData, _ := json.Marshal(p)
	fmt.Println(string(jsonData)) // 输出：{"name":"Alice","age":30}
}
```

#### 16.15.2 常用 JSON 标签选项

1. **`omitempty`**：如果字段为空或是其类型的零值，则在 JSON 中忽略该字段。

```go
type Person struct {
	Name string `json:"name"`
	Age  int    `json:"age,omitempty"` // 如果 Age 是零值，则忽略该字段
}

func main() {
	p := Person{Name: "Alice"}
	jsonData, _ := json.Marshal(p)
	fmt.Println(string(jsonData)) // 输出：{"name":"Alice"}，Age 字段被忽略
}
```

1. **`-`**：忽略字段，不将该字段编码到 JSON 中。

```go
type Person struct {
	Name string `json:"name"`
	Age  int    `json:"-"` // 忽略 Age 字段
}

func main() {
	p := Person{Name: "Alice", Age: 30}
	jsonData, _ := json.Marshal(p)
	fmt.Println(string(jsonData)) // 输出：{"name":"Alice"}，Age 字段被忽略
}
```

#### 16.15.3 自定义字段名称与可见性

Go 语言结构体中的字段名称**首字母必须大写**，该字段才是**导出的**，也即可以被外部访问（包括 JSON 序列化）。如果字段是小写的，则无法导出到 JSON 中。

```go
type Person struct {
	Name string `json:"name"`
	age  int    // 这个字段不会导出到 JSON
}

func main() {
	p := Person{Name: "Alice", age: 30}
	jsonData, _ := json.Marshal(p)
	fmt.Println(string(jsonData)) // 输出：{"name":"Alice"}，age 字段不会出现在 JSON 中
}
```

### 16.16 嵌套结构体的 JSON 序列化

Go 语言支持嵌套结构体的序列化，嵌套结构体的字段会被自动序列化。

```go
type Address struct {
	City  string `json:"city"`
	State string `json:"state"`
}

type Person struct {
	Name    string  `json:"name"`
	Age     int     `json:"age"`
	Address Address `json:"address"` // 嵌套结构体
}

func main() {
	p := Person{Name: "Alice", Age: 30, Address: Address{City: "New York", State: "NY"}}
	jsonData, _ := json.Marshal(p)
	fmt.Println(string(jsonData)) // 输出：{"name":"Alice","age":30,"address":{"city":"New York","state":"NY"}}
}
```

### 16.17 使用 `json.RawMessage`

在某些情况下，可能需要延迟 JSON 的解析，这时可以使用 `json.RawMessage` 来处理 JSON 的原始数据，稍后再手动解析。

```go
type Response struct {
	Status string          `json:"status"`
	Data   json.RawMessage `json:"data"` // 原始 JSON 数据
}

func main() {
	jsonStr := `{"status":"ok","data":{"name":"Alice","age":30}}`
	var res Response
	json.Unmarshal([]byte(jsonStr), &res)
	fmt.Println(string(res.Data)) // 输出原始 JSON：{"name":"Alice","age":30}
}
```

## 17 包和依赖管理

### 17.1 包（Package）

在 Go 语言中，**包** 是代码的基本组织单元。每个 Go 文件都属于一个包，一个程序可以由多个包组成。包的设计使代码模块化、易于维护和复用。

### 17.2 包的声明

每个 Go 文件的开头必须有一个包声明，表示该文件属于哪个包。包名通常与文件所在的目录同名。

```go
package main
```

`main` 包是一个特殊的包，它定义了一个独立的可执行程序。每个可执行程序必须包含一个 `main` 包，并且该包必须定义一个 `main` 函数作为程序的入口点。

其他包一般用于代码的组织和复用，不包含 `main` 函数。

### 17.3 导入包

要使用其他包中的代码，必须使用 `import` 语句导入该包。

```go
import "fmt"
```

`fmt` 是 Go 的标准库之一，提供了格式化输入输出的功能。导入包后，可以使用包中的公共函数、变量、类型等。

#### 17.3.1 导入多个包

可以使用小括号 `()` 来导入多个包：

```go
import (
    "fmt"
    "math"
)
```

#### 17.3.2 别名导入

可以通过导入时指定别名来重命名包，这在避免包名冲突或使代码更简洁时非常有用。

```go
import f "fmt" // 将 fmt 包重命名为 f
```

使用别名导入后，必须使用别名来访问包中的内容。

#### 17.3.3 空白标识符导入

有时可能需要导入一个包来执行它的初始化函数，但不会直接使用该包中的任何内容。这种情况下，可以使用空白标识符 `_`。

```go
import _ "net/http"
```

这会导入 `net/http` 包并执行它的初始化函数，但不会引用该包中的任何符号。

### 17.4 包的可见性

Go 语言中通过标识符的首字母大小写来控制可见性：

- **首字母大写**的标识符（类型、函数、变量等）可以被其他包访问，称为**导出的**。
- **首字母小写**的标识符则只能在包内访问，称为**未导出的**。

例如，`fmt` 包中的 `Println` 函数是导出的，因此可以在其他包中调用：

```go
fmt.Println("Hello, Go!")
```

而包内的未导出标识符无法在外部包中访问。

### 17.5 创建自定义包

可以通过创建目录和在其中定义 `.go` 文件来创建自定义包。包名通常与所在的目录同名。下面是一个简单的自定义包示例。

1. 在项目目录下创建一个名为 `mypackage` 的目录。
2. 在 `mypackage` 目录下创建一个 `mathutil.go` 文件，并定义一个简单的数学函数：

```go
// 文件路径：mypackage/mathutil.go
package mypackage

// 导出函数
func Add(a, b int) int {
    return a + b
}
```

1. 在主程序中导入并使用该自定义包：

```go
package main

import (
    "fmt"
    "mypackage" // 导入自定义包
)

func main() {
    result := mypackage.Add(2, 3)
    fmt.Println(result) // 输出 5
}
```

注意，自定义包的文件路径必须与包声明一致，否则编译器会报错。

### 17.6 包的初始化顺序

每个包都有一个初始化函数 `init`，用于在包被导入时执行一些初始化操作。`init` 函数在程序启动时自动执行, 在包级别变量之后，并且在 `main` 函数之前执行。

每个包可以定义多个 `init` 函数，但执行顺序是不确定的。`init` 函数不能被显式调用。

```go
package mypackage

import "fmt"

func init() {
    fmt.Println("mypackage 初始化")
}
```

在导入 `mypackage` 包时，上述 `init` 函数会自动执行，输出 `mypackage 初始化`。

### 17.7 [[#3 Go 基础应用|Go 依赖管理]]

## 18 接口（Interface）

在 Go 语言中，接口是一组方法的集合。接口的核心理念是面向接口编程，而不是具体实现。Go 的接口非常灵活，**接口的实现是隐式的**，即只要一个类型实现了接口中的所有方法，那么该类型就实现了这个接口，而不需要显式地声明或标注。

### 18.1 定义接口

接口的定义使用 `type` 关键字和 `interface` 关键字。

```go
type Speaker interface {
    Speak() string
}
```

上面的代码定义了一个名为 `Speaker` 的接口，其中包含一个 `Speak` 方法，返回一个字符串。任何实现了这个 `Speak` 方法的类型都可以称为实现了 `Speaker` 接口。

### 18.2 实现接口

Go 中的接口实现是隐式的。只要某个类型实现了接口中的所有方法，那么这个类型就被认为实现了该接口。

```go
type Person struct {
    Name string
}

func (p Person) Speak() string {
    return "Hello, my name is " + p.Name
}

func main() {
    var s Speaker
    p := Person{Name: "Alice"}
    s = p // Person 类型实现了 Speaker 接口
    fmt.Println(s.Speak()) // 输出：Hello, my name is Alice
}
```

在上面的例子中，`Person` 结构体实现了 `Speaker` 接口，因为它有一个 `Speak` 方法。

### 18.3 多个接口实现

一个类型可以实现多个接口，只需要实现这些接口所需的方法即可。

```go
type Greeter interface {
    Greet() string
}

type Person struct {
    Name string
}

func (p Person) Speak() string {
    return "Hello, my name is " + p.Name
}

func (p Person) Greet() string {
    return "Nice to meet you!"
}

func main() {
    var s Speaker
    var g Greeter
    p := Person{Name: "Alice"}

    s = p // 实现了 Speaker 接口
    g = p // 同时实现了 Greeter 接口

    fmt.Println(s.Speak()) // 输出：Hello, my name is Alice
    fmt.Println(g.Greet()) // 输出：Nice to meet you!
}
```

在上面的例子中，`Person` 同时实现了 `Speaker` 和 `Greeter` 接口。

### 18.4 多态性

接口在 Go 中实现了多态性，能够根据动态类型的不同表现出不同的行为。只要实现了相同的接口，不同的类型都可以被赋值给该接口，并在运行时根据其动态类型执行相应的实现。

```go
func describeAnimal(a Animal) {
    fmt.Println(a.Speak())
}

func main() {
    describeAnimal(Dog{}) // 输出 Woof!
    describeAnimal(Cat{}) // 输出 Meow!
}
```

### 18.5 接口类型

接口类型可以像普通类型一样使用，接口类型的变量可以保存任何实现了该接口的值。

```go
func say(s Speaker) {
    fmt.Println(s.Speak())
}

func main() {
    p := Person{Name: "Bob"}
    say(p) // 输出：Hello, my name is Bob
}
```

### 18.6 空接口

> [!tip] Go 引入 `any` 别名，其等价于 `interface{}`，详情见 [[#23 Go 泛型（Generics）]]

空接口是 Go 语言中的一个特殊接口，定义为 `interface{}`，表示可以接受任何类型的值。因为任何类型都隐式地实现了空接口，所以空接口可以存储任意类型的值。

```go
func describe(i interface{}) {
    fmt.Printf("(%v, %T)\n", i, i)
}

func main() {
    describe(42)       // 输出：(42, int)
    describe("hello")  // 输出：(hello, string)
    describe(true)     // 输出：(true, bool)
}
```

### 18.7 类型断言

当我们将值存储在一个接口变量中时，可能需要将其转换回它的具体类型。这时可以使用**类型断言**。

```go
var i interface{} = "hello"

s := i.(string) // 断言 i 是一个字符串
fmt.Println(s)  // 输出：hello

// 安全的类型断言
if s, ok := i.(string); ok {
    fmt.Println("i 是一个字符串:", s)
} else {
    fmt.Println("i 不是一个字符串")
}
```

### 18.8 接口值

接口在 Go 语言中被实现为**两部分**：

- **动态类型**：接口保存的值的类型，即实现了该接口的具体类型。
- **动态值**：接口保存的值，即该具体类型的值。

当接口变量赋值时，实际上是将值的动态类型和动态值存储在一起。理解这点有助于理解接口赋值和比较的行为，当 2 者均为 `nil` 时，接口 `== nil`。

```go
var a Animal = Dog{}
fmt.Printf("动态类型: %T, 动态值: %v\n", a, a) // 动态类型: main.Dog, 动态值: {}
```

### 18.9 类型选择（Type Switch）

Go 提供了一种方便的方式来根据存储在接口变量中的值的类型执行不同的代码，即 **类型选择**。

```go
func do(i interface{}) {
    switch v := i.(type) {
    case int:
        fmt.Println("整型:", v)
    case string:
        fmt.Println("字符串:", v)
    default:
        fmt.Println("未知类型")
    }
}

func main() {
    do(10)        // 输出：整型: 10
    do("hello")   // 输出：字符串: hello
    do(true)      // 输出：未知类型
}
```

## 19 结构体与接口结合使用

结合结构体和接口，可以设计灵活的程序。以下是一个例子，展示了如何通过接口和结构体来实现多态：

```go
type Shape interface {
    Area() float64
}

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return 3.14 * c.Radius * c.Radius
}

type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func printArea(s Shape) {
    fmt.Printf("面积: %f\n", s.Area())
}

func main() {
    c := Circle{Radius: 5}
    r := Rectangle{Width: 3, Height: 4}

    printArea(c) // 输出：面积: 78.50
    printArea(r) // 输出：面积: 12.00
}
```

在上述例子中，`Circle` 和 `Rectangle` 结构体都实现了 `Shape` 接口的 `Area` 方法，可以通过接口实现多态。

## 20 错误处理与 `error` 接口

> [!summary] 错误处理与 `error` 接口
>
> - `error` 接口是 Go 中用于错误处理的基础，通过 `Error()` 方法返回错误消息。
> - 使用 `errors.New` 和 `fmt.Errorf` 可以生成简单的错误信息。
> - 可以通过实现 `error` 接口来自定义错误类型。
> - 错误处理应遵循函数返回 `error` 并立即检查的模式。
> - 使用 `errors.Is` 和 `errors.As` 可以更灵活地处理错误类型。
> - `panic` 和 `recover` 提供了处理严重错误的机制，但应尽量少用。

在 Go 语言中，错误处理是通过内置的 `error` 接口实现的。`error` 接口的定义非常简单：

```go
type error interface {
    Error() string
}
```

它包含一个 `Error()` 方法，返回错误信息的字符串表示。任何实现了 `Error()` 方法的类型都可以被当作 `error` 类型使用。

### 20.1 创建简单的错误

Go 提供了一个内置函数 `errors.New`，用于创建基本的错误对象。

```go
import (
    "errors"
    "fmt"
)

func main() {
    err := errors.New("这是一个错误")
    fmt.Println(err) // 输出：这是一个错误
}
```

`errors.New` 函数返回一个实现了 `error` 接口的基本错误类型。

### 20.2 使用 `fmt.Errorf` 生成错误

除了 `errors.New`，Go 还提供了 `fmt.Errorf` 函数，用于格式化并生成错误信息。

```go
import (
    "fmt"
)

func main() {
    err := fmt.Errorf("发生错误：%d", 404)
    fmt.Println(err) // 输出：发生错误：404
}
```

`fmt.Errorf` 函数类似于 `fmt.Sprintf`，可以使用格式化字符串创建错误消息。

### 20.3 自定义错误类型

有时你可能希望定义自己的错误类型，以便提供更多的上下文信息或定制错误行为。你可以通过实现 `Error()` 方法来自定义错误类型。

```go
type MyError struct {
    Code    int
    Message string
}

func (e *MyError) Error() string {
    return fmt.Sprintf("错误 %d: %s", e.Code, e.Message)
}

func main() {
    err := &MyError{Code: 404, Message: "找不到页面"}
    fmt.Println(err) // 输出：错误 404: 找不到页面
}
```

在这个例子中，`MyError` 结构体实现了 `error` 接口，可以作为一个错误类型使用。

### 20.4 错误处理模式

Go 提倡一种明确的错误处理模式，通常通过返回 `error` 来传递函数的错误状态。函数可以返回一个 `error`，如果返回值为 `nil`，则表示没有错误；否则，表示出现了错误。

```go
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, fmt.Errorf("除数不能为零")
    }
    return a / b, nil
}

func main() {
    result, err := divide(10, 0)
    if err != nil {
        fmt.Println("错误:", err) // 输出：错误: 除数不能为零
    } else {
        fmt.Println("结果:", result)
    }
}
```

这种方式要求你在调用函数后立即检查错误，并相应处理错误。

### 20.5 `errors.Is` 和 `errors.As`

Go 1.13 引入了 `errors.Is` 和 `errors.As` 函数，用于检查错误类型。

- **`errors.Is`**：用于检查错误是否与某个具体的错误值相等。

```go
import (
    "errors"
    "fmt"
)

var ErrNotFound = errors.New("找不到页面")

func findPage(id int) error {
    if id != 1 {
        return ErrNotFound
    }
    return nil
}

func main() {
    err := findPage(2)
    if errors.Is(err, ErrNotFound) {
        fmt.Println("错误: 页面未找到") // 输出：错误: 页面未找到
    }
}
```

- **`errors.As`**：用于判断错误是否为某个特定类型，并将其转换为该类型。

```go
import (
    "errors"
    "fmt"
)

type MyError struct {
    Code int
}

func (e *MyError) Error() string {
    return fmt.Sprintf("错误代码: %d", e.Code)
}

func findPage(id int) error {
    return &MyError{Code: 404}
}

func main() {
    err := findPage(2) // err是一个code: 404的指针MyError
    var myErr *MyError
    if errors.As(err, &myErr) { // 判断err是否为myErr类型，然后转型赋值
        fmt.Println("自定义错误代码:", myErr.Code) // 输出：自定义错误代码: 404
    }
}
```

`errors.As` 允许你对自定义的错误类型进行类型断言，并进行更细粒度的处理。

### 20.6 恐慌（panic）与恢复（recover）

虽然 Go 提倡使用错误返回值来处理异常情况，但有时候可能会遇到一些严重错误，这些错误无法通过常规的返回值进行处理。在这种情况下，可以使用 `panic` 函数。

- **`panic`**：用于引发恐慌，终止当前函数的执行，并沿调用栈向上逐层传递。
- **`recover`**：用于捕获恐慌，并恢复正常执行。

```go
func riskyOperation() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("捕获到恐慌:", r)
        }
    }()

    panic("出现严重错误")
}

func main() {
    riskyOperation()
    fmt.Println("继续执行…")
}
```

在这个例子中，`recover` 捕获了 `panic`，程序得以继续执行。

## 21 反射（Reflection）

> [!summary] 反射（Reflection）
>
> - 反射可以动态获取类型和值，并且可以在运行时修改数据。
> - 通过反射，能够操作和修改结构体的字段与方法。
> - 反射功能强大，但在实际开发中应谨慎使用，因为它可能影响程序的性能，并且代码的可读性也会降低。

Go 语言中的反射允许程序在运行时检查变量的类型、获取其值、修改数据或执行类型断言。反射的核心包是 `reflect`。

### 21.1 反射的三大核心概念

- **Type**：代表 Go 语言中的类型，可以通过 `reflect.TypeOf()` 函数获取。
- **Value**：代表具体的值，可以通过 `reflect.ValueOf()` 函数获取。
- **Kind**：表示 Go 中的底层类型，比如 `int`、`float`、`struct` 等。

### 21.2 基本使用

#### 21.2.1 获取类型信息

通过 `reflect.TypeOf()` 函数可以获取变量的类型。

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    var x int = 10
    fmt.Println("Type of x:", reflect.TypeOf(x)) // 输出：Type of x: int
}
```

#### 21.2.2 获取值信息

通过 `reflect.ValueOf()` 函数可以获取变量的值。

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    var x int = 10
    v := reflect.ValueOf(x)
    fmt.Println("Value of x:", v)        // 输出：Value of x: 10
    fmt.Println("Type of v:", v.Type())  // 输出：Type of v: int
}
```

#### 21.2.3 通过 `reflect.Value` 获取具体值

要从 `reflect.Value` 中取回原始的值，使用 `Interface()` 方法并进行[[#18.7 类型断言|类型断言]]。

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    var x int = 10
    v := reflect.ValueOf(x) // 转化x成reflect.value
    originalValue := v.Interface().(int)  // Interface()方法返回interface{}，使用类型断言.(int)还原原始类型
    fmt.Println("Original value:", originalValue)  // 输出：Original value: 10
}
```

#### 21.2.4 常见的 `reflect.Value` 方法

除了使用 `Interface()` 方法和类型断言将 `reflect.Value` 恢复为具体的值外，Go 的 `reflect` 包还提供了一些便捷方法，直接返回某些基本类型的值，如 `Int()`、`Uint()`、`Float()`、`Bool()`、`Bytes()` 和 `String()` 等。这些方法直接从 `reflect.Value` 中获取原始类型的值，而无需进行类型断言。

1. **`Int()`**：当 `reflect.Value` 包含一个整数类型（如 `int`、`int8`、`int16` 等）时，使用 `Int()` 方法获取其值，返回 `int64` 类型。

   ```go
   var x int = 42
   v := reflect.ValueOf(x)
   fmt.Println(v.Int()) // 输出 42
   ```

2. **`Uint()`**：当 `reflect.Value` 包含一个无符号整数类型（如 `uint`、`uint8`、`uint16` 等）时，使用 `Uint()` 方法获取其值，返回 `uint64` 类型。

   ```go
   var x uint = 42
   v := reflect.ValueOf(x)
   fmt.Println(v.Uint()) // 输出 42
   ```

3. **`Float()`**：当 `reflect.Value` 包含一个浮点数类型（如 `float32`、`float64`）时，使用 `Float()` 方法获取其值，返回 `float64` 类型。

   ```go
   var x float64 = 3.14
   v := reflect.ValueOf(x)
   fmt.Println(v.Float()) // 输出 3.14
   ```

4. **`Bool()`**：当 `reflect.Value` 包含一个布尔值时，使用 `Bool()` 方法获取其值，返回 `bool` 类型。

   ```go
   var x bool = true
   v := reflect.ValueOf(x)
   fmt.Println(v.Bool()) // 输出 true
   ```

5. **`Bytes()`**：当 `reflect.Value` 包含一个字节切片（`[]byte`）时，使用 `Bytes()` 方法获取其值，返回 `[]byte` 类型。

   ```go
   var x = []byte{1, 2, 3}
   v := reflect.ValueOf(x)
   fmt.Println(v.Bytes()) // 输出 [1 2 3]
   ```

6. **`String()`**：当 `reflect.Value` 包含一个字符串时，使用 `String()` 方法获取其值，返回 `string` 类型。

   ```go
   var x string = "hello"
   v := reflect.ValueOf(x)
   fmt.Println(v.String()) // 输出 hello
   ```

##### 21.2.4.1 使用场景

这些方法的使用场景主要在于当我们已经知道 `reflect.Value` 中存储的具体类型时，可以直接通过这些方法获取值，而不必先调用 `Interface()` 并通过类型断言。它们的主要优势是简化了常见类型的处理过程。

##### 21.2.4.2 注意事项

这些方法要求 `reflect.Value` 的类型必须与调用的方法匹配，否则会导致 panic。例如，调用 `Int()` 时，`reflect.Value` 必须是某种整数类型；如果是其他类型，将会触发运行时错误。

```go
var x string = "hello"
v := reflect.ValueOf(x)
// v.Int() 会引发 panic，因为 v 并不是整数类型
```

#### 21.2.5 `reflect.value` 状态检测

##### 21.2.5.1 `isNil()` & `isValid()`

在 Go 的反射中，`isNil()` 和 `isValid()` 是两个用于检查 `reflect.Value` 状态的重要方法。

> [!summary] `isNil()` & `isValid()`
> - `isNil()`：用于检查指针、通道、映射等类型的值是否为 `nil`。
> - `isValid()`：用于判断一个 `reflect.Value` 是否有效，适用于检查映射键、字段或方法是否存在等。

###### 21.2.5.1.1 `isNil()`

`isNil()` 用于判断一个 `reflect.Value` 是否为 `nil`。它只能用于指针、通道、函数、接口、映射和切片类型的 `reflect.Value`，其他类型调用会导致 panic。

**示例**：

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    var p *int
    v := reflect.ValueOf(p)
    
    if v.IsNil() {
        fmt.Println("Value is nil")
    } else {
        fmt.Println("Value is not nil")
    }
}
```

输出：

```
Value is nil
```

注意：如果尝试对非指针、非接口、非映射等类型调用 `isNil()`，则会导致 panic。

**非指针类型示例**：

```go
package main

import (
    "reflect"
)

func main() {
    var i int
    v := reflect.ValueOf(i)
    
    // 这里会导致 panic，因为 int 类型不能用 isNil
    v.IsNil()
}
```

###### 21.2.5.1.2 `isValid()`

`isValid()` 用于判断一个 `reflect.Value` 是否有效。如果 `reflect.Value` 不代表任何值，则 `isValid()` 返回 `false`。这通常用来检查变量是否存在或类型转换是否成功。

**示例**：

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    var x interface{}
    v := reflect.ValueOf(x)
    
    if !v.IsValid() {
        fmt.Println("Value is invalid")
    } else {
        fmt.Println("Value is valid")
    }
}
```

输出：

```
Value is invalid
```

`isValid()` 常用于以下几种情况：

- 检查映射中的键是否存在。
- 检查方法或字段是否存在。

**映射键的示例**：

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    m := map[string]int{"age": 30}
    v := reflect.ValueOf(m)
    
    key := reflect.ValueOf("name")
    val := v.MapIndex(key)
    
    if !val.IsValid() {
        fmt.Println("Key does not exist")
    } else {
        fmt.Println("Key exists with value:", val)
    }
}
```

输出：

```
Key does not exist
```

### 21.3 修改变量值

反射不仅可以获取值，还可以修改变量的值。要修改值，必须*传递指针*给 `reflect.ValueOf()`，然后调用 `Elem()` 方法获取指针指向的元素。

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    var x int = 10
    v := reflect.ValueOf(&x)  // 传递指针
    v.Elem().SetInt(20)       // 修改指针指向的值
    fmt.Println("Modified x:", x)  // 输出：Modified x: 20
}
```

注意，修改变量值时必须确保它是可设置的（`CanSet()`）。

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    var x int = 10
    v := reflect.ValueOf(x)
    fmt.Println("Can set:", v.CanSet())  // 输出：Can set: false，值是不可修改的

    v = reflect.ValueOf(&x)
    fmt.Println("Can set:", v.Elem().CanSet())  // 输出：Can set: true，指针指向的值可修改
}
```

### 21.4 类型的 `Kind`

`reflect.Type` 提供的 `Kind()` 方法表示的是变量的底层类型（`kind`），比如 `int`、`string`、`struct` 等。

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    var x int = 10
    t := reflect.TypeOf(x)
    fmt.Println("Type:", t)       // 输出：Type: int
    fmt.Println("Kind:", t.Kind()) // 输出：Kind: int
}
```

### 21.5 反射操作结构体

反射可以用于动态操作结构体的字段和值。通过 `reflect.Type` 和 `reflect.Value`，可以获取结构体的字段信息、方法以及进行修改。以下是 `reflect.Type` 和 `reflect.Value` 操作结构体成员的常用方法总结。

#### 21.5.1 `reflect.Type` & `reflect.Value`

| 方法                                          | 所属类型         | 返回类型      | 说明                                                   |
| --------------------------------------------- | ---------------- | ------------- | ------------------------------------------------------ |
| `Align()`                                     | `Type`           | `int`         | 返回类型的对齐字节数                                   |
| `Field(i int)`                                | `Type`           | `StructField` | 获取结构体第 `i` 个字段的 `StructField` 对象           |
| `FieldByName(name string)`                    | `Type`           | `StructField` | 通过字段名获取 `StructField` 对象                      |
| `FieldByIndex(index []int)`                   | `Type`           | `StructField` | 通过嵌套索引获取字段                                   |
| `FieldByNameFunc(funcName func(string) bool)` | `Type`           | `StructField` | 通过自定义函数查找字段名，返回匹配字段的 `StructField` |
| `NumField()`                                  | `Type`           | `int`         | 返回结构体的字段数量                                   |
| `Method(i int)`                               | `Type`           | `Method`      | 获取类型第 `i` 个方法的 `Method` 对象                  |
| `MethodByName(name string)`                   | `Type`           | `Method`      | 通过方法名获取 `Method` 对象                           |
| `NumMethod()`                                 | `Type`           | `int`         | 返回类型的方法数量                                     |
| `Name()`                                      | `Type`           | `string`      | 返回类型的名称                                         |
| `PkgPath()`                                   | `Type`           | `string`      | 返回类型所在的包路径                                   |
| `Size()`                                      | `Type`           | `uintptr`     | 返回类型的大小（以字节为单位）                         |
| `String()`                                    | `Type`           | `string`      | 返回类型的字符串表示                                   |
| `Kind()`                                      | `Type` / `Value` | `Kind`        | 返回类型或值的种类（如 `struct`、`int`、`string` 等）  |
| `Implements(u Type)`                          | `Type`           | `bool`        | 判断类型是否实现了接口 `u`                             |
| `AssignableTo(u Type)`                        | `Type`           | `bool`        | 判断类型是否可以赋值给类型 `u`                         |
| `ConvertibleTo(u Type)`                       | `Type`           | `bool`        | 判断类型是否可以转换为类型 `u`                         |
| `Comparable()`                                | `Type`           | `bool`        | 判断类型是否可以比较                                   |
| `Elem()`                                      | `Value`          | `Value`       | 返回指针、接口或数组的元素值                           |
| `Field(i int)`                                | `Value`          | `Value`       | 返回结构体中第 `i` 个字段的值                          |
| `FieldByName(name string)`                    | `Value`          | `Value`       | 通过字段名获取字段的 `Value` 值                        |
| `FieldByIndex(index []int)`                   | `Value`          | `Value`       | 通过嵌套索引获取字段的 `Value` 值                      |
| `FieldByNameFunc(funcName func(string) bool)` | `Value`          | `Value`       | 通过自定义函数查找字段名，返回匹配字段的 `Value`       |
| `NumField()`                                  | `Value`          | `int`         | 返回结构体中的字段数量                                 |
| `Method(i int)`                               | `Value`          | `Value`       | 返回值的第 `i` 个方法                                  |
| `NumMethod()`                                 | `Value`          | `int`         | 返回值的方法数量                                       |
| `Interface()`                                 | `Value`          | `interface{}` | 返回值的接口表示                                       |
| `IsValid()`                                   | `Value`          | `bool`        | 判断值是否有效                                         |
| `CanSet()`                                    | `Value`          | `bool`        | 判断值是否可以设置                                     |
| `Set()`                                       | `Value`          | `-`           | 设置字段的值（必须是指针）                             |
| `SetString(string)`                           | `Value`          | `-`           | 设置字符串字段的值                                     |
| `SetInt(int64)`                               | `Value`          | `-`           | 设置整数字段的值                                       |
| `Call([]Value)`                               | `Value`          | `[]Value`     | 调用值的方法并返回结果                                 |

#### 21.5.2 `StructField`

`StructField` 是 `reflect` 包中表示结构体字段的类型，用于描述结构体中的每个字段。通过 `reflect.Type.Field()` 等方法获取的字段信息就是 `StructField` 类型的实例。

以下是 `StructField` 结构体的常用字段和方法：

| 字段/方法       | 类型                | 说明                                                                  |
| --------------- | ------------------- | --------------------------------------------------------------------- |
| `Name`          | `string`            | 字段的名称                                                            |
| `PkgPath`       | `string`            | 字段的包路径，非导出字段的包路径，不导出字段时可用于区分字段可见性    |
| `Type`          | `reflect.Type`      | 字段的类型（`reflect.Type`）                                          |
| `Tag`           | `reflect.StructTag` | 字段的[[#16.15 结构体标签（Struct Tags）\|结构体标签]]（`StructTag`） |
| `Offset`        | `uintptr`           | 字段在结构体中的字节偏移量                                            |
| `Index`         | `[]int`             | 字段在结构体中的索引（适用于嵌套结构体字段）                          |
| `Anonymous`     | `bool`              | 字段是否为匿名字段                                                    |
| `IsExported()`  | `bool`              | 字段是否为导出字段（Go 1.17+ 提供）                                   |
| `Type().Kind()` | `reflect.Kind`      | 获取字段类型的种类（如 `int`、`string`、`struct` 等）                 |

> [!example]
>
> - 获取 `StructField` 信息
>
> 	```go
> 	package main
> 	
> 	import (
> 	    "fmt"
> 	    "reflect"
> 	)
> 	
> 	type Person struct {
> 	    Name string `json:"name"`  // 带有结构体标签
> 	    Age  int
> 	}
> 	
> 	func main() {
> 	    p := Person{Name: "Alice", Age: 30}
> 	    t := reflect.TypeOf(p)
> 	
> 	    for i := 0; i < t.NumField(); i++ {
> 	        field := t.Field(i)
> 	        fmt.Printf("Field Name: %s\n", field.Name)
> 	        fmt.Printf("Field Type: %s\n", field.Type)
> 	        fmt.Printf("Field Tag: %s\n", field.Tag)
> 	        fmt.Printf("Field Offset: %d\n", field.Offset)
> 	        fmt.Printf("Is Anonymous: %v\n", field.Anonymous)
> 	        fmt.Println("-----")
> 	    }
> 	}
> 	```
>
> 	```
> 	Field Name: Name
> 	Field Type: string
> 	Field Tag: json:"name"
> 	Field Offset: 0
> 	Is Anonymous: false
> 	-----
> 	Field Name: Age
> 	Field Type: int
> 	Field Tag: 
> 	Field Offset: 16
> 	Is Anonymous: false
> 	-----
> 	```
>
> 通过 `StructField` 的字段和方法，开发者可以详细了解每个结构体字段的类型、名称、偏移量、标签等信息，并且可以通过 `IsExported()` 判断字段是否为导出字段（即首字母大写）。  
>
> - 使用 `FieldByIndex` 和 `FieldByNameFunc` 访问嵌套结构体字段
>
> 	```go
> 	package main
> 	
> 	import (
> 	    "fmt"
> 	    "reflect"
> 	)
> 	
> 	type Address struct {
> 	    City  string
> 	    State string
> 	}
> 	
> 	type Person struct {
> 	    Name    string
> 	    Age     int
> 	    Address Address
> 	}
> 	
> 	func main() {
> 	    p := Person{
> 	        Name: "Alice",
> 	        Age:  30,
> 	        Address: Address{
> 	            City:  "New York",
> 	            State: "NY",
> 	        },
> 	    }
> 	
> 	    // 使用 FieldByIndex 访问嵌套字段
> 	    v := reflect.ValueOf(p)
> 	    cityField := v.FieldByIndex([]int{2, 0})  // 访问 Address.City 字段
> 	    fmt.Println("City:", cityField)           // 输出：City: New York
> 	
> 	    // 使用 FieldByNameFunc 通过自定义函数查找字段名
> 	    field := reflect.TypeOf(p).FieldByNameFunc(func(s string) bool {
> 	        return s == "Name"
> 	    })
> 	    fmt.Println("Field found by custom func:", field.Name)  // 输出：Field found by custom func: Name
> 	}
> 	```
>
> - 修改嵌套结构体字段值
>
> 通过反射修改结构体字段时，必须传递指针，且字段必须为导出字段。
>
> 	```go
> 	package main
> 	
> 	import (
> 	    "fmt"
> 	    "reflect"
> 	)
> 	
> 	type Address struct {
> 	    City  string
> 	    State string
> 	}
> 	
> 	type Person struct {
> 	    Name    string
> 	    Age     int
> 	    Address Address
> 	}
> 	
> 	func main() {
> 	    p := Person{Name: "Alice", Age: 30, Address: Address{City: "New York", State: "NY"}}
> 	    v := reflect.ValueOf(&p).Elem()  // 获取指针指向的值
> 	
> 	    // 修改 Name 字段
> 	    v.FieldByName("Name").SetString("Bob")
> 	
> 	    // 修改 Address.City 字段
> 	    v.FieldByIndex([]int{2, 0}).SetString("Los Angeles")
> 	
> 	    fmt.Println("Modified person:", p)
> 	}
> 	```
>
> - 获取结构体方法并调用
>
> 	```go
> 	package main
> 	
> 	import (
> 	    "fmt"
> 	    "reflect"
> 	)
> 	
> 	type Person struct {
> 	    Name string
> 	}
> 	
> 	func (p Person) Greet() {
> 	    fmt.Println("Hello, my name is", p.Name)
> 	}
> 	
> 	func main() {
> 	    p := Person{Name: "Alice"}
> 	    v := reflect.ValueOf(p)
> 	
> 	    greetMethod := v.MethodByName("Greet")
> 	    greetMethod.Call(nil)  // 调用 Greet 方法
> 	}
> 	```
>
> 在以上示例中，`FieldByNameFunc` 可以用来自定义搜索字段，而 `FieldByIndex` 则用于访问嵌套结构体的字段。这些方法与结构体反射结合使用，允许更加灵活的字段和方法操作。
>
> - `ini` 解析并存入结构体
>
> 	```go
> 	package main
> 	
> 	import (
> 		"bufio"
> 		"fmt"
> 		"os"
> 		"reflect"
> 		"strconv"
> 		"strings"
> 	)
> 	
> 	// parseINI 解析 INI 文件并将其内容填充到传入的结构体中
> 	func parseINI(filename string, out interface{}) error {
> 		// 打开文件
> 		file, err := os.Open(filename)
> 		if err != nil {
> 			return err
> 		}
> 		defer file.Close() // 确保文件在函数结束时关闭
> 	
> 		// 使用反射解析目标结构体
> 		v := reflect.ValueOf(out)
> 		if v.Kind() != reflect.Ptr || v.Elem().Kind() != reflect.Struct { // 检查是否是指向结构体的指针
> 			return fmt.Errorf("output must be a pointer to a struct")
> 		}
> 		v = v.Elem() // 获取指针指向的结构体
> 	
> 		// 用于存储当前正在处理的部分（section）
> 		var currentSection reflect.Value
> 	
> 		// 创建一个扫描器逐行读取文件内容
> 		scanner := bufio.NewScanner(file)
> 		for scanner.Scan() {
> 			line := strings.TrimSpace(scanner.Text()) // 去除行首尾的空白字符
> 			if line == "" || strings.HasPrefix(line, ";") || strings.HasPrefix(line, "#") {
> 				// 跳过空行和注释行
> 				continue
> 			}
> 	
> 			// 判断是否是 [section]
> 			if strings.HasPrefix(line, "[") && strings.HasSuffix(line, "]") {
> 				sectionName := strings.TrimSpace(line[1 : len(line)-1]) // 提取 section 名称（前闭后开区间）
> 	
> 				// 通过反射获取对应的 section 字段
> 				section := v.FieldByNameFunc(func(name string) bool {
> 					field, _ := v.Type().FieldByName(name)     // 获取字段信息
> 					return field.Tag.Get("ini") == sectionName // 判断字段的 ini 标签是否等于 section 名称
> 				})
> 				if !section.IsValid() {
> 					return fmt.Errorf("section [%s] not found in struct", sectionName)
> 				}
> 	
> 				currentSection = section // 更新当前 section
> 				continue
> 			}
> 	
> 			// 解析 key=value
> 			parts := strings.SplitN(line, "=", 2)
> 			if len(parts) != 2 {
> 				continue // 如果不是 key=value 格式，跳过
> 			}
> 			key := strings.TrimSpace(parts[0])
> 			value := strings.TrimSpace(parts[1])
> 	
> 			if !currentSection.IsValid() {
> 				return fmt.Errorf("no section found for key %s", key)
> 			}
> 	
> 			// 设置字段值
> 			field := currentSection.FieldByNameFunc(func(name string) bool {
> 				field, _ := currentSection.Type().FieldByName(name)
> 				return field.Tag.Get("ini") == key
> 			})
> 	
> 			if !field.IsValid() {
> 				return fmt.Errorf("field for key %s not found in struct", key)
> 			}
> 	
> 			// 根据字段类型设置值
> 			switch field.Kind() {
> 			case reflect.String:
> 				field.SetString(value)
> 			case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
> 				intValue, err := strconv.ParseInt(value, 10, 64)
> 				if err != nil {
> 					return err
> 				}
> 				field.SetInt(intValue)
> 			default:
> 				return fmt.Errorf("unsupported field type: %s", field.Kind())
> 			}
> 		}
> 	
> 		return scanner.Err() // 返回扫描器的错误（如果有）
> 	}
> 	
> 	func main() {
> 		// 定义配置结构体
> 		type Config struct {
> 			Server struct {
> 				IP   string `ini:"ip"`
> 				Port int    `ini:"port"`
> 			} `ini:"server"`
> 			Database struct {
> 				User     string `ini:"user"`
> 				Password string `ini:"password"`
> 				Port     int    `ini:"port"`
> 			} `ini:"database"`
> 		}
> 	
> 		var cfg Config // 创建配置结构体实例
> 	
> 		// 解析 INI 文件并填充配置结构体
> 		err := parseINI("config.ini", &cfg)
> 		if err != nil {
> 			fmt.Println("Error:", err)
> 			return
> 		}
> 	
> 		// 打印解析后的配置
> 		fmt.Printf("Parsed Config: %+v\n", cfg)
> 	}
> 	```

### 21.6 反射与方法调用

可以通过反射调用结构体的方法。首先使用 `reflect.ValueOf()` 获取方法，再调用 `Call()` 方法执行。

```go
package main

import (
    "fmt"
    "reflect"
)

type Person struct {
    Name string
}

func (p Person) Greet() {
    fmt.Println("Hello, my name is", p.Name)
}

func main() {
    p := Person{Name: "Alice"}
    v := reflect.ValueOf(p)
    greetMethod := v.MethodByName("Greet")
    
    greetMethod.Call(nil)  // 调用方法，nil表示不需要参数，输出：Hello, my name is Alice
}
```

### 21.7 反射的缺点

#### 21.7.1 **性能开销大**

   - 反射操作通常比常规的类型操作慢很多，因为反射在运行时需要额外的类型检查、内存分配和安全检查。
   - 在需要频繁调用或大规模数据处理的场景中，反射的性能开销可能会显著增加程序的运行时间。

#### 21.7.2 **类型安全性下降**

   - 反射破坏了编译时的类型检查，导致一些潜在的错误只能在运行时暴露。例如，使用 `reflect.Value.Interface()` 获取原始值时，如果断言类型错误，程序会在运行时崩溃。
   - 这使得程序不再具备 Go 语言通常提供的编译期类型安全特性。

#### 21.7.3 **代码可读性差**

   - 反射代码往往比普通代码更难理解，尤其对于没有反射经验的开发者来说，代码逻辑复杂，阅读和维护都变得困难。
   - 反射代码隐藏了实际的类型和逻辑，使得追踪代码行为变得困难。

#### 21.7.4 **调试难度高**

   - 由于反射是在运行时操作类型和数据，调试过程中很难直观地看到操作过程。错误往往不是在编译时暴露，而是在运行时触发，这使得调试和定位问题变得更加困难。

#### 21.7.5 **代码灵活性和泛型支持有限**

   - 反射虽然允许在运行时处理不同类型，但由于其复杂性和限制，往往不如引入泛型那样灵活、简洁。Go 语言自从1.18引入泛型后，许多使用反射来实现泛型功能的代码可以通过更安全和高效的泛型来实现。

#### 21.7.6 **不适合频繁使用**

   - 由于性能和复杂性问题，反射不适合在关键代码路径或高频率调用中使用。即使 Go 提供了反射的功能，通常建议尽量避免频繁使用，尤其是在可以通过静态类型安全方式实现的情况下。

#### 21.7.7 **隐含的错误信息**

   - 反射错误的信息往往不够直观，导致难以追踪具体错误的来源。例如，当 `reflect.Value.Interface()` 的类型断言失败时，错误信息可能较模糊，难以直接指出问题的根源。

#### 21.7.8 总结

反射提供了灵活性和动态性，但代价是性能和可维护性问题。通常情况下，只有在*类型未知且必须动态处理*数据时，反射才是必要的，否则应尽量避免使用。

## 22 并发编程

> [!note] 并发 vs 并行 vs 串行
>
> - **串行**：任务*逐个执行*，只有当前任务完成，才能开始下一个任务。这种方式简单，但效率较低，尤其在任务之间没有依赖关系时。
>
> - **并发**：多个任务可以在*同一时间段内交替进行*，它强调的是任务间的交替执行，不要求同时运行。并发的目的是提高任务的响应速度，而不是最大化计算资源的利用。
>
> - **并行**：多个任务在*同一时间内同时运行*，通常需要多核处理器来并行执行多个任务。并行可以充分利用计算资源，但适用于任务之间相互独立的情况。

> [!note] 进程、线程和协程
>
> - **进程**：是操作系统*分配资源*的*最小单位*，每个进程都有自己的内存空间、文件描述符等资源。进程之间的通信开销较大。
>
> - **线程**：是操作系统*调度执行*的*基本单位*，一个进程可以包含多个线程，它们共享同一个进程的内存和资源。线程之间的通信比进程更轻量，但会涉及到资源竞争问题。
>
> - **协程**：是一种比线程更轻量的执行单元，协程由*程序调度*而不是操作系统调度。协程在*单个线程内执行*，可以通过*非抢占式*的方式实现并发。相比线程，协程的上下文切换开销非常小。

> [!note] 并发模型
>
> 不同编程语言有不同的并发模型，常见的并发模型包括：
>
> - **多线程并发模型**：如 Java 和 C++，通过操作系统的线程来实现并发，每个线程都是独立的执行单元，共享内存。
>
> - **事件驱动模型**：如 JavaScript，通过事件循环机制实现并发，所有任务都在一个线程中通过回调函数处理，避免了多线程带来的复杂性。
>
> - **Actor 模型**：如 Erlang，每个 Actor 是一个独立的执行单元，Actor 之间通过消息传递进行通信，而不是共享内存。

Go 语言采用的是基于 **CSP（Communicating Sequential Processes，通信顺序进程）** 的并发模型。CSP 模型的核心思想是，多个独立的进程通过*消息传递*（而不是共享内存）来进行通信。Go 使用 **goroutine** 和 **channel** 来实现这一模型。

- **Goroutine**：是 Go 中用于并发执行的轻量级线程，它比操作系统的线程更加轻量，且可以通过 Go 运行时进行管理。
- **Channel**：是 Go 提供的用于在多个 goroutine 之间传递消息的通信机制，避免了共享内存带来的复杂性和数据竞争问题。

Go 的并发模式相对简单，且高效，能够帮助开发者编写并发安全的程序，而无需频繁考虑锁、同步等低级别细节。

### 22.1 Goroutine

> [!summary] goroutine
>
> - goroutine 是 Go 中的并发执行单元，使用 `go` 关键字启动。
> - goroutine 使用动态栈，启动时占用的内存非常小。
> - `GOMAXPROCS` 控制了 goroutine 并行执行的最大 CPU 核心数，合理设置可以提高程序的性能。
> - Go 的调度器会管理 goroutine 在内核线程上的执行，保证并发的高效和轻量。

> [!warning] recover goroutine中的panic
>
> 在 Go 中，`panic` 和 `recover` 机制用于处理程序中的异常情况。`panic` 触发时，会导致当前 goroutine 的执行被中断，程序的控制流将跳转到最近的 `defer` 语句中带有 `recover` 的处理代码。
>
> 关键点如下：
>
> 1. **每个 goroutine 的独立性**：每个 goroutine 运行在自己的独立栈上。`panic` 仅会影响当前 goroutine，而不会传播到其他 goroutine。因此，如果一个 goroutine 中发生了 `panic`，只有这个 goroutine 内的 `recover` 能够捕捉到这个 `panic`。
>
> 2. **`recover` 只能在 `defer` 语句中有效**：`recover` 只能在同一个 goroutine 内的 `defer` 语句中有效。如果一个 goroutine 中触发了 `panic`，只有这个 goroutine 内的 `defer` 语句才能使用 `recover` 捕捉到 `panic`。
>
> 3. **跨 goroutine 的 `panic` 无法捕获**：`panic` 从一个 goroutine 传播到另一个 goroutine 是不可能的。因此，在一个 goroutine 中 `panic` 不能被另一个 goroutine 中的 `recover` 捕捉。每个 goroutine 必须处理自己内部的 `panic`，并且要在 `defer` 中使用 `recover` 来保证 `panic` 被正确处理。
>
> 总之，为了保证异常处理的正确性，必须在发生 `panic` 的 goroutine 内部进行 `recover`。

#### 22.1.1 `go` 关键字

在 Go 中，要启动一个新的 goroutine，只需要在函数调用前加上 `go` 关键字。例如：

```go
package main

import (
    "fmt"
    "time"
)

func sayHello() {
    fmt.Println("Hello, Go!")
}

func main() {
    go sayHello()  // 启动一个新的 goroutine 执行 sayHello 函数
    time.Sleep(time.Second)  // 主 goroutine 休眠一秒钟以等待其他 goroutine 执行
    fmt.Println("Main function finished")
}
```

在上面的例子中，`sayHello()` 函数通过 `go` 关键字被作为 goroutine 启动，而主函数中 `time.Sleep` 用来防止主 goroutine 退出得太快，否则 `sayHello` 的输出可能看不到。

#### 22.1.2 启动单个或多个 Goroutine

- **单个 goroutine**：如上例所示，可以通过 `go` 关键字启动一个单独的 goroutine 来执行函数。
  
- **多个 goroutine**：可以在 `main()` 函数或其他 goroutine 中启动多个 goroutine。所有的 goroutine 都是并发执行的。

```go
package main

import (
    "fmt"
    "time"
)

func printNumbers() {
    for i := 1; i <= 5; i++ {
        fmt.Println(i)
        time.Sleep(time.Millisecond * 500)
    }
}

func main() {
    go printNumbers()  // 启动第一个 goroutine
    go printNumbers()  // 启动第二个 goroutine

    time.Sleep(time.Second * 3)  // 主 goroutine 等待其他 goroutine 完成
}
```

在这个例子中，两个 `printNumbers` 函数以 goroutine 形式并发执行，互不阻塞，输出的顺序也不确定。

#### 22.1.3 动态栈

与系统线程不同，goroutine 的栈是**动态增长**和**收缩**的。每个 goroutine 启动时只会分配少量的栈空间（一般是 2 KB），当栈空间不足时，Go 的运行时会自动调整栈的大小。这一特性使得 goroutine 非常轻量，可以同时运行成千上万个 goroutine，而不会占用大量内存。

相较之下，操作系统线程的栈空间是固定的，通常每个线程需要分配 1~2 MB 的栈，导致过多线程时内存消耗较大。

#### 22.1.4 Goroutine 调度

##### 22.1.4.1 系统的并发调度

操作系统的并发调度通常采用多线程模型。每个线程有自己的栈空间、寄存器状态等。操作系统内核负责管理线程的执行，包括线程的创建、调度、和销毁。多线程调度器会在**内核态**和**用户态**之间进行频繁切换，以响应不同的任务需求。

现代操作系统大多采用 **1:1 线程模型**，即每个用户线程对应一个内核线程。操作系统的调度器会公平地调度这些线程执行，并利用多核 CPU 的特性让线程并行执行。虽然这种模型实现了并发，但每个内核线程的创建和切换会带来较大的性能开销：

- **上下文切换**：线程在 CPU 上运行时保存状态，切换到另一个线程时需要恢复状态，涉及寄存器、程序计数器、内存等切换。每次切换都消耗 CPU 时间。
- **内存开销**：每个线程有独立的栈和内核资源，线程过多时会占用大量内存资源。
- **系统调用开销**：线程调度、线程同步等操作需要调用内核功能，频繁的系统调用会带来额外的开销。

##### 22.1.4.2 Go 的调度器模型

Go 语言在并发方面的设计非常高效，其调度器是**完全在用户态**运行的，避免了系统态和用户态的频繁切换。Go 采用了 **M:N 模型**，即将多个 goroutine 映射到少量的内核线程上，利用轻量级的 goroutine 实现高效的并发。

- **M:N 模型**：`M` 表示内核线程，`N` 表示 goroutine。Go 的调度器会将大量的 goroutine 复用在较少的内核线程上，以避免线程的频繁创建和销毁。
- **用户态调度**：Go 调度器在用户态完成调度工作，不涉及系统调用。通过使用自己的 goroutine 队列，调度器能够决定哪个 goroutine 该执行，并何时进行切换。
- **动态栈**：Go goroutine 的栈内存大小是动态调整的，初始栈非常小（通常为 2KB），在需要时自动扩展，避免了传统线程中一次性分配大栈空间的浪费。

Go 的调度模型基于三个重要组件：**G（goroutine）**、**M（内核线程）** 和 **P（处理器，processor）**。

- **G（goroutine）**：轻量级线程，运行在用户态，由 Go 调度器管理。
- **M（machine，内核线程）**：操作系统提供的内核线程，负责真正的计算和执行。
- **P（processor，处理器）**：调度的核心，负责将 goroutine 分配给内核线程执行。Go 的调度器会根据系统的 CPU 核心数动态决定 P 的数量。

Go 的调度器在**P-M-G 模型**下工作：

1. **P** 维护一个 goroutine 的队列，决定该队列上的 goroutine 什么时候可以被分配给 M。
2. **M** 负责执行由 P 分配的 goroutine，P 和 M 是一对一绑定的，但一个 P 可以切换绑定不同的 M，以充分利用多核 CPU。
3. **G** 通过 P 分配到 M 上执行，多个 goroutine 可以在同一个线程上并发执行。

##### 22.1.4.3 Go 调度器的工作机制

- **抢占式调度**：调度器会定期检查运行中的 goroutine，如果某个 goroutine 占用了过多的 CPU 时间，调度器会强制将其挂起，并调度其他 goroutine 运行。
- **工作窃取**：如果某个处理器上的 goroutine 执行完了，而其他处理器上仍有未执行的 goroutine，调度器会从其他处理器的队列中窃取 goroutine，确保处理器资源的充分利用。
- **协作调度**：当某个 goroutine 发生 I/O 阻塞或主动调用 `runtime.Gosched()` 函数让出 CPU 时，调度器会调度其他 goroutine 运行。

##### 22.1.4.4 并发调度模型的区别与 Go 的性能优势

1. **M:N 模型 vs 1:1 模型**：
   - 操作系统的 1:1 线程模型依赖内核调度，内核线程的创建和切换需要进行系统调用，带来了上下文切换和内存开销。每个内核线程分配固定大小的栈空间，资源消耗大。
   - Go 的 M:N 模型则通过用户态调度器管理 goroutine。每个 goroutine 是轻量级的，栈空间是动态分配的，避免了传统线程模型的栈内存浪费问题。

2. **用户态调度 vs 内核态调度**：
   - Go 的调度器完全运行在用户态，避免了频繁的系统调用，调度效率更高。
   - 操作系统的调度器运行在内核态，频繁的系统调用（如线程切换、锁机制等）会带来显著的性能损耗。

3. **轻量级 goroutine**：
   - Go 的 goroutine 是极其轻量级的，并且支持数以万计的 goroutine 同时运行，具有非常低的资源消耗。
   - 传统线程模型下，大量线程的上下文切换会带来高昂的性能开销，而 Go 的 goroutine 切换仅需要用户态的少量操作。

4. **调度灵活性与多核利用**：
   - Go 调度器通过**抢占式调度**和**工作窃取**机制，能够灵活地将 goroutine 分配到不同的处理器上执行，充分利用多核 CPU 的性能。
   - 传统的线程调度模型则较为固定，线程的 CPU 绑定和调度机制缺乏灵活性。

综上，Go 语言的并发调度模型具有**高效、轻量**的特点，通过用户态的 M:N 调度模型和轻量级 goroutine 实现了对系统资源的充分利用，避免了操作系统多线程调度带来的性能瓶颈。这使得 Go 成为处理大规模并发任务的理想选择。

#### 22.1.5 `GOMAXPROCS`

`GOMAXPROCS` 是 Go 语言中的一个重要配置项，它用于控制 Go 运行时可以并行使用的操作系统线程数，即可以并行执行的 goroutine 数量。`GOMAXPROCS` 的默认值是系统的 CPU 核心数。

可以通过 `runtime.GOMAXPROCS(n)` 函数来手动设置 `GOMAXPROCS` 的值，例如：

```go
package main

import (
    "fmt"
    "runtime"
)

func main() {
    fmt.Println("CPU 核心数:", runtime.NumCPU())
    
    // 设置 GOMAXPROCS 为 1，限制只使用一个 CPU 核心
    runtime.GOMAXPROCS(1)
    fmt.Println("设置 GOMAXPROCS 为 1")
    
    // 启动两个 goroutine
    go func() {
        for i := 0; i < 5; i++ {
            fmt.Println("Goroutine 1")
        }
    }()
    
    go func() {
        for i := 0; i < 5; i++ {
            fmt.Println("Goroutine 2")
        }
    }()
    
    // 等待一段时间，保证 goroutine 执行完成
    select {}
}
```

上面的代码中，`runtime.GOMAXPROCS(1)` 将限制程序只使用一个 CPU 核心进行 goroutine 的调度和执行。这样即使启动了多个 goroutine，它们也只能在单个核心上并发执行，而不能并行运行。

在现代多核 CPU 上，`GOMAXPROCS` 通常设置为 CPU 核心数，以最大化程序的并行执行性能。对于 CPU 密集型任务，增大 `GOMAXPROCS` 的值可以提升程序的运行效率。

#### 22.1.6 Goroutine 的生命周期

goroutine 的生命周期从 `go` 关键字调用的那一刻开始，直到该 goroutine 执行完所有代码为止。goroutine 具有以下特性：

- 当 goroutine 启动后，主 goroutine 不会等待其他 goroutine 的执行完成，主 goroutine 执行完毕时程序就会退出。
- 如果需要让主 goroutine 等待其他 goroutine 执行完毕，可以使用同步机制（例如 `sync.WaitGroup`）或 `time.Sleep()` 来阻塞主 goroutine，等待其他 goroutine 完成。

> [!example]
>
> ```go
> for i := 0; i < 5; i++ {
> 	go func() {
> 		fmt.Println(i)
> 	}()
> }
> ```
>
> 这段代码在 Go 中使用了一个 `for` 循环和 5 个 goroutine。由于 goroutine 是并发执行的，而变量 `i` 是在外层作用域中定义的，所以当每个 goroutine 实际执行 `fmt.Println(i)` 时，`i` 的值可能已经发生变化。这是因为 goroutine 的调度是非确定性的，因此在 goroutine 中访问的 `i` 变量，可能已经变成了最后循环后的值。
>
> 更详细地解释：
>
> - `i` 是 `for` 循环的控制变量，随着循环的进行，`i` 的值会不断变化。
> - 每次循环都会启动一个新的 goroutine，但是 goroutine 的执行时间是不确定的。它们可能在循环结束后才开始执行。
> - 当 goroutine 执行时，它访问的是 `i` 的当前值，而这个值很可能已经是循环结束后的 `i=5`。
>
> 所以，通常你会看到每个 goroutine 输出的都是 `5`，而不是 `0` 到 `4`。
>
> **解决办法：传递循环变量**
>
> 可以通过显式传递循环变量的值给每个 goroutine，确保每个 goroutine 都能捕获到正确的 `i` 值。
>
> ```go
> for i := 0; i < 5; i++ {
> 	go func(i int) {
> 		fmt.Println(i)
> 	}(i)
> }
> ```
>
> 在这个例子中，`i` 被作为参数传递给匿名函数，这样每个 goroutine 都能获取到当前循环的 `i` 值。

### 22.2 Channel

> [!summary]
>
> - `channel` 提供了 goroutine 间通信的机制。
> - 支持无缓冲和带缓冲的 `channel`，无缓冲 `channel` 会阻塞直到数据被接收，带缓冲的 `channel` 可以在缓冲区未满时不阻塞发送数据。
> - `for range` 可以用于遍历 `channel` 中的数据，直到 `channel` 被关闭。
> - 单向 `channel` 限制了通道的读写操作，可以帮助避免误用。
>
> 这种机制使得 goroutine 间的同步和通信变得更加简单和安全，可以将 `channel` 理解为线程安全的队列，支持一个或多个 goroutine 进行读写操作。

| 通道状态          | 发送操作 (`ch <- value`)            | 接收操作 (`<-ch`)            | 关闭操作 (`close(ch)`)               |
| ------------- | ------------------------------- | ------------------------ | -------------------------------- |
| **未关闭且未满**    | 成功发送，继续执行                       | 阻塞，直到有数据可接收              | 成功关闭                             |
| **未关闭且满**     | 阻塞，直到有接收方或缓冲区有空间                | 成功接收数据，继续执行              | 成功关闭                             |
| **未关闭且空**     | 成功发送，继续执行                       | 阻塞，直到有发送方                | 成功关闭                             |
| **已关闭且有剩余数据** | 发送引发 `panic`                    | 成功接收数据，继续执行              | `panic: close of closed channel` |
| **已关闭且无数据**   | 发送引发 `panic`                    | 接收零值，第二返回值为 `false`      | `panic: close of closed channel` |
| **已关闭且再次关闭**  | `panic: send on closed channel` | 接收零值或剩余数据，第二返回值为 `false` | `panic: close of closed channel` |

#### 22.2.1 Channel 的声明和类型

`Channel` 是类型化的，可以传递指定类型的数据。其声明方式如下：

```go
ch := make(chan Type, [CacheSize])
```

**Channel 类型：**
- `chan T`：表示传递类型 `T` 的 channel，可以双向读写。
- `chan<- T`：表示只写入类型 `T` 的单向 channel。
- `<-chan T`：表示只读取类型 `T` 的单向 channel。

#### 22.2.2 Channel 的零值

`Channel` 的零值是 `nil`，即未初始化的 `channel`。一个未初始化的 `channel` 不能用于读写操作，否则会引发死锁。

```go
var ch chan int  // 未初始化的 channel，零值为 nil
// ch <- 1  // 会导致 panic：使用 nil channel
```

#### 22.2.3 Channel 的初始化

`Channel` 需要通过 `make` 函数进行初始化：

```go
ch := make(chan int)  // 初始化一个无缓冲的 channel
```

或者，初始化带有缓冲区的 `channel`：

```go
ch := make(chan int, 3)  // 初始化一个缓冲区大小为 3 的 channel
```

#### 22.2.4 Channel 的基本操作

1. **发送数据到 channel：**

   ```go
   ch <- 10  // 发送数据 10 到 channel
   ```

2. **从 channel 接收数据：**

   ```go
   x := <-ch  // 从 channel 接收数据并赋值给 x
   ```

3. **关闭 channel：**

   `close()` 函数用于关闭 `channel`，一旦 `channel` 被关闭，不能再写入数据。

   ```go
   close(ch)  // 关闭 channel
   ```

> [!warning] 关闭的 channel 特点
>
> - **无法再发送数据**  
>
> 一旦 `channel` 被关闭，向这个 `channel` 发送数据会引发运行时恐慌（`panic`）。因此，在关闭 `channel` 后，应该确保不会再向该 `channel` 发送数据。
>
> ```go
> ch := make(chan int)
> close(ch)
> ch <- 10  // 这里会导致 panic: send on closed channel
> ```
>
> - **可以继续接收数据**  
>
> 关闭 `channel` 后，仍然可以从 `channel` 中接收剩余的缓冲数据。如果 `channel` 是带缓冲的，在缓冲区中的数据读取完毕后，继续读取会返回该类型的零值，且第二个返回值为 `false`，表示 `channel` 已关闭。
>
> ```go
> ch := make(chan int, 2)
> ch <- 1
> ch <- 2
> close(ch)
> 
> fmt.Println(<-ch)  // 输出：1
> fmt.Println(<-ch)  // 输出：2
> fmt.Println(<-ch)  // 输出：0（int 的零值），因为通道关闭且无更多数据
> ```
>
> - **使用多返回值接收判断通道是否关闭**  
>
> 通过接收操作的第二个返回值，能够判断 `channel` 是否已关闭。当 `channel` 被关闭且没有更多数据可供接收时，接收操作返回该类型的零值，同时第二个返回值为 `false`，表示通道已关闭。
>
>    ```go
>    ch := make(chan int, 1)
>    ch <- 10
>    close(ch)
> 
>    v, ok := <-ch
>    fmt.Println(v, ok)  // 输出：10 true
> 
>    v, ok = <-ch
>    fmt.Println(v, ok)  // 输出：0 false，表示通道已关闭且无更多数据
>    ```
>
> - **关闭多次会引发 panic**  
>
> 关闭已经关闭的 `channel` 会引发运行时恐慌（`panic`）。因此，一般情况下，关闭 `channel` 应当只在生产者端进行，并且确保只关闭一次。
>
> ```go
> ch := make(chan int)
> close(ch)
> close(ch)  // 第二次关闭会导致 panic: close of closed channel
> ```
>
> - **`for range` 循环自动结束**  
>
> 当 `channel` 被关闭后，使用 `for range` 循环接收数据的操作会在所有数据接收完毕后自动结束，不需要手动判断 `channel` 是否关闭。
>
> ```go
> ch := make(chan int, 2)
> ch <- 1
> ch <- 2
> close(ch)
> 
> for v := range ch {
>    fmt.Println(v)  // 输出：1 2
> }
> // 通道关闭后，for range 自动退出
> ```
>
> - **关闭的通道会被安全回收**  
>
> 当 `channel` 被关闭并且没有引用时，Go 会安全地回收其资源，不会导致内存泄漏。

#### 22.2.5 无缓冲的 Channel

无缓冲的 `channel` 是指发送方和接收方必须同时准备好，发送和接收才会发生。否则，发送操作或接收操作会阻塞。

```go
package main

import "fmt"

func main() {
    ch := make(chan int)

    go func() {
        ch <- 10  // 发送数据会阻塞，直到有接收者
    }()

    fmt.Println(<-ch)  // 接收数据
}
```

#### 22.2.6 有缓冲的 Channel

有缓冲的 `channel` 允许发送方在缓冲区未满的情况下发送数据而不阻塞。缓冲区满后，发送操作将阻塞，直到有数据被接收。

```go
ch := make(chan int, 2)  // 创建一个缓冲区大小为 2 的 channel
ch <- 1
ch <- 2  // 缓冲区未满，操作不会阻塞
```

当缓冲区满时，继续发送数据会阻塞，直到有数据被取出。

#### 22.2.7 多返回值的 Channel

在从 `channel` 读取数据时，接收操作可以有两个返回值，第一个是接收到的值，第二个是一个布尔值，表示 `channel` 是否还可以继续接收数据。

```go
x, ok := <-ch  // ok 为 false 表示 channel 已关闭
```

#### 22.2.8 使用 `for range` 接收 Channel 数据

可以使用 `for range` 来遍历 `channel` 中的数据，直到 `channel` 被关闭。

```go
for v := range ch {
    fmt.Println(v)  // 依次打印 channel 中的数据
}
```

#### 22.2.9 单向通道

单向通道是指只能写入或只能读取数据的 `channel`。在函数参数中可以声明单向通道来限制使用。

1. **只写通道：**

   ```go
   func send(ch chan<- int) {
       ch <- 10  // 只能向 ch 写数据
   }
   ```

2. **只读通道：**

   ```go
   func receive(ch <-chan int) {
       x := <-ch  // 只能从 ch 读取数据
   }
   ```

> [!example]
>
> 下面是一个简单的示例，展示如何使用无缓冲 `channel` 在多个 `goroutine` 之间传递数据：
>
> ```go
> package main
> 
> import (
>     "fmt"
> )
> 
> func worker(id int, ch chan int) {
>     for n := range ch {
>         fmt.Printf("Worker %d received %d\n", id, n)
>     }
> }
> 
> func main() {
>     ch := make(chan int)
> 
>     go worker(1, ch)
>     go worker(2, ch)
> 
>     for i := 0; i < 5; i++ {
>         ch <- i
>     }
> 
>     close(ch)  // 关闭 channel，通知所有接收方没有数据了
> }
> ```
>
> 在该示例中，两个 `goroutine` 通过 `channel` 接收主程序发送的数据，当数据发送完毕后，`channel` 被关闭，所有接收方停止接收。

### 22.3 Select 语句

`select` 语句用于监听多个 channel 的通信。它类似于 `switch`，但针对 channel 操作。

> [!note] `select` 语句是 Go 中用于处理多个通道操作的控制结构
>
> 1. **同时监听多个通道**：`select` 语句可以同时监听多个通道的发送或接收操作，哪个通道准备好了（即数据可发送或接收），就执行对应的 `case` 代码。
>
> 2. **随机选择**：如果多个通道同时准备好，`select` 会随机选择其中一个进行执行，保证不会产生偏向。
>
> 3. **阻塞行为**：`select` 会阻塞，直到有一个通道可以进行通信。如果所有通道都无法操作，它会一直等待，除非有其他情况（如通道关闭或发送数据）。可用于阻塞 main 函数，防止退出。
>
> 4. **`default` 子句**：`select` 可以包含一个 `default` 分支，如果所有通道都没有准备好时，`default` 分支会立即执行，防止阻塞。
>
> 5. **处理并发通信**：`select` 通常用于处理多个 Goroutine 之间的并发通信，确保程序能够高效地进行非阻塞式通道操作。
>
> 通过 `select`，Go 实现了对并发的高效管理，避免了手动轮询通道状态的复杂性。

> [!example]
>
> ```go
> package main
> 
> import "fmt"
> 
> func fibonacci(ch, quit chan int) {
>     x, y := 0, 1
>     for {
>         select {
>         case ch <- x:
>             x, y = y, x+y
>         case <-quit:
>             fmt.Println("quit")
>             return
>         }
>     }
> }
> 
> func main() {
>     ch := make(chan int)
>     quit := make(chan int)
> 
>     go func() {
>         for i := 0; i < 10; i++ {
>             fmt.Println(<-ch)
>         }
>         quit <- 0
>     }()
>     fibonacci(ch, quit)
> }
> ```

### 22.4 并发安全与锁

在并发编程中，多个 goroutine 可能会同时访问共享资源，如果不进行正确的同步处理，会导致竞态条件（Race Condition）。

> [!summary] Go 提供了多种同步原语来确保并发操作的安全
>
> - `sync.Mutex` 互斥锁用于保护共享资源的并发访问。
> - `sync.RWMutex` 读写锁允许多个读操作并发执行，但写操作会阻塞其他操作。
> - `sync.WaitGroup` 用于等待一组 goroutine 完成。
> - `sync.Once` 保证某段代码只执行一次。
> - `sync.Map` 提供并发安全的 map 操作。
>

#### 22.4.1 `sync.Mutex`（互斥锁）

`sync.Mutex` 是 Go 中的互斥锁，用于保护共享资源的并发访问。它通过两种操作控制并发访问：`Lock()` 用于锁定，`Unlock()` 用于解锁。在同一时刻，只有一个 goroutine 可以获取锁，从而确保临界区内的操作是线程安全的。

```go
package main

import (
    "fmt"
    "sync"
)

var (
    counter int
    mu      sync.Mutex
)

func increment(wg *sync.WaitGroup) {
    defer wg.Done()
    mu.Lock()         // 获取锁
    counter++
    mu.Unlock()       // 释放锁
}

func main() {
    var wg sync.WaitGroup
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go increment(&wg)
    }
    wg.Wait()
    fmt.Println("Final Counter:", counter) // 输出：Final Counter: 1000
}
```

**特点：**
- 互斥锁（`Mutex`）保证同一时刻只有一个 goroutine 能访问共享资源。
- 如果一个 goroutine 已经持有锁，其他试图获取锁的 goroutine 会阻塞，直到锁被释放。

#### 22.4.2 `sync.RWMutex`（读写锁）

`sync.RWMutex` 是一种读写互斥锁，它允许多个 goroutine 同时进行读操作，但在进行写操作时，会阻塞所有其他的读写操作。相对于 `Mutex`，它提供了更高的并发性，因为多个读操作可以并行执行。

```go
package main

import (
    "fmt"
    "sync"
)

var (
    counter int
    rwMu    sync.RWMutex
)

func readCounter(wg *sync.WaitGroup) {
    defer wg.Done()
    rwMu.RLock()        // 获取读锁
    fmt.Println("Read:", counter)
    rwMu.RUnlock()      // 释放读锁
}

func writeCounter(wg *sync.WaitGroup) {
    defer wg.Done()
    rwMu.Lock()         // 获取写锁
    counter++
    rwMu.Unlock()       // 释放写锁
}

func main() {
    var wg sync.WaitGroup
    for i := 0; i < 5; i++ {
        wg.Add(1)
        go readCounter(&wg)
    }
    wg.Add(1)
    go writeCounter(&wg)

    wg.Wait()
}
```

**特点：**
- 读锁（`RLock`）允许多个 goroutine 并发读。
- 写锁（`Lock`）保证同一时刻只有一个 goroutine 能进行写操作，并阻止其他读操作。

#### 22.4.3 `sync.WaitGroup`

`sync.WaitGroup` 用于等待一组 goroutine 完成，它提供了 `Add()`、`Done()` 和 `Wait()` 方法，分别用于增加待完成的 goroutine 计数、减少计数以及阻塞等待所有 goroutine 完成。

```go
package main

import (
    "fmt"
    "sync"
)

func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done()
    fmt.Printf("Worker %d started\n", id)
    fmt.Printf("Worker %d done\n", id)
}

func main() {
    var wg sync.WaitGroup

    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go worker(i, &wg)
    }

    wg.Wait()  // 等待所有 goroutine 完成
    fmt.Println("All workers done")
}
```

**特点：**
- `sync.WaitGroup` 用于等待 goroutine 结束。
- `Add()` 设置等待的 goroutine 数量，`Done()` 减少计数，`Wait()` 阻塞直到计数变为零。

#### 22.4.4 `sync.Once`

`sync.Once` 确保某段代码只执行一次，常用于初始化操作。在并发场景下，它保证即使多个 goroutine 并发调用某个初始化操作，也只会执行一次。

```go
package main

import (
    "fmt"
    "sync"
)

var once sync.Once

func initialize() {
    fmt.Println("Initializing")
}

func worker(wg *sync.WaitGroup) {
    defer wg.Done()
    once.Do(initialize)  // 只会执行一次
    fmt.Println("Worker done")
}

func main() {
    var wg sync.WaitGroup
    for i := 0; i < 3; i++ {
        wg.Add(1)
        go worker(&wg)
    }
    wg.Wait()
}
```

**特点：**
- `sync.Once` 确保某个函数只会执行一次，适用于初始化等场景。
- 多个 goroutine 并发调用时，只有一个会成功执行操作。

#### 22.4.5 `sync.Map`

`sync.Map` 是 Go 提供的并发安全的 map。相比于普通的 map，`sync.Map` 可以在多 goroutine 环境下进行并发读写操作，而无需显式使用互斥锁。它还提供了额外的便利方法，如 `LoadOrStore`、`Range` 等。

```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var sm sync.Map

    // 存储数据
    sm.Store("name", "Alice")
    sm.Store("age", 30)

    // 读取数据
    if value, ok := sm.Load("name"); ok {
        fmt.Println("Name:", value)
    }

    // 删除数据
    sm.Delete("age")

    // 遍历数据
    sm.Range(func(key, value interface{}) bool {
        fmt.Println(key, value)
        return true
    })
}
```

**特点：**
- `sync.Map` 提供线程安全的 map 操作，无需手动加锁。
- `Store()` 存储键值对，`Load()` 读取键值对，`Delete()` 删除键值对，`Range()` 遍历 map。

> [!example]
>
> 1. 启动一个 goroutine 循环生成 `int64` 类型的随机数，并发送到 `jobChan`。
> 2. 启动 24 个 goroutine 从 `jobChan` 中取出随机数，计算其各位数的和，并将结果发送到 `resultChan`。
> 3. 主 goroutine 从 `resultChan` 取出结果，并打印到终端。
>
> ```go
> package main
> 
> import (
>     "fmt"
>     "math/rand"
>     "sync"
>     "time"
> )
> 
> // 定义任务和结果的结构体
> type Job struct {
>     Value int64
> }
> 
> type Result struct {
>     Job Job
>     Sum int64
> }
> 
> // 生成随机数并发送到 jobChan
> func generateJobs(jobChan chan<- Job) {
>     for {
>         // 生成随机的 int64 数
>         randomNum := rand.Int63n(100000)
>         jobChan <- Job{Value: randomNum}
>         time.Sleep(time.Millisecond * 500) // 模拟任务间隔
>     }
> }
> 
> // 计算随机数每个位数的和，并将结果发送到 resultChan
> func calculateSum(jobChan <-chan Job, resultChan chan<- Result, wg *sync.WaitGroup) {
>     defer wg.Done()
> 
>     for job := range jobChan {
>         sum := int64(0)
>         n := job.Value
> 
>         // 计算每个位数的和
>         for n > 0 {
>             sum += n % 10
>             n /= 10
>         }
> 
>         // 将计算结果发送到 resultChan
>         resultChan <- Result{Job: job, Sum: sum}
>     }
> }
> 
> // 主函数
> func main() {
>     rand.Seed(time.Now().UnixNano()) // 随机数种子
> 
>     jobChan := make(chan Job, 100)    // 任务队列
>     resultChan := make(chan Result, 100) // 结果队列
> 
>     var wg sync.WaitGroup
> 
>     // 启动随机数生成的 goroutine
>     go generateJobs(jobChan)
> 
>     // 启动24个计算 goroutine
>     wg.Add(24)
>     for i := 0; i < 24; i++ {
>         go calculateSum(jobChan, resultChan, &wg)
>     }
> 
>     // 启动一个 goroutine 监听结果
>     go func() {
>         for result := range resultChan {
>             fmt.Printf("随机数: %d, 各位数之和: %d\n", result.Job.Value, result.Sum)
>         }
>     }()
> 
>     // 主 goroutine 等待计算 goroutines 结束
>     wg.Wait()
> 
>     // 关闭通道
>     close(resultChan)
> }
> ```
>
> ```
> 随机数: 26785, 各位数之和: 28
> 随机数: 61345, 各位数之和: 19
> 随机数: 8451, 各位数之和: 18
> 随机数: 762, 各位数之和: 15
> 随机数: 93048, 各位数之和: 24
> …
> ```

### 22.5 `errgroup`

`errgroup` 是 Go 语言标准库中的一个工具，来自 `golang.org/x/sync/errgroup` 包。它提供了处理多个并发操作的错误管理和等待功能，使得在多个 goroutine 并发执行时，可以统一处理错误并同步任务。

#### 22.5.1 主要功能

1. **管理多个 goroutine**：`errgroup.Group` 允许同时启动多个 goroutine，并在所有 goroutine 完成后统一处理。

2. **错误传播**：如果任意一个 goroutine 返回错误，`errgroup` 会立即停止其他 goroutine 的执行，并返回第一个遇到的错误。

3. **等待所有 goroutine 完成**：`errgroup` 提供一个方法来等待所有 goroutine 完成，不论是否成功。

#### 22.5.2 核心类型和方法

- **`errgroup.Group`**：核心类型，用于管理一组 goroutine。
  
- **`g.Go`**：启动一个新的 goroutine，并将其与 `errgroup` 关联。此方法接受一个返回 `error` 类型的函数。

- **`g.Wait`**：阻塞直到所有 goroutine 完成。如果任意 goroutine 返回错误，`Wait` 会立即返回该错误。

#### 22.5.3 使用方式

```go
package main

import (
    "fmt"
    "golang.org/x/sync/errgroup"
    "net/http"
)

func fetchURL(url string, g *errgroup.Group) {
    g.Go(func() error {
        resp, err := http.Get(url)
        if err != nil {
            return err
        }
        defer resp.Body.Close()
        fmt.Println("Fetched:", url)
        return nil
    })
}

func main() {
    var g errgroup.Group
    urls := []string{
        "http://example.com",
        "http://example.org",
        "http://example.net",
    }

    for _, url := range urls {
        fetchURL(url, &g)
    }

    if err := g.Wait(); err != nil {
        fmt.Println("Error occurred:", err)
    } else {
        fmt.Println("All URLs fetched successfully")
    }
}
```

## 23 Go 泛型（Generics）

Go 从 1.18 版本开始引入了**泛型**（Generics）的概念，使得开发者可以编写类型安全且可复用的代码，而不需要为每种类型都写多个版本的相同功能。泛型通过 **类型参数** 实现，可以用于函数、结构体、接口等，极大提高了代码的灵活性和可扩展性。

### 23.1 泛型基础语法

泛型通过在类型名、函数名或方法名后面使用方括号 `[]` 来定义类型参数。`T` 是常用的类型参数名称，但你可以使用任何合法的标识符。

> [!info] **`[T any]` vs `[T interface{}]`**
>
> ### 1. `any` 和 `interface{}` 的关系
> - **`any`** 是 Go 1.18 引入的一个别名，表示任意类型，等价于 **`interface{}`**。
> - **`interface{}`** 表示 Go 中的空接口，也表示任意类型。
>
> ### 2. 语法上的区别
> - **`[T any]`** 是 Go 泛型中的惯用法，表示类型参数 `T` 可以是任何类型。
> - **`[T interface{}]`** 同样表示类型参数 `T` 可以是任何类型，因为 `interface{}` 也表示任意类型。
>
> **示例**：
> ```go
> // 使用 any
> func PrintValue[T any](value T) {
>     fmt.Println(value)
> }
> 
> // 使用 interface{}
> func PrintValue[T interface{}](value T) {
>     fmt.Println(value)
> }
> ```
> 这两个函数功能相同，都是表示泛型参数 `T` 可以是任何类型。
>
> ### 3. 推荐使用 `any`
> - **`any`** 是 Go 1.18 及以后的推荐用法，语义更清晰、语法更简洁。
> - **`interface{}`** 是历史遗留的用法，仍然常用于非泛型代码中表示任意类型。
>

### 23.2 泛型函数

```go
func Print[T any](value T) {
    fmt.Println(value)
}
```

这里 `T` 是类型参数，`any` 是类型约束，表示 `T` 可以是任何类型。

- `T`：类型参数。表示函数可以接受任意类型的数据。
- `any`：在这里等同于 `interface{}`，表示不对类型做任何约束。

调用泛型函数时，类型参数可以自动推断：

```go
Print(123)       // 推断 T 为 int
Print("hello")   // 推断 T 为 string
```

### 23.3 泛型变量

泛型也可以用于变量定义中。

```go
var x T
```

使用泛型变量时，类型参数 `T` 仍然需要从上下文中推断或显式指定。

### 23.4 泛型结构体

结构体可以包含泛型类型参数，从而使得结构体能够存储不同类型的数据。

```go
type Pair[T any, U any] struct {
    First  T
    Second U
}

p := Pair[int, string]{First: 1, Second: "hello"}
```

- `Pair`：一个带有两个类型参数 `T` 和 `U` 的结构体。
- 可以为不同类型实例化 `Pair`，例如 `Pair[int, string]`。

### 23.5 泛型接口

泛型也可以用于接口定义，允许接口在多个实现之间共享类型约束。

```go
type Comparable[T any] interface {
    CompareTo(other T) int
}
```

- `T` 是接口的类型参数，表示实现此接口的类型必须具有比较自身与另一个相同类型实例的能力。

### 23.6 多个类型参数

函数或结构体可以有多个类型参数，通过逗号分隔。

```go
func Swap[T, U any](a T, b U) (U, T) {
    return b, a
}
```

- `T` 和 `U` 是两个不同的类型参数。
- 该函数可以接收不同类型的参数并返回交换后的值。

### 23.7 类型约束

类型约束用于限制类型参数 `T` 的可能类型。可以通过接口或预定义的类型约束来定义。

```go
type Number interface {
    int | float64
}

func Add[T Number](a, b T) T {
    return a + b
}

func Sub[T int | float64](a, b T) T {
	return a - b
}
```

- `Number` 是一个自定义类型约束，表示 `T` 只能是 `int` 或 `float64`。
- 泛型函数 `Add` 只允许参数为数字类型。

### 23.8 类型推断

在调用泛型函数或实例化泛型类型时，Go 通常可以根据传递的参数自动推断类型参数，无需显式指定。

```go
func Identity[T any](x T) T {
    return x
}

result := Identity(42)   // 推断 T 为 int
```

### 23.9 泛型的应用场景

- **集合类数据结构**：比如链表、栈、队列等，可以使用泛型来存储任意类型的数据。
- **类型安全的算法**：实现排序、搜索等算法，允许操作不同类型的数据。

通过泛型，Go 提供了更高的代码复用性，同时保持了强类型的优势。

## 24 单元测试

### 24.1 单元测试简介

单元测试是一种软件测试方法，用于验证代码中的最小可测试单元的正确性。在 Go 语言中，标准库自带了 `testing` 包，提供了简洁的单元测试功能，支持编写、运行和组织测试代码。

> [!info] Go 单元测试基本特性
>
> - **文件命名**：Go 中的单元测试文件通常以 `_test.go` 结尾。
> - **函数命名**：测试函数的名称必须以 `Test` 开头，且接受一个 `*testing.T` 参数。
> - **运行测试**：测试通过 `go test` 命令运行。
> - **跳过编译**：`_test.go` 文件不会被 `go build` 编译到最终的可执行文件中，除非运行测试时使用 `go test` 命令。

> [!note] `go test`
>
> | 选项               | 作用说明                        | 示例                                   |
> | ---------------- | --------------------------- | ------------------------------------ |
> | `-v`             | 显示详细的测试过程，包括每个测试函数的执行结果。    | `go test -v`                         |
> | `-run PATTERN`   | 仅运行与正则表达式 PATTERN 匹配的测试函数。  | `go test -run TestFunc`              |
> | `-bench PATTERN` | 运行基准测试，与 PATTERN 匹配的函数会被执行。 | `go test -bench=.`                   |
> | `-benchmem`      | 在基准测试中显示内存分配统计信息。           | `go test -bench=. -benchmem`         |
> | `-cover`         | 显示测试覆盖率的简单报告。               | `go test -cover`                     |
> | `-coverprofile`  | 生成覆盖率报告文件，方便后续分析。           | `go test -coverprofile=coverage.out` |
> | `-timeout`       | 设置单个测试的超时时间。                | `go test -timeout=30s`               |
> | `-short`         | 在短模式下运行测试，跳过时间较长或特殊条件的测试。   | `go test -short`                     |
> | `-count N`       | 运行测试 N 次，用于多次执行确保稳定性。       | `go test -count=3`                   |
> | `-parallel N`    | 并行运行最多 N 个测试。               | `go test -parallel=4`                |

### 24.2 测试文件中的三种类型函数

Go 中的 `_test.go` 文件除了编写常规的测试函数 `TestXxx` 外，还支持基准测试和示例测试：

1. **单元测试函数**
   - 以 `Test` 开头，用于测试代码中的逻辑是否正确。
   - 函数签名为 `func TestXxx(t *testing.T)`。

2. **基准测试函数**
   - 以 `Benchmark` 开头，用于评估代码性能。
   - 函数签名为 `func BenchmarkXxx(b *testing.B)`。
   - 基准测试会自动循环执行多次，以确保测量出稳定的运行时间。

3. **示例测试函数**
   - 以 `Example` 开头，主要用于生成文档，并验证代码输出是否符合预期。
   - 函数不需要参数，使用标准输出，期望的输出通过注释 `// Output:` 指定。

> [!example] 单元测试 & 基准测试 & 示例测试
>
> #### 单元测试
>
> ```go
> package main
> 
> import "testing"
> 
> func TestAdd(t *testing.T) {
>     result := Add(2, 3)
>     if result != 5 {
>         t.Errorf("Expected 5 but got %d", result)
>     }
> }
> ```
>
> #### 基准测试
>
> ```go
> func BenchmarkAdd(b *testing.B) {
>     for i := 0; i < b.N; i++ {
>         Add(2, 3)
>     }
> }
> ```
>
> #### 示例测试
>
> ```go
> func ExampleAdd() {
>     fmt.Println(Add(2, 3))
>     // Output: 5
> }
> ```

### 24.3 `go test` 的操作流程

执行 `go test` 时，Go 会自动完成以下步骤：

1. **编译测试文件**：Go 编译器会将 `_test.go` 文件与其他代码文件一起编译生成一个临时的测试二进制文件。

2. **运行测试用例**：
   - 运行所有以 `Test` 开头的函数。
   - 如果存在 `Benchmark` 函数，并使用 `go test -bench` 参数，则运行基准测试。
   - 运行所有的 `Example` 函数并验证其输出。

3. **生成和展示报告**：
   - 测试结果会以标准输出的形式展示。
   - 测试失败时，会显示详细的错误日志。

4. **清理临时文件**：测试结束后，临时生成的二进制文件和中间结果会被自动删除。

### 24.4 测试组与子测试

Go 语言的 `go test` 命令支持测试组和子测试功能，允许在单个测试函数中运行多个相关的测试，方便测试逻辑分组和更加精细的控制。

#### 24.4.1 测试组

测试组可以通过在单个测试函数中包含多个测试逻辑来实现。通常情况下，会在同一个函数内执行多个测试用例。例如：

```go
func TestMathOperations(t *testing.T) {
    result := Add(1, 2)
    if result != 3 {
        t.Errorf("Add failed: expected 3, got %d", result)
    }

    result = Subtract(2, 1)
    if result != 1 {
        t.Errorf("Subtract failed: expected 1, got %d", result)
    }
}
```

在上面的例子中，`TestMathOperations` 测试了两个函数 `Add` 和 `Subtract`，它们共同构成了一个测试组。

#### 24.4.2 子测试

Go 提供了 `t.Run` 方法，可以用于创建子测试。通过子测试，可以更灵活地控制单个测试组中的测试单元，每个子测试都有自己的测试名称和执行结果。这使得在执行和查看测试结果时更加清晰。示例如下：

```go
func TestMath(t *testing.T) {
    t.Run("Add", func(t *testing.T) {
        result := Add(1, 2)
        if result != 3 {
            t.Errorf("Add failed: expected 3, got %d", result)
        }
    })

    t.Run("Subtract", func(t *testing.T) {
        result := Subtract(2, 1)
        if result != 1 {
            t.Errorf("Subtract failed: expected 1, got %d", result)
        }
    })
}
```

在此例中，`TestMath` 包含两个子测试 `Add` 和 `Subtract`，运行时会分别输出它们的执行结果。这种方式使得每个子测试可以独立运行，便于定位问题和调试。

#### 24.4.3 子测试的并行执行

如果测试逻辑是互不影响的，可以使用 `t.Parallel()` 来并行执行子测试，以提高测试执行的效率。示例如下：

```go
func TestMathParallel(t *testing.T) {
    t.Run("Add", func(t *testing.T) {
        t.Parallel()
        result := Add(1, 2)
        if result != 3 {
            t.Errorf("Add failed: expected 3, got %d", result)
        }
    })

    t.Run("Subtract", func(t *testing.T) {
        t.Parallel()
        result := Subtract(2, 1)
        if result != 1 {
            t.Errorf("Subtract failed: expected 1, got %d", result)
        }
    })
}
```

在上面的例子中，`Add` 和 `Subtract` 子测试会并行运行。需要注意的是，并行测试可能会引发数据竞争问题，因此要确保测试之间没有共享状态或者使用适当的同步机制。

### 24.5 测试的 Setup 和 Teardown

> [!summary]
>
> 1. **`TestMain` 和 `testing.M`：**  
> `TestMain` 是 Go 的测试入口函数，当它被定义时，Go 会在运行测试前调用它。通过在 `TestMain` 中使用 `setup()` 和 `teardown()`，可以在运行所有测试之前和之后进行全局的初始化和清理操作。`m.Run()` 负责执行包中的所有测试，并返回一个退出码，用于向操作系统报告测试结果。
>
> 2. **针对每个测试函数的 `setup` 和 `teardown`：**  
> 在每个测试函数中手动调用 `setupTest()` 和 `teardownTest()`，并使用 `defer` 确保清理操作始终在测试结束后执行。
>
> 3. **子测试的 `setup` 和 `teardown`：**  
> 使用 `t.Run()` 创建子测试时，可以分别在每个子测试中调用 `setupTest` 和 `teardownTest`，确保每个子测试都有独立的初始化和清理操作。
>
> 这种模式非常灵活，适合不同层次的初始化和清理需求，无论是全局、每个测试函数，还是每个子测试都可以应用。

在编写测试时，有时需要在每个测试执行前进行初始化操作，或在测试执行后进行清理操作。这种场景通常通过 `setup` 和 `teardown` 方法实现。Go 虽然没有内置的 `setup` 和 `teardown` 方法，但我们可以在测试函数中手动实现这些功能，并结合 `testing.M` 类型和 `TestMain` 函数来管理测试生命周期。

#### 24.5.1 `setup` 和 `teardown` 基本模式

可以通过 `TestMain` 函数来对测试套件（整个测试包）的 `setup` 和 `teardown` 进行全局控制。Go 的 `TestMain` 函数是所有测试的入口函数，用于设置全局环境并控制所有测试的执行顺序。在 `TestMain` 中，可以通过调用 `setup` 和 `teardown` 分别在测试运行前后执行初始化和清理操作。

`testing.M` 是 Go 标准库 `testing` 包中的一个类型，包含了对所有测试的管理，`m.Run()` 负责运行包中的所有测试函数，并返回一个表示测试结果的退出码。

以下是全局 `setup` 和 `teardown` 的基本实现模式：

```go
func setup() {
    // 执行测试前的初始化操作
    fmt.Println("Setup before test")
}

func teardown() {
    // 执行测试后的清理操作
    fmt.Println("Teardown after test")
}

func TestMain(m *testing.M) {
    setup()               // 测试开始前进行初始化
    code := m.Run()        // 运行包中的所有测试
    teardown()             // 测试结束后进行清理
    os.Exit(code)          // 将测试结果返回给操作系统
}
```

在上述例子中：

- `setup()` 和 `teardown()` 分别在所有测试函数执行前后调用。
- `m.Run()` 执行所有测试函数，并返回一个退出码，用于表示测试的成功或失败。

#### 24.5.2 针对每个测试的 Setup 和 Teardown

如果需要对每个具体测试函数执行 `setup` 和 `teardown`，可以在每个测试函数中手动调用。这种方式适用于不同的测试需要不同的初始化或清理操作的场景。

示例代码如下：

```go
func setupTest(t *testing.T) {
    t.Log("Setup for test")
    // 初始化操作
}

func teardownTest(t *testing.T) {
    t.Log("Teardown for test")
    // 清理操作
}

func TestAdd(t *testing.T) {
    setupTest(t)
    defer teardownTest(t)  // 确保在测试结束后执行

    result := Add(1, 2)
    if result != 3 {
        t.Errorf("expected 3, got %d", result)
    }
}

func TestSubtract(t *testing.T) {
    setupTest(t)
    defer teardownTest(t)

    result := Subtract(2, 1)
    if result != 1 {
        t.Errorf("expected 1, got %d", result)
    }
}
```

在这个例子中：

- `setupTest` 在每个测试开始前被调用。
- `defer teardownTest(t)` 确保无论测试成功还是失败，测试结束时都会执行清理操作。

#### 24.5.3 结合子测试的 Setup 和 Teardown

如果在使用子测试（通过 `t.Run`）的场景中，也可以为每个子测试单独设置 `setup` 和 `teardown`，确保每个子测试都有独立的初始化和清理操作。

示例代码如下：

```go
func TestMath(t *testing.T) {
    t.Run("Add", func(t *testing.T) {
        setupTest(t)
        defer teardownTest(t)

        result := Add(1, 2)
        if result != 3 {
            t.Errorf("Add failed: expected 3, got %d", result)
        }
    })

    t.Run("Subtract", func(t *testing.T) {
        setupTest(t)
        defer teardownTest(t)

        result := Subtract(2, 1)
        if result != 1 {
            t.Errorf("Subtract failed: expected 1, got %d", result)
        }
    })
}
```

在这个例子中：

- 每个子测试（"Add" 和 "Subtract"）都有自己的 `setupTest` 和 `teardownTest`，确保每个子测试的环境独立。  
为了更好地展示如何在测试中编写实际的函数和应用 `setup` 和 `teardown`，我们可以通过创建一个简单的数学库（例如 `Add` 和 `Subtract` 函数）来进行演示，并结合前面提到的 `setup` 和 `teardown` 进行测试。下面我们将提供函数实现、测试函数的格式以及实际的测试用例。

### 24.6 示例测试

> [!summary]
>
> - **Example 函数的作用：** 主要用于文档化代码的使用方式，同时还可通过 `go test` 验证输出。
> - **格式要求：** 函数以 `Example` 开头，通常没有参数，输出通过 `fmt.Println()` 完成，并在注释中给出预期结果。
> - **自动化测试：** `go test` 会自动运行所有的 `Example` 函数并对比实际输出与 `// Output:` 指定的内容。
>

#### 24.6.1 示例测试函数格式

Go 的示例测试函数的格式是以 `Example` 开头，并且不接受参数，函数体中的注释 `// Output:` 用于指定预期输出值。测试框架会将实际输出与注释中指定的输出进行对比，以验证示例代码的正确性。

> [!example] 示例测试函数基本格式
>
> ```go
> func ExampleXxx() {
>     // 函数逻辑
>     fmt.Println(Xxx(参数))
> 
>     // Output: 预期的输出结果
> }
> ```

#### 24.6.2 示例测试函数的示例

以 `Add` 和 `Subtract` 函数为例，下面展示如何编写相应的示例测试函数：

```go
package mathlib

import (
    "fmt"
)

// Add takes two integers and returns their sum
func Add(a, b int) int {
    return a + b
}

// Subtract takes two integers and returns the result of subtracting b from a
func Subtract(a, b int) int {
    return a - b
}

// ExampleAdd demonstrates how to use the Add function.
func ExampleAdd() {
    result := Add(2, 3)
    fmt.Println(result)
    
    // Output: 5
}

// ExampleSubtract demonstrates how to use the Subtract function.
func ExampleSubtract() {
    result := Subtract(5, 3)
    fmt.Println(result)
    
    // Output: 2
}
```

#### 24.6.3 // Output: 的意义

- **`// Output:`** 是一个特殊注释，它标记了该函数的预期输出。运行 `go test` 时，测试框架会捕获示例测试的标准输出并与 `// Output:` 指定的内容进行对比。如果输出不一致，测试将失败。
- **匹配规则：** 输出的空白符不严格要求完全匹配，但需要符合基本的格式和内容。

#### 24.6.4 自动测试示例

可以通过运行 `go test` 来测试这些示例函数。Go 的测试框架会自动执行以 `Example` 开头的函数并验证输出：

```bash
$ go test
```

如果示例的实际输出和 `// Output:` 中的预期输出匹配，测试将通过。

> [!example] 示例输出
>
> ```bash
> ok  	mathlib	0.001s
> ```

### 24.7 基准测试

> [!summary]
>
> - **基准测试函数格式：** 以 `Benchmark` 开头，使用 `b.N` 控制测试次数。
> - **性能比较函数：** 可以通过编写多个基准测试函数，比较不同实现的性能。
> - **重置计时器：** 使用 `b.ResetTimer()` 忽略准备阶段的时间，确保只记录核心代码的执行时间。
> - **并行测试：** 使用 `b.RunParallel()` 进行多 Goroutine 并发测试，以评估代码在并行环境下的表现。

#### 24.7.1 基准测试函数格式

基准测试函数的格式与普通测试函数类似，但有以下关键点：

- 函数名以 `Benchmark` 开头，后跟测试目标的名称。
- 参数为 `b *testing.B`，用于控制基准测试的执行次数并记录性能指标。
- 基准测试的核心是通过 `b.N` 控制代码重复运行的次数，循环体内的代码将被多次执行。

基本格式如下：

```go
func BenchmarkXxx(b *testing.B) {
    for i := 0; i < b.N; i++ {
        // 待测代码
    }
}
```

下面是针对 `Add` 和 `Subtract` 函数的基准测试：

```go
package mathlib_test

import (
    "testing"
    "mathlib"
)

func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        mathlib.Add(1, 2)
    }
}

func BenchmarkSubtract(b *testing.B) {
    for i := 0; i < b.N; i++ {
        mathlib.Subtract(5, 3)
    }
}
```

#### 24.7.2 性能比较函数

基准测试可以用于比较不同实现的性能。假设有两种加法实现，可以通过编写两个基准测试函数来对比性能：

```go
func BenchmarkAddNormal(b *testing.B) {
    for i := 0; i < b.N; i++ {
        mathlib.Add(1, 2)
    }
}

func BenchmarkAddOptimized(b *testing.B) {
    for i := 0; i < b.N; i++ {
        mathlib.AddOptimized(1, 2)
    }
}
```

通过运行基准测试，可以比较 `Add` 和 `AddOptimized` 的执行性能。

#### 24.7.3 重置计时器

在某些情况下，基准测试的准备工作可能会耗费较多时间，影响实际的性能测量。为了解决这个问题，可以通过 `b.ResetTimer()` 重置计时器，使得准备工作的时间不会影响基准测试的结果。

示例如下：

```go
func BenchmarkWithReset(b *testing.B) {
    // 模拟准备工作
    time.Sleep(2 * time.Second)

    // 重置计时器，忽略准备工作的时间
    b.ResetTimer()

    for i := 0; i < b.N; i++ {
        mathlib.Add(1, 2)
    }
}
```

#### 24.7.4 并行测试

基准测试还支持并行运行，以测试代码在多线程环境下的性能表现。通过 `b.RunParallel()`，可以让基准测试在多个 Goroutine 中并发执行。

示例如下：

```go
func BenchmarkParallel(b *testing.B) {
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            mathlib.Add(1, 2)
        }
    })
}
```

这种方法适用于测试代码在高并发场景下的性能表现。

### 24.8 整合示例

编写一个回文检测函数，并为其编写单元测试和基准测试，根据测试的结果逐步对其进行优化。（回文：一个字符串正序和逆序一样，如“Madam,I’mAdam”、“油灯少灯油”等。）

#### 24.8.1 基本实现

```go
package main

import (
    "fmt"
    "strings"
    "testing"
    "unicode"
)

// isPalindrome 检查一个字符串是否为回文
func isPalindrome(s string) bool {
    var filtered []rune
    for _, r := range s {
        if unicode.IsLetter(r) || unicode.IsDigit(r) {
            filtered = append(filtered, unicode.ToLower(r))
        }
    }

    n := len(filtered)
    for i := 0; i < n/2; i++ {
        if filtered[i] != filtered[n-1-i] {
            return false
        }
    }
    return true
}

// 示例用例
func main() {
    fmt.Println(isPalindrome("Madam, I’m Adam")) // 输出: true
    fmt.Println(isPalindrome("油灯少灯油"))         // 输出: true
    fmt.Println(isPalindrome("not a palindrome")) // 输出: false
}

```

#### 24.8.2 单元测试

编写单元测试来验证回文函数的正确性：

```go
package main

import "testing"

func TestIsPalindrome(t *testing.T) {
    tests := []struct {
        input    string
        expected bool
    }{
        {"Madam, I’m Adam", true},
        {"油灯少灯油", true},
        {"not a palindrome", false},
        {"A man, a plan, a canal, Panama!", true},
        {"", true}, // 空字符串也是回文
    }

    for _, test := range tests {
        result := isPalindrome(test.input)
        if result != test.expected {
            t.Errorf("isPalindrome(%q) = %v; want %v", test.input, result, test.expected)
        }
    }
}
```

#### 24.8.3 基准测试

为了测量该函数的性能，我们编写了基准测试：

```go
package main

import "testing"

func BenchmarkIsPalindrome(b *testing.B) {
    input := "A man, a plan, a canal, Panama!"
    for i := 0; i < b.N; i++ {
        isPalindrome(input)
    }
}
```

#### 24.8.4 优化步骤

根据性能测试结果，进一步优化 `isPalindrome` 函数。我们可以通过避免重复分配内存和过多的转换来提升效率。例如：

1. **预分配 `filtered` 容量**：我们可以预先计算需要过滤的字符数量，从而减少内存分配次数。
2. **减少转换次数**：可以直接在比较时进行转换，而不是先过滤字符再比较。

#### 24.8.5 优化后的 `filtered`

```go
// 预估filtered的容量，避免动态扩容
filtered := make([]rune, 0, len(s))
```

#### 24.8.6 优化后的回文检测函数

```go
func isPalindromeOptimized(s string) bool {
    left, right := 0, len(s)-1
    for left < right {
        // 跳过非字母和非数字字符
        for left < right && !unicode.IsLetter(rune(s[left])) && !unicode.IsDigit(rune(s[left])) {
            left++
        }
        for left < right && !unicode.IsLetter(rune(s[right])) && !unicode.IsDigit(rune(s[right])) {
            right--
        }
        // 比较字母或数字的大小写是否一致
        if unicode.ToLower(rune(s[left])) != unicode.ToLower(rune(s[right])) {
            return false
        }
        left++
        right--
    }
    return true
}
```

#### 24.8.7 优化后基准测试的示例输出

```bash
$ go test -bench=.
BenchmarkIsPalindrome-8           6355412     189 ns/op
BenchmarkIsPalindromeOptimized-8   9238491     132 ns/op
```

在这个优化过程中，我们通过减少内存分配和直接比较字符，将回文检测的性能提升了约 30%。

## 25 网络编程

> [!info] OSI 七层模型的详细说明，请参考 [OSI 模型 - Wikipedia](https://zh.wikipedia.org/wiki/OSI%E6%A8%A1%E5%9E%8B)。

### 25.1 Socket编程

Socket 编程是网络通信的基础，通过 Socket，应用程序可以通过网络进行数据传输。Socket 提供了与网络接口的通信方式，可以使用不同的协议进行通信，如常见的 TCP 和 UDP 协议。TCP 是面向连接的、可靠的传输协议，UDP 则是面向无连接的、不可靠的传输协议。下面将分别介绍在 Go 语言中如何实现 TCP 和 UDP 通信，并解决 TCP 通信中的常见问题——粘包。

> [!summary]
>
> - **TCP 通信**：面向连接的可靠传输，适合需要稳定连接的场景。
> - **UDP 通信**：无连接的传输协议，适合需要快速但不可靠传输的场景。
> - **TCP 粘包处理**：通过添加消息长度前缀来确保完整消息的传递，解决粘包问题。

> [!info] TCP/UDP  
> TCP和UDP是两种常见的传输层协议，区别在于TCP是面向连接的，提供可靠的数据传输，而UDP是无连接的，提供快速但不保证可靠的传输。
>
> ### TCP握手流程：
> TCP使用**三次握手**建立连接，**四次挥手**断开连接：
>
> 1. **三次握手建立连接**：
>    - **第一次握手**：客户端发送一个SYN（同步）标志的包，表示希望与服务器建立连接。
>    - **第二次握手**：服务器收到SYN包后，回复一个SYN+ACK（同步确认）包，确认连接请求。
>    - **第三次握手**：客户端收到SYN+ACK后，发送一个ACK（确认）包，表示确认服务器的响应，此时连接建立。
>
> 2. **四次挥手断开连接**：
>    - **第一次挥手**：客户端发送一个FIN（结束）标志的包，表示要关闭连接。
>    - **第二次挥手**：服务器收到FIN包后，发送一个ACK包确认。
>    - **第三次挥手**：服务器发送一个FIN包，表示它也准备关闭连接。
>    - **第四次挥手**：客户端收到FIN包后，发送ACK确认，连接断开。
>
> ### UDP握手流程：
> UDP是无连接的协议，不存在握手过程。UDP只是在需要时将数据报文发送到目标地址，并不关心对方是否准备好接收，或是否能够接收到数据。UDP的优点是传输效率高，适合对实时性要求高但可靠性要求较低的应用（如视频直播、在线游戏等）。

### 25.2 Go 实现 TCP 通信

#### 25.2.1 TCP 服务器端

在 Go 中，使用 `net` 包可以轻松实现 TCP 服务器。以下是一个简单的 TCP 服务器示例，它接受客户端连接并回显收到的消息：

```go
package main

import (
    "fmt"
    "net"
    "os"
)

func handleConnection(conn net.Conn) {
    defer conn.Close()
    buffer := make([]byte, 1024)

    for {
        n, err := conn.Read(buffer)
        if err != nil {
            fmt.Println("Connection closed:", err)
            return
        }
        fmt.Printf("Received: %s\n", string(buffer[:n]))

        // Echo the message back to the client
        conn.Write([]byte("Message received: " + string(buffer[:n])))
    }
}

func main() {
    listener, err := net.Listen("tcp", "localhost:8080")
    if err != nil {
        fmt.Println("Error starting TCP server:", err)
        os.Exit(1)
    }
    defer listener.Close()

    fmt.Println("TCP server listening on port 8080…")
    for {
        conn, err := listener.Accept()
        if err != nil {
            fmt.Println("Error accepting connection:", err)
            continue
        }
        go handleConnection(conn) // Handle each connection in a separate goroutine
    }
}
```

#### 25.2.2 TCP 客户端

TCP 客户端连接到服务器并发送消息，服务器回显消息：

```go
package main

import (
    "fmt"
    "net"
    "os"
)

func main() {
    conn, err := net.Dial("tcp", "localhost:8080")
    if err != nil {
        fmt.Println("Error connecting to server:", err)
        os.Exit(1)
    }
    defer conn.Close()

    message := "Hello, TCP server!"
    _, err = conn.Write([]byte(message))
    if err != nil {
        fmt.Println("Error sending message:", err)
        return
    }

    buffer := make([]byte, 1024)
    n, err := conn.Read(buffer)
    if err != nil {
        fmt.Println("Error reading response:", err)
        return
    }

    fmt.Println("Server response:", string(buffer[:n]))
}
```

### 25.3 TCP 粘包问题及处理

TCP 是流式协议，可能会出现粘包问题，即客户端一次发送多条消息时，服务器可能一次性收到多条消息，也可能消息被拆分。为了解决粘包问题，通常会采用给消息添加长度前缀的方法。

#### 25.3.1 TCP 粘包处理示例

```go
package main

import (
    "bufio"
    "encoding/binary"
    "fmt"
    "net"
    "os"
)

func sendMessage(conn net.Conn, message string) error {
    length := uint32(len(message))
    lengthBuffer := make([]byte, 4)
    binary.BigEndian.PutUint32(lengthBuffer, length)

    _, err := conn.Write(lengthBuffer)
    if err != nil {
        return err
    }

    _, err = conn.Write([]byte(message))
    return err
}

func receiveMessage(conn net.Conn) (string, error) {
    lengthBuffer := make([]byte, 4)
    _, err := conn.Read(lengthBuffer)
    if err != nil {
        return "", err
    }

    length := binary.BigEndian.Uint32(lengthBuffer)
    messageBuffer := make([]byte, length)
    _, err = conn.Read(messageBuffer)
    if err != nil {
        return "", err
    }

    return string(messageBuffer), nil
}

func main() {
    conn, err := net.Dial("tcp", "localhost:8080")
    if err != nil {
        fmt.Println("Error connecting to server:", err)
        os.Exit(1)
    }
    defer conn.Close()

    reader := bufio.NewReader(os.Stdin)
    fmt.Print("Enter message: ")
    message, _ := reader.ReadString('\n')

    err = sendMessage(conn, message)
    if err != nil {
        fmt.Println("Error sending message:", err)
        return
    }

    response, err := receiveMessage(conn)
    if err != nil {
        fmt.Println("Error receiving response:", err)
        return
    }

    fmt.Println("Received from server:", response)
}
```

### 25.4 Go 实现 UDP 通信

UDP 是面向无连接的协议，适合于不需要可靠传输的场景。以下是使用 Go 实现 UDP 服务器和客户端的示例。

#### 25.4.1 UDP 服务器端

```go
package main

import (
    "fmt"
    "net"
    "os"
)

func main() {
    addr, err := net.ResolveUDPAddr("udp", ":8081")
    if err != nil {
        fmt.Println("Error resolving address:", err)
        os.Exit(1)
    }

    conn, err := net.ListenUDP("udp", addr)
    if err != nil {
        fmt.Println("Error starting UDP server:", err)
        os.Exit(1)
    }
    defer conn.Close()

    buffer := make([]byte, 1024)

    for {
        n, clientAddr, err := conn.ReadFromUDP(buffer)
        if err != nil {
            fmt.Println("Error reading from UDP:", err)
            continue
        }

        fmt.Printf("Received %s from %s\n", string(buffer[:n]), clientAddr)

        // Echo the message back to the client
        _, err = conn.WriteToUDP([]byte("Message received"), clientAddr)
        if err != nil {
            fmt.Println("Error sending response:", err)
        }
    }
}
```

#### 25.4.2 UDP 客户端

```go
package main

import (
    "fmt"
    "net"
    "os"
)

func main() {
    addr, err := net.ResolveUDPAddr("udp", "localhost:8081")
    if err != nil {
        fmt.Println("Error resolving address:", err)
        os.Exit(1)
    }

    conn, err := net.DialUDP("udp", nil, addr)
    if err != nil {
        fmt.Println("Error connecting to server:", err)
        os.Exit(1)
    }
    defer conn.Close()

    message := []byte("Hello, UDP server!")
    _, err = conn.Write(message)
    if err != nil {
        fmt.Println("Error sending message:", err)
        return
    }

    buffer := make([]byte, 1024)
    n, _, err := conn.ReadFromUDP(buffer)
    if err != nil {
        fmt.Println("Error reading response:", err)
        return
    }

    fmt.Println("Server response:", string(buffer[:n]))
}
```
