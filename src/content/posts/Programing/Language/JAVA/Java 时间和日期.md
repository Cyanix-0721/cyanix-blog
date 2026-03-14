---
tags:
  - Language
  - Java
  - Time
---

# Java 时间和日期

> [!summary] 日期和时间
>
> - `Date` 是 Java 早期的日期类，不推荐直接使用。
> - `Calendar` 支持更多功能，但自 Java 8 起被 `LocalDate`、`LocalTime`、`LocalDateTime` 等类取代。
> - `LocalDate`、`LocalTime` 和 `LocalDateTime` 提供了更现代化、线程安全的日期处理方法。
> - `DateTimeFormatter` 用于格式化和解析日期时间。
> - 各种日期时间类可以通过 `Instant` 和时区进行互相转换。
> - 与 SQL 数据库日期时间交互时，可以使用 `java.sql.Date`、`java.sql.Time` 和 `java.sql.Timestamp` 类。

## 1 `LocalDate`、`LocalTime`、`LocalDateTime`

Java 8 引入了全新的日期和时间 API，推荐使用这些类进行日期和时间操作。`LocalDate` 表示日期，`LocalTime` 表示时间，而 `LocalDateTime` 同时包含日期和时间。

### 1.1 `LocalDateTime` 与 `Date` 之间的转换

虽然不推荐直接使用 `Date`，但在某些情况下需要与旧代码兼容。可以通过 `Instant` 进行转换。

#### 1.1.1 `Date` 转 `LocalDateTime`

```java
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

public class DateToLocalDateTime {
    public static void main(String[] args) {
        // Date 转 LocalDateTime
        Date date = new Date();
        Instant instant = date.toInstant();
        LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());

        System.out.println("Date: " + date);
        System.out.println("LocalDateTime: " + localDateTime);
    }
}
```

#### 1.1.2 `LocalDateTime` 转 `Date`

```java
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

public class LocalDateTimeToDate {
    public static void main(String[] args) {
        // LocalDateTime 转 Date
        LocalDateTime localDateTime = LocalDateTime.now();
        Date date = Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());

        System.out.println("LocalDateTime: " + localDateTime);
        System.out.println("Date: " + date);
    }
}
```

### 1.2 `LocalDateTime` 与 `LocalDate` 和 `LocalTime` 的转换

`LocalDateTime` 可以很方便地与 `LocalDate` 和 `LocalTime` 进行互相转换。

```java
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class LocalDateTimeConversion {
    public static void main(String[] args) {
        // LocalDate 和 LocalTime 转 LocalDateTime
        LocalDate localDate = LocalDate.now();
        LocalTime localTime = LocalTime.now();
        LocalDateTime localDateTime = LocalDateTime.of(localDate, localTime);

        System.out.println("LocalDate: " + localDate);
        System.out.println("LocalTime: " + localTime);
        System.out.println("LocalDateTime: " + localDateTime);

        // LocalDateTime 转 LocalDate 和 LocalTime
        LocalDate extractedDate = localDateTime.toLocalDate();
        LocalTime extractedTime = localDateTime.toLocalTime();

        System.out.println("Extracted LocalDate: " + extractedDate);
        System.out.println("Extracted LocalTime: " + extractedTime);
    }
}
```

## 2 `DateTimeFormatter` 格式化与解析

`DateTimeFormatter` 提供了格式化和解析日期时间的能力。你可以通过自定义模式来格式化 `LocalDateTime`，并解析字符串为日期时间对象。

### 2.1 格式化 `LocalDateTime` 为字符串

```java
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class LocalDateTimeFormatting {
    public static void main(String[] args) {
        LocalDateTime localDateTime = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // 格式化 LocalDateTime 为字符串
        String formattedDateTime = localDateTime.format(formatter);
        System.out.println("Formatted LocalDateTime: " + formattedDateTime);
    }
}
```

### 2.2 解析字符串为 `LocalDateTime`

```java
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class StringToLocalDateTime {
    public static void main(String[] args) {
        String dateTimeString = "2024-09-09 12:30:45";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // 解析字符串为 LocalDateTime
        LocalDateTime localDateTime = LocalDateTime.parse(dateTimeString, formatter);
        System.out.println("Parsed LocalDateTime: " + localDateTime);
    }
}
```

## 3 `Instant` 与 `Timestamp`

`Instant` 是 Java 8 中用于精确记录时间点的类，适用于存储和处理 UTC 时间。`Timestamp` 是 `Date` 的子类，通常用于处理与 SQL 数据库交互中的 `DATETIME` 和 `TIMESTAMP` 类型字段。

### 3.1 `Timestamp` 转 `Instant`

```java
import java.sql.Timestamp;
import java.time.Instant;

public class TimestampToInstant {
    public static void main(String[] args) {
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());
        Instant instant = timestamp.toInstant();

        System.out.println("Timestamp: " + timestamp);
        System.out.println("Instant: " + instant);
    }
}
```

### 3.2 `Instant` 转 `Timestamp`

```java
import java.sql.Timestamp;
import java.time.Instant;

public class InstantToTimestamp {
    public static void main(String[] args) {
        Instant instant = Instant.now();
        Timestamp timestamp = Timestamp.from(instant);

        System.out.println("Instant: " + instant);
        System.out.println("Timestamp: " + timestamp);
    }
}
```

## 4 `LocalDateTime` 与 `Timestamp` 的转换

### 4.1 `LocalDateTime` 转 `Timestamp`

```java
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class LocalDateTimeToTimestamp {
    public static void main(String[] args) {
        LocalDateTime localDateTime = LocalDateTime.now();
        Timestamp timestamp = Timestamp.valueOf(localDateTime);

        System.out.println("LocalDateTime: " + localDateTime);
        System.out.println("Timestamp: " + timestamp);
    }
}
```

### 4.2 `Timestamp` 转 `LocalDateTime`

```java
import java.sql.Timestamp;
import java.time.LocalDateTime;

public class TimestampToLocalDateTime {
    public static void main(String[] args) {
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());
        LocalDateTime localDateTime = timestamp.toLocalDateTime();

        System.out.println("Timestamp: " + timestamp);
        System.out.println("LocalDateTime: " + localDateTime);
    }
}
```
