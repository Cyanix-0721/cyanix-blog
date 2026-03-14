---
tags:
  - Language
  - Go
---

# Go with Time

## 1 Go `time` 包介绍

Go 语言中的 `time` 包提供了对日期和时间的基本操作，如获取当前时间、格式化时间、解析时间、计时器、定时器等功能。它支持时间的操作、比较和计算，广泛用于日志记录、定时任务和时间间隔计算等场景。

### 1.1 获取当前时间

- **`time.Now()`**：获取当前本地时间，返回 `Time` 对象。
- **`Time.Year()`**：返回年份。
- **`Time.Month()`**：返回月份。
- **`Time.Day()`**：返回日期。
- **`Time.Hour()`**：返回小时（24 小时制）。
- **`Time.Minute()`**：返回分钟。
- **`Time.Second()`**：返回秒。

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    now := time.Now() // 获取当前时间
    fmt.Println("Current time:", now)
    
    // 获取时间的各个组成部分
    fmt.Println("Year:", now.Year())       // 获取年份
    fmt.Println("Month:", now.Month())     // 获取月份
    fmt.Println("Day:", now.Day())         // 获取日期
    fmt.Println("Hour:", now.Hour())       // 获取小时
    fmt.Println("Minute:", now.Minute())   // 获取分钟
    fmt.Println("Second:", now.Second())   // 获取秒
}
```

## 2 时间格式化

Go 语言使用特殊的布局字符串来格式化和解析时间，而不是像其他语言那样使用占位符。布局字符串表示的是 `Mon Jan 2 15:04:05 MST 2006` 的格式（这个具体的时间是 Go 语言参考的起点时间）。

### 2.1 时间格式化函数

- **`Time.Format(layout string)`**：根据指定的布局字符串格式化时间。

```go
formattedTime := now.Format("2006-01-02 15:04:05")
fmt.Println("Formatted time:", formattedTime)
```

> 注意：`2006` 表示年份，`01` 表示月份，`02` 表示日期，`15` 表示小时（24 小时制），`04` 表示分钟，`05` 表示秒。

### 2.2 常见时间布局格式

```go
t := time.Now()

// 年-月-日
fmt.Println(t.Format("2006-01-02"))

// 时:分:秒
fmt.Println(t.Format("15:04:05"))

// 日期和时间
fmt.Println(t.Format("2006-01-02 15:04:05"))

// 使用 AM/PM 标志
fmt.Println(t.Format("03:04:05 PM"))
```

## 3 时间解析

> [!summary]
>
> - 使用 **`time.Parse(layout, value string)`** 解析时间字符串，获取 `Time` 对象。
> - 使用 **`time.ParseInLocation(layout string, value string, loc *time.Location)`** 解析带时区的时间字符串。
> - 时间解析依赖于特定的布局字符串，必须使用固定的格式。

### 3.1 基本时间解析

- **`time.Parse(layout string, value string)`**：根据指定的布局字符串解析时间。`layout` 是一个时间格式化的模板，而 `value` 是待解析的时间字符串。

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    // 解析日期字符串
    parsedTime, err := time.Parse("2006-01-02", "2024-09-12")
    if err != nil {
        fmt.Println("Error parsing time:", err)
    } else {
        fmt.Println("Parsed time:", parsedTime)
    }
}
```

### 3.2 带时区的时间解析

- **`time.ParseInLocation(layout string, value string, loc *time.Location)`**：在指定的时区内解析时间字符串。与 `time.Parse()` 类似，但可以考虑时区差异。

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    // 解析时间字符串（假设字符串是本地时间）
    localLocation, _ := time.LoadLocation("Local")
    parsedLocalTime, err := time.ParseInLocation("2006-01-02 15:04:05", "2024-09-12 14:30:00", localLocation)
    if err != nil {
        fmt.Println("Error parsing local time:", err)
    } else {
        fmt.Println("Parsed local time:", parsedLocalTime)
    }

    // 解析时间字符串（指定为纽约时区）
    newYorkLocation, _ := time.LoadLocation("America/New_York")
    parsedNYTime, err := time.ParseInLocation("2006-01-02 15:04:05", "2024-09-12 14:30:00", newYorkLocation)
    if err != nil {
        fmt.Println("Error parsing New York time:", err)
    } else {
        fmt.Println("Parsed New York time:", parsedNYTime)
    }
}
```

### 3.3 解析布局字符串

在 Go 中，时间布局字符串的格式是固定的，必须使用 `2006-01-02 15:04:05` 这种特定的布局进行格式化。你可以使用这种布局字符串来匹配输入的时间字符串。例如：

- **`"2006-01-02"`**：日期格式（年-月-日）。
- **`"2006-01-02 15:04:05"`**：完整的日期和时间格式。

## 4 时间间隔 (Duration)

在 Go 语言中，`time.Duration` 是一个表示时间段的类型，单位为纳秒。它可以表示不同的时间单位，如小时、分钟、秒、毫秒等。

- **`time.Nanosecond`**：表示 1 纳秒。
- **`time.Microsecond`**：表示 1 微秒。
- **`time.Millisecond`**：表示 1 毫秒。
- **`time.Second`**：表示 1 秒。
- **`time.Minute`**：表示 1 分钟，等于 60 秒。
- **`time.Hour`**：表示 1 小时，等于 60 分钟。

## 5 时间运算

### 5.1 时间加减

- **`Time.Add(d time.Duration)`**：给当前时间加上一个时间段。
- **`Time.Sub(t Time)`**：计算两个时间点的差值，返回 `Duration`。

```go
// 加 2 小时
later := now.Add(2 * time.Hour)
fmt.Println("Two hours later:", later)

