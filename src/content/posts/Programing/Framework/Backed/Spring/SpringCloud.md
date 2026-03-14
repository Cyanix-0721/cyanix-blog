---
tags:
  - "#SpringCloud"
  - RESTful
  - SpringBoot
  - Dubbo
  - RestTemplate
  - Eureka
  - Actuator
  - Nacos
  - LoadBalance
  - OpenFegin
  - RocketMQ
---

# Spring Cloud：构建微服务的利器

## 1 微服务架构：从单体到分布式

随着互联网应用的复杂度不断提升，传统的单体架构逐渐暴露出问题：

* **代码耦合度高：** 难以维护和扩展
* **部署不灵活：** 牵一发而动全身
* **技术栈受限：** 难以引入新技术

微服务架构应运而生，将应用拆分为一系列独立的服务，每个服务专注于单一业务功能。这些服务之间通过轻量级协议（如HTTP、RPC）进行通信。

**微服务的共同特点：**

* **独立部署：** 每个服务可以独立开发、测试、部署和扩展
* **技术异构性：** 不同服务可以使用不同的编程语言、数据库和技术栈
* **弹性伸缩：** 根据负载情况动态调整服务实例数量
* **故障隔离：** 服务之间相互隔离，单个服务的故障不会影响整个系统
* **去中心化治理：** 服务注册与发现、配置管理、负载均衡等功能通常由独立的组件或平台提供

## 2 Spring Cloud vs. Dubbo: 两大微服务框架

Spring Cloud和Dubbo是Java领域两大流行的微服务框架，它们都提供了丰富的功能，帮助开发者快速构建和管理微服务应用。

> [!note]  
> [Spring Cloud](https://spring.io/projects/spring-cloud)  
> [Dubbo](https://dubbo.apache.org/zh-cn/)

**Spring Cloud：**

* **一站式解决方案：** 提供了微服务开发所需的全套组件，包括服务发现、配置管理、断路器、网关等
* **与Spring生态无缝集成：** 构建于Spring Boot之上，方便使用Spring框架的开发者
* **丰富的功能：** 支持多种通信协议（REST、gRPC等）、多种数据存储方式、多种安全机制等
* **活跃的社区：** 拥有庞大的用户群体和活跃的社区，提供丰富的文档和支持

**Dubbo：**

* **高性能RPC框架：** 专注于服务之间的通信，提供了高性能、可扩展的RPC调用机制
* **轻量级：** 内核精简，易于集成和扩展
* **丰富的服务治理功能：** 支持负载均衡、容错、服务降级等
* **阿里巴巴背书：** 由阿里巴巴开源，经过大规模生产环境的验证

## 3 本文档内容

本文档将深入介绍Spring Cloud的核心组件和使用方法，帮助您掌握Spring Cloud微服务开发的最佳实践。我们将涵盖以下内容：

* **服务发现与注册：** Eureka、Nacos
* **配置管理：** Nacos config
* **负载均衡：** Ribbon、Spring Cloud Balancer、Feign
* **断路器：** Hystrix、Resilience4j
* **API网关：** Spring Cloud Gateway
* **消息驱动：** Spring Cloud Stream
* **分布式事务：** Seata
* **监控与追踪：** Spring Cloud Sleuth、Zipkin

## 4 RestTemplate：Spring Cloud 中的 REST 客户端

在微服务架构中，服务之间通常通过 RESTful API 进行通信。Spring Cloud 提供了 RestTemplate，一个方便易用的 REST 客户端，用于发送 HTTP 请求和处理响应。

### 4.1 RestTemplate 的优势

* **简化 REST 调用：** RestTemplate 提供了简洁的 API，可以轻松地发送 GET、POST、PUT、DELETE 等各种类型的 HTTP 请求。
* **自动序列化和反序列化：** RestTemplate 可以自动将 Java 对象序列化为 JSON 或 XML 格式发送，并将接收到的响应反序列化为 Java 对象。
* **集成 Ribbon 负载均衡：** RestTemplate 可以与 Ribbon 负载均衡器无缝集成，实现客户端负载均衡。
* **异常处理：** RestTemplate 提供了统一的异常处理机制，方便处理 HTTP 请求过程中的各种异常情况。

### 4.2 RestTemplate 的局限性

* **同步阻塞：** RestTemplate 的 API 是同步阻塞的，每次请求都会阻塞当前线程，直到收到响应。
* **功能相对简单：** RestTemplate 的功能相对简单，对于复杂的 REST 调用场景可能需要额外的处理。

### 4.3 WebClient：异步非阻塞的替代方案

Spring 5 引入了 WebClient，一个全新的异步非阻塞的 REST 客户端。WebClient 提供了更灵活的 API 和响应式编程模型，适用于高并发、低延迟的场景。

### 4.4 使用 RestTemplate

#### 4.4.1 `pom.xml`

##### 4.4.1.1 Main `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://maven.apache.org/POM/4.0.0"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <packaging>pom</packaging>
    <modules>
        <module>product-service</module>
        <module>order-service</module>
    </modules>

    <groupId>org.example</groupId>
    <artifactId>SpringCloud_DEMO</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <java.version>8</java.version>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring-boot.repackage.skip>true</spring-boot.repackage.skip>
        <spring-cloud.version>2021.0.9</spring-cloud.version>
    </properties>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.6.15</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

##### 4.4.1.2 Product `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <artifactId>product-service</artifactId>

    <parent>
        <groupId>org.example</groupId>
        <artifactId>SpringCloud_DEMO</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <skipTests>true</skipTests>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.5.5</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.32</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

##### 4.4.1.3 Order `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <artifactId>order-service</artifactId>

    <parent>
        <groupId>org.example</groupId>
        <artifactId>SpringCloud_DEMO</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <skipTests>true</skipTests>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.32</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
    </dependencies>
</project>
```

### 4.5 产品模块

#### 4.5.1 Entity

> [!note] MyBatis-Plus  
> MyBatis-Plus默认使用了下划线命名策略（underscore_to_camel_case），它会将实体类中的驼峰式命名字段转换为数据库中的下划线命名字段。
> * 例如，实体类中的`gPublicDate`字段会被映射到数据库中的`g_public_date`字段。
> * 如果你的数据库字段命名并不遵循这个规则，你可以使用 `@TableField` 注解来明确指定实体类字段和数据库字段的映射关系。
> 	* `@TableField("g_date")` 将 `gPublicDate` 映射到 `g_date` 。

```java
package org.example.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 游戏实体类
 * 使用了Lombok库的@Data，@AllArgsConstructor，@NoArgsConstructor注解来自动生成getter，setter，构造函数等常用方法
 * 使用了MyBatis Plus的@TableId，@TableName注解来指定数据库中的表名和主键
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("tab_game") // 指定对应的数据库表名为"tab_game"
public class Product {

 @TableId("g_id") // 指定主键字段名为"g_id"
 private Integer gId; // 游戏ID
 private String gName; // 游戏名称
 private String gDesc; // 游戏描述
 private Double gPrice; // 游戏价格
 private Date gDate; // 游戏发布日期
 private Integer gStatus; // 游戏状态

}
```

#### 4.5.2 Mapper

```java
package org.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.example.entity.Product;

public interface ProductMapper extends BaseMapper<Product> {
}
```

#### 4.5.3 Service

##### 4.5.3.1 Service

```java
package org.example.service;

import org.example.entity.Product;

import java.util.List;

public interface ProductService {

	List<Product> findAll();

}
```

##### 4.5.3.2 ServiceImpl

```java
package org.example.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.entity.Product;
import org.example.mapper.ProductMapper;
import org.example.service.ProductService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 产品服务实现类
 * 使用了Lombok库的@RequiredArgsConstructor注解来自动生成构造函数（为所有标记为final或@NonNull的字段生成一个构造器）
 * 使用了Spring的@Service注解来标记这是一个服务类
 * 实现了ProductService接口
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    // 产品映射器，用于操作数据库中的产品数据
    private final ProductMapper productMapper;

    /**
     * 查询所有产品
     * @return 返回所有产品的列表
     */
    @Override
    public List<Product> findAll() {
        return productMapper.selectList(null);
    }
}
```

#### 4.5.4 Controller

```java
package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.entity.Product;
import org.example.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 这是一个处理产品相关请求的Rest控制器。
 * 它使用Lombok的@RequiredArgsConstructor来注入依赖。
 */
@RestController
@RequiredArgsConstructor
public class ProductController {

    // ProductService依赖项由Lombok的@RequiredArgsConstructor自动注入
    private final ProductService productService;

    /**
     * 此方法处理对"/products"端点的GET请求。
     * 它使用ProductService获取所有产品并返回它们。
     *
     * @return 所有产品的列表
     */
    @GetMapping("products")
    public List<Product> findAll() {
        return productService.findAll();
    }
}
```

#### 4.5.5 Application

```java
package org.example;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("org.example.mapper")
public class ProductServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProductServiceApplication.class, args);
	}

}
```

#### 4.5.6 `application.yaml`

```yaml
my:
  db: localhost

