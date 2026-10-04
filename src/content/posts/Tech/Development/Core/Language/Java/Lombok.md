---
tags: [Java, Lombok]
title: Lombok
date created: 2026-10-04 00:30:00
date modified: 2026-10-04 00:50:00
---

# Lombok

Lombok 是一个 Java 库，它可以帮助开发者减少 Java 类中样板代码的编写。Lombok 使用注解的方式来自动生成 getter/setter、构造函数、equals、hashCode、toString 等常用方法。本文档将介绍 Lombok 的常用注解及其使用方法。

## 1 引入 Lombok

在使用 Lombok 之前，需要先在项目中引入 Lombok 库。

### 1.1 Maven

在 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.24</version>
    <scope>provided</scope>
</dependency>
```

### 1.2 Gradle

在 `build.gradle` 文件中添加以下依赖：

```groovy
dependencies {
    compileOnly 'org.projectlombok:lombok:1.18.24'
    annotationProcessor 'org.projectlombok:lombok:1.18.24'
}
```

## 2 常用注解

### 2.1 `@Getter` 和 `@Setter`

`@Getter` 和 `@Setter` 注解可以自动生成 getter 和 setter 方法。

```java
import lombok.Getter;
import lombok.Setter;

public class User {
    @Getter @Setter
    private String name;

    @Getter @Setter
    private int age;
}
```

### 2.2 `@ToString`

`@ToString` 注解可以自动生成 `toString` 方法。

```java
import lombok.ToString;

@ToString
public class User {
    private String name;
    private int age;
}
```

### 2.3 `@EqualsAndHashCode`

`@EqualsAndHashCode` 注解可以自动生成 `equals` 和 `hashCode` 方法。

```java
import lombok.EqualsAndHashCode;

@EqualsAndHashCode
public class User {
    private String name;
    private int age;
}
```

### 2.4 `@NoArgsConstructor`, `@AllArgsConstructor`, `@RequiredArgsConstructor`

* `@NoArgsConstructor` 注解生成无参构造函数。
* `@AllArgsConstructor` 注解生成包含所有字段的构造函数。
* `@RequiredArgsConstructor` 注解生成包含 `final` 字段的构造函数（`@Autowired` 隐式注入）。

```java
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@RequiredArgsConstructor
public class User {
    private String name;
    private int age;
}
```

### 2.5 @Data

`@Data` 注解是一个综合注解，相当于同时使用 `@Getter`、`@Setter`、`@ToString`、`@EqualsAndHashCode` 和 `@RequiredArgsConstructor`。

```java
import lombok.Data;

@Data
public class User {
    private String name;
    private int age;
}
```

### 2.6 @Builder

`@Builder` 注解可以使用构建者模式来创建对象。

```java
import lombok.Builder;

@Builder
public class User {
    private String name;
    private int age;
}

// 使用示例
User user = User.builder()
    .name("John")
    .age(30)
    .build();
```

### 2.7 @Value

`@Value` 注解可以将一个类标记为不可变类，相当于同时使用 `@Getter`、`@AllArgsConstructor`、`@EqualsAndHashCode`、`@ToString` 和 `@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)`。

```java
import lombok.Value;

@Value
public class User {
    String name;
    int age;
}
```

## 3 高级用法

### 3.1 @Slf4j

`@Slf4j` 注解可以自动生成 `SLF4J` 日志记录器。

```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class User {
    public void doSomething() {
        log.info("Doing something…");
    }
}
```

### 3.2 @SneakyThrows

`@SneakyThrows` 注解可以在方法中自动处理受检异常，而无需显式捕获或声明抛出。

```java
import lombok.SneakyThrows;

public class User {
    @SneakyThrows
    public void doSomething() {
        throw new Exception("Checked Exception");
    }
}
```
