---
tags: 
title: Spring Cloud Alibaba Sentinel
date created: 2024-11-04 08:26:39
date modified: 2026-03-14 09:35:38
date: 2026-03-15 02:52:39
---

# [Spring Cloud Alibaba Sentinel](https://sentinelguard.io/zh-cn/docs/introduction.html)

## 1 Sentinel介绍

### 1.1 什么是Sentinel

Sentinel是阿里巴巴开源的分布式系统的流量防卫兵，以流量为切入点，从流量控制、熔断降级、系统负载保护等多个维度保护服务的稳定性。

### 1.2 主要特性

- 流量控制
- 熔断降级
- 系统负载保护
- 实时监控
- 控制台管理
- 规则持久化
- 集群流控

### 1.3 核心概念

1. **资源**：可以是Java方法、URL或其他逻辑调用
2. **规则**：流控规则、熔断规则、系统规则等
3. **降级**：服务降级、熔断
4. **滑动窗口**：接口统计的时间窗口

## 2 快速开始

### 2.1 Maven依赖

```xml
<!-- Sentinel核心依赖 -->
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-core</artifactId>
    <version>${sentinel.version}</version>
</dependency>

<!-- Spring Cloud Alibaba Sentinel -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    <version>${spring.cloud.alibaba.version}</version>
</dependency>

<!-- Sentinel控制台 -->
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-transport-simple-http</artifactId>
    <version>${sentinel.version}</version>
</dependency>
```

### 2.2 基础配置(application.yml)

```yaml
spring:
  cloud:
    sentinel:
      transport:
        # 控制台地址
        dashboard: localhost:8080
        # 客户端监控API的端口
        port: 8719
      # 是否饥饿加载
      eager: true
      # Servlet Filter配置
      filter:
        enabled: true
      # 取消Sentinel控制台懒加载
      web-context-unify: false
      # 规则文件配置
      datasource:
        ds1:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: flow
```

## 3 流量控制

### 3.1 流控规则

```java
@Service
public class OrderService {
    
    @SentinelResource(value = "createOrder", 
                      blockHandler = "createOrderBlockHandler",
                      fallback = "createOrderFallback")
    public String createOrder() {
        // 业务逻辑
        return "订单创建成功";
    }
    
    // 流控处理
    public String createOrderBlockHandler(BlockException ex) {
        return "订单创建被限流";
    }
    
    // 降级处理
    public String createOrderFallback(Throwable e) {
        return "订单创建异常";
    }
}
```

### 3.2 Java代码配置规则

```java
@Configuration
public class SentinelConfig {
    
    @PostConstruct
    private void initFlowRules() {
        List<FlowRule> rules = new ArrayList<>();
        
        FlowRule rule = new FlowRule();
        rule.setResource("createOrder");
        // QPS限制
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        // 每秒允许调用次数
        rule.setCount(10);
        
        rules.add(rule);
        FlowRuleManager.loadRules(rules);
    }
}
```

### 3.3 控制台配置规则

```json
{
    "resource": "createOrder",
    "limitApp": "default",
    "grade": 1,
    "count": 10,
    "strategy": 0,
    "controlBehavior": 0,
    "clusterMode": false
}
```

## 4 熔断降级

### 4.1 降级规则

```java
@Service
public class UserService {
    
    @SentinelResource(value = "getUserInfo",
                      fallback = "getUserInfoFallback",
                      exceptionsToIgnore = {IllegalArgumentException.class})
    public UserInfo getUserInfo(String userId) {
        // 远程调用用户服务
        return remoteUserService.getUser(userId);
    }
    
    public UserInfo getUserInfoFallback(String userId, Throwable e) {
        // 返回默认用户信息
        return new UserInfo();
    }
}
```

### 4.2 配置降级规则

```java
private void initDegradeRule() {
    List<DegradeRule> rules = new ArrayList<>();
    
    DegradeRule rule = new DegradeRule();
    rule.setResource("getUserInfo");
    // 降级策略，根据异常比例
    rule.setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO);
    // 异常比例阈值
    rule.setCount(0.5);
    // 时间窗口
    rule.setTimeWindow(10);
    
    rules.add(rule);
    DegradeRuleManager.loadRules(rules);
}
```

## 5 系统自适应保护

### 5.1 系统规则