server:
  port: 8081

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://${my.db}:3306/demo?useSSL=false&characterEncoding=utf8
    username: root
    password: 114514
  application:
    name: product-service

mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: g_status
      logic-delete-value: 1
      logic-not-delete-value: 0

management:
  endpoint:
    health:
      show-details: always
    shutdown:
      enabled: true
  endpoints:
    web:
      exposure:
        include: '*'
```

### 4.6 订单模块

#### 4.6.1 Entity

```java
package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 游戏实体类
 * 使用了Lombok库的@Data，@AllArgsConstructor，@NoArgsConstructor注解来自动生成getter，setter，构造函数等常用方法
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {

	private Integer gId; // 游戏ID
	private String gName; // 游戏名称
	private String gDesc; // 游戏描述
	private Double gPrice; // 游戏价格
	private Date gDate; // 游戏发布日期
	private Integer gStatus; // 游戏状态

}
```

#### 4.6.2 Config

```java
package org.example.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

// RestTemplateConfig是一个配置类，提供了一个RestTemplate bean。
// RestTemplate是我们用来发出HTTP请求的同步HTTP客户端。
// 它简化了与HTTP服务器的通信，并强制执行RESTful原则。
@Configuration
public class RestTemplateConfig {

	// 这个方法提供了一个RestTemplate bean。
	// @ConditionalOnMissingBean注解表示只有当Spring上下文中没有同类型的其他bean时，才提供RestTemplate bean。
	// 这样，如果有其他配置提供了RestTemplate bean，那么这个配置就不会干扰它。
	//
	// @return 一个新的RestTemplate实例
	@ConditionalOnMissingBean(RestTemplate.class)
	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

}
```

#### 4.6.3 Controller

> [!tip] [RestTemplate.exchange](https://blog.csdn.net/scm_2008/article/details/127682333)

```java
package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.entity.Product;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class OrderController {

private final RestTemplate restTemplate;

// 创建订单
@GetMapping("/orders")
public List<Product> makeOrder() {

// 调用产品服务获取产品列表
// 创建一个ResponseEntity对象，该对象将保存来自产品服务的响应。
// 预期的响应是Product对象的列表。
// 使用RestTemplate的exchange方法发送请求并接收响应。
// 第一个参数是产品服务的URL。
// 第二个参数是HTTP方法（在这种情况下为GET）。
// 第三个参数是包含头和主体的请求实体（在这种情况下为null，因为GET不使用主体）。
// 第四个参数是ParameterizedTypeReference，它有助于捕获和传递泛型类型信息。
ResponseEntity<List<Product>> res = restTemplate.exchange(
"http://localhost:8081/products",
HttpMethod.GET,
null,
new ParameterizedTypeReference<List<Product>>() {
}
);
// 如果响应状态码不是2xx，返回null
if (!res.getStatusCode().is2xxSuccessful()) {
return null;
}
// 返回产品列表
return (List<Product>) res.getBody();
}

}

```

#### 4.6.4 Application

```java
package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OrderServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrderServiceApplication.class, args);
	}
}
```

#### 4.6.5 `application.yaml`

```yaml
server:
  port: 8082

spring:
  application:
    name: order-service

management:
  endpoint:
    health:
      show-details: always
    shutdown:
      enabled: true
  endpoints:
    web:
      exposure:
        include: '*'
```

## 5 服务治理

在微服务架构中，RestTemplate虽然能通过HTTP获取远程数据，但存在以下问题：

1. **硬编码连接地址：** 不灵活，难以适应变化。
2. **单一连接：** 无法在多个微服务间自动切换或负载均衡。
3. **容错性差：** 微服务崩溃时，调用方也会受到影响。
4. **扩展性受限：** 无法动态发现并使用新增的微服务。

为解决这些问题，我们需要引入**服务治理**。

**服务治理**的核心目标是将微服务纳入统一管理，实现以下功能：

* **服务注册与发现：** 新服务能自动注册到系统中，并被其他服务发现。
* **负载均衡：** 请求能均衡地分发到多个服务实例，提高系统整体性能和可靠性。

### 5.1 常见的服务治理框架

| 框架名称   | 开发公司      | 平台   | 特点                                                |
| ------ | --------- | ---- | ------------------------------------------------- |
| Eureka | Netflix   | Java | Spring Cloud官方集成，使用广泛，但已*停止更新*                    |
| Nacos  | Alibaba   | Java | 功能丰富，支持服务注册、配置管理、动态DNS等，与Spring Cloud Alibaba深度集成 |
| Consul | HashiCorp | Go   | 轻量级，易部署，支持多语言，提供服务健康检查和KV存储等功能                    |

**选择建议：**

* **Spring Cloud技术栈：** 可选Eureka（需注意停止更新）或Nacos
* **Spring Cloud Alibaba技术栈：** 推荐Nacos
* **多语言环境或追求轻量级：** 推荐Consul

**扩展说明：**

除了上述框架，还有其他服务治理方案，如：

* **ZooKeeper：** Apache的分布式协调服务，常用于构建服务注册与发现系统。
* **Kubernetes：** Google开源的容器编排平台，提供强大的服务治理能力。
* **Istio：** 基于Kubernetes的服务网格，提供更细粒度的流量控制和安全管理。

### 5.2 Eureka

#Eureka  
Eureka是一个基于REST的服务注册与发现框架，用于实现微服务架构中的服务治理。其工作流程如下：

1. **服务注册：** 服务提供者在启动时，会主动向Eureka服务器注册自己的信息，包括服务名称、IP地址、端口号等。
2. **信息存储：** Eureka服务器将接收到的服务注册信息保存到注册表中，形成一个可用的服务列表。
3. **服务发现：** 服务消费者在需要调用某个服务时，会向Eureka服务器发送请求，查询所需服务的地址信息。
4. **心跳检测：** 服务提供者会定期向Eureka服务器发送心跳信息，证明自己仍然存活。如果Eureka服务器在一段时间内未收到心跳，则会将该服务从注册表中移除。
5. **负载均衡：** 服务消费者从Eureka服务器获取到可用的服务实例列表后，通常会使用负载均衡算法（如轮询、随机等）选择一个实例进行调用。

#### 5.2.1 搭建 Eureka Server

##### 5.2.1.1 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <artifactId>eureka-server</artifactId>

    <parent>
        <groupId>org.example</groupId>
        <artifactId>SpringCloud_DEMO</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
    </dependencies>

</project>
```

##### 5.2.1.2 Application

```java
package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(EurekaServerApplication.class, args);
	}

}
```

##### 5.2.1.3 `application.yaml`

