---
tags:
  - SpringBoot
  - SpringIntegration
  - RabbitMQ
---

# Spring Integration & RabbitMQ

在Spring Integration中整合RabbitMQ可以实现消息的发布、消费以及消息流的管理。以下是一个简单的使用Spring Integration与RabbitMQ整合的步骤：

## 1 添加依赖

首先在项目中添加Spring Integration和RabbitMQ的相关依赖，使用Maven管理依赖的例子如下：

```xml
<dependencies>
    <!-- Spring Integration core -->
    <dependency>
        <groupId>org.springframework.integration</groupId>
        <artifactId>spring-integration-core</artifactId>
    </dependency>

    <!-- Spring Integration for RabbitMQ -->
    <dependency>
        <groupId>org.springframework.integration</groupId>
        <artifactId>spring-integration-amqp</artifactId>
    </dependency>

    <!-- RabbitMQ Client -->
    <dependency>
        <groupId>com.rabbitmq</groupId>
        <artifactId>amqp-client</artifactId>
    </dependency>

    <!-- Spring Boot starter for RabbitMQ -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-amqp</artifactId>
    </dependency>
</dependencies>
```

## 2 配置RabbitMQ连接

配置RabbitMQ的连接工厂，确保应用程序能够与RabbitMQ服务交互。

```java
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.integration.amqp.dsl.Amqp;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.messaging.MessageChannel;

@Configuration
public class RabbitMqConfig {

    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory connectionFactory = new CachingConnectionFactory("localhost");
        connectionFactory.setUsername("guest");
        connectionFactory.setPassword("guest");
        return connectionFactory;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        return new RabbitTemplate(connectionFactory);
    }

    @Bean
    public Queue myQueue() {
        return new Queue("myQueue", true);
    }
    
    @Bean
    public MessageChannel inputChannel() {
        return new DirectChannel();
    }

    @Bean
    public IntegrationFlow amqpInbound(ConnectionFactory connectionFactory) {
        return IntegrationFlows.from(Amqp.inboundAdapter(connectionFactory, myQueue()))
                               .channel(inputChannel())
                               .get();
    }
}
```

## 3 发布消息

可以通过Spring Integration的`MessagingGateway`发布消息到RabbitMQ。

```java
import org.springframework.integration.annotation.MessagingGateway;

@MessagingGateway(defaultRequestChannel = "outputChannel")
public interface MyGateway {

    void sendToRabbit(String data);

}
```

配置发送的输出通道和队列：

```java
@Configuration
public class RabbitMqOutboundConfig {

    @Bean
    public MessageChannel outputChannel() {
        return new DirectChannel();
    }

    @Bean
    public IntegrationFlow amqpOutbound(ConnectionFactory connectionFactory) {
        return IntegrationFlows.from(outputChannel())
                               .handle(Amqp.outboundAdapter(rabbitTemplate(connectionFactory)))
                               .get();
    }
}
```

## 4 消费消息

通过定义`IntegrationFlow`将RabbitMQ的消息传入到应用程序的通道，并通过处理器来消费消息。

```java
@Configuration
public class RabbitMqInboundConfig {

    @Bean
    public IntegrationFlow rabbitInbound(ConnectionFactory connectionFactory) {
        return IntegrationFlows.from(Amqp.inboundAdapter(connectionFactory, myQueue()))
                               .handle(message -> {
                                   System.out.println("Received: " + message.getPayload());
                               })
                               .get();
    }
}
```

## 5 启动应用

通过调用`MyGateway`的`sendToRabbit`方法来发送消息，消费逻辑将自动处理从RabbitMQ队列中接收到的消息。

## 6 总结

- **依赖配置**：确保项目引入了Spring Integration和RabbitMQ的相关依赖。
- **配置连接**：使用`ConnectionFactory`连接RabbitMQ。
- **消息发送**：使用`MessagingGateway`发布消息。
- **消息消费**：通过`IntegrationFlow`来消费消息并处理。

这样，你就能够使用Spring Integration与RabbitMQ进行消息的传递和处理了。如果有更复杂的场景，比如处理路由、过滤或变换消息内容，可以通过Spring Integration的其他功能来扩展。
