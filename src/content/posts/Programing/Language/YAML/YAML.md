# YAML 入门指南

> [!note] [YAML](https://yaml.org/)

YAML (YAML Ain't Markup Language) 是一种人类可读的数据序列化语言，常用于配置文件、数据交换和对象持久化。它以简洁、易读的语法著称，被广泛应用于 Ansible、Docker Compose、Kubernetes 等工具中。

## 1 YAML 的优势

* **易读性：** YAML 使用缩进和简单的符号来表示结构，避免了繁琐的标签和括号。
* **简洁性：** YAML 语法简洁明了，减少了冗余信息，提高了编写效率。
* **表达能力：** YAML 支持多种数据类型，包括标量、序列、映射，能够灵活地表示复杂的数据结构。
* **可移植性：** YAML 是一种跨平台的语言，可以在不同的操作系统和编程环境中使用。

## 2 YAML 基本语法

### 2.1 文件格式

YAML 文件扩展名通常为 `.yaml` 或 `.yml`。

### 2.2 缩进

* YAML 使用缩进来表示层级关系，相同缩进的元素属于同一级别。通常使用**两个空格**作为缩进单位，**切勿使用制表符**。
* 冒号 `:` 后面必须有空格。

```yaml
key1: value1
key2: 
  subkey1: subvalue1
  subkey2: subvalue2
```

### 2.3 注释

YAML 使用 `#` 符号表示注释，注释内容从 `#` 开始到行尾结束。

```yaml
# 这是一个注释
key: value  # 行内注释
```

### 2.4 大小写敏感

YAML 是大小写敏感的，`key` 和 `Key` 是不同的键。

### 2.5 数据类型

* **标量（Scalars）：** 表示单个值，包括字符串、数字、布尔值、null。
	* 字符串可以不加引号，但包含特殊字符时需要用单引号或双引号括起来。
	* 数字包括整数、浮点数和科学计数法。
	* 布尔值表示为 `true` 或 `false`。
	* null 表示为空，可以写为 `null` 或 `~`。
* **序列（Sequences）：** 表示有序列表，使用 `-` 开头的行表示列表项。
* **映射（Mappings）：** 表示键值对，使用冒号 `:` 分隔键和值。

### 2.6 示例

```yaml
# 标量
name: John Doe
age: 30
isStudent: true
score: 98.5
address: null

# 序列
fruits:
  - apple
  - banana
  - orange

# 映射
person:
  name: John Doe
  age: 30
  address:
    street: 123 Main St
    city: Anytown
    state: CA
    zip: 12345
```

## 3 YAML 高级语法

### 3.1 锚点（Anchors）和别名（Aliases）

* **锚点：** 使用 `&` 定义锚点，用于标记一个节点。
* **别名：** 使用 `*` 定义别名，用于引用锚点标记的节点。

```yaml
defaults: &defaults
  adapter: postgres
  host: localhost

development:
  database: myapp_development
  <<: *defaults

test:
  database: myapp_test
  <<: *defaults
```

### 3.2 标签（Tags）

* **标签：** 使用 `!` 定义标签，用于显式指定数据类型。
* **自定义标签：** 可以使用 `!` 后跟自定义标签名来表示自定义数据类型。

```yaml
date: !timestamp '2024-05-30'
person: !Person
  name: John Doe
  age: 30
```

### 3.3 多行字符串

* **折叠式（Folded Style）：** 使用 `>` 表示，将多行文本合并为一行，保留换行符。
* **字面量式（Literal Style）：** 使用 `|` 表示，保留多行文本的原始格式，包括换行符和缩进。

```yaml
folded: >
  This is a
  folded string.

literal: |
  This is a
  literal string.
```

### 3.4 特殊字符转义

* **特殊字符：** YAML 中的一些字符具有特殊含义，需要使用 `\` 进行转义。
* **常用转义字符：** `\`, `"`, `:`, `#`, `[]`, `{}`, `|`, `>`, `*`, `&`, `!`

```yaml
string: "This is a string with a \"quote\"."
```

## 4 自定义参数及应用

在 Spring Boot 项目中，YAML 常用于配置文件（如 `application.yml`）。您可以定义自定义属性，并在运行时通过命令行参数或环境变量覆盖它们。

**主配置文件应用：**

Spring Boot 默认会自动加载 `classpath` 下的 `application.yml` 或 `application.properties` 文件作为主配置文件。

### 4.1 多配置文件

Spring Boot 支持多配置文件，可以在不同的环境下使用不同的配置文件。例如：

* `application.yml`：主配置文件，包含所有环境通用的配置。
* `application-dev.yml`：开发环境配置文件，包含开发环境特有的配置。
* `application-prod.yml`：生产环境配置文件，包含生产环境特有的配置。

Spring Boot 会按照以下顺序加载配置文件：

1. `application.yml`
2. `application-{profile}.yml` (例如 `application-dev.yml`)

可以通过 `spring.profiles.active` 属性来指定当前激活的 profile。

### 4.2 YAML 参数注入实体类示例

```yaml
# application.yml
person:
  name: John Doe
  age: 30
```

```java
// Person.java
// Spring 扫描 @Component 创建 bean 实例到 IoC 容器
@Component
// 配置文件查找前缀 "person"
@ConfigurationProperties(prefix = "person")
public class Person {
    private String name;
    private int age;

    // getters and setters
}
```

```java
// MyController.java
@RestController
public class MyController {

    @Autowired
    private Person person;

    @GetMapping("/person")
    public Person getPerson() {
        return person;
    }
}
```

**解释：**

1. 在 `application.yml` 中定义 `person` 属性。
2. 创建一个 `Person` 类，使用 `@Component` 注解使其成为 Spring 组件，使用 `@ConfigurationProperties(prefix = "person")` 注解将配置文件中的 `person` 属性绑定到该类的属性上。
3. 在 `MyController` 中注入 `Person` 对象，并通过接口返回。

## 5 项目启动时修改参数

### 5.1 命令行参数

使用 `--` 选项可以在启动时覆盖配置文件中的属性。

```bash
java -jar myapp.jar --server.port=9090
```

### 5.2 环境变量

使用环境变量也可以覆盖配置文件中的属性。

```bash
export SERVER_PORT=9090
java -jar myapp.jar
```
