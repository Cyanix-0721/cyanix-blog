---
tags: []
title: Spring Boot/Cloud 集成 Prometheus 和 Grafana 完整监控方案
aliases: Spring Boot/Cloud 集成 Prometheus 和 Grafana 完整监控方案
date created: 2024-11-04 07:31:27
date modified: 2026-03-27 07:11:18
---

# Spring Boot/Cloud 集成 Prometheus 和 Grafana 完整监控方案

## 1 概述

### 1.1 技术栈版本

- Spring Boot: 2.7. x
- Spring Cloud: 2021. x
- JDK: 1.8+
- Prometheus: 2.45.0
- Grafana: 9.5. x
- Maven: 3.6. x

### 1.2 监控架构

```
单体架构：
[Spring Boot Application] --> [Prometheus] --> [Grafana]

微服务架构：
[Gateway Service] -----> [Prometheus] --> [Grafana]
[Service A     ] -----> 
[Service B     ] -----> 
[Service C     ] -----> 
```

## 2 基础环境配置

### 2.1 Maven 依赖配置

#### 2.1.1 Spring Boot 项目

```xml
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Actuator -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    
    <!-- Prometheus -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
</dependencies>
```

#### 2.1.2 Spring Cloud 项目（common 模块）

```xml
<dependencies>
    <!-- Spring Cloud Dependencies -->
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
    
    <!-- Monitoring Dependencies -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
</dependencies>
```

### 2.2 应用配置

#### 2.2.1 Spring Boot 配置 (application. yml)

```yaml
server:
  port: 8080

spring:
  application:
    name: springboot-prometheus-demo

management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,info,metrics
  endpoint:
    health:
      show-details: always
    metrics:
      enabled: true
    prometheus:
      enabled: true
  metrics:
    tags:
      application: ${spring.application.name}
    export:
      prometheus:
        enabled: true
```

#### 2.2.2 Spring Cloud 配置 (bootstrap. yml)

```yaml
spring:
  application:
    name: ${SERVICE_NAME}
  cloud:
    config:
      enabled: true

management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,info,metrics
  metrics:
    tags:
      application: ${spring.application.name}
      environment: ${spring.profiles.active:default}
    enable:
      all: true
    export:
      prometheus:
        enabled: true
  endpoint:
    prometheus:
      enabled: true
```

## 3 监控指标配置

### 3.1 通用监控指标

```java
@Configuration
public class MetricsConfig {
    
    @Bean
    MeterRegistry meterRegistry() {
        return new SimpleMeterRegistry();
    }
    
    @Bean
    public Counter requestCounter(MeterRegistry registry) {
        return Counter.builder("app_requests_total")
                .description("应用请求总数")
                .tags("type", "total")
                .register(registry);
    }
    
    @Bean
    public Timer requestLatencyTimer(MeterRegistry registry) {
        return Timer.builder("app_request_latency")
                .description("请求延迟")
                .tags("type", "latency")
                .register(registry);
    }
    
    @Bean
    public Gauge queueSize(MeterRegistry registry, Queue<?> queue) {
        return Gauge.builder("app_queue_size", queue::size)
                .description("队列大小")
                .register(registry);
    }
}
```

### 3.2 业务监控指标

```java
@Service
@RequiredArgsConstructor
public class BusinessService {
    private final MeterRegistry registry;
    private final Counter businessCounter;
    
    public void processBusinessLogic() {
        Timer.Sample sample = Timer.start(registry);
        try {
            // 业务逻辑
            businessCounter.increment();
        } finally {
            sample.stop(registry.timer("business.process.time"));
        }
    }
}
```

### 3.3 网关监控指标（Spring Cloud）

```java
@Configuration
public class GatewayMetricsConfig {
    
    @Bean
    public RouteDefinitionMetrics routeMetrics(MeterRegistry registry) {
        return new RouteDefinitionMetrics(registry);
    }
    
    @Bean
    public FilteringWebHandler filteringWebHandler(List<GlobalFilter> globalFilters,
                                                 MeterRegistry registry) {
        return new MetricsFilteringWebHandler(globalFilters, registry);
    }
}
```

## 4 Prometheus 配置

### 4.1 单体应用配置

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'springboot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
    scrape_interval: 5s
```

### 4.2 微服务配置

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # 网关监控
  - job_name: 'spring-cloud-gateway'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['gateway:8080']
    
  # 服务发现监控
  - job_name: 'spring-cloud-services'
    eureka_sd_configs:
      - server: http://eureka-server:8761/eureka
    metrics_path: '/actuator/prometheus'
    relabel_configs:
      - source_labels: [__meta_eureka_app_name]
        target_label: application

  # 自定义业务监控
  - job_name: 'business-metrics'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['service-a:8081', 'service-b:8082']
    metric_relabel_configs:
      - source_labels: [__name__]
        regex: 'business_.*'
        action: keep
```