```yaml
# 服务器配置
server:
  port: 8761  # 服务器端口

# Spring应用配置
spring:
  application:
    name: eureka-server  # 应用程序名称

# Eureka配置
eureka:
  client:
    register-with-eureka: false  # 是否将自己注册到Eureka服务中
    fetch-registry: false  # 是否从Eureka服务中获取服务注册信息
  server:
    enable-self-preservation: false #false为关闭自我保护模式，默认开启
    eviction-interval-timer-in-ms: 6000  #清理时间（单位：毫秒，默认是60×1000）
```

#### 5.2.2 服务注册

##### 5.2.2.1 `pom.xml`

`eureka-server` 以外服务模块添加以下依赖

> [!tip] 未在上文依赖部分给出

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

##### 5.2.2.2 Application

启动程序中新增注解`@EnableEurekaClient`

##### 5.2.2.3 `application.yaml`

> [!tip] 未在上文 `application.yaml` 部分给出

```yaml
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/

spring:
  application:
    name: <server_name>
```

##### 5.2.2.4 新增相同服务

> [!info] -D 参数（Java 系统属性）
> * **设置方式：** 在启动 Java 应用程序时，通过 `-Dproperty=value` 的形式设置。
> * **优先级：** 通常比配置文件的优先级高，可以直接覆盖配置文件中的值。
> * **命名限制：** 受到 Java 系统属性的命名限制，通常不能包含`.`等特殊字符。

> [!info] Relaxed Binding (环境变量)
> * **设置方式：** 通过操作系统的环境变量来设置。
> * **优先级：** 通常比配置文件的优先级高，但可能比 `-D` 参数的优先级低。
> * **命名规则：** 遵循特定的转换规则（`.` 转换为 `_`，全部大写），以便与配置文件的属性名对应。

1. 目标 Service `Copy Configuration`
2. `Modify options`
3. 设置 `-D` 参数或环境变量

##### 5.2.2.5 Order Controller

引入 `Discovery` 对外暴露服务IP、服务名称、端口号等服务信息用于服务注册到 Eureka

```java
package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang.math.RandomUtils;
import org.example.entity.Product;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * 这是一个处理订单相关请求的Rest控制器。
 * 它使用RestTemplate进行HTTP请求，并使用DiscoveryClient进行服务发现。
 */
@RestController
@RequiredArgsConstructor
public class OrderController {

 private final RestTemplate restTemplate;
 private final DiscoveryClient discoveryClient;

 /**
  * 此方法用于创建订单。
  * 它首先从DiscoveryClient获取"product-service"的所有实例。
  * 然后从实例列表中随机选择一个实例。
  * 然后使用RestTemplate向选定实例的"/products"端点发出GET请求。
  * 如果响应状态码不是2xx，则返回null。
  * 否则，返回响应体中的产品列表。
  *
  * @return 如果响应状态码是2xx，则返回产品列表，否则返回null。
  */
 @GetMapping("/orders")
 public List<Product> makeOrder() {

  // 获取"product-service"的所有实例
  List<ServiceInstance> instances = discoveryClient.getInstances("product-service");
  // 从实例列表中随机选择一个实例
  ServiceInstance instance = instances.get(RandomUtils.nextInt(instances.size()));
  System.out.println(instance.getUri());
  // 向选定实例的"/products"端点发出GET请求
  ResponseEntity<List<Product>> res = restTemplate.exchange(
    instance.getUri() + "/products",
    HttpMethod.GET,
    null,
    new ParameterizedTypeReference<List<Product>>() {
    }
  );
  // 如果响应状态码不是2xx，返回null
  if (!res.getStatusCode().is2xxSuccessful()) {
   return null;
  }
  // 返回响应体中的产品列表
  return (List<Product>) res.getBody();
 }

}
```

### 5.3 Eureka 高可用

#### 5.3.1 Eureka `application-es1.yaml`

```yaml
server:
  port: 8761
eureka:
  instance:
    hostname: eureka-1
  client:
    service-url:
      defaultZone: http://eureka-2:8762/eureka
```

#### 5.3.2 Eureka `application-es2.yaml`

```yaml
server:
  port: 8762
eureka:
  instance:
    hostname: eureka-2
  client:
    service-url:
      defaultZone: http://eureka-1:8761/eureka
```

#### 5.3.3 Eureka `application.yaml`

```yaml
spring:
  profiles:
    active: es1				#设置活动的配置文件按为es1
eureka:
  client:
    register-with-eureka: true     #是否将自己注册到eureka-server中
    fetch-registry: true           #是否从eureka-server中获取服务注册信息
```

#### 5.3.4 [配置其他服务器](#5.2.2.4%20新增相同服务)

#### 5.3.5 `application.yaml`

生产者和消费者均添加服务集群地址

```yaml
eureka:
  client:
    serviceUrl:
      defaultZone: http://eureka-1:8761/eureka/,http://eureka-2:8762/eureka/
```

### 5.4 LoadBalance

#LoadBalance  
负载均衡（Load Balancing）是分布式系统架构中至关重要的一环，旨在将网络请求或工作负载均匀分发到多个服务器上，从而实现系统的高可用性、可扩展性和性能优化。Spring Cloud生态系统中的负载均衡方案经历了从Ribbon到Spring Cloud Loadbalancer的演变。

* **Ribbon：** 最初由Netflix开发，曾是Spring Cloud早期版本中的负载均衡组件。它提供了多种负载均衡算法（如轮询、随机等）以及自定义算法的扩展能力。
* **Spring Cloud Loadbalancer：** 随着Spring Cloud的发展，从2020年后的版本开始，Spring Cloud Loadbalancer逐渐取代了Ribbon，成为新的负载均衡解决方案。它不仅继承了Ribbon的优点，还提供了更灵活、更强大的功能。

#### 5.4.1 负载均衡的两种方案

1. **集中式负载均衡（Server-Side Load Balancing）：**
   * 由专门的负载均衡组件（硬件如F5，软件如Nginx）统一管理请求分发。
   * 优点：配置简单，对客户端透明，可实现全局负载均衡。
   * 缺点：存在单点故障风险，扩展性受限。

2. **进程内负载均衡（Client-Side Load Balancing）：**
   * 负载均衡策略集成在客户端（消费者）内部，由客户端自主选择服务提供者。
   * 优点：灵活度高，可实现细粒度控制，降低对集中式组件的依赖。
   * 缺点：客户端实现复杂度增加。

#### 5.4.2 负载均衡策略

##### 5.4.2.1 Ribbon 和 Spring Cloud Loadbalancer 支持的负载均衡策略：

* **RoundRobinRule / RoundRobinLoadBalancer：** 轮询
> [!INFO] 轮询策略  
> 按照顺序依次选择服务器，实现请求的均匀分配。

* **RandomRule / RandomLoadBalancer：** 随机
> [!INFO] 随机策略  
> 随机选择服务器，适用于服务器性能差异不大的场景。

* **WeightedResponseTimeRule：** (仅Ribbon) 权重轮询，响应时间越快的服务权重越高。
* **BestAvailableRule：** (仅Ribbon) 选择并发请求数最少（最空闲）的服务。
* **RetryRule：** (仅Ribbon) 重试策略，在轮询失败时会尝试连接其他服务。
* **AvailabilityFilteringRule：** (仅Ribbon) 可用性过滤策略，过滤掉不可用或性能差的服务。
* **ZoneAvoidanceRule：** (仅Ribbon) 区域敏感策略，优先选择同区域的服务。
* **自定义：** 开发者可根据需求实现自定义负载均衡策略。

#### 5.4.3 Spring Cloud Loadbalancer

> [!info] `LoadBalancerClient`  
> `LoadBalancerClient` 除了具备 `DiscoveryClient` 的所有功能外，还增加了客户端负载均衡功能。它不仅能找到可用的服务实例，还能智能地在这些实例之间分发请求，从而提高性能和容错能力。

> [!tip]  
> 以下在订单模块操作

##### 5.4.3.1 Order Controller

