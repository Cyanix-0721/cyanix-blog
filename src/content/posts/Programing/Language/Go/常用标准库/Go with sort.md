# Go 语言 `sort` 包介绍

`sort` 包是 Go 语言标准库中的一个非常有用的包，提供了对切片进行排序的功能。它支持对整数、浮点数和字符串等内置类型的排序，并且允许对自定义类型进行排序。

## 1 基本用法

`sort` 包提供了多种用于排序的函数和类型，下面我们详细介绍几种常见的排序方法。

### 1.1 `sort.Ints`

`sort.Ints` 是最常用的排序函数之一，用于对整数切片进行排序。它的参数是 `[]int` 类型的切片，调用后会对该切片进行原地排序。

#### 1.1.1 示例

```go
package main

import (
    "fmt"
    "sort"
)

func main() {
    nums := []int{5, 2, 6, 3, 1, 4}
    sort.Ints(nums) // 对整数切片进行排序
    fmt.Println(nums) // 输出: [1, 2, 3, 4, 5, 6]
}
```

#### 1.1.2 工作原理

`sort.Ints` 使用的是 `sort.Sort` 函数的封装，它利用了快速排序算法（具体的实现可以在标准库的 `src/sort/sort.go` 中查看），对给定的整数切片进行排序。

### 1.2 `sort.IntSlice`

`sort.IntSlice` 是 Go 语言中的一种自定义类型，它本质上是 `[]int` 类型的封装，提供了实现排序接口的方法。我们可以通过 `sort.Sort` 函数对 `IntSlice` 进行排序。

#### 1.2.1 示例

```go
package main

import (
    "fmt"
    "sort"
)

func main() {
    nums := []int{5, 2, 6, 3, 1, 4}
    sort.Sort(sort.IntSlice(nums)) // 使用 IntSlice 进行排序
    fmt.Println(nums) // 输出: [1, 2, 3, 4, 5, 6]
}
```

#### 1.2.2 `sort.IntSlice` 的方法

`sort.IntSlice` 类型实现了 `sort.Interface` 接口，该接口有以下三个方法：

- `Len()`：返回切片的长度。
- `Less(i, j int)`：决定索引 `i` 和 `j` 处的元素是否需要交换，返回 `true` 表示 `i` 处的元素应该在 `j` 前面。
- `Swap(i, j int)`：交换索引 `i` 和 `j` 处的元素。

```go
func (p IntSlice) Len() int           { return len(p) }
func (p IntSlice) Less(i, j int) bool { return p[i] < p[j] }
func (p IntSlice) Swap(i, j int)      { p[i], p[j] = p[j], p[i] }
```

通过这种实现方式，`sort.Sort` 可以对 `IntSlice` 进行排序。

### 1.3 自定义排序规则

通过实现 `sort.Interface` 接口，我们可以对任意类型进行自定义排序。下面是一个对结构体切片进行排序的示例：

#### 1.3.1 示例：对结构体进行排序

```go
package main

import (
    "fmt"
    "sort"
)

// 定义一个包含 Name 和 Age 的结构体
type Person struct {
    Name string
    Age  int
}

// 按照 Age 从小到大排序的自定义切片类型
type ByAge []Person

// 实现 sort.Interface 接口
func (a ByAge) Len() int           { return len(a) }
func (a ByAge) Less(i, j int) bool { return a[i].Age < a[j].Age }
func (a ByAge) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

func main() {
    people := []Person{
        {"Alice", 30},
        {"Bob", 25},
        {"Charlie", 35},
    }

    // 使用自定义的排序方法
    sort.Sort(ByAge(people))

    fmt.Println(people)
    // 输出: [{Bob 25} {Alice 30} {Charlie 35}]
}
```

### 1.4 `sort.Reverse`

如果我们想要对切片进行降序排序，可以使用 `sort.Reverse`。它会返回一个 `sort.Interface` 的包装器，用于反转排序顺序。

#### 1.4.1 示例

```go
package main

import (
    "fmt"
    "sort"
)

func main() {
    nums := []int{5, 2, 6, 3, 1, 4}
    sort.Sort(sort.Reverse(sort.IntSlice(nums))) // 降序排序
    fmt.Println(nums) // 输出: [6, 5, 4, 3, 2, 1]
}
```

### 1.5 检查切片是否已排序

`sort` 包还提供了一个 `sort.IntsAreSorted` 函数，用于检查整数切片是否已排序（升序）。类似地，也有 `sort.Float64sAreSorted` 和 `sort.StringsAreSorted` 来检查其他类型的排序情况。

#### 1.5.1 示例

```go
package main

import (
    "fmt"
    "sort"
)

func main() {
    nums := []int{1, 2, 3, 4, 5}
    sorted := sort.IntsAreSorted(nums) // 检查是否已排序
    fmt.Println(sorted) // 输出: true
}
```

## 2 总结

`sort` 包是一个功能强大且易于使用的排序工具。在排序整数、浮点数和字符串时，使用 `sort.Ints`、`sort.Float64s` 和 `sort.Strings` 是最直接的方式；对于自定义类型，可以实现 `sort.Interface` 来定义自己的排序规则。同时，`sort.Reverse` 提供了反向排序功能，`sort.IntsAreSorted` 等函数可以方便地检查数组是否已经有序。

### 2.1 常用函数和类型总结

- **`sort.Ints([]int)`**：对整数切片进行升序排序。
- **`sort.Float64s([]float64)`**：对浮点数切片进行升序排序。
- **`sort.Strings([]string)`**：对字符串切片进行升序排序。
- **`sort.IntSlice`**：整数切片的封装类型，实现了排序接口，可自定义排序。
- **`sort.Reverse`**：对给定的 `sort.Interface` 进行降序排序。
- **`sort.IntsAreSorted([]int)`**：检查整数切片是否已升序排列。