// 计算时间差
duration := later.Sub(now)
fmt.Println("Time difference:", duration)
```

### 5.2 时间比较

- **`Time.Before(t Time)`**：如果当前时间点在指定时间点之前，返回 `true`。
- **`Time.After(t Time)`**：如果当前时间点在指定时间点之后，返回 `true`。
- **`Time.Equal(t Time)`**：判断两个时间点是否相等。

```go
future := now.Add(24 * time.Hour)
if now.Before(future) {
    fmt.Println("Now is before future")
}
```

## 6 定时器与计时器

### 6.1 定时器 (Ticker)

- **`time.NewTicker(d time.Duration)`**：创建一个定时器，每隔指定时间段触发一次。

```go
ticker := time.NewTicker(1 * time.Second)
defer ticker.Stop()

for t := range ticker.C {
    fmt.Println("Tick at", t)
}
```

### 6.2 计时器 (Timer)

- **`time.NewTimer(d time.Duration)`**：创建一个计时器，在指定时间后触发一次。

```go
timer := time.NewTimer(2 * time.Second)
<-timer.C
fmt.Println("Timer expired")
```

## 7 睡眠与暂停

- **`time.Sleep(d time.Duration)`**：暂停当前协程一段时间。

```go
fmt.Println("Sleeping for 2 seconds…")
time.Sleep(2 * time.Second)
fmt.Println("Awake now!")
```

## 8 时区与时间转换

> [!summary]
>
> - 使用 `Time.UTC()` 将时间转换为 UTC 时间。
> - 使用 `Time.Local()` 将时间转换为本地时间。
> - 使用 `time.LoadLocation()` 或 `time.FixedZone()` 加载或创建时区。
> - 使用 `Time.In(location *Location)` 将时间转换为指定时区。

### 8.1 常用时间转换方法

- **`Time.UTC()`**：将时间转换为 UTC 时间。
- **`Time.Local()`**：将时间转换为本地时间（系统配置的时区）。

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    now := time.Now()

    // 转换为 UTC 时间
    utc := now.UTC()
    fmt.Println("UTC time:", utc)

    // 将 UTC 时间转换回本地时间
    local := utc.Local()
    fmt.Println("Local time:", local)
}
```

### 8.2 使用 `Location` 设置时区

Go 语言提供了 `time.Location` 类型，用于表示不同的时区。你可以使用 `time.LoadLocation()` 函数加载特定的时区，或者使用 `time.FixedZone()` 创建自定义时区。

