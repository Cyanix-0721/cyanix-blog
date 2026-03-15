---
tags: 
title: Dubbo
date created: 2024-11-12 02:46:33
date modified: 2026-03-14 09:35:36
date: 2026-03-15 02:52:39
---

# Dubbo

本文将详细介绍 Apache Dubbo 的使用，包括其基本概念、核心功能，以及在 Spring Boot 3 中如何集成和使用 Dubbo。

## 1 一、Dubbo 简介

[Apache Dubbo](https://dubbo.apache.org) 是一款高性能、轻量级的开源 Java RPC 框架，提供基于接口的远程调用能力。它支持多种协议、序列化方式和注册中心，具备自动负载均衡、服务自动注册与发现、高可用等特性，是构建分布式服务应用的理想选择。

## 2 二、Dubbo 的核心概念

- **服务提供者（Provider）**：暴露服务的提供方。
- **服务消费者（Consumer）**：调用远程服务的调用方。
- **注册中心（Registry）**：服务注册与发现的中心。
- **监控中心（Monitor）**：统计服务的调用次数和时间的统计分析。
- **远程调用（RPC）**：通过网络调用远程方法，就像调用本地方法一样。

## 3 三、Dubbo 的主要特性

- **透明化的远程方法调用**：像调用本地方法一样调用远程方法，屏蔽了底层通信细节。
- **智能负载均衡**：内置多种负载均衡策略，如随机、轮询、最少活跃调用数等。
- **高可用性**：支持失败自动切换、失败重试等机制，保证服务的高可用。
- **可扩展性**：提供丰富的扩展点，支持自定义协议、注册中心、负载均衡策略等。

## 4 四、在 Spring Boot 3 中集成 Dubbo

### 4.1 添加 Maven 依赖

在 `pom.xml` 文件中添加以下依赖：

```xml
<!-- Dubbo Spring Boot Starter -->
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>3.2.1</version>
</dependency>

<!-- Spring Boot Web Starter -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Nacos Client，用于注册中心 -->
<dependency>
    <groupId>com.alibaba.nacos</groupId>
    <artifactId>nacos-client</artifactId>
    <version>2.2.3</version>
</dependency>
```

### 4.2 配置注册中心（以 Nacos 为例）

在 `application.yml` 文件中添加以下配置：

```yaml
spring:
  application:
    name: dubbo-demo-provider # 服务名称

dubbo:
  registry:
    address: nacos://localhost:8848 # Nacos 注册中心地址
  scan:
    base-packages: com.example.dubbo.service # 扫描服务的包路径
  protocol:
    name: dubbo
    port: 20880 # Dubbo 服务端口
```

### 4.3 编写服务提供者

#### 4.3.1 A. 定义服务接口

```java
package com.example.dubbo.service;

public interface GreetingService {
    String sayHello(String name);
}
```

#### 4.3.2 B. 实现服务接口

```java
package com.example.dubbo.service.impl;

import com.example.dubbo.service.GreetingService;
import org.apache.dubbo.config.annotation.DubboService;

@DubboService(version = "1.0.0")
public class GreetingServiceImpl implements GreetingService {
    @Override
    public String sayHello(String name) {
        return "Hello, " + name + "!";
    }
}
```

#### 4.3.3 C. 启动类

```java
package com.example.dubbo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DubboProviderApplication {
    public static void main(String[] args) {
        SpringApplication.run(DubboProviderApplication.class, args);
    }
}
```

### 4.4 编写服务消费者

在另一个项目中，添加相同的 Dubbo 和 Nacos 依赖。

#### 4.4.1 A. 配置文件

```yaml
spring:
  application:
    name: dubbo-demo-consumer

dubbo:
  registry:
    address: nacos://localhost:8848
  scan:
    base-packages: com.example.dubbo.service
```

#### 4.4.2 B. 调用远程服务

```java
package com.example.dubbo.controller;

import com.example.dubbo.service.GreetingService;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GreetingController {

    @DubboReference(version = "1.0.0")
    private GreetingService greetingService;

    @GetMapping("/hello")
    public String sayHello(String name) {
        return greetingService.sayHello(name);
    }
}
```

#### 4.4.3 C. 启动类

```java
package com.example.dubbo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DubboConsumerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DubboConsumerApplication.class, args);
    }
}
```

### 4.5 测试服务

1. **启动 Nacos 注册中心**：下载并启动 Nacos Server。
2. **启动服务提供者**：运行 `DubboProviderApplication`。
3. **启动服务消费者**：运行 `DubboConsumerApplication`。
4. **访问接口**：在浏览器中访问 `http://localhost:8080/hello?name=Dubbo`，应得到返回结果 `Hello, Dubbo!`。

## 5 五、Dubbo 配置详解

### 5.1 注册中心配置

Dubbo 支持多种注册中心，常用的有 Zookeeper、Nacos 等。

```yaml
dubbo:
  registry:
    address: nacos://localhost:8848
```

如果使用 Zookeeper：

```yaml
dubbo:
  registry:
    address: zookeeper://localhost:2181
```

### 5.2 协议配置

Dubbo 默认使用 Dubbo 协议，可以根据需要更改：

```yaml
dubbo:
  protocol:
    name: dubbo
    port: 20880
```

### 5.3 服务版本与分组

在服务提供者和消费者中，可以通过 `version` 和 `group` 来区分不同的服务版本和分组：

```java
// 服务提供者
@DubboService(version = "1.0.0", group = "test")
public class GreetingServiceImpl implements GreetingService {
    // ...
}

// 服务消费者
@DubboReference(version = "1.0.0", group = "test")
private GreetingService greetingService;
```

### 5.4 负载均衡与集群容错

Dubbo 提供多种负载均衡策略和集群容错机制，可在配置中指定：

```yaml
dubbo:
  consumer:
    loadbalance: random # 负载均衡策略：random、roundrobin、leastactive 等
    cluster: failover    # 集群容错：failover、failfast、failsafe 等
```

## 6 六、Dubbo 常见问题

### 6.1 服务调用失败

- **检查注册中心是否正常运行**。
- **确认服务提供者已成功注册服务**。
- **确保消费者与提供者的服务接口、版本、分组一致**。

### 6.2 序列化问题

Dubbo 默认使用 Hessian2 序列化，若需更改，可在配置中指定：

```yaml
dubbo:
  protocol:
    serialization: kryo # 其他可选项：fastjson、fst 等
```
