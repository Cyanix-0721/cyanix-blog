---
tags: [Java]
title: Java 对象类型总结
date created: 2024-10-14 15:47:03
date modified: 2026-03-14 09:35:20
date: 2026-03-15 02:52:39
---

# Java 对象类型总结

## 1 数据模型对象

### 1.1 POJO (Plain Old Java Object)

- **定义**：最基本的 Java 对象，没有特殊限制，不依赖于特定框架。
- **使用场景**：可用于任何需要简单 Java 对象的地方。
- **特点**：简单，灵活，不受框架约束。
- **示例**：

  ```java
  public class Person {
      private String name;
      private int age;
      // Getters and setters
  }
  ```

### 1.2 Entity (实体)

- **定义**：代表持久化到数据库的对象。
- **使用场景**：ORM（对象关系映射）中，直接映射到数据库表。
- **特点**：通常带有 ORM 框架的注解，如 JPA 注解。
- **示例**：

  ```java
  @Entity
  @Table(name = "users")
  public class User {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;
      
      @Column(name = "username", nullable = false)
      private String username;
      
      // Other fields, getters, and setters
  }
  ```

### 1.3 Model

- **定义**：表示应用程序的核心数据模型。
- **使用场景**：在 MVC 架构中代表 "M"（模型）。
- **特点**：可能包含一些业务逻辑。
- **包名示例**：`com.example.models`

### 1.4 Domain

- **定义**：在领域驱动设计(DDD)中表示核心业务概念的对象。
- **使用场景**：实现复杂的业务逻辑和规则，尤其在使用DDD的项目中。
- **特点**：
  - 封装了业务逻辑和规则
  - 可能包含行为（方法）和状态（属性）
  - 通常是有状态的，可变的对象
- **包名示例**：`com.example.domain`
- **示例**：

  ```java
  public class Order {
      private List<OrderLine> orderLines;
      private Customer customer;
      private OrderStatus status;

      public void addOrderLine(Product product, int quantity) {
          // Business logic for adding an order line
      }

      public BigDecimal calculateTotalPrice() {
          // Business logic for calculating the total price
      }

      public void confirm() {
          // Business logic for confirming the order
      }
  }
  ```

### 1.5 JavaBean

- **定义**：符合特定命名约定的 Java 类。
- **使用场景**：常用于 Java EE 开发，尤其是在图形化开发工具和框架中。
- **特点**：
  - 有一个公共的无参构造函数
  - 属性通过 getter 和 setter 方法访问
  - 可序列化（实现 Serializable 接口）
- **包名示例**：`com.example.beans`
- **示例**：

  ```java
  public class PersonBean implements Serializable {
      private String name;
      private int age;

      public PersonBean() {}

      public String getName() {
          return name;
      }

      public void setName(String name) {
          this.name = name;
      }

      public int getAge() {
          return age;
      }

      public void setAge(int age) {
          this.age = age;
      }
  }
  ```

## 2 数据传输对象

### 2.1 DTO (Data Transfer Object)

- **定义**：用于在不同层或系统间传输数据的对象。
- **使用场景**：在网络传输中，或在应用程序的不同层之间传递数据。
- **特点**：通常只包含数据，没有业务逻辑。
- **示例**：

  ```java
  public class UserDTO {
      private String username;
      private String email;
      // Getters and setters
  }
  ```

## 3 视图对象

### 3.1 VO as Value Object (值对象)

- **定义**：代表一个特定的值或概念。
- **使用场景**：表示一个具有特定含义的值，如金钱、日期范围等。
- **特点**：通常是不可变的，可能包含一些简单的业务逻辑。
- **示例**：

  ```java
  public final class Money {
      private final BigDecimal amount;
      private final String currency;
      
      // Constructor, getters (no setters for immutability)
  }
  ```

### 3.2 VO as View Object (视图对象)

- **定义**：用于展示层的对象，包含要在用户界面上显示的数据。
- **使用场景**：在 Web 应用的展示层使用。
- **特点**：可能组合多个领域对象的数据，包含格式化后的数据。
- **示例**：

  ```java
  public class UserProfileVO {
      private String fullName;
      private String formattedBirthDate;
      private String avatarUrl;
      private List<String> hobbies;
      
      // Getters, setters, and methods for UI-specific logic
  }
  ```

## 4 业务对象

### 4.1 BO (Business Object)

- **定义**：封装业务逻辑和数据的对象。
- **使用场景**：在业务层实现核心业务逻辑。
- **特点**：包含业务规则和处理逻辑，可能聚合多个实体或数据源的信息。
- **示例**：

  ```java
  public class OrderBO {
      private Long orderId;
      private List<OrderItemBO> items;
      private OrderStatus status;
      
      public BigDecimal calculateTotalPrice() {
          // Business logic to calculate total price
      }
      
      public void cancel() {
          // Business logic for order cancellation
      }
      
      // Other business methods
  }
  ```

## 5 总结

选择使用哪种类型的对象取决于多个因素，包括:

- 项目的架构风格（如分层架构、领域驱动设计等）
- 使用的框架或技术栈
- 团队的约定和偏好
- 对象在应用程序中的具体用途

重要的是在项目中保持一致性，并确保团队成员都理解这些命名约定的含义。在某些情况下，可能需要在项目文档中明确定义这些术语，以避免混淆。

各种对象类型之间的主要区别：

- POJO 是最基础和通用的
- Entity 专注于数据持久化
- Model 可能包含一些业务逻辑
- Domain 对象在 DDD 中使用，包含核心业务逻辑和规则
- JavaBean 遵循特定的命名约定，常用于 Java EE 开发
- DTO 专注于数据传输
- VO (Value Object) 代表特定的值或概念
- VO (View Object) 用于数据展示
- BO 封装业务逻辑和数据处理

选择合适的对象类型可以提高代码的组织性、可维护性和可读性。
