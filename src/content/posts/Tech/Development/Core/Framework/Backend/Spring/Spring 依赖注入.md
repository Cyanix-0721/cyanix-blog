---
tags: [SpringBoot, 依赖注入]
title: Spring 依赖注入
date created: 2024-09-29 02:09:41
date modified: 2026-10-04 00:50:00
---

# Spring 依赖注入

> [!summary]
>
> - `@Autowired` 是 Spring 提供的注解，支持按类型和按名称注入。
> - `@Resource` 是 JSR-250 标准注解，默认按名称注入。
> - 构造函数注入是推荐的方式，确保依赖在对象创建时即被提供。每种注入方式各有优缺点，选择时可根据具体需求和场景。

在 Spring 中，依赖注入是实现组件之间解耦的重要手段。常用的注入方式包括 `@Autowired` 和 `@Resource` 注解，以及构造函数注入。以下是对这些注解及其使用方法的详细介绍。

在软件工程中，依赖注入（Dependency Injection，DI）是一种设计模式，用于实现控制反转（Inversion of Control，IoC）原则。它的核心思想是将一个对象所需的依赖关系从外部注入，而不是在对象内部自行创建。这种方式能够降低组件之间的耦合度，提高代码的可维护性和可测试性。

在 Java 中，依赖注入可以通过构造函数、Setter 方法或接口实现。然而，手动管理依赖关系可能会变得复杂且容易出错。Spring 框架通过 IoC 容器和注解（如 `@Autowired` 和 `@Resource`）简化了依赖注入的实现，使得开发者可以更轻松地管理和配置对象之间的依赖关系。

Spring 提供了 `@Autowired` 和 `@Resource` 两种注解来实现依赖注入。

## 1 @Autowired

`@Autowired` 是 Spring 提供的注解，用于自动装配 Spring 容器中的 bean。它可以标记字段、构造函数和方法。

> [!note] `@Inject`
> `@Inject` 同样可以用于依赖注入。来自 Java EE 的 JSR-330 规范，它可以用于构造器、字段和方法，按类型进行自动装配。如果有多个匹配的 bean，它会抛出异常。

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

## 4 `@Autowired` 与 `@Resource` 对比

### 4.1 `@Autowired`

* **来源：** `@Autowired` 是 Spring 自带的注解。
* **装配方式：** 默认按照类型（byType）进行自动装配。如果容器中存在多个相同类型的 Bean，可以通过 `@Qualifier` 注解指定 Bean 的名称（byName）进行装配。
* **特性：**
	* 支持构造函数、字段、Setter 方法注入。
	* 可以配合 `@Qualifier` 注解实现按名称注入。
	* `required` 属性默认为 `true`，表示注入的 Bean 必须存在，否则抛出异常。可以设置为 `false`，表示找不到 Bean 时不报错。

**代码示例：**

```java
@Service
public class UserService {

    // 字段注入
    @Autowired
    private UserRepository userRepository;

    // 构造函数注入
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Setter 方法注入
    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 按名称注入
    @Autowired
    @Qualifier("userRepositoryImpl")
    private UserRepository userRepository;
}
```

### 4.2 `@Resource`

* **来源：** `@Resource` 是 JSR-250 规范定义的注解。
* **装配方式：** 默认按照名称（byName）进行自动装配。如果找不到名称匹配的 Bean，则按照类型（byType）进行装配。
* **特性：**
	* 支持字段和 Setter 方法注入。
	* 可以通过 `name` 属性指定 Bean 的名称进行注入。
	* `type` 属性指定 Bean 的类型。

**代码示例：**

```java
@Service("userService")
public class UserService {

    // 字段注入
    @Resource
    private UserRepository userRepository;

    // Setter 方法注入
    @Resource(name = "userRepositoryImpl")
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

### 4.3 总结

* `@Autowired` 和 `@Resource` 都可以用于字段和 Setter 方法注入。
* `@Autowired` 默认按类型装配，`@Resource` 默认按名称装配。
* `@Autowired` 可以配合 `@Qualifier` 注解实现按名称注入。
* `@Autowired` 的 `required` 属性可以控制注入 Bean 是否必须存在。
* `@Resource` 可以通过 `name` 和 `type` 属性指定注入的 Bean。

### 4.4 最佳实践

* 建议优先使用 `@Autowired`，因为它更符合 Spring 的理念。
* 如果需要按名称注入，可以使用 `@Autowired` 配合 `@Qualifier`。
* 如果需要更灵活的注入方式，可以使用 `@Resource`。
* 尽量避免在同一个类中同时使用 `@Autowired` 和 `@Resource`，以保持代码风格一致。
