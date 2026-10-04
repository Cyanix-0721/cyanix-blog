---
tags: []
title: MyBatis乐观锁实现指南
aliases: MyBatis乐观锁实现指南
date created: 2024-10-22 17:04:04
date modified: 2026-03-27 07:11:06
---

# MyBatis乐观锁实现指南

乐观锁是一种并发控制方法，它假设多用户并发访问数据库时，不会发生冲突。只在数据提交更新时，才会正式对数据的冲突与否进行检查。

## 1 实现原理

乐观锁通常通过以下两种方式实现：

- 版本号机制
- 时间戳机制

# 2 环境准备

## 1 Maven依赖

```xml
<dependencies>
    <!-- MyBatis -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>2.3.1</version>
    </dependency>
    
    <!-- MySQL -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.30</version>
        <optional>true</optional>
    </dependency>
</dependencies>
```

# 3 数据库设计

```sql
CREATE TABLE t_product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL COMMENT '商品名称',
    stock INT NOT NULL COMMENT '库存',
    version INT NOT NULL DEFAULT 1 COMMENT '版本号',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
```

# 4 项目实现

## 1 实体类

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    private Long id;
    private String productName;
    private Integer stock;
    private Integer version;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

## 2 Mapper接口

```java
@Mapper
public interface ProductMapper {
    @Select("SELECT * FROM t_product WHERE id = #{id}")
    Product selectById(@Param("id") Long id);
    
    @Update("UPDATE t_product SET stock = #{stock}, version = version + 1 " +
            "WHERE id = #{id} AND version = #{version}")
    int decreaseStock(@Param("id") Long id, 
                     @Param("stock") Integer stock, 
                     @Param("version") Integer version);
}
```

## 3 Service层

```java
@Service
@Slf4j
public class ProductService {
    @Autowired
    private ProductMapper productMapper;
    
    @Transactional
    public boolean decreaseStock(Long productId, Integer count) {
        // 1. 查询商品当前信息
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }
        
        // 2. 校验库存
        if (product.getStock() < count) {
            throw new RuntimeException("库存不足");
        }
        
        // 3. 更新库存
        int affected = productMapper.decreaseStock(
            productId,
            product.getStock() - count,
            product.getVersion()
        );
        
        // 4. 更新失败则重试
        if (affected == 0) {
            log.info("更新失败，版本号冲突");
            return false;
        }
        
        return true;
    }
}
```

## 4 控制器

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductService productService;
    
    @PostMapping("/{id}/stock/decrease")
    public ResponseEntity<?> decreaseStock(
            @PathVariable Long id,
            @RequestParam Integer count) {
        boolean success = productService.decreaseStock(id, count);
        if (success) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(409).body("库存更新失败，请重试");
    }
}
```

# 5 测试用例

```java
@SpringBootTest
class ProductServiceTest {
    @Autowired
    private ProductService productService;
    
    @Test
    void testDecreaseStock() {
        // 模拟并发请求
        CountDownLatch latch = new CountDownLatch(2);
        
        new Thread(() -> {
            try {
                boolean result = productService.decreaseStock(1L, 1);
                System.out.println("线程1结果:" + result);
            } finally {
                latch.countDown();
            }
        }).start();
        
        new Thread(() -> {
            try {
                boolean result = productService.decreaseStock(1L, 1);
                System.out.println("线程2结果:" + result);
            } finally {
                latch.countDown();
            }
        }).start();
        
        latch.await();
    }
}
```

# 6 最佳实践

## 1 重试机制

推荐实现重试机制来处理并发冲突：

```java
public boolean decreaseStockWithRetry(Long productId, Integer count) {
    int maxRetries = 3;
    int retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            boolean success = decreaseStock(productId, count);
            if (success) {
                return true;
            }
            retryCount++;
            Thread.sleep(50); // 短暂延迟后重试
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            break;
        }
    }
    return false;
}
```

## 2 性能优化建议

1. 合理设置重试次数和间隔
2. 添加适当的索引
3. 使用批量更新减少数据库访问
4. 考虑使用缓存预热热点数据

# 7 常见问题

## 1 版本号溢出

对于高并发系统，需要注意版本号可能溢出的问题。建议：

1. 使用足够大的数据类型（如BIGINT）
2. 定期重置版本号
3. 实现版本号回环处理逻辑

## 2 性能问题

在高并发场景下可能出现：

1. 频繁重试导致的性能下降
2. 大量事务回滚
3. 数据库压力过大

解决方案：

1. 使用分布式缓存
2. 实现请求排队机制
3. 合理设置重试策略
4. 考虑使用悲观锁

## 3 死锁预防

1. 设置合理的事务超时时间
2. 避免长事务
3. 保持加锁顺序一致
4. 及时释放锁资源
