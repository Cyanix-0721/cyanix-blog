# Spring对象实例化

> [!summary] Spring对象实例化：核心方法与最佳实践
>
> - **主要实例化方式**：注解驱动、工厂方法
> - **核心注解**：`@Component`, `@Autowired`, `@Bean`
> - **推荐实践**：优先使用构造器注入，尽量使用注解方式
> - **灵活性**：结合多种注解解决依赖注入复杂场景

## 1 **`@Component` 和衍生注解**

Spring 提供了 `@Component` 注解用于标记一个类为 Bean，Spring 容器会自动扫描并实例化它。其他功能类似的注解包括：

- `@Controller`：用于标记控制器类，适用于 MVC 项目中的表现层。
- `@Service`：用于标记服务类，表示业务逻辑层。
- `@Repository`：用于标记数据访问层类，具有自动捕获数据库异常的能力。

**示例：**

```java
@Component
public class ExampleService {
    // Bean 类
}
```

## 2 **`@Autowired` 自动注入**

`@Autowired` 是 Spring 的核心注解之一，用于按类型（by-type）自动注入依赖。它有以下几种使用方式：

### 2.1 构造器注入（推荐）

`@Autowired` 可以作用于构造器，这是最推荐的依赖注入方式，原因如下：

1. **不变性保证**
   - 注入的依赖可以声明为final，确保不可变性
   - 对象创建后依赖关系不可改变，符合单一职责原则

2. **控制依赖明确**
   - 必要的依赖通过构造器参数明确表达
   - 避免使用可选依赖，使组件职责更清晰

3. **便于测试**
   - 测试时可以方便地通过构造器注入mock对象
   - 避免反射注入带来的测试复杂性

> [!note] 为什么mock测试推荐构造器注入？
> 1. **直接性**: 使用构造器注入，可以直接通过new对象的方式注入mock对象，不需要反射或Spring容器
> ```java
> // 构造器注入方式 - 简单直接
> UserService userService = new UserService(mockRepository, mockEmailService);
> 
> // 字段注入方式 - 需要反射或Spring测试上下文
> @InjectMocks
> UserService userService;
> @Mock
> UserRepository mockRepository;
> ```
>
> 2. **显式依赖**: 构造器参数明确表明了测试需要mock哪些依赖
> 3. **隔离性**: 不依赖Spring容器，可以进行真正的单元测试
> 4. **性能**: 避免启动Spring测试上下文带来的额外开销

1. **循环依赖检测**
   - 构造器注入可以在启动时就检测出循环依赖
   - 避免运行时才发现的依赖问题

2. **代码可读性**
   - 依赖关系在构造器中一目了然
   - 有利于代码审查和维护

**示例：**

```java
@Component
public class ExampleController {
    private final ExampleService exampleService;
    @Autowired
    public ExampleController(ExampleService exampleService) {
        this.exampleService = exampleService; // 构造器注入
    }
}
```

### 2.2 Setter 方法注入

`@Autowired` 也可以作用于 Setter 方法，适用于需要在对象创建后再注入依赖的场景。

**示例：**

```java
@Component
public class ExampleController {
    private ExampleService exampleService;
    @Autowired
    public void setExampleService(ExampleService exampleService) {
        this.exampleService = exampleService; // Setter 方法注入
    }
}
```

### 2.3 字段注入

`@Autowired` 可以直接作用于字段，但不推荐这种方式，因为它不利于测试和维护。

**示例：**

```java
@Component
public class ExampleController {
    @Autowired
    private ExampleService exampleService; // 字段注入
}
```

## 3 **`@Resource` 按名称注入**

`@Resource` 是 JSR-250 规范定义的注解，Spring框架提供了完整支持。与`@Autowired`主要区别在于，`@Resource`默认按名称注入，而不是按类型注入。

### 3.1 基本用法

**示例：**

```java
@Component
public class ExampleController {
    // 查找顺序：
    // 1. 查找名为"exampleService"的bean
    // 2. 如果未找到，查找类型为ExampleService的bean
    // 3. 如果有多个ExampleService类型的bean，再用"exampleService"作为名称匹配
    @Resource
    private ExampleService exampleService; // 按名称注入
}
```

### 3.2 使用场景

1. 字段注入

	```java
	@Component
	public class UserService {
	    @Resource
	    private UserDao userDao;
	}
	```

2. Setter方法注入

	```java
	@Component
	public class UserService {
	    private UserDao userDao;
	    
	    @Resource
	    public void setUserDao(UserDao userDao) {
	        this.userDao = userDao;
	    }
	}
	```

### 3.3 最佳实践建议

1. 使用场景选择
	- 需要类型安全和复杂注入时，使用 `@Autowired`
	- 当明确知道要注入的bean名称时，优先使用 `@Resource`
2. 命名规范
	- bean名称使用驼峰命名法
	- 保持字段名与bean名称一致，减少显式指定name