```java
package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.entity.Product;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * 这是一个处理订单相关请求的Rest控制器。
 * 它使用RestTemplate进行HTTP请求，并使用DiscoveryClient进行服务发现。
 */
@RestController
@RequiredArgsConstructor
public class OrderController {

	private final RestTemplate restTemplate;

	// private final DiscoveryClient discoveryClient;
	private final LoadBalancerClient loadBalancerClient;

	/**
	 * 此方法用于创建订单。
	 * 它首先从DiscoveryClient获取"product-service"的所有实例。
	 * 然后从实例列表中随机选择一个实例。
	 * 然后使用RestTemplate向选定实例的"/products"端点发出GET请求。
	 * 如果响应状态码不是2xx，则返回null。
	 * 否则，返回响应体中的产品列表。
	 *
	 * @return 如果响应状态码是2xx，则返回产品列表，否则返回null。
	 */
	@GetMapping("/orders")
	public List<Product> makeOrder() {

		// 获取"product-service"的所有实例
		// List<ServiceInstance> instances = discoveryClient.getInstances("product-service");
		// 从实例列表中随机选择一个实例
		// ServiceInstance instance = instances.get(RandomUtils.nextInt(instances.size()));

		// Spring Cloud LoadBalancer 可以使用 spring.cloud.loadbalancer.<server_name>.strategy=XXX 来配置负载均衡策略
		// choose 方法会应用一种负载均衡算法来决定哪个实例最适合处理当前的请求
		ServiceInstance instance = loadBalancerClient.choose("product-service");
		System.out.println(instance.getUri());
		// 向选定实例的"/products"端点发出GET请求
		ResponseEntity<List<Product>> res = restTemplate.exchange(
				instance.getUri() + "/products",
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<List<Product>>() {
				}
		);
		// 如果响应状态码不是2xx，返回null
		if (!res.getStatusCode().is2xxSuccessful()) {
			return null;
		}
		// 返回响应体中的产品列表
		return (List<Product>) res.getBody();
	}

}
```

##### 5.4.3.2 `CustomLoadBalancerConfiguration`

```java
package org.example.config;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.loadbalancer.core.RandomLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ReactorLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ServiceInstanceListSupplier;
import org.springframework.cloud.loadbalancer.support.LoadBalancerClientFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

/**
 * 这个类提供了负载均衡器的自定义配置。
 * 它定义了一个创建随机负载均衡器的bean。
 */
public class CustomLoadBalancerConfiguration {

	/**
	 * 这个方法创建了一个ReactorLoadBalancer类型的bean。
	 * 负载均衡器使用随机策略进行负载均衡。
	 *
	 * @param environment               从中获取负载均衡器名称的环境。
	 * @param loadBalancerClientFactory 用于创建负载均衡器的工厂。
	 * @return 一个ReactorLoadBalancer实例。
	 */
	@Bean
	ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(Environment environment,
	                                                        LoadBalancerClientFactory loadBalancerClientFactory) {
		String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
		System.out.println("随机=============");
		return new RandomLoadBalancer(loadBalancerClientFactory
				.getLazyProvider(name, ServiceInstanceListSupplier.class),
				name);
	}

}
```

##### 5.4.3.3 `RestTemplateConfig`

添加注解

```java
@LoadBalancerClient(name = "product-service", configuration = CustomLoadBalancerConfiguration.class)
````

### 5.5 Nacos

#Nacos

> [!note] Nacos
> * [Nacos repo](https://github.com/alibaba/nacos)
> * [Nacos docs](https://nacos.io/zh-cn/docs/v2/quickstart/quick-start.html)
> 	* [版本说明](https://github.com/alibaba/spring-cloud-alibaba/wiki/版本说明)
> 	 * [Nacos+SpringCloud](https://nacos.io/zh-cn/docs/v2/ecology/use-nacos-with-spring-cloud.html)
> 	 * [Nacos config](https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-config)
> 	 * [Nacos discovery](https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-discovery)

> [!tip] gRPC  
> `2.X` 版本记得开放 gRPC 接口 9848/9849

> [!tip] 接下来使用 Nacos 替代 Eureka 重构项目  
> 介于官方文档完善程度高，不再单独编写，直接给出调整后源码  
> 完成 Nacos 基本应用和使用 `RestTemplate` + `Spring Cloud Loadbalancer ` 实现负载均衡

#### 5.5.1 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://maven.apache.org/POM/4.0.0"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <packaging>pom</packaging>
    <modules>
        <module>nacos-config</module>
        <module>product-service</module>
        <module>order-service</module>
    </modules>

    <groupId>org.example</groupId>
    <artifactId>SpringCloud-Ali_DEMO</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <java.version>8</java.version>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring-boot.repackage.skip>true</spring-boot.repackage.skip>
        <spring-cloud.version>2021.0.9</spring-cloud.version>
        <spring-cloud-alibaba.version>2021.0.5.0</spring-cloud-alibaba.version>
    </properties>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.6.15</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>${spring-cloud-alibaba.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

#### 5.5.2 `nacos-config` Module

##### 5.5.2.1 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://maven.apache.org/POM/4.0.0"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <artifactId>nacos-config</artifactId>

    <parent>
        <groupId>org.example</groupId>
        <artifactId>SpringCloud-Ali_DEMO</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bootstrap</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
    </dependencies>

</project>
```

##### 5.5.2.2 `bootstrap.properties`

```properties
spring.cloud.nacos.config.server-addr=nacos:8848
# appName
spring.application.name=nacos-config
# Config Type: properties(Default Value) \ yaml \ yml
#spring.cloud.nacos.config.file-extension=properties
spring.cloud.nacos.config.file-extension=yaml
spring.config.import=optional:nacos:nacos-config.yaml
# Map Nacos Config: example.properties
# Create the config Of nacos firstly?you can use one of the following two methods:
## Create Config By OpenAPI
### Create Config By OpenAPI
# curl -X POST 'http://127.0.0.1:8848/nacos/v1/cs/configs' -d 'dataId=example.properties&group=DEFAULT_GROUP&content=useLocalCache=true'
### Get Config By OpenAPI
# curl -X GET 'http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=example.properties&group=DEFAULT_GROUP'
## Create Config By Console
### Login the console of Nacos: http://127.0.0.1:8848/nacos/index.html , then create config:
### Data ID: example.properties
### Group: DEFAULT_GROUP
### Content: useLocalCache=true
```

##### 5.5.2.3 `application.yaml`

```yaml
# 服务器配置
server:
  port: 8761  # 服务器端口
```

##### 5.5.2.4 `NacosConfigApplication`

```java
package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Document: https://nacos.io/zh-cn/docs/quick-start-spring-cloud.html
 */
@SpringBootApplication
public class NacosConfigApplication {

	public static void main(String[] args) {
		SpringApplication.run(NacosConfigApplication.class, args);
	}
}
```

##### 5.5.2.5 `ConfigController`

> [!note] 实现配置文件自动刷新

```java
package org.example.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ConfigController 是一个 REST 控制器，提供了一个 Endpoint 来获取 'useLocalCache' 的配置值。
 * 它使用了 @RefreshScope 注解，这意味着，当底层配置发生变化时，它将被刷新。
 */
@RestController
@RequestMapping("/config")
@RefreshScope
public class ConfigController {

    /**
     * 'useLocalCache' 是从配置服务器获取的配置值。
     * 如果配置服务器没有为它提供值，那么它将被初始化为 'false'。
     */
    @Value("${useLocalCache:false}")
    private boolean useLocalCache;

    /**
     * 这个方法是一个 HTTP GET 端点，返回 'useLocalCache' 的当前值。
     *
     * @return 'useLocalCache' 的当前值。
     */
    @RequestMapping("/get")
    public boolean get() {
       return useLocalCache;
    }
}
```

#### 5.5.3 `product-service` Module

