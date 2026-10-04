---
tags: [Java]
title: Java 对象类型总结
date created: 2024-10-14 15:47:03
date modified: 2026-10-04 00:50:00
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

## 6 Entity 与 DTO 的取舍

在软件开发中，`entity`（实体）和`DTO`（数据传输对象）分别有不同的用途和使用场景。确定使用哪一个取决于具体的需求和应用场景。下面将详细介绍`entity`和`DTO`的区别、适用场景以及如何在不同情况下做出选择。

### 6.1 Entity

**定义**：`entity`通常代表数据库中的表或集合中的对象。它们与数据库中的数据直接映射，通常包含业务逻辑和数据持久化的相关信息。

**特点**：

1. **与数据库紧密耦合**：`entity`类通常与数据库表结构一一对应。
2. **包含业务逻辑**：可以包含业务逻辑方法。
3. **数据持久化**：使用ORM框架（如Hibernate、JPA）进行数据持久化。

**适用场景**：

1. **数据持久化**：在需要与数据库交互的场景中，使用`entity`类。
2. **业务逻辑处理**：在需要在对象上执行业务逻辑的场景中使用。
3. **直接映射数据库表**：当需要直接操作数据库表数据时。

### 6.2 DTO

**定义**：`DTO`（Data Transfer Object）是用于在不同层之间传输数据的对象。通常用于传输数据而不包含业务逻辑。

**特点**：

1. **与数据库解耦**：DTO与数据库表结构无关，只用于数据传输。
2. **无业务逻辑**：通常不包含业务逻辑，仅用于封装数据。
3. **轻量级**：相对于`entity`，DTO通常更加轻量，仅包含需要传输的数据。

**适用场景**：

1. **数据传输**：在不同层（如服务层和控制层）之间传递数据时使用。
2. **API接口**：在设计API接口时，使用DTO传输数据以保证接口的稳定性和数据格式的控制。
3. **安全性**：隐藏内部数据结构，仅暴露需要传输的字段，提升安全性。

### 6.3 选择指南

1. **持久化和业务逻辑**：
   * 如果需要与数据库直接交互，并且需要在对象上处理业务逻辑，选择`entity`。
   * 例如：保存用户数据到数据库，或者处理订单业务逻辑。

2. **数据传输**：
   * 如果需要在不同层之间传输数据，选择`DTO`。
   * 例如：前端和后端之间的数据交换，或微服务之间的数据传递。

3. **性能和安全性考虑**：
   * 使用DTO可以减少数据传输量，提高传输效率。
   * 使用DTO可以隐藏不必要的字段，增强数据安全性。

### 6.4 实践示例

**Entity示例**：

```java
@Entity
public class User {
    @Id
    private Long id;
    private String username;
    private String password;
    
    // getters and setters
}
```

**DTO示例**：

```java
public class UserDTO {
    private Long id;
    private String username;
    
    // getters and setters
}
```

**使用示例**：

```java
// Service layer - using entity
public User getUser(Long id) {
    return userRepository.findById(id);
}

// Controller layer - using DTO
public UserDTO getUserDTO(Long id) {
    User user = userService.getUser(id);
    UserDTO userDTO = new UserDTO();
    userDTO.setId(user.getId());
    userDTO.setUsername(user.getUsername());
    return userDTO;
}
```

## 7 相关

* 领域驱动设计中的实体、值对象、聚合等概念见 [[领域驱动设计（DDD）模式概述]]。
* 减少样板代码见 [[Lombok]]。
