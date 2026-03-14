# Mockito

在 Java 开发中，**Mock** 是一种常用的测试技术，主要用于**模拟对象的行为**，以便在单元测试中隔离和测试目标代码。通过模拟外部依赖（如数据库、网络请求、第三方服务等）的行为，Mock 可以让测试更加独立且可控。这样，开发者只需关注业务逻辑的正确性，而不必依赖实际的外部环境或资源。

在 Java 测试框架中，**Mockito** 是最常用的 mock 框架之一，它简化了 mock 对象的创建和行为模拟，使编写单元测试更加便捷。Mockito 允许我们轻松地模拟接口或类的行为、定义方法调用的返回值、验证方法调用等。此外，Mockito 与 Spring 框架集成得非常好，通过 Spring 提供的 `@MockBean` 注解，可以方便地将 mock 对象注入到测试环境中。

接下来，我们将结合 Spring Boot 和 Mockito，介绍如何使用 mock 技术对依赖的服务进行单元测试。

## 1 添加依赖

在 Spring Boot 项目中，只需添加 `spring-boot-starter-test` 依赖即可自动引入 Mockito、JUnit 等常用的测试框架：

### 1.1 Maven:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

### 1.2 Gradle:

```groovy
testImplementation 'org.springframework.boot:spring-boot-starter-test'
```

这个依赖会引入 Mockito，因此不需要单独引入 Mockito 的依赖。

## 2 示例场景

假设我们有一个 `UserService` 类依赖于一个外部 `DatabaseService`，我们希望使用 Mockito 对 `DatabaseService` 进行 mock，以便单元测试 `UserService` 的逻辑。

### 2.1 `UserService.java`

```java
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final DatabaseService databaseService;

    public UserService(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    public String getUserRole(int userId) {
        User user = databaseService.findUserById(userId);
        return (user != null) ? user.getRole() : "Unknown";
    }
}
```

### 2.2 `DatabaseService.java`

```java
import org.springframework.stereotype.Service;

@Service
public class DatabaseService {

    public User findUserById(int userId) {
        // 假设这里是调用数据库的逻辑
        return new User(userId, "default");
    }
}
```

### 2.3 `User.java`

```java
public class User {
    private int id;
    private String role;

    public User(int id, String role) {
        this.id = id;
        this.role = role;
    }

    public String getRole() {
        return role;
    }
}
```

## 3 编写测试类

使用 Spring 的 `@MockBean` 注解，可以轻松创建 `DatabaseService` 的 mock 实例，并注入到 `UserService` 中，从而只测试业务逻辑，避免依赖实际的数据库操作。

```java
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @MockBean
    private DatabaseService databaseService;

    @Test
    public void testGetUserRole() {
        // 设置 mock 行为
        User mockUser = new User(1, "admin");
        when(databaseService.findUserById(1)).thenReturn(mockUser);

        // 调用被测试方法
        String role = userService.getUserRole(1);

        // 验证结果
        assertEquals("admin", role);

        // 验证调用次数
        verify(databaseService).findUserById(1);
    }

    @Test
    public void testGetUserRoleForUnknownUser() {
        // 模拟找不到用户
        when(databaseService.findUserById(2)).thenReturn(null);

        // 调用被测试方法
        String role = userService.getUserRole(2);

        // 验证结果
        assertEquals("Unknown", role);
    }
}
```

## 4 解释

- **`@MockBean`**：Spring 提供的注解，用于在测试上下文中创建并注入 mock 对象。这是测试中最常用的方式，避免了手动创建 mock 对象和注入的繁琐步骤。
  
- **Mockito 的使用**：
  - **`when(...).thenReturn(...)`**：用于模拟依赖对象的行为，比如在这里模拟了 `findUserById` 方法的返回值。
  - **`verify(...)`**：验证 mock 对象的方法是否被调用，以及调用的次数。
  
- **自动注入**：通过 `@Autowired` 自动将 `UserService` 和 `DatabaseService` mock 对象注入，确保 `UserService` 的测试独立于实际的数据库操作。

## 5 总结

通过 `spring-boot-starter-test`，可以在 Spring Boot 项目中方便地整合 Mockito 进行单元测试。`@MockBean` 简化了 mock 对象的创建和注入，确保了测试的独立性和可控性。这样，可以轻松测试业务逻辑，而无需依赖外部资源。

这个示例展示了如何通过 mock 对象实现业务逻辑的隔离测试，帮助开发者更高效地进行单元测试。