##### 5.5.3.1 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://maven.apache.org/POM/4.0.0"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <artifactId>product-service</artifactId>

    <parent>
        <groupId>org.example</groupId>
        <artifactId>SpringCloud-Ali_DEMO</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <skipTests>true</skipTests>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.5.5</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.32</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

##### 5.5.3.2 `application.yaml`

```yaml
my:
  db: localhost

server:
  port: 8070

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://${my.db}:3306/demo?useSSL=false&characterEncoding=utf8
    username: root
    password: 114514
  application:
    name: product-service
  cloud:
    nacos:
      server-addr: nacos:8848

mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: g_status
      logic-delete-value: 1
      logic-not-delete-value: 0

management:
  endpoint:
    health:
      show-details: always
    shutdown:
      enabled: true
  endpoints:
    web:
      exposure:
        include: '*'
```

##### 5.5.3.3 `ProductServiceApplication`

```java
package org.example;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@EnableDiscoveryClient
@MapperScan("org.example.mapper")
public class ProductServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProductServiceApplication.class, args);
	}

	@RestController
	public class EchoController {
		@RequestMapping(value = "/echo/{string}", method = RequestMethod.GET)
		public String echo(@PathVariable String string) {
			return "Hello Nacos Discovery " + string;
		}
	}
}
```

##### 5.5.3.4 `Product` Entity

```java
package org.example.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 游戏实体类
 * 使用了Lombok库的@Data，@AllArgsConstructor，@NoArgsConstructor注解来自动生成getter，setter，构造函数等常用方法
 * 使用了MyBatis Plus的@TableId，@TableName注解来指定数据库中的表名和主键
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("tab_game") // 指定对应的数据库表名为"tab_game"
public class Product {

 @TableId("g_id") // 指定主键字段名为"g_id"
 private Integer gId; // 游戏ID
 private String gName; // 游戏名称
 private String gDesc; // 游戏描述
 private Double gPrice; // 游戏价格
 private Date gDate; // 游戏发布日期
 private Integer gStatus; // 游戏状态

}
```

##### 5.5.3.5 `ProductMapper`

```java
package org.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.example.entity.Product;

public interface ProductMapper extends BaseMapper<Product> {
}
```

##### 5.5.3.6 `ProductService`

```java
package org.example.service;

import org.example.entity.Product;

import java.util.List;

public interface ProductService {

	List<Product> findAll();

}
```

###### 5.5.3.6.1 `ProductServiceImpl`

```java
package org.example.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.entity.Product;
import org.example.mapper.ProductMapper;
import org.example.service.ProductService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 产品服务实现类
 * 使用了Lombok库的@RequiredArgsConstructor注解来自动生成构造函数（为所有标记为final或@NonNull的字段生成一个构造器）
 * 使用了Spring的@Service注解来标记这是一个服务类
 * 实现了ProductService接口
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    // 产品映射器，用于操作数据库中的产品数据
    private final ProductMapper productMapper;

    /**
     * 查询所有产品
     *
     * @return 返回所有产品的列表
     */
    @Override
    public List<Product> findAll() {
       return productMapper.selectList(null);
    }
}
```

##### 5.5.3.7 `ProductController`

```java
package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.entity.Product;
import org.example.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 这是一个处理产品相关请求的Rest控制器。
 * 它使用Lombok的@RequiredArgsConstructor来注入依赖。
 */
@RestController
@RequiredArgsConstructor
public class ProductController {

    // ProductService依赖项由Lombok的@RequiredArgsConstructor自动注入
    private final ProductService productService;

    /**
     * 此方法处理对"/products"端点的GET请求。
     * 它使用ProductService获取所有产品并返回它们。
     *
     * @return 所有产品的列表
     */
    @GetMapping("/products")
    public List<Product> findAll() {
       return productService.findAll();
    }
}
```

#### 5.5.4 `order-service` Module

##### 5.5.4.1 `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://maven.apache.org/POM/4.0.0"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <artifactId>order-service</artifactId>

    <parent>
        <groupId>org.example</groupId>
        <artifactId>SpringCloud-Ali_DEMO</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <skipTests>true</skipTests>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.32</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-loadbalancer</artifactId>
        </dependency>
    </dependencies>
</project>
```

##### 5.5.4.2 `application.yaml`

```yaml
server:
  port: 8080

spring:
  application:
    name: order-service
  cloud:
    nacos:
      server-addr: nacos:8848

management:
  endpoint:
    health:
      show-details: always
    shutdown:
      enabled: true
  endpoints:
    web:
      exposure:
        include: '*'
```

##### 5.5.4.3 `OrderServiceApplication`

```java
package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@EnableDiscoveryClient
public class OrderServiceApplication {

    public static void main(String[] args) {
       SpringApplication.run(OrderServiceApplication.class, args);
    }

    @RestController
    public class EchoController {
       @RequestMapping(value = "/echo/{string}", method = RequestMethod.GET)
       public String echo(@PathVariable String string) {
          return "Hello Nacos Discovery " + string;
       }
    }
}
```

##### 5.5.4.4 `CustomLoadBalancerConfiguration`

```java
package org.example.config;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.loadbalancer.core.RandomLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ReactorLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ServiceInstanceListSupplier;
import org.springframework.cloud.loadbalancer.support.LoadBalancerClientFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

/**
 * 这个类提供了负载均衡器的自定义配置。
 * 它定义了一个创建随机负载均衡器的bean。
 */
@Configuration
public class CustomLoadBalancerConfiguration {

    /**
     * 这个方法创建了一个ReactorLoadBalancer类型的bean。
     * 负载均衡器使用随机策略进行负载均衡。
     *
     * @param environment               从中获取负载均衡器名称的环境。
     * @param loadBalancerClientFactory 用于创建负载均衡器的工厂。
     * @return 一个ReactorLoadBalancer实例。
     */
    @Bean
    ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(Environment environment,
                                                            LoadBalancerClientFactory loadBalancerClientFactory) {
       String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
       System.out.println("负载均衡策略：随机");
       return new RandomLoadBalancer(loadBalancerClientFactory
             .getLazyProvider(name, ServiceInstanceListSupplier.class),
             name);
    }

}
```

##### 5.5.4.5 `RestTemplateConfig`

```java
package org.example.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cloud.loadbalancer.annotation.LoadBalancerClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

// RestTemplateConfig是一个配置类，提供了一个RestTemplate bean。
// RestTemplate是我们用来发出HTTP请求的同步HTTP客户端。
// 它简化了与HTTP服务器的通信，并强制执行RESTful原则。
@Configuration
@LoadBalancerClient(name = "product-service", configuration = CustomLoadBalancerConfiguration.class)
public class RestTemplateConfig {

    // 这个方法提供了一个RestTemplate bean。
    // @ConditionalOnMissingBean注解表示只有当Spring上下文中没有同类型的其他bean时，才提供RestTemplate bean。
    // 这样，如果有其他配置提供了RestTemplate bean，那么这个配置就不会干扰它。
    //
    // @return 一个新的RestTemplate实例
    @ConditionalOnMissingBean(RestTemplate.class)
    @Bean
    public RestTemplate restTemplate() {
       return new RestTemplate();
    }

}
```

##### 5.5.4.6 `Product` Entity

```java
package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 游戏实体类
 * 使用了Lombok库的@Data，@AllArgsConstructor，@NoArgsConstructor注解来自动生成getter，setter，构造函数等常用方法
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    private Integer gId; // 游戏ID
    private String gName; // 游戏名称
    private String gDesc; // 游戏描述
    private Double gPrice; // 游戏价格
    private Date gDate; // 游戏发布日期
    private Integer gStatus; // 游戏状态

}
```

##### 5.5.4.7 `OrderController`

```java
package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.entity.Product;
import org.example.client.ProductClient;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 这是一个处理订单相关请求的Rest控制器。
 * 它使用ProductClient进行HTTP请求。
 */
