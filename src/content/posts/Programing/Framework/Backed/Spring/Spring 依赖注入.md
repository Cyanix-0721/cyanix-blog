---
tags:
  - SpringBoot
  - 依赖注入
---

# Spring 依赖注入

> [!summary]
>
> - `@Autowired` 是 Spring 提供的注解，支持按类型和按名称注入。
> - `@Resource` 是 JSR-250 标准注解，默认按名称注入。
> - 构造函数注入是推荐的方式，确保依赖在对象创建时即被提供。每种注入方式各有优缺点，选择时可根据具体需求和场景。

在 Spring 中，依赖注入是实现组件之间解耦的重要手段。常用的注入方式包括 `@Autowired` 和 `@Resource` 注解，以及构造函数注入。以下是对这些注解及其使用方法的详细介绍。

## 1 @Autowired

`@Autowired` 是 Spring 提供的注解，用于自动装配 Spring 容器中的 bean。它可以标记字段、构造函数和方法。

### 1.1 用法

- **字段注入**：

```java
@Component
public class MyService {
    
    @Autowired
    private MyRepository myRepository; // 自动装配

    public void performTask() {
        myRepository.doSomething();
    }
}
```

- **构造函数注入**：

```java
@Component
public class MyService {

    private final MyRepository myRepository;

    @Autowired
    public MyService(MyRepository myRepository) { // 构造函数注入
        this.myRepository = myRepository;
    }

    public void performTask() {
        myRepository.doSomething();
    }
}
```

- **方法注入**：

```java
@Component
public class MyService {

    private MyRepository myRepository;

    @Autowired
    public void setMyRepository(MyRepository myRepository) { // Setter 方法注入
        this.myRepository = myRepository;
    }

    public void performTask() {
        myRepository.doSomething();
    }
}
```

### 1.2 注意事项

- `@Autowired` 默认是按类型进行装配。如果有多个同类型的 bean，可以通过 `@Qualifier` 指定具体的 bean。
- 如果没有找到匹配的 bean，会抛出 `NoSuchBeanDefinitionException`。可以通过设置 `required = false` 来使其可选。

## 2 @Resource

`@Resource` 是 JSR-250 规范中的注解，主要用于 Java EE 应用中，但也可以在 Spring 中使用。它默认按名称进行装配。

### 2.1 用法

- **字段注入**：

```java
import javax.annotation.Resource;

@Component
public class MyService {
    
    @Resource
    private MyRepository myRepository; // 按名称自动装配

    public void performTask() {
        myRepository.doSomething();
    }
}
```

- **构造函数注入**：

```java
import javax.annotation.Resource;

@Component
public class MyService {

    private final MyRepository myRepository;

    @Resource
    public MyService(MyRepository myRepository) { // 按名称构造函数注入
        this.myRepository = myRepository;
    }

    public void performTask() {
        myRepository.doSomething();
    }
}
```

### 2.2 注意事项

- `@Resource` 默认按名称装配，如果没有找到匹配的名称，会按类型装配。
- 它可以用于指定特定的 bean 名称，示例：

```java
@Resource(name = "myRepositoryBean")
private MyRepository myRepository;
```

## 3 构造函数注入

Spring 中不推荐在字段上直接使用 `@Autowired`，而是建议通过构造函数注入来实现依赖注入，能够使得依赖在对象创建时就被注入，从而保证对象的不可变性和一致性。

### 3.1 优点

- **强制依赖**：构造函数注入确保所有依赖在对象创建时提供，避免了运行时出现空指针异常。
- **便于测试**：通过构造函数注入，容易对依赖进行 mock，从而便于单元测试。
- **不可变性**：通过构造函数注入，依赖在对象创建时被赋值，确保了依赖的不可变性。
- **避免循环依赖**：构造函数注入在某些情况下可以帮助避免循环依赖问题。

### 3.2 使用示例

```java
@Component
public class MyService {

    private final MyRepository myRepository;

    @Autowired // 如果仅一个构造函数,可忽略@Autowired
    public MyService(MyRepository myRepository) { // 构造函数注入
        this.myRepository = myRepository;
    }

    public void performTask() {
        myRepository.doSomething();
    }
}
```