3. 注入方式
	- 优先使用字段注入（因为 `@Resource` 不支持构造器注入）
	- 需要setter方法时才使用方法注入

> [!summary] @Resource vs @Autowired
>
> | 特性               | @Resource          | @Autowired        |
> |--------------------|--------------------|-------------------|
> | 来源               | JSR-250规范        | Spring框架        |
> | 默认注入方式       | 按名称             | 按类型            |
> | 辅助注解配合       | 不支持@Qualifier   | 支持@Qualifier    |
> | 支持@Primary       | 不支持             | 支持              |
> | 指定名称方式       | name属性           | @Qualifier注解    |
> | 是否支持构造器注入 | 不支持             | 支持              |

## 4 **`@Qualifier` 精确匹配**

当存在多个同类型的 Bean 时，`@Qualifier` 配合 `@Autowired` 一起使用，通过指定 Bean 名称解决冲突。

**示例：**

```java
@Component
public class ExampleController {
    @Autowired
    // 假设 ExampleService 有2个实现类分别为 ExampleServiceA/ExampleServiceB
    @Qualifier("exampleServiceA")
    private ExampleService exampleService; // 指定注入
}
```

## 5 **`@Value` 注入配置属性**

`@Value` 用于将配置文件中的属性值注入到字段中。

**示例：**

```java
@Component
public class ExampleConfig {
    @Value("${app.name}")
    private String appName; // 注入配置文件的属性值
}
```

## 6 **`@Bean` 自定义实例化**

在配置类中，使用 `@Bean` 手动定义一个 Bean，并指定如何实例化。

**示例：**

```java
@Configuration
public class AppConfig {
    @Bean
    public ExampleService exampleService() {
        return new ExampleService(); // 手动实例化
    }
}
```

## 7 **`@Scope` 定义 Bean 的作用域**

通过 `@Scope` 注解可以定义 Bean 的生命周期，例如 `singleton`、`prototype`。

**示例：**

```java
@Component
@Scope("prototype") // 每次调用都会创建一个新实例
public class PrototypeBean {
}
```

## 8 **`@Primary` 指定首选 Bean**

当存在多个同类型的 Bean 时，使用 `@Primary` 标记其中一个为首选。

**示例：**

```java
@Component
@Primary
public class DefaultService implements ExampleService {
    // 默认注入的实现类
}
```

## 9 常用组合与推荐实践

- **优先使用构造器注入**，避免字段注入难以测试的问题。
- 对于复杂注入，结合 `@Autowired` 和 `@Qualifier`。
- 需要更多配置时，优先使用 `@Bean` 方法。
- 使用 `@Value` 从配置文件中获取动态值。
- 结合 `@Primary` 和 `@Resource` 灵活解决多实例问题。

## 10 工厂方法实例化

### 10.1 静态工厂方法

通过调用类的静态方法创建实例，适用于需要通过静态方法提供 Bean 的场景。

**XML 配置：**

```xml
<bean id="exampleBean" class="com.example.ExampleFactory" factory-method="createInstance"/>
```

**Java 配置：**

```java
@Configuration
public class AppConfig {
    @Bean
    public ExampleBean exampleBean() {
        return ExampleFactory.createInstance(); // 静态工厂方法
    }
}
```

### 10.2 实例工厂方法

通过工厂类的实例方法创建对象，适用于需要使用工厂类提供复杂的初始化逻辑时。

**XML 配置：**

```xml
<bean id="exampleFactory" class="com.example.ExampleFactory"/>
<bean id="exampleBean" factory-bean="exampleFactory" factory-method="createInstance"/>
```

**Java 配置：**

```java
@Configuration
public class AppConfig {
    @Bean
    public ExampleFactory exampleFactory() {
        return new ExampleFactory(); // 工厂实例
    }

    @Bean
    public ExampleBean exampleBean() {
        return exampleFactory().createInstance(); // 实例工厂方法
    }
}
```

### 10.3 静态工厂 vs 实例工厂对比

| 对比点     | 静态工厂                     | 实例工厂                               |
| ---------- | ---------------------------- | -------------------------------------- |
| 调用方式   | 通过静态方法调用             | 需要先创建工厂类实例，再调用其实例方法 |
| 配置复杂度 | 较简单，只需指定类和静态方法 | 较复杂，需要配置工厂 Bean 和工厂方法   |
| 使用场景   | 工厂方法不依赖类的实例状态   | 工厂方法需要维护状态                   |
| 推荐程度   | 推荐，使用更简洁             | 在必要时使用                           |

### 10.4 常用组合与场景选择

1. 初始化逻辑简单时：
   - 优先使用**静态工厂方法**或注解方式
2. 需要复杂初始化逻辑时：
   - 使用**实例工厂方法**
3. 推荐实践：
   - 尽量通过注解方式实例化对象
   - 工厂方法仅适用于特殊场景

通过这些注解和方法，Spring 能灵活地管理和注入对象依赖，满足大多数场景需求。