@RestController
@RequiredArgsConstructor
public class OrderController {

	private final ProductClient productClient;
	private final LoadBalancerClient loadBalancerClient;

	/**
	 * 此方法用于创建订单。
	 * 它使用ProductClient向"product-service"的"/products"端点发出GET请求。
	 * 返回响应体中的产品列表。
	 *
	 * @return 产品列表。
	 */
	@GetMapping("/orders")
	public List<Product> makeOrder() {
		// 使用ProductClient获取产品列表
		List<Product> products = productClient.findAll();

		// 获取并打印服务实例的URI
		ServiceInstance instance = loadBalancerClient.choose("product-service");
		System.out.println("服务地址：" + instance.getUri());

		return products;
	}
/*  // 以下代码是使用RestTemplate+LoadBalancerClient的方式
	private final RestTemplate restTemplate;

	private final LoadBalancerClient loadBalancerClient;

	*//**
	 * 此方法用于创建订单。
	 * 它首先从DiscoveryClient获取"product-service"的所有实例。
	 * 然后从实例列表中随机选择一个实例。
	 * 然后使用RestTemplate向选定实例的"/products"端点发出GET请求。
	 * 如果响应状态码不是2xx，则返回null。
	 * 否则，返回响应体中的产品列表。
	 *
	 * @return 如果响应状态码是2xx，则返回产品列表，否则返回null。
	 *//*
	@GetMapping("/orders")
	public List<Product> makeOrder() {

		// Spring Cloud LoadBalancer 可以使用 spring.cloud.loadbalancer.<server_name>.strategy=XXX 来配置负载均衡策略
		// choose 方法会应用一种负载均衡算法来决定哪个实例最适合处理当前的请求
		ServiceInstance instance = loadBalancerClient.choose("product-service");
		System.out.println(instance.getUri());
		// 向选定实例的"/products"端点发出GET请求
		ResponseEntity<List<Product>> res = restTemplate.exchange(
				instance.getUri() + "/products",
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<List<Product>>() {
				}
		);
		// 如果响应状态码不是2xx，返回null
		if (!res.getStatusCode().is2xxSuccessful()) {
			return null;
		}
		// 返回响应体中的产品列表
		return (List<Product>) res.getBody();
	}
	*/
}
```

### 5.6 OpenFeign

OpenFeign 是 Spring Cloud 体系中一个声明式的 REST 客户端，它基于 Netflix Feign 开发，并对其进行了增强，使其能够与 Spring Cloud 的其他组件（如 Spring Cloud Loadbalancer、Hystrix）无缝集成。

**主要特点：**

* **声明式接口：** 开发者只需定义接口并使用注解描述 REST 请求，OpenFeign 会自动生成实现类并处理 HTTP 请求的细节。
* **集成 Spring Cloud Loadbalancer：** 内置 Spring Cloud Loadbalancer 负载均衡器（Spring Cloud 2020.0.0 之后替代 Ribbon），可实现客户端负载均衡，提高系统的可用性和容错性。
* **集成 Hystrix：** 可选集成 Hystrix 熔断器，实现服务降级和熔断，保护系统免受级联故障的影响。
* **可插拔编码器/解码器：** 支持多种数据格式（如 JSON、XML）的编码和解码，方便与不同类型的服务进行交互。
* **请求/响应压缩：** 可选启用请求和响应压缩，减少网络传输量，提高性能。

**使用方式：**

1. **引入依赖：** 在项目中添加 Spring Cloud OpenFeign 和 Spring Cloud Loadbalancer 的依赖。
2. **定义 Feign 客户端接口：** 使用 `@FeignClient` 注解声明接口，并在接口方法上使用 `@RequestMapping` 等注解描述 REST 请求。
3. **启用 Feign：** 在 Spring Boot 启动类上添加 `@EnableFeignClients` 注解启用 Feign。
4. **注入并调用：** 在需要调用远程服务的地方，注入 Feign 客户端接口并调用其方法。

**Spring Cloud Loadbalancer 的作用：**

* **服务发现：** 从服务注册中心（如 Eureka、Consul、Nacos）获取可用的服务实例列表。
* **负载均衡：** 根据配置的负载均衡策略（如轮询、随机、加权随机等）从服务实例列表中选择一个实例。
* **请求转发：** OpenFeign 将请求转发到选定的服务实例。

**注意事项：**

* OpenFeign 默认使用 Spring Cloud Loadbalancer 进行负载均衡，如果不需要负载均衡，可以在 `@FeignClient` 注解中设置 `url` 属性指定服务地址。
* OpenFeign 默认不启用 Hystrix，如果需要使用 Hystrix，需要在项目中添加 Hystrix 的依赖，并在 `@FeignClient` 注解中设置 `fallback` 属性指定降级处理类。
* OpenFeign 可以与 Spring Cloud Gateway 配合使用，实现 API 网关的功能。

#### 5.6.1 连接池

OpenFeign的连接主要依靠以下三个Http框架

* **HttpURLConnection**：默认连接，不支持连接池，连接效率较低
* **Apache HttpClient**：支持连接池
* **OKHttp**：支持连接池

我们可以通过修改底层的Http框架来实现连接池，提高连接效率。

```xml
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-okhttp</artifactId>
</dependency>
```

```yaml
feign:
  okhttp:
    enabled: true
```

#### 5.6.2 日志

OpenFeign日志主要分为以下4种

* **NONE**：默认级别，不记录日志
* **BASIC**：仅记录基础日志，比如请求方法，URL以及相应代码和执行时间
* **HEADERS**：在BASIC基础上，额外记录了请求和相应的头信息
* **FULL**：记录所有请求和响应的明细，所有信息

* 启用日志
	* 全局：所有的接口都启用日志 (启动类)
		* `@EnableFeignClients(basePackages = "org.example.client" ,defaultConfiguration = FeignConfig.class)`
	* 局部：只有设置的接口才启用日志（Client 类）
		* `@FeignClient(value = "product-service",configuration = FeignConfig.class)`

`application.yaml`

```yaml
logging:
  level:
    org.example: debug
```

`FeignConfig`

```java
package org.example.config;

import feign.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {
    @Bean
    public Logger.Level feignLoggerLevel() {
       return Logger.Level.FULL;
    }
}
```

#### 5.6.3 Comsumer Module

##### 5.6.3.1 `pom.xml`

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

##### 5.6.3.2 `ProductClinet`

```java
package org.example.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient("product-service")
public interface ProductClient {

    @GetMapping("/products")
    public List<Product> findAll();

}
```

##### 5.6.3.3 `OrderController`

```java
package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.entity.Product;
import org.example.client.ProductClient;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 这是一个处理订单相关请求的Rest控制器。
 * 它使用ProductClient进行HTTP请求。
 */
@RestController
@RequiredArgsConstructor
public class OrderController {

	private final ProductClient productClient;
	private final LoadBalancerClient loadBalancerClient;