### 4.3 告警规则配置

```yaml
groups:
  - name: SpringAlerts
    rules:
      # 实例存活告警
      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Instance {{ $labels.instance }} down"
          
      # 高错误率告警
      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status="5xx"}[5m]) > 1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate on {{ $labels.instance }}"
          
      # JVM内存告警
      - alert: HighJVMMemoryUsage
        expr: jvm_memory_used_bytes / jvm_memory_max_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High JVM memory usage on {{ $labels.instance }}"
```

## 5 Grafana 配置

### 5.1 数据源配置

```json
{
  "name": "Prometheus",
  "type": "prometheus",
  "url": "http://localhost:9090",
  "access": "proxy",
  "basicAuth": false
}
```

### 5.2 Dashboard 配置

#### 5.2.1 JVM 监控面板

```json
{
  "panels": [
    {
      "title": "JVM堆内存使用",
      "type": "graph",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "sum(jvm_memory_used_bytes{area=\"heap\"}) by (instance)",
          "legendFormat": "{{instance}}"
        }
      ]
    },
    {
      "title": "GC暂停时间",
      "type": "graph",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "rate(jvm_gc_pause_seconds_sum[5m])",
          "legendFormat": "GC暂停"
        }
      ]
    }
  ]
}
```

#### 5.2.2 微服务监控面板

```json
{
  "panels": [
    {
      "title": "服务健康状态",
      "type": "stat",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "up",
          "legendFormat": "{{application}}"
        }
      ]
    },
    {
      "title": "服务请求量",
      "type": "graph",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "sum(rate(http_server_requests_seconds_count[5m])) by (application)",
          "legendFormat": "{{application}}"
        }
      ]
    },
    {
      "title": "服务响应时间",
      "type": "heatmap",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "rate(http_server_requests_seconds_sum[5m]) / rate(http_server_requests_seconds_count[5m])",
          "legendFormat": "{{application}}"
        }
      ]
    }
  ]
}
```

## 6 最佳实践

### 6.1 监控指标分类

1. 系统指标
   - CPU 使用率
   - 内存使用
   - 磁盘 IO
   - 网络流量

2. JVM 指标
   - 堆内存使用
   - 非堆内存使用
   - GC 情况
   - 线程状态

3. 应用指标
   - 请求量
   - 响应时间
   - 错误率
   - 业务指标

4. 中间件指标
   - 连接池状态
   - 队列大小
   - 缓存命中率

### 6.2 性能优化建议

1. 采集频率优化
   - 系统指标：15 s
   - 应用指标：5 s
   - 业务指标：30 s

2. 存储优化
   - 合理设置数据保留时间
   - 使用适当的压缩算法
   - 定期清理无用数据

3. 查询优化
   - 使用高效的 PromQL
   - 避免过度使用正则
   - 合理使用标签

### 6.3 告警策略

1. 告警级别
   - Critical：影响业务
   - Warning：需要关注
   - Info：提示信息

2. 告警规则
   - 实例存活
   - 资源使用率
   - 业务指标
   - 错误率

3. 告警通道
   - 邮件
   - 短信
   - 钉钉/企业微信
   - 自定义 webhook

## 7 常见问题排查

### 7.1 数据采集问题

1. 检查 actuator 端点配置
2. 验证网络连通性
3. 查看 Prometheus target 状态
4. 检查防火墙设置

### 7.2 性能问题

1. 调整采集间隔
2. 优化指标过滤
3. 配置数据压缩
4. 清理历史数据

### 7.3 集成问题

1. 版本兼容性检查
2. 依赖冲突解决
3. 配置文件验证
4. 服务注册检查

## 8 开发建议

### 8.1 代码实践

```java
@RestController
@RequiredArgsConstructor
public class DemoController {
    
    private final MeterRegistry meterRegistry;
    
    @GetMapping("/api/demo")
    public String demo() {
        // 记录请求计数
        meterRegistry.counter("api.requests", "endpoint", "demo").increment();
        
        // 记录处理时间
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            // 业务逻辑
            return "success";
        } finally {
            sample.stop(meterRegistry.timer("api.response.time", "endpoint", "demo"));
        }
    }
}
```

### 8.2 监控实践

1. 合理使用标签
2. 避免高基数指标
3. 关注重要指标
4. 定期检查告警
5. 持续优化配置

### 8.3 运维实践

1. 配置备份
2. 定期验证
3. 容量规划
4. 安全加固
5. 文档维护
