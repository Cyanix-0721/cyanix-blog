---
tags:
  - SpringBoot
  - Monitor
---

# Spring Boot Admin

## 1 简介

Spring Boot Admin 是一个管理和监控 Spring Boot 应用的开源项目。它提供了可视化界面，用于查看 Spring Boot 应用的健康状态、日志、环境变量等信息，适合于单体或分布式架构下的应用监控。

> [!info]  
>
> [Spring Boot Admin – Spring Boot Admin Server](https://docs.spring-boot-admin.com/current/server.html)  
> [Spring Boot Admin – Client Applications](https://docs.spring-boot-admin.com/current/client.html)

## 2 安装与配置

### 2.1 引入依赖

在 `pom.xml` 中添加 Spring Boot Admin 的依赖：

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-server</artifactId>
    <version>3.3.4</version> <!-- 根据实际版本调整 -->
</dependency>
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
    <version>3.3.4</version>
</dependency>
```

### 2.2 配置 Spring Boot Admin Server

创建一个 Spring Boot 应用作为 Admin Server。在 `application.yml` 中进行配置：

```yaml
server:
  port: 8080

spring:
  application:
    name: admin-server

spring.boot.admin:
  ui:
    title: "Spring Boot Admin Dashboard"
```

### 2.3 配置 Admin Client

在被监控的 Spring Boot 应用中引入 Client 依赖，并配置将应用注册到 Admin Server。

`pom.xml` 中添加：

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
    <version>3.3.4</version>
</dependency>
```

`application.yml` 中配置：

```yaml
spring:
  application:
    name: client-application

spring.boot.admin.client:
  url: http://localhost:8080 # Admin Server 的地址
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

## 3 启动应用

- 启动 Spring Boot Admin Server。
- 启动被监控的应用，它们将自动注册到 Admin Server 中。

## 4 功能详解

### 4.1 应用列表

在 Spring Boot Admin Dashboard 中，你可以看到所有注册到 Admin Server 的应用列表，包括应用名称、状态、健康检查等。

### 4.2 详细信息

点击某个应用，可以查看该应用的详细信息，包括：

- **健康状态**：显示各个健康检查指标的结果。
- **环境变量**：查看应用的环境配置。
- **日志**：实时查看和搜索应用日志。
- **JVM 指标**：展示 JVM 的各项指标，如内存使用情况、GC 等。

### 4.3 通知

Spring Boot Admin 支持通过邮件、Slack、Webhook 等方式发送通知，提醒管理员应用的状态变化。

配置邮件通知示例：

```yaml
spring.boot.admin.notify:
  mail:
    enabled: true
    from: admin@example.com
    to: admin@example.com
    smtp:
      host: smtp.example.com
      port: 587
      username: your-username
      password: your-password
      properties:
        mail.smtp.starttls.enable: true
```

## 5 高级配置

### 5.1 安全配置

为了保护 Admin Server 的管理页面，可以配置基本的 HTTP 身份验证：

```yaml
spring.security:
  user:
    name: admin
    password: admin
```

### 5.2 自定义实例显示

你可以通过设置 `spring.boot.admin.metadata` 属性来自定义显示的应用信息：

```yaml
spring.boot.admin.client:
  instance:
    metadata:
      user.name: "admin-user"
      user.contact: "admin@example.com"
```

## 6 部署和运维

### 6.1 生产环境建议

- **高可用**：使用多实例部署 Admin Server，结合负载均衡器确保高可用性。
- **监控和告警**：结合 Spring Boot Admin 与其他监控系统（如 Prometheus、Grafana）搭建完整的监控和告警体系。

## 7 总结

Spring Boot Admin 提供了强大的监控和管理功能，使得对 Spring Boot 应用的健康监控、日志分析和配置管理变得更为简便。通过配置 UI、自定义通知、集成安全等功能，可以打造更加全面的应用监控平台。