	/**
	 * 此方法用于创建订单。
	 * 它使用ProductClient向"product-service"的"/products"端点发出GET请求。
	 * 返回响应体中的产品列表。
	 *
	 * @return 产品列表。
	 */
	@GetMapping("/orders")
	public List<Product> makeOrder() {
		// 使用ProductClient获取产品列表
		List<Product> products = productClient.findAll();

		// 获取并打印服务实例的URI
		ServiceInstance instance = loadBalancerClient.choose("product-service");
		System.out.println("服务地址：" + instance.getUri());

		return products;
	}
/*  // 以下代码是使用RestTemplate+LoadBalancerClient的方式
	private final RestTemplate restTemplate;

	private final LoadBalancerClient loadBalancerClient;

	*//**
	 * 此方法用于创建订单。
	 * 它首先从DiscoveryClient获取"product-service"的所有实例。
	 * 然后从实例列表中随机选择一个实例。
	 * 然后使用RestTemplate向选定实例的"/products"端点发出GET请求。
	 * 如果响应状态码不是2xx，则返回null。
	 * 否则，返回响应体中的产品列表。
	 *
	 * @return 如果响应状态码是2xx，则返回产品列表，否则返回null。
	 *//*
	@GetMapping("/orders")
	public List<Product> makeOrder() {

		// Spring Cloud LoadBalancer 可以使用 spring.cloud.loadbalancer.<server_name>.strategy=XXX 来配置负载均衡策略
		// choose 方法会应用一种负载均衡算法来决定哪个实例最适合处理当前的请求
		ServiceInstance instance = loadBalancerClient.choose("product-service");
		System.out.println(instance.getUri());
		// 向选定实例的"/products"端点发出GET请求
		ResponseEntity<List<Product>> res = restTemplate.exchange(
				instance.getUri() + "/products",
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<List<Product>>() {
				}
		);
		// 如果响应状态码不是2xx，返回null
		if (!res.getStatusCode().is2xxSuccessful()) {
			return null;
		}
		// 返回响应体中的产品列表
		return (List<Product>) res.getBody();
	}
	*/
}
```

##### 5.6.3.4 `OrderServiceApplication`

启动类添加注解 `@EnableFeignClients`

### 5.7 通用模块

1. 创建一个新的Maven模块，这个模块将包含所有的通用代码
2. 在新模块的pom.xml文件中，添加所有需要的依赖
3. 将通用的代码移动到新模块中
4. 在其他模块的pom.xml文件中，添加对新模块的依赖
5. 在其他模块中，删除所有已经移动到新模块的代码

### 5.8 网关

#SpringCloudGateway  
**微服务路由

1. **路由**：准确地将客户端请求转发到正确的微服务实例。
2. **转发**：高效地处理请求转发，确保请求在微服务之间顺利传递。
3. **鉴权**：对请求进行身份验证和授权，保障微服务的安全性。

| 网关实现    | 说明                                  | 优点                                                                               | 缺点                                                        |
| ------- | ----------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Zuul    | 基于 Servlet 实现，采用阻塞式编程模型。            | - 成熟稳定，有较多实践经验。 <br> - 配置简单，易于上手。                                                | - 性能较差，在大规模并发场景下可能成为瓶颈。 <br> - 阻塞式编程模型不够灵活，难以应对复杂的异步处理需求。 |
| Gateway | 基于 Spring 5 的 WebFlux 框架，采用响应式编程模型。 | - 性能优异，能够处理更高的并发请求。 <br> - 响应式编程模型更灵活，易于实现复杂的异步逻辑。 <br> - 支持动态路由配置，可以更方便地调整路由规则。 | - 相对较新，实践经验较少。 <br> - 学习曲线较陡峭，需要对响应式编程有一定了解。              |

#### 5.8.1 `gateway service` Module

```xml
<dependencies>
    <dependency>
        <groupId>org.example</groupId>
        <artifactId>common-service</artifactId>
        <version>1.0-SNAPSHOT</version>
        <scope>compile</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.32</version>
        <scope>provided</scope>
    </dependency>
```

```java
package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
       SpringApplication.run(GatewayApplication.class, args);
    }

}
```

```yaml
my:
  nacos:
    server: nacos                          #nacos服务器地址

server:
  port: 8080

spring:
  application:
    name: gateway-service
  cloud:
    nacos:
      server-addr: ${my.nacos.server}:8848
    gateway:
      routes: # 路由配置
        - id: product-service                           # id，必须唯一
          uri: lb://product-service                     # 访问地址，lb代表loadbalancer，负载均衡
          predicates: # 路由断言规则
            - Path=/products/**,/product/**             # 通过path路由，多个地址用,隔开
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/orders/**,/order/**
```

#### 5.8.2 [Spring Cloud Gateway](https://docs.spring.io/spring-cloud-gateway/docs/3.1.9/reference/html/#gateway-starter)

网关路由是网关的核心功能，用于将客户端请求转发到适当的后端服务。以下是可以配置的网关路由信息：

| 配置项             | 说明                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| 路由 ID（route id） | 路由的唯一标识符，用于区分不同的路由规则。通常使用有意义的名称，例如服务名称或路由目的地的组合。                                                               |
| 路由 URI（uri）     | 路由的目的地，指定请求转发到的目标地址。支持以下两种类型：<br>- lb：负载均衡 URI，用于将请求转发到一组后端服务，并通过负载均衡算法选择具体的服务实例。<br>- http：直接指定目标服务的 HTTP 地址。 |
| 断言（predicates）  | 一组用于判断请求是否符合转发条件的规则。只有当请求满足所有断言条件时，才会被转发到路由目的地。断言可以基于请求的各种属性，例如路径、HTTP 方法、请求头、查询参数等。                           |
| 过滤器（filters）    | 一组用于在请求转发之前或之后执行的处理逻辑。过滤器可以修改请求或响应的内容，例如添加或删除请求头、修改请求参数、记录日志、进行身份验证等。                                          |

##### 5.8.2.1 Shortcut Configuration

Shortcut configuration is recognized by the filter name, followed by an equals sign (`=`), followed by argument values separated by commas (`,`).

`application.yaml`

```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: after_route
        uri: https://example.org
        predicates:
        - Cookie=mycookie,mycookievalue
```

##### 5.8.2.2 Fully Expanded Arguments

Fully expanded arguments appear more like standard yaml configuration with name/value pairs. Typically, there will be a `name` key and an `args` key. The `args` key is a map of key value pairs to configure the predicate or filter.

`application.yaml`

```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: after_route
        uri: https://example.org
        predicates:
        - name: Cookie
          args:
            name: mycookie
            regexp: mycookievalue
```

##### 5.8.2.3 [断言](https://docs.spring.io/spring-cloud-gateway/docs/3.1.9/reference/html/#gateway-request-predicates-factories )

##### 5.8.2.4 [过滤器]( https://docs.spring.io/spring-cloud-gateway/docs/3.1.9/reference/html/#gatewayfilter-factories)

`gateway-service` `application.yaml`  
`filter: ` add ` - AddRequestHeader=Message, I Love SpringGateWay `  
`default-filters: ` 和 `route` 同级

```yaml
my:
  nacos:
    server: nacos                          #nacos服务器地址

server:
  port: 8080

spring:
  application:
    name: gateway-service
  cloud:
    nacos:
      server-addr: ${my.nacos.server}:8848
    gateway:
      routes: # 路由配置
        - id: product-service                           # id，必须唯一
          uri: lb://product-service                     # 访问地址，lb代表loadbalancer，负载均衡
          predicates: # 路由断言规则
            - Path=/products/**,/product/**             # 通过path路由，多个地址用,隔开
          filters:
            - AddRequestHeader=Message, I Love SpringGateWay
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/orders/**,/order/**
```

`ProductController`  
add arg `@RequestHeader(value = "message",required = false) String message`  
`false` => `message` 非必须，若方法内定义 message 则替代请求头中的参数

```java
package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.entity.Product;
import org.example.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 这是一个处理产品相关请求的Rest控制器。
 * 它使用Lombok的@RequiredArgsConstructor来注入依赖。
 */
@RestController
@RequiredArgsConstructor
public class ProductController {

    // ProductService依赖项由Lombok的@RequiredArgsConstructor自动注入
    private final ProductService productService;

