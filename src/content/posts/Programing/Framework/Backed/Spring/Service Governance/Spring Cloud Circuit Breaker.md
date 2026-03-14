# Spring Cloud Circuit Breaker

**Spring Cloud Circuit Breaker** 是 Spring Cloud 微服务架构中的服务容错保护组件，用于处理分布式系统中的服务调用失败问题。它基于断路器（Circuit Breaker）模式，通过检测服务的响应状态，自动触发容错机制，以防止系统因为某个服务不可用而导致整体崩溃。

> [!summary]
>
> Spring Cloud Circuit Breaker 提供了一种简单有效的方式来处理微服务之间的调用失败问题，尤其适合在电商平台这种高并发、高依赖性的分布式系统中应用。通过断路器模式，开发者可以在服务调用失败时及时采取措施，防止问题扩散，保障系统的高可用性和稳定性。

> [!info] 在电商平台中的应用场景
>
> - **服务降级**
>
> 当某个微服务（如支付服务或物流服务）不可用时，Spring Cloud Circuit Breaker 可以触发回退逻辑，进行服务降级。例如，当支付服务不可用时，可以直接返回一个 "支付失败" 的结果，并提示用户稍后再试，而不是一直等待服务恢复。
>
> - **限流保护**
>
> 电商平台可能会在促销活动期间面临大量用户同时访问。在这种情况下，可以使用断路器配合限流保护，当流量过大或请求失败时，断路器会打开，保护后端服务不被压垮。
>
> - **依赖服务不稳定**
>
> 电商平台中，多个微服务之间存在复杂的依赖关系。例如，订单服务依赖库存服务、用户服务等。如果其中一个服务出现问题，断路器可以及时触发，避免订单服务受到影响，同时可以为用户提供友好的错误提示或进行数据回滚。

## 1 断路器模式的核心原理

断路器模式的核心思想是当某个服务不可用时，不再频繁尝试请求该服务，而是直接返回错误或执行回退逻辑，从而避免服务调用方长期等待和资源浪费。断路器有三种状态：

1. **Closed（关闭）**：断路器处于关闭状态时，所有请求都会直接发送到目标服务。如果服务调用失败率达到某个阈值，则断路器会进入打开状态。
   
2. **Open（打开）**：断路器处于打开状态时，所有请求将被快速失败，不再发送到目标服务，直接执行回退逻辑。此状态会持续一段时间，然后进入半开状态。

3. **Half-Open（半开）**：在断路器打开一段时间后，进入半开状态。此时，会允许部分请求通过，以检测服务是否恢复正常。如果部分请求成功，断路器会重新进入关闭状态；如果继续失败，断路器会再次进入打开状态。

## 2 Spring Cloud Circuit Breaker 的实现

Spring Cloud Circuit Breaker 提供了对多种断路器实现的支持，如 `Resilience4j` 和 `Hystrix`（不推荐新项目使用）。下面以 `Resilience4j` 为例，展示其在电商平台中的使用。

## 3 添加依赖

在 `pom.xml` 中添加 Spring Cloud Circuit Breaker 和 Resilience 4 j 的依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
```

## 4 使用断路器保护服务

使用 `@CircuitBreaker` 注解来标记需要保护的服务调用。可以通过注解中的 `name` 属性指定断路器的配置名称，通过 `fallbackMethod` 指定服务调用失败时的回退方法。

### 4.1 示例：电商平台中的订单服务调用库存服务

在电商平台中，当用户下单时，订单服务需要调用库存服务检查库存。为了防止库存服务出现问题导致订单服务长时间等待，可以为库存服务的调用添加断路器。

```java
@Service
public class OrderService {

    @Autowired
    private InventoryClient inventoryClient;

    @CircuitBreaker(name = "inventoryService", fallbackMethod = "fallbackCheckInventory")
    public boolean checkInventory(String productId) {
        // 调用库存服务检查库存
        return inventoryClient.checkInventory(productId);
    }

    // 回退方法
    public boolean fallbackCheckInventory(String productId, Throwable throwable) {
        System.out.println("Inventory service is down, executing fallback");
        // 默认返回库存不足
        return false;
    }
}
```

在上述代码中，`checkInventory` 方法调用了远程的库存服务。如果库存服务不可用或调用超时，断路器将触发回退逻辑，执行 `fallbackCheckInventory` 方法。

## 5 配置断路器参数

可以在 `application.yml` 中配置 `Resilience4j` 断路器的参数，如失败率阈值、超时时间、断路器状态转换的等待时间等。

```yaml
resilience4j:
  circuitbreaker:
    instances:
      inventoryService:
        # 请求失败率超过50%时，断路器进入打开状态
        failure-rate-threshold: 50
        # 请求的超时时间（毫秒）
        wait-duration-in-open-state: 10000
        # 断路器在半开状态时允许的最大并发请求数
        permitted-number-of-calls-in-half-open-state: 5
        # 滑动窗口的大小，定义多少次调用的统计
        sliding-window-size: 10
```

## 6 自定义回退逻辑

在回退方法中，可以实现更复杂的逻辑，而不仅仅是返回默认值。例如，可以从缓存中读取库存信息、返回默认库存状态，或者通知运维人员库存服务不可用等。

**示例：从缓存读取库存信息**

```java
public boolean fallbackCheckInventory(String productId, Throwable throwable) {
    System.out.println("Inventory service is down, attempting to fetch from cache");
    // 从缓存中获取库存信息
    Integer cachedInventory = cacheService.getCachedInventory(productId);
    return cachedInventory != null && cachedInventory > 0;
}
```

## 7 断路器的监控

Spring Cloud Circuit Breaker 还可以与 Spring Boot Actuator 集成，提供断路器的运行时监控信息。通过 Actuator 端点，可以查看断路器的状态、调用统计等。

### 7.1 示例：启用 Actuator

```yaml
management:
  endpoints:
    web:
      exposure:
        include: circuitbreakers
```

然后可以通过 `http://localhost:8080/actuator/circuitbreakers` 查看断路器的状态。