```java
private void initSystemRule() {
    List<SystemRule> rules = new ArrayList<>();
    
    SystemRule rule = new SystemRule();
    // 系统load
    rule.setHighestSystemLoad(3.0);
    // CPU使用率
    rule.setHighestCpuUsage(0.8);
    // 平均RT
    rule.setAvgRt(1000);
    // QPS
    rule.setQps(20);
    // 线程数
    rule.setMaxThread(10);
    
    rules.add(rule);
    SystemRuleManager.loadRules(rules);
}
```

## 6 规则持久化

### 6.1 Nacos配置

```yaml
spring:
  cloud:
    sentinel:
      datasource:
        # 流控规则
        flow:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: flow
        # 降级规则
        degrade:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-degrade-rules
            groupId: SENTINEL_GROUP
            rule-type: degrade
```

### 6.2 Nacos规则配置

```json
[
    {
        "resource": "createOrder",
        "limitApp": "default",
        "grade": 1,
        "count": 10,
        "strategy": 0,
        "controlBehavior": 0,
        "clusterMode": false
    }
]
```

## 7 集群流控

### 7.1 Token Server配置

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
        port: 8719
      cluster:
        server:
          # 启用集群服务端
          enabled: true
          # 服务端连接端口
          port: 11111
          # 流控规则是否需要持久化
          persistent: true
```

### 7.2 Token Client配置

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
        port: 8719
      cluster:
        client:
          # 启用集群客户端
          enabled: true
          # 服务端地址
          server-host: localhost
          # 服务端端口
          server-port: 11111
```

## 8 实践案例

### 8.1 接口限流

```java
@RestController
@RequestMapping("/api")
public class OrderController {
    
    @GetMapping("/orders")
    @SentinelResource(value = "getOrders",
                      blockHandler = "getOrdersBlockHandler",
                      fallback = "getOrdersFallback")
    public List<Order> getOrders() {
        return orderService.findAll();
    }
    
    public List<Order> getOrdersBlockHandler(BlockException ex) {
        log.warn("接口被限流", ex);
        return Collections.emptyList();
    }
    
    public List<Order> getOrdersFallback(Throwable e) {
        log.error("接口异常", e);
        return Collections.emptyList();
    }
}
```

### 8.2 服务熔断

```java
@Service
public class RemoteServiceClient {
    
    @SentinelResource(value = "remoteCall",
                      blockHandler = "remoteCallBlockHandler",
                      fallback = "remoteCallFallback")
    public String remoteCall() {
        return restTemplate.getForObject("http://remote-service/api/data", String.class);
    }
    
    public String remoteCallBlockHandler(BlockException ex) {
        return "服务被限流";
    }
    
    public String remoteCallFallback(Throwable e) {
        return "服务降级";
    }
}
```

### 8.3 热点参数限流

```java
@RestController
public class UserController {
    
    @GetMapping("/user/{id}")
    @SentinelResource(value = "getUserById",
                      blockHandler = "getUserByIdBlockHandler",
                      fallback = "getUserByIdFallback")
    public User getUserById(@PathVariable("id") String id) {
        return userService.getUser(id);
    }
    
    public User getUserByIdBlockHandler(String id, BlockException ex) {
        return new User();
    }
    
    public User getUserByIdFallback(String id, Throwable e) {
        return new User();
    }
}
```

## 9 最佳实践

### 9.1 规则配置建议

1. 根据实际业务场景选择合适的规则
2. 合理设置阈值和时间窗口
3. 配置降级和熔断规则兜底
4. 使用动态规则配置
5. 规则持久化到配置中心

### 9.2 开发建议

1. 合理使用@SentinelResource注解
2. 实现自定义的BlockHandler和Fallback
3. 注意异常处理
4. 监控规则效果
5. 做好日志记录

### 9.3 运维建议

1. 合理规划集群部署
2. 监控规则变更
3. 定期评估规则效果
4. 做好容量规划
5. 建立应急预案

## 10 常见问题

### 10.1 整合问题

1. 版本兼容性检查
2. 依赖冲突解决
3. 控制台连接问题
4. 规则持久化异常

### 10.2 使用问题

1. 规则不生效排查
2. 限流异常处理
3. 降级策略选择
4. 集群模式配置

### 10.3 性能问题

1. 规则数量优化
2. 监控数据处理
3. 集群流控性能
4. 规则推送延迟
