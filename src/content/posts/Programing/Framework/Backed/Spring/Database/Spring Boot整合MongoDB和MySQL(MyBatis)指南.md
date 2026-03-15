---
tags: 
title: Spring Boot整合MongoDB和MySQL(MyBatis)指南
date created: 2024-10-15 07:03:18
date modified: 2026-03-14 09:35:37
date: 2026-03-15 02:52:39
---

# Spring Boot整合MongoDB和MySQL(MyBatis)指南

## 1 添加依赖

在您的`pom.xml`文件中添加以下依赖:

```xml
<!-- MongoDB依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>

<!-- MySQL和MyBatis依赖 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.2.0</version>
</dependency>
```

## 2 配置数据源

在`application.properties`或`application.yml`文件中添加MongoDB和MySQL的连接配置:

```yaml
# MongoDB配置
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/yourmongodb

# MySQL配置
  datasource:
    url: jdbc:mysql://localhost:3306/yourmysqldb
    username: your_username
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver

# MyBatis配置
mybatis:
  mapper-locations: classpath:mappers/*.xml
  type-aliases-package: com.yourpackage.model
```

## 3 MongoDB配置

### 3.1 创建MongoDB实体类

```java
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class MongoUser {
    @Id
    private String id;
    private String name;
    private String email;

    // 构造函数、getter和setter方法
}
```

### 3.2 创建MongoDB Repository

```java
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoUserRepository extends MongoRepository<MongoUser, String> {
    MongoUser findByName(String name);
}
```

## 4 MySQL和MyBatis配置

### 4.1 创建MySQL实体类

```java
public class SqlUser {
    private Long id;
    private String name;
    private String email;

    // 构造函数、getter和setter方法
}
```

### 4.2 创建MyBatis Mapper接口

```java
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SqlUserMapper {
    SqlUser findById(Long id);
    void insert(SqlUser user);
    // 其他CRUD方法
}
```

### 4.3 创建MyBatis XML映射文件

在`src/main/resources/mappers`目录下创建`SqlUserMapper.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.yourpackage.mapper.SqlUserMapper">
    <select id="findById" resultType="com.yourpackage.model.SqlUser">
        SELECT * FROM users WHERE id = #{id}
    </select>
    <insert id="insert" parameterType="com.yourpackage.model.SqlUser">
        INSERT INTO users (name, email) VALUES (#{name}, #{email})
    </insert>
    <!-- 其他CRUD操作 -->
</mapper>
```

## 5 使用示例

### 5.1 MongoDB操作示例

```java
@Service
public class MongoUserService {
    @Autowired
    private MongoUserRepository mongoUserRepository;

    public MongoUser createUser(MongoUser user) {
        return mongoUserRepository.save(user);
    }

    public MongoUser getUserByName(String name) {
        return mongoUserRepository.findByName(name);
    }
}
```

### 5.2 MySQL操作示例

```java
@Service
public class SqlUserService {
    @Autowired
    private SqlUserMapper sqlUserMapper;

    public SqlUser getUserById(Long id) {
        return sqlUserMapper.findById(id);
    }

    public void createUser(SqlUser user) {
        sqlUserMapper.insert(user);
    }
}
```

## 6 事务管理

需要注意的是，MongoDB和MySQL使用不同的事务管理器。如果需要在服务中同时操作两个数据源，您需要小心处理事务。

对于跨数据源的复杂操作，可以考虑使用分布式事务管理器，如Atomikos。

## 7 结论

通过以上步骤，您已经成功地在Spring Boot项目中同时整合了MongoDB和MySQL（使用MyBatis）。这种配置允许您根据需求灵活地使用不同的数据存储解决方案。

记得根据您的具体需求调整配置和代码。在实际应用中，您可能需要考虑更多因素，如连接池配置、性能优化等。
