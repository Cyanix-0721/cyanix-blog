---
tags: [Cache, Redis]
title: Redis
date created: 2024-08-15 04:19:28
date modified: 2026-03-27 07:11:06
---

# Redis

## 1 Redis 简要介绍

Redis 是一个开源的内存数据库，以其速度快、支持多种数据结构（如字符串、哈希、列表、集合、有序集合等）而著称。它不仅可以作为数据库，还可以用作缓存、消息队列等。Redis 的持久化机制确保数据即使在断电或崩溃时也能恢复。

### 1.1 Redis 在 Java 中的应用

#### 1.1.1 引入依赖

在使用 Spring 框架时，首先需要在项目的 `pom.xml` 文件中引入 Redis 和 Lettuce 的相关依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>io.lettuce.core</groupId>
    <artifactId>lettuce-core</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

#### 1.1.2 配置 Redis 连接

在 `application.properties` 或 `application.yml` 中配置 Redis 的连接信息：

```properties
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.password=yourpassword
```

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password: yourpassword
```

#### 1.1.3 创建 Redis 配置类

```java
package com.mole.persoread.common.config;  
  
import com.fasterxml.jackson.annotation.JsonAutoDetect;  
import com.fasterxml.jackson.annotation.PropertyAccessor;  
import com.fasterxml.jackson.databind.ObjectMapper;  
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;  
import org.springframework.cache.CacheManager;  
import org.springframework.context.annotation.Bean;  
import org.springframework.context.annotation.Configuration;  
import org.springframework.data.redis.cache.RedisCacheConfiguration;  
import org.springframework.data.redis.cache.RedisCacheManager;  
import org.springframework.data.redis.connection.RedisConnectionFactory;  
import org.springframework.data.redis.core.RedisTemplate;  
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;  
import org.springframework.data.redis.serializer.RedisSerializer;  
import org.springframework.data.redis.serializer.StringRedisSerializer;  
  
import java.time.Duration;  
  
@Configuration  
public class RedisConfig {  
  
    /**  
     * 配置 RedisTemplate  
     *     * @param redisConnectionFactory Redis 连接工厂  
     * @return RedisTemplate 实例  
     */  
    @Bean  
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {  
        // 创建一个 RedisSerializer 对象，用于序列化 Redis 中的值  
        RedisSerializer<Object> serializer = redisSerializer();  
  
        // 创建一个 RedisTemplate 对象，用于执行 Redis 操作  
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();  
  
        // 设置 Redis 连接工厂  
        redisTemplate.setConnectionFactory(redisConnectionFactory);  
  
        // 设置键的序列化器为 StringRedisSerializer          
        redisTemplate.setKeySerializer(new StringRedisSerializer());  
  
        // 设置值的序列化器为自定义的 JSON 序列化器  
        redisTemplate.setValueSerializer(serializer);  
  
        // 设置哈希键的序列化器为 StringRedisSerializer        
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());  
  
        // 设置哈希值的序列化器为自定义的 JSON 序列化器  
        redisTemplate.setHashValueSerializer(serializer);  
  
        // 在设置完所有属性后，调用 afterPropertiesSet 方法，确保所有属性都已设置  
        redisTemplate.afterPropertiesSet();  
  
        // 返回配置好的 RedisTemplate 实例  
        return redisTemplate;  
    }  
  
    /**  
     * 配置 Redis 序列化器  
     *  
     * @return RedisSerializer 实例  
     */  
    @Bean  
    public RedisSerializer<Object> redisSerializer() {  
  
        // 创建 ObjectMapper 对象，用于配置 JSON 序列化  
        ObjectMapper objectMapper = new ObjectMapper();  
  
        // 设置所有访问权限的可见性  
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);  
  
        // 启用默认类型，必须设置，否则无法将 JSON 转化为对象，会转化成 Map 类型  
        objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL);  
  
        // 创建 JSON 序列化器, 将配置好的 ObjectMapper 设置到 JSON 序列化器中  
        return new Jackson2JsonRedisSerializer<>(objectMapper, Object.class);  
    }  
  
    /**  
     * 配置 Redis 缓存管理器  
     *  
     * @param redisConnectionFactory Redis 连接工厂  
     * @return RedisCacheManager 实例  
     */  
    @Bean  
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {  
        RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()  
                .entryTtl(Duration.ofDays(1)) // 设置缓存过期时间  
                .disableCachingNullValues();  
  
        return RedisCacheManager.builder(redisConnectionFactory)  
                .cacheDefaults(cacheConfig)  
                .build();  
    }  
}
```

#### 1.1.4 使用 RedisTemplate 进行操作

在业务逻辑中，可以使用 `RedisTemplate` 进行各种 Redis 操作，例如存取数据、操作列表和集合等：

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public void saveValue(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    public Object getValue(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    public void deleteValue(String key) {
        redisTemplate.delete(key);
    }
}
```

#### 1.1.5 使用注解简化缓存操作

> [!note] SpringCache  
>
> | 注解               | 描述                                                              |
| ---------------- | --------------------------------------------------------------- |
| `@EnableCaching` | 开启缓存注解功能，用于启动类或配置类                                              |
| `@Cacheable`     | 标记方法的返回值会被缓存。如果缓存中存在数据，则直接返回缓存数据，否则执行方法并缓存结果。                   |
| `@CachePut`      | 标记方法的返回值会更新缓存。每次调用方法时，都会执行方法并将结果更新到缓存中。                         |
| `@CacheEvict`    | 标记方法会清除缓存中的数据。可以指定清除特定的缓存项或整个缓存。                                |
| `@Caching`       | 组合多个缓存操作注解（如 `@Cacheable`、`@CachePut`、`@CacheEvict`），用于复杂的缓存逻辑。 |
| `@CacheConfig`   | 类级别注解，用于配置共享的缓存名称和其他缓存配置。                                       |

#### 1.1.6 ![[Spring Cache]]
