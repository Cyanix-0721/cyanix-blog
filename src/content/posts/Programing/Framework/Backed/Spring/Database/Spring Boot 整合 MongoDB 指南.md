---
tags: 
title: Spring Boot 整合 MongoDB 指南
date created: 2024-10-15 07:02:30
date modified: 2026-03-14 09:35:37
date: 2026-03-15 02:52:39
---

# Spring Boot 整合 MongoDB 指南

## 1 添加依赖

首先, 在您的 `pom.xml` 文件中添加以下依赖:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

## 2 配置 MongoDB 连接

在 `application.properties` 或 `application.yml` 文件中添加 MongoDB 的连接配置:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/yourdatabase
```

或者使用 YAML 格式:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/yourdatabase
```

## 3 创建实体类

创建一个代表 MongoDB 文档的实体类:

```java
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;

    // 构造函数、getter和setter方法
}
```

## 4 创建 Repository 接口

创建一个继承自 `MongoRepository` 的接口:

```java
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    User findByName(String name);
}
```

## 5 使用 Repository

在您的服务或控制器中注入并使用 Repository:

```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User getUserByName(String name) {
        return userRepository.findByName(name);
    }

    // 其他CRUD操作方法
}
```

## 6 测试连接

创建一个简单的测试类来验证连接:

```java
@SpringBootTest
class MongoDbConnectionTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testConnection() {
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");

        User savedUser = userRepository.save(user);
        assertNotNull(savedUser.getId());
    }
}
```

## 7 结论

通过以上步骤, 您已经成功地在 Spring Boot 项目中整合了 MongoDB。您可以使用 `MongoRepository` 接口进行基本的 CRUD 操作, 也可以根据需要自定义查询方法。

记得根据您的具体需求调整配置和代码。如果您需要更复杂的查询或操作, 可以考虑使用 `MongoTemplate` 或自定义查询方法。
