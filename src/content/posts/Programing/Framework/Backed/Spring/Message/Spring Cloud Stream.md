---
tags:
  - Framework
  - SpringCloud
---

# Spring Cloud Stream

**Spring Cloud Stream** 是 Spring Cloud 项目中的一个模块，旨在简化微服务架构中与消息系统的集成。它为构建消息驱动的微服务提供了一个编程模型，并抽象了底层的消息中间件（如 Kafka、RabbitMQ 等）的实现细节。Spring Cloud Stream 通过“消息通道”和“绑定器”将应用程序与消息代理连接，开发者无需直接处理消息系统的复杂性。

> [!summary]
>
> Spring Cloud Stream 为微服务提供了一种标准化的、简化的消息驱动开发方式，它通过与不同的消息中间件（如 Kafka 和 RabbitMQ）集成，使得开发者可以专注于业务逻辑，而无需关心底层的实现细节。

## 1 核心概念

1. **Binder（绑定器）**  
   Binder 是 Spring Cloud Stream 的核心组件之一，它负责将应用程序的消息通道与底层的消息中间件（例如 Kafka 或 RabbitMQ）绑定。Binder 提供了统一的抽象，隐藏了与具体消息中间件的交互细节。

2. **Message Channel（消息通道）**  
   Spring Cloud Stream 使用 `MessageChannel` 作为与消息中间件交互的接口。消息通道有两个主要的类型：
   - `Input`：用于接收消息的通道。
   - `Output`：用于发送消息的通道。

3. **Binding（绑定）**  
   绑定是指应用程序中的消息通道和消息代理之间的连接关系。通过绑定，可以实现消息的发送和接收。

4. **消息处理器（Message Processor）**  
   消息处理器是对输入和输出通道进行业务处理的组件，开发者只需要专注于消息的处理逻辑，而无需关心底层的消息传输机制。

## 2 使用 Spring Cloud Stream 的基本步骤

### 2.1 添加依赖

根据使用的消息中间件，添加相应的依赖。例如，使用 RabbitMQ 作为消息代理：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
</dependency>
```

如果使用 Kafka，则添加以下依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-kafka</artifactId>
</dependency>
```

### 2.2 定义消息通道接口

可以通过注解 `@Input` 和 `@Output` 来定义输入和输出通道接口。

```java
public interface MyChannels {
    
    @Output("myOutput")
    MessageChannel output();

    @Input("myInput")
    SubscribableChannel input();
}
```

在此示例中，我们定义了两个通道，一个用于发送消息，一个用于接收消息。

### 2.3 配置通道绑定

在 `application.yml` 中配置消息通道与消息代理之间的绑定。例如，使用 RabbitMQ：

```yaml
spring:
  cloud:
    stream:
      bindings:
        myOutput:
          destination: my-queue
        myInput:
          destination: my-queue
```

此配置指明了消息发送到的目标 `my-queue`，并从相同的队列中接收消息。

### 2.4 发送消息

可以通过 `MessageChannel` 发送消息：

```java
@Autowired
private MyChannels myChannels;

public void sendMessage(String message) {
    myChannels.output().send(MessageBuilder.withPayload(message).build());
}
```

### 2.5 处理接收到的消息

通过 `@StreamListener` 注解监听消息：

```java
@EnableBinding(MyChannels.class)
public class MessageProcessor {

    @StreamListener("myInput")
    public void handleMessage(String message) {
        System.out.println("Received: " + message);
    }
}
```

## 3 其他功能

1. **消息转换**  
   Spring Cloud Stream 支持使用消息转换器（例如，JSON 到 POJO）的自动转换，这样可以轻松地将消息载荷从一种格式转换为另一种格式。

2. **分区处理**  
   对于 Kafka 这样的消息系统，可以启用分区处理，使得消息根据某种键（例如用户 ID）分发到不同的分区，从而实现并行处理。

```yaml
spring:
  cloud:
    stream:
      bindings:
        myOutput:
          producer:
            partitionKeyExpression: headers['partitionKey']
            partitionCount: 3
```

1. **消息重试**  
   Spring Cloud Stream 支持在消息处理失败时自动进行重试，并允许自定义重试的次数和间隔。

```yaml
spring:
  cloud:
    stream:
      bindings:
        myInput:
          consumer:
            maxAttempts: 5
            backOffInitialInterval: 1000
            backOffMaxInterval: 10000
```