    /**
     * 此方法处理对"/products"端点的GET请求。
     * 它使用ProductService获取所有产品并返回它们。
     *
     * @return 所有产品的列表
     */
    @GetMapping("/products")
    public List<Product> findAll(@RequestHeader(value = "message",required = false) String message){
       System.out.println(message);
       System.out.println("Called by client");
       return productService.findAll();
    }
}
```

###### 5.8.2.4.1 自定义过滤器

Spring Cloud Gateway 提供了两种类型的过滤器：

1. **GatewayFilter（路由过滤器）**：
	* 作用范围：仅作用于指定的路由规则。
	* 生效方式：需要在路由配置中显式声明才能生效。
	* 适用场景：对特定路由进行定制化处理，例如针对某个服务的请求进行特殊处理。

2. **GlobalFilter（全局过滤器）**：
	* 作用范围：作用于所有路由规则。
	* 生效方式：声明后自动生效，无需额外配置。
	* 适用场景：对所有请求进行统一处理，例如全局的身份验证、日志记录等。

由于 Spring Cloud Gateway 采用响应式编程模型，所有的过滤器都需要返回一个 `Mono` 对象，表示一个异步调用。当过滤器完成处理后，会通过 `Mono` 对象通知 Gateway 继续执行后续的处理逻辑。

`gateway-service` Module

```java
package org.example.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

//Ordered接口为过滤器的优先级接口
public class AuthGlobalFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
       //模拟校验过程，代码后面再来补完
       //获取请求头
       ServerHttpRequest request = exchange.getRequest();
       HttpHeaders headers = request.getHeaders();
       System.out.println(headers);
       return chain.filter(exchange);
    }

    //优先级设置，数字越小优先级越高。0为最高优先级。
    @Override
    public int getOrder() {
       return 0;
    }
}
```

#### 5.8.3 [JSON Web Token (JWT)](https://jwt.io/)

#JWT #Auth0

JWT (JSON Web Token) 是一种开放标准 (RFC 7519)，以 JSON 格式作为载体，用于在不同服务终端之间安全地传递信息。JWT 主要用于用户身份验证，通过数字签名确保信息在传输过程中不被篡改。

##### 5.8.3.1 JWT 的组成

JWT 通常由以下三个部分组成，使用 `.` 连接：

1. **Header (头)**：包含 JWT 的类型 (`typ`) 和签名算法 (`alg`) 等元数据。例如：

	```json
    {"typ":"JWT","alg":"HS256"}
    ```

	经过 Base 64 编码后得到第一部分：`eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9`

2. **Payload (载荷)**：包含 JWT 的有效信息，分为三类（均为非必要使用）：

	* **标准声明 (Registered Claims)**：*建议但不强制使用*的声明，如签发者 (`iss`)、面向用户 (`sub`)、接收方 (`aud`)、过期时间 (`exp`) 、生效时间 (`nbf`) 、签发时间 (`iat`) 、唯一身份标识作一次性 token 避免重放攻击 (`jti`) 等。
	* **公共声明 (Public Claims)**：可以添加任何信息，如用户 ID、用户名等。
	* **私有声明 (Private Claims)**：提供者和消费者共同定义的声明，不建议存放敏感信息，因为 base64 对称解密，可归类为明文。

	例如：

	```json
    {"id":"123456","name":"MoonlightL","sex":"male"}
    ```

	经过 Base 64 编码后得到第二部分：`eyJpZCI6IjEyMzQ1NiIsIm5hbWUiOiJNb29ubGlnaHRMIiwic2V4IjoibWFsZSJ9`

3. **Signature (签名)**：对 Header 和 Payload 的 Base 64 编码结果进行签名，以确保 JWT 的完整性和真实性。签名算法由 Header 中的 `alg` 指定。

	例如，使用 HS 256 算法对上述 Header 和 Payload 进行签名后得到第三部分：`e5dda3f17226c1c6ca7435cd17f83ec0c74d62bd8e8386e1a178cd970737f09f`

将上述三部分使用 `.` 连接，即可得到完整的 JWT：

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMzQ1NiIsIm5hbWUiOiJNb29ubGlnaHRMIiwic2V4IjoibWFsZSJ9.e5dda3f17226c1c6ca7435cd17f83ec0c74d62bd8e8386e1a178cd970737f09f
```

##### 5.8.3.2 应用

`gateway-service` Module

###### 5.8.3.2.1 引入依赖

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.32</version>
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
</dependency>
<dependency>
    <groupId>com.auth0</groupId>
    <artifactId>java-jwt</artifactId>
    <version>4.4.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

###### 5.8.3.2.2 工具类

```java
package org.example.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.Date;
import java.util.Map;

public class JwtTool {

    private final static long TTL = 1000 * 60 * 60 * 24;          //token的过期时间1天。
    private final static String SECRET_KEY = "A/.Sss324hah21asdjlkcxb.rt2-09z.sdfm!~";            //密钥。

    //生成密钥，传入userId作为主题，claims为载荷
    //主题（Subject），即令牌的持有者
    public static String createToken(String username, Map<String, Object> claims) {
       Date now = new Date();
       JWTCreator.Builder builder = JWT.create();
       String token = builder.withSubject(username)
             .withPayload(claims)
             .withExpiresAt(new Date(now.getTime() + TTL))
             .sign(Algorithm.HMAC256(SECRET_KEY));
       System.out.println(token);
       return token;
    }

    //解密
    public static Map<String, Claim> getClaims(String token) {
       JWTVerifier jwtVerifier = JWT.require(Algorithm.HMAC256(SECRET_KEY)).build();
       DecodedJWT decodedJWT = jwtVerifier.verify(token);
       return decodedJWT.getClaims();
    }

}
```

###### 5.8.3.2.3 属性文件

```yaml
my:
  auth:
    excludePaths:
      - /products/**
```

###### 5.8.3.2.4 配置属性文件

```java
package org.example.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "my.auth")
public class AuthProperties {
    private List<String> excludePaths;
}
```

###### 5.8.3.2.5 过滤器

```java
package org.example.filter;

import com.auth0.jwt.interfaces.Claim;
import lombok.RequiredArgsConstructor;
import org.example.config.AuthProperties;
import org.example.util.JwtTool;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuthGlobalFilter implements GlobalFilter, Ordered {

    private final AuthProperties authProperties;
    private AntPathMatcher antPathMatcher = new AntPathMatcher();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
       //获取请求头
       ServerHttpRequest request = exchange.getRequest();
       //判断是否是可以放行的路径
       if (isExclude(request)) {
          return chain.filter(exchange);
       }
       //需要校验权限的路径
       List<String> authorization = request.getHeaders().get("authorization");
       String token = null;
       //获取token
       if (authorization != null && !authorization.isEmpty()) {
          token = authorization.get(0);
       }
       String username = null;
       try {
          Map<String, Claim> claims = JwtTool.getClaims(token);
          if (claims.containsKey("username")) {
             Claim claim = claims.get("username");
             username = claim.asString();
          }
          System.out.println(username);
       } catch (Exception e) {
          System.out.println(e);
          //如果出错，说明用户没有权限
          ServerHttpResponse response = exchange.getResponse();
          response.setStatusCode(HttpStatus.UNAUTHORIZED);        //设置401，用户无权限标志位
          return response.setComplete();              //返回异步调用
       }
       return chain.filter(exchange);
    }

    //用于判断是否是可以放行的地址。
    private boolean isExclude(ServerHttpRequest request) {
       String url = request.getPath().toString();
       for (String excludeUrl : authProperties.getExcludePaths()) {
          if (antPathMatcher.match(excludeUrl, url)) {
             System.out.println("true");
             return true;
          }
       }
       return false;
    }

    //优先级设置，数字越小优先级越高。0为最高优先级。
    @Override
    public int getOrder() {
       return 0;
    }
}
```

###### 5.8.3.2.6 测试

`/orders/**` 无法正常访问。  
`/products/**` 设置为例外地址，还能正常访问。

###### 5.8.3.2.7 生成 Token

```java
package org.example.util;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

@SpringBootTest
public class JwtToolTest {

    @Test
    public void testCreateToken() {
       Map<String, Object> map = new HashMap<>();
       map.put("username", "zhangsan");
       map.put("role", "user");
       String token = JwtTool.createToken("zhangsan", map);
       System.out.println(token);
    }
}
```

###### 5.8.3.2.8 权限测试

测试 order 接口：请求 Header 添加 authorization 属性，值为 token
