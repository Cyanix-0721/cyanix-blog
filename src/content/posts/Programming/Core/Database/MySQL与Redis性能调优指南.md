---
tags: []
title: MySQL与Redis性能调优指南
date created: 2024-10-30 05:05:23
date modified: 2026-03-27 07:11:06
---

# MySQL与Redis性能调优指南

## 1 MySQL性能调优

### 1.1 服务器层面优化

1. **硬件选择**
   - 使用SSD替代机械硬盘
   - 配置足够的内存，建议总内存的70%-80%分配给MySQL
   - 多核CPU处理并发连接

2. **操作系统优化**
   - 调整文件系统的I/O调度算法
   - 增加文件描述符限制
   - 禁用透明大页（Transparent Huge Pages）

### 1.2 数据库设计优化

1. **表设计原则**
   - 选择合适的数据类型，尽量使用数字型主键
   - 表字段避免`NULL`值，使用`NOT NULL`并设置默认值
   - 控制单表数据量，适时分表分库

2. **索引优化**
   - 针对查询频繁的字段建立索引
   - 避免索引过多，删除无用索引
   - 合理使用联合索引，遵循最左前缀原则
   - 控制索引长度，考虑前缀索引

### 1.3 查询优化

1. **SQL语句优化**
   - 避免`SELECT *`，只查询需要的字段
   - 使用`EXPLAIN`分析SQL执行计划
   - 合理使用索引，避免索引失效
   - 优化`JOIN`语句，小表驱动大表

2. **事务优化**
   - 控制事务大小，避免长事务
   - 合理设置隔离级别
   - 避免事务嵌套

### 1.4 配置优化

1. **内存相关参数**

```ini
innodb_buffer_pool_size = 物理内存的50%-70%
innodb_buffer_pool_instances = 8
key_buffer_size = 256M-512M
```

1. **并发相关参数**

```ini
max_connections = 1000
innodb_thread_concurrency = 0
```

1. **日志相关参数**

```ini
innodb_log_file_size = 256M
innodb_log_buffer_size = 16M
```

## 2 Redis性能调优

### 2.1 内存优化

1. **内存配置**
   - 设置maxmemory限制内存使用
   - 配置合适的淘汰策略（如volatile-lru）
   - 及时清理过期键

2. **数据结构优化**
   - 合理使用数据结构
   - 压缩数据，使用ziplist等紧凑存储
   - 避免大key

### 2.2 持久化优化

1. **RDB优化**

```conf
save 900 1
save 300 10
save 60 10000
```

1. **AOF优化**

```conf
appendfsync everysec
no-appendfsync-on-rewrite yes
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

### 2.3 网络优化

1. **连接优化**
   - 使用连接池
   - 合理设置timeout
   - 启用keepalive

2. **批量操作**
   - 使用mget替代多个get
   - 使用pipeline批量执行命令
   - 使用Lua脚本减少网络交互

### 2.4 命令使用优化

1. **高效命令**
   - 避免使用keys命令，改用scan
   - 合理使用expire设置过期时间
   - 避免使用monitor命令

2. **架构优化**
   - 合理使用主从复制
   - 适时使用集群模式
   - 考虑哨兵机制保证高可用

## 3 监控与维护

1. **MySQL监控**
   - 使用慢查询日志找出慢SQL
   - 监控连接数、QPS、TPS
   - 定期检查表碎片并优化

2. **Redis监控**
   - 使用info命令查看性能指标
   - 监控内存使用情况
   - 关注慢查询日志

## 4 最佳实践

1. **MySQL最佳实践**
   - 定期备份数据
   - 及时更新统计信息
   - 维护合理的数据量
   - 定期进行性能检测

2. **Redis最佳实践**
   - 避免大量数据同时过期
   - 合理设置内存上限
   - 定期清理无用数据
   - 监控复制延迟
