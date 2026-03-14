# MySQL 慢查询

MySQL 慢查询可以帮助你分析和优化数据库性能，特别是在处理复杂查询或大数据集时。慢查询日志记录了执行时间超过设定阈值的SQL语句。以下是关于如何启用、配置和分析 MySQL 慢查询的步骤。

## 1 启用慢查询日志

首先，你需要在 MySQL 配置文件（通常为 `my.cnf` 或 `my.ini`）中启用慢查询日志。

### 1.1 编辑 MySQL 配置文件

- 在 Linux 系统上，打开 `my.cnf`（通常位于 `/etc/mysql/my.cnf` 或 `/etc/my.cnf`）。
- 在 Windows 系统上，打开 `my.ini`。

在 `[mysqld]` 段落中，添加或修改以下配置：

```ini
slow_query_log = 1          # 启用慢查询日志
slow_query_log_file = /var/log/mysql/mysql-slow.log  # 日志文件路径
long_query_time = 2         # 设置查询时间阈值（秒）
log_queries_not_using_indexes = 1  # 记录未使用索引的查询
```

- `slow_query_log`: 设置为 `1` 以启用慢查询日志。
- `slow_query_log_file`: 指定慢查询日志文件的路径。
- `long_query_time`: 记录执行时间超过此阈值的查询（单位为秒）。
- `log_queries_not_using_indexes`: 记录未使用索引的查询。

### 1.2 重启 MySQL 服务

更改配置后，重启 MySQL 服务以应用配置：

```bash
# 在 Linux 上
sudo systemctl restart mysql

# 或者在某些系统上
sudo service mysql restart
```

## 2 查询慢查询日志状态

启用后，可以通过以下 SQL 查询查看慢查询日志的状态：

```sql
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'slow_query_log_file';
SHOW VARIABLES LIKE 'long_query_time';
```

## 3 查看慢查询日志

慢查询日志默认保存在配置文件中指定的路径下。你可以使用以下命令查看日志内容：

```bash
cat /var/log/mysql/mysql-slow.log
```

或者，如果日志文件过大，使用 `tail` 命令查看最后几行：

```bash
tail -n 50 /var/log/mysql/mysql-slow.log
```

## 4 使用 `mysqldumpslow` 分析慢查询

MySQL 提供了 `mysqldumpslow` 工具，可以用来汇总和分析慢查询日志。以下是常用的分析命令：

```bash
# 按查询出现的次数排序
mysqldumpslow -s c /var/log/mysql/mysql-slow.log

# 按查询的平均时间排序
mysqldumpslow -s t /var/log/mysql/mysql-slow.log

# 显示前10条最慢的查询
mysqldumpslow -t 10 /var/log/mysql/mysql-slow.log
```

## 5 优化慢查询

分析慢查询日志后，可以通过以下方法优化查询性能：

- **使用适当的索引**：未使用索引的查询通常会更慢。确保查询中用到了适当的索引。
- **优化查询语句**：重写查询以减少不必要的表连接、子查询或不必要的复杂性。
- **分表或分区**：对于大表，考虑使用分区或分表以提高查询性能。
- **缓存查询结果**：对于频繁执行的相同查询，可以使用查询缓存（虽然在 MySQL 8.0 中已经废弃）。
