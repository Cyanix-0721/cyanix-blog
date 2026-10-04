---
tags: [SpringBoot, Redis, Redission]
title: SpringBoot集成Redisson
aliases: SpringBoot集成Redisson
date created: 2024-10-22 17:11:07
date modified: 2026-03-27 07:11:05
---

# SpringBoot集成Redisson

## 1 Redisson简介

Redisson是Redis官方推荐的Java版分布式中间件，提供了分布式的Java常用对象、分布式服务和分布式锁等功能。

### 1.1 主要特性

- 分布式锁和同步器
- 分布式集合
- 分布式对象
- 分布式服务
- 支持Redis单机、主从、哨兵、集群等部署方式

## 2 环境搭建

### 2.1 Maven依赖

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.24.3</version>
</dependency>
```

### 2.2 配置文件

```yaml
spring:
  redis:
    redisson:
      config:
        singleServerConfig:
          address: "redis://localhost:6379"
          password: null
          database: 0
        # 线程池配置
        threads: 16
        nettyThreads: 32
        # 编码配置
        codec: !<org.redisson.codec.JsonJacksonCodec> {}
        # 传输模式配置
        transportMode: "NIO"
```

### 2.3 配置类

```java
@Configuration
public class RedissonConfig {
    
    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        // 单机模式
        config.useSingleServer()
              .setAddress("redis://localhost:6379")
              .setConnectionMinimumIdleSize(10)
              .setConnectionPoolSize(50);
        return Redisson.create(config);
    }
}
```

## 3 常用功能

### 3.1 分布式锁

```java
@Service
@Slf4j
public class StockService {
    @Autowired
    private RedissonClient redissonClient;
    
    public void decreaseStock(Long productId, int count) {
        RLock lock = redissonClient.getLock("product_stock_" + productId);
        try {
            // 尝试加锁，最多等待3秒，10秒后自动解锁
            boolean locked = lock.tryLock(3, 10, TimeUnit.SECONDS);
            if (locked) {
                // 执行库存扣减逻辑
                doDecrease(productId, count);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("获取锁失败", e);
        } finally {
            lock.unlock();
        }
    }
}
```

### 3.2 分布式集合

```java
@Service
public class CartService {
    @Autowired
    private RedissonClient redissonClient;
    
    public void addToCart(Long userId, Long productId) {
        RMap<Long, Integer> cart = redissonClient.getMap("user_cart_" + userId);
        cart.addAndGet(productId, 1); // 原子性增加商品数量
    }
    
    public Map<Long, Integer> getCart(Long userId) {
        RMap<Long, Integer> cart = redissonClient.getMap("user_cart_" + userId);
        return cart.readAllMap();
    }
}
```

### 3.3 布隆过滤器

```java
@Service
public class BloomFilterService {
    @Autowired
    private RedissonClient redissonClient;
    
    public void initBloomFilter() {
        RBloomFilter<Long> bloomFilter = redissonClient.getBloomFilter("product_bloom");
        // 初始化布隆过滤器：预计元素为100000，误判率为0.03
        bloomFilter.tryInit(100000L, 0.03);
    }
    
    public void addToBloomFilter(Long productId) {
        RBloomFilter<Long> bloomFilter = redissonClient.getBloomFilter("product_bloom");
        bloomFilter.add(productId);
    }
    
    public boolean mightContain(Long productId) {
        RBloomFilter<Long> bloomFilter = redissonClient.getBloomFilter("product_bloom");
        return bloomFilter.contains(productId);
    }
}
```

## 4 分布式锁实战

### 4.1 可重入锁

```java
@Service
public class OrderService {
    @Autowired
    private RedissonClient redissonClient;
    
    public void createOrder(Long orderId) {
        RLock lock = redissonClient.getLock("order_" + orderId);
        try {
            lock.lock();
            // 处理订单逻辑
            processOrder(orderId);
        } finally {
            lock.unlock();
        }
    }
}
```

### 4.2 公平锁

```java
@Service
public class QueueService {
    @Autowired
    private RedissonClient redissonClient;
    
    public void processQueue(String queueId) {
        RLock fairLock = redissonClient.getFairLock("queue_" + queueId);
        try {
            fairLock.lock();
            // 处理队列任务
            processQueueTask(queueId);
        } finally {
            fairLock.unlock();
        }
    }
}
```

### 4.3 读写锁

```java
@Service
public class CacheService {
    @Autowired
    private RedissonClient redissonClient;
    
    public void updateData(String key, String value) {
        RReadWriteLock rwLock = redissonClient.getReadWriteLock("data_" + key);
        RLock writeLock = rwLock.writeLock();
        try {
            writeLock.lock();
            // 写入数据
            writeData(key, value);
        } finally {
            writeLock.unlock();
        }
    }
    
    public String readData(String key) {
        RReadWriteLock rwLock = redissonClient.getReadWriteLock("data_" + key);
        RLock readLock = rwLock.readLock();
        try {
            readLock.lock();
            // 读取数据
            return readData(key);
        } finally {
            readLock.unlock();
        }
    }
}
```

## 5 最佳实践

### 5.1 锁的使用建议

1. 合理设置锁的超时时间

```java
// 设置锁的超时时间为30秒
lock.lock(30, TimeUnit.SECONDS);
```

1. 使用try-finally确保锁释放

```java
RLock lock = redissonClient.getLock("myLock");
try {
    lock.lock();
    // 业务逻辑
} finally {
    if (lock.isHeldByCurrentThread()) {
        lock.unlock();
    }
}
```

1. 避免长时间持有锁

```java
// 错误示例
lock.lock();
Thread.sleep(very_long_time);  // 不要在持有锁时进行耗时操作

// 正确示例
// 将耗时操作放在加锁区域外
doSomethingTimeConsuming();
lock.lock();
try {
    doQuickOperation();
} finally {
    lock.unlock();
}
```

### 5.2 连接池配置

```java
Config config = new Config();
config.useSingleServer()
      .setConnectionMinimumIdleSize(5)    // 最小空闲连接数
      .setConnectionPoolSize(50)          // 连接池大小
      .setIdleConnectionTimeout(10000)    // 空闲连接超时时间
      .setConnectTimeout(10000)          // 连接超时时间
      .setRetryAttempts(3)               // 重试次数
      .setRetryInterval(1500);           // 重试间隔
```

## 6 性能优化

### 6.1 序列化优化

```java
@Configuration
public class RedissonConfig {
    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        // 使用FST序列化
        config.setCodec(new FstCodec());
        // 其他配置...
        return Redisson.create(config);
    }
}
```

### 6.2 线程池优化

```yaml
spring:
  redis:
    redisson:
      config:
        threads: 16             # 业务操作线程池大小
        nettyThreads: 32        # Netty线程池大小
        transportMode: "NIO"    # 传输模式
```

### 6.3 监控指标

```java
@Service
public class RedissonMonitorService {
    @Autowired
    private RedissonClient redissonClient;
    
    public RedisMetrics getMetrics() {
        RedisMetrics metrics = new RedisMetrics();
        metrics.setConnections(redissonClient.getNodesGroup().pingAll().size());
        // 获取更多指标...
        return metrics;
    }
}
```
