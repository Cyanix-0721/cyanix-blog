---
tags: []
title: Spring Cache
date created: 2024-11-19 15:20:53
date modified: 2026-03-27 07:11:16
---

# Spring Cache

Spring 提供了一套强大的缓存抽象（Spring Cache），通过 Redis 等多种存储介质实现缓存功能。以下是 Spring 中与 Redis 缓存相关的常用注解详解，包括其功能、用法和注意事项。

## 1 **@Cacheable**

### 1.1 **功能**

- 在方法执行前检查缓存，如果缓存存在则直接返回缓存结果；否则执行方法并将返回结果存入缓存。

### 1.2 **核心属性**

| 属性名          | 描述                                                                                 |
|-----------------|--------------------------------------------------------------------------------------|
| `value` 或 `cacheNames` | 缓存的名称（必须），可以对应多个缓存实例。                                          |
| `key`           | 缓存的键，支持 SpEL 表达式，默认是方法的所有参数组合。                                  |
| `keyGenerator`  | 自定义缓存键的生成逻辑，与 `key` 二选一。                                              |
| `condition`     | 判断是否需要缓存，返回 `true` 时才会缓存，支持 SpEL 表达式。                              |
| `unless`        | 方法执行完成后判断是否存入缓存，返回 `true` 则不缓存，支持 SpEL 表达式。                  |
| `sync`          | 是否启用同步缓存，当多个线程同时请求时避免方法多次执行，通常与分布式锁搭配使用。默认 `false`。 |

### 1.3 **示例**

```java
@Cacheable(value = "users", key = "#id", unless = "#result == null")
public User getUserById(Long id) {
    // 模拟耗时操作
    return userRepository.findById(id).orElse(null);
}
```

### 1.4 **注意事项**

- 如果 `unless` 和 `condition` 同时设置，`unless` 在方法执行后生效，而 `condition` 在方法执行前生效。
- 对于 Redis，`value` 的值会作为缓存的 **命名空间**。

## 2 **@CachePut**

### 2.1 **功能**

- 每次方法执行后，都会将返回结果更新到缓存中，通常用于更新缓存内容。

### 2.2 **核心属性**

| 属性名          | 描述                                                                                 |
|-----------------|--------------------------------------------------------------------------------------|
| `value` 或 `cacheNames` | 缓存的名称（必须）。                                                              |
| `key`           | 缓存的键，支持 SpEL 表达式，默认是方法的所有参数组合。                                  |
| `keyGenerator`  | 自定义缓存键的生成逻辑，与 `key` 二选一。                                              |
| `condition`     | 判断是否需要更新缓存，返回 `true` 时才更新，支持 SpEL 表达式。                            |
| `unless`        | 方法执行完成后判断是否更新缓存，返回 `true` 则不更新，支持 SpEL 表达式。                  |

### 2.3 **示例**

```java
@CachePut(value = "users", key = "#user.id")
public User updateUser(User user) {
    return userRepository.save(user);
}
```

### 2.4 **注意事项**

- **区别于 @Cacheable**：`@CachePut` 无论缓存中是否有数据，都会执行方法并更新缓存。
- 可用于修改操作中，确保缓存与数据库数据一致。

## 3 **@CacheEvict**

### 3.1 **功能**

- 移除缓存中的一个或多个条目，常用于数据删除或变更操作。

### 3.2 **核心属性**

| 属性名          | 描述                                                                                 |
|-----------------|--------------------------------------------------------------------------------------|
| `value` 或 `cacheNames` | 缓存的名称（必须）。                                                              |
| `key`           | 缓存的键，支持 SpEL 表达式。                                                          |
| `keyGenerator`  | 自定义缓存键的生成逻辑，与 `key` 二选一。                                              |
| `allEntries`    | 是否移除所有缓存条目，默认 `false`。                                                  |
| `beforeInvocation` | 是否在方法执行前清理缓存，默认 `false`（即方法执行成功后才清理缓存）。                  |

### 3.3 **示例**

```java
@CacheEvict(value = "users", key = "#id")
public void deleteUser(Long id) {
    userRepository.deleteById(id);
}

@CacheEvict(value = "users", allEntries = true)
public void clearAllCache() {
    // 清空 users 缓存空间
}
```

### 3.4 **注意事项**

- `allEntries = true` 会清空指定命名空间的所有缓存，慎用！
- `beforeInvocation = true` 可用于避免方法执行失败时缓存数据的不一致问题。

## 4 **@Caching**

### 4.1 **功能**

- 组合多个缓存操作注解（如 `@Cacheable`、`@CachePut` 和 `@CacheEvict`）。

### 4.2 **核心属性**

| 属性名          | 描述                                                                                 |
|-----------------|--------------------------------------------------------------------------------------|
| `cacheable`     | 包含一组 `@Cacheable` 注解。                                                         |
| `put`           | 包含一组 `@CachePut` 注解。                                                         |
| `evict`         | 包含一组 `@CacheEvict` 注解。                                                       |

### 4.3 **示例**

```java
@Caching(
    cacheable = { @Cacheable(value = "users", key = "#id") },
    put = { @CachePut(value = "users", key = "#result.email") },
    evict = { @CacheEvict(value = "tempCache", allEntries = true) }
)
public User getUserDetails(Long id) {
    return userRepository.findById(id).orElse(null);
}
```

### 4.4 **注意事项**

- `@Caching` 可以实现复杂的缓存逻辑，但可读性较低，需清晰注释。

## 5 **@CacheConfig**

### 5.1 **功能**

- 用于类级别的缓存配置，设置默认的缓存命名空间、键生成器等，减少重复代码。

### 5.2 **核心属性**

| 属性名           | 描述                                                                                 |
|------------------|--------------------------------------------------------------------------------------|
| `cacheNames` 或 `value` | 配置默认的缓存名称。                                                              |
| `keyGenerator`   | 配置默认的键生成器。                                                                 |

### 5.3 **示例**

```java
@CacheConfig(cacheNames = "users")
public class UserService {

    @Cacheable(key = "#id")
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @CacheEvict(key = "#id")
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
```

### 5.4 **注意事项**

- 配置后，类中的方法默认使用相同的缓存命名空间，简化注解配置。

## 6 **Redis缓存的注意事项**

1. **缓存穿透、雪崩和击穿**
   - 处理空值缓存（避免缓存穿透）。
   - 使用过期策略和热点缓存降级（应对缓存雪崩和击穿）。

2. **分布式缓存**
   - 使用 `@Cacheable(sync = true)` 或者分布式锁，避免缓存击穿。

3. **Spring Cache与Redis的整合**
   - 配置 `RedisCacheManager`，确保序列化方式与 Redis 兼容（推荐 `JSON` 序列化）。
   - 使用 `spring-boot-starter-data-redis` 实现快速集成。