- **`time.LoadLocation(name string)`**：根据时区名称加载时区。
- **`time.FixedZone(name string, offset int)`**：根据指定的时区名称和偏移量（以秒为单位）创建固定时区。

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    now := time.Now()

    // 加载 "Asia/Shanghai" 时区
    shanghai, _ := time.LoadLocation("Asia/Shanghai")
    shanghaiTime := now.In(shanghai)
    fmt.Println("Shanghai time:", shanghaiTime)

    // 加载 "America/New_York" 时区
    newYork, _ := time.LoadLocation("America/New_York")
    newYorkTime := now.In(newYork)
    fmt.Println("New York time:", newYorkTime)

    // 创建自定义的时区 UTC+8（偏移 8 小时）
    customZone := time.FixedZone("Custom UTC+8", 8*3600)
    customTime := now.In(customZone)
    fmt.Println("Custom UTC+8 time:", customTime)
}
```

### 8.3 获取所有时区名称

如果你想查看系统中支持的所有时区，可以参考时区数据库，如 IANA 时区数据库。Go 使用的时区数据库通常位于 `/usr/share/zoneinfo`（在 Linux 系统上）。

### 8.4 将 `Time` 对象转换为指定时区

在需要将某个时间转换为特定时区时，可以使用 `Time.In(location *Location)` 方法。

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    // 获取当前时间
    now := time.Now()

    // 转换为 UTC 时间
    utcTime := now.UTC()
    fmt.Println("UTC time:", utcTime)

    // 加载 "Europe/London" 时区
    londonLocation, _ := time.LoadLocation("Europe/London")
    londonTime := utcTime.In(londonLocation)
    fmt.Println("London time:", londonTime)

    // 加载 "Asia/Tokyo" 时区
    tokyoLocation, _ := time.LoadLocation("Asia/Tokyo")
    tokyoTime := utcTime.In(tokyoLocation)
    fmt.Println("Tokyo time:", tokyoTime)
}
```

## 9 时间戳

在 Go 语言中，时间戳表示自 Unix 纪元（1970年1月1日 00:00:00 UTC）以来的时间，单位可以是秒、纳秒、毫秒或微秒。以下是 `time` 包中有关时间戳的方法：

- **`Time.Unix()`**：返回时间的 Unix 时间戳，单位为秒，类型为 `int64`。
- **`Time.UnixMilli()`**：返回时间的 Unix 时间戳，单位为毫秒，类型为 `int64`。
- **`Time.UnixMicro()`**：返回时间的 Unix 时间戳，单位为微秒，类型为 `int64`。
- **`Time.UnixNano()`**：返回时间的 Unix 时间戳，单位为纳秒，类型为 `int64`。

> [!info]
>
> - **秒 (s)**：这是我们日常生活中最常用的时间单位。
> - **毫秒 (ms)**：是千分之一秒。1秒 = 1E-3 毫秒。
> - **微秒 (μs)**：是百万分之一秒。1秒 = 1E-6 微秒。
> - **纳秒 (ns)**：是十亿分之一秒。1秒 = 1E-9 纳秒。

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    now := time.Now()

    // 获取 Unix 时间戳（秒）
    timestamp := now.Unix()
    fmt.Println("Unix timestamp (seconds):", timestamp)

	// 获取 Unix 时间戳（毫秒）
    timestampMilli := now.UnixMilli()
    fmt.Println("Unix timestamp (milliseconds):", timestampMilli)

    // 获取 Unix 时间戳（微秒）
    timestampMicro := now.UnixMicro()
    fmt.Println("Unix timestamp (microseconds):", timestampMicro)
    
    // 获取 Unix 时间戳（纳秒）
    timestampNano := now.UnixNano()
    fmt.Println("Unix timestamp (nanoseconds):", timestampNano)
}
```

### 9.1 将 `int64` 时间戳转换为 `Time` 对象

可以使用 `time.Unix()` 函数将 `int64` 类型的 Unix 时间戳（秒）转换为 `Time` 对象。对于纳秒、毫秒和微秒级的时间戳，需要做适当的调整：

- **`time.Unix(seconds int64, nanoseconds int64)`**：将秒和纳秒转换为 `Time` 对象。
- **`time.UnixMilli(millis int64)`**：将毫秒级时间戳转换为 `Time` 对象（Go 1.17+）。
- **`time.UnixMicro(micros int64)`**：将微秒级时间戳转换为 `Time` 对象（Go 1.17+）。

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    // 秒级时间戳
    seconds := time.Now().Unix()
    t := time.Unix(seconds, 0)
    fmt.Println("Time from Unix seconds timestamp:", t)

    // 纳秒级时间戳
    nanoseconds := time.Now().UnixNano()
    tNano := time.Unix(0, nanoseconds)
    fmt.Println("Time from Unix nanoseconds timestamp:", tNano)

    // 毫秒级时间戳（Go 1.17+）
    milliseconds := time.Now().UnixMilli()
    tMilli := time.Unix(0, milliseconds*int64(time.Millisecond))
    fmt.Println("Time from Unix milliseconds timestamp:", tMilli)

    // 微秒级时间戳（Go 1.17+）
    microseconds := time.Now().UnixMicro()
    tMicro := time.Unix(0, microseconds*int64(time.Microsecond))
    fmt.Println("Time from Unix microseconds timestamp:", tMicro)
}
```
