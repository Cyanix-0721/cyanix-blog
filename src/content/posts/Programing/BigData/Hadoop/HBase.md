> [!info] [HBase](https://hbase.apache.org/book.html)

# HBase 组件及其作用

HBase是基于Apache Hadoop的分布式、可扩展的大数据存储系统，它利用Hadoop文件系统（HDFS）提供随机实时读写访问。HBase的设计灵感来源于Google的Bigtable，它通过使用列族来优化大规模数据集的存储和访问。以下是HBase的核心组件及其功能：

## 1 客户端 (Client)

- **功能**：提供应用程序接口(API)以便与HBase集群交互，维护缓存以加速数据访问，通过远程过程调用(RPC)与HMaster和HRegionServer通信。

## 2 协调器 (Zookeeper)

- **功能**：确保集群高可用性，管理主节点的故障转移，存储所有Region的入口信息，监控RegionServer的状态变化，并将更新实时通知给HMaster。

## 3 主节点 (HMaster)

- **功能**：负责Region的分配和负载均衡，监控RegionServer的健康状况，处理DDL操作，如表的创建和修改，以及垃圾文件的回收。

## 4 区域服务器 (HRegionServer)

- **功能**：管理存储在本地的Region，处理对这些Region的读写请求，以及在Region过大时进行分裂操作。

## 5 区域 (HRegion)

- **功能**：作为数据存储和负载均衡的基本单元，不同的Region可以分布在不同的RegionServer上，按需进行水平分割。

## 6 存储 (Store)

- **功能**：每个Region由一个或多个Store组成，每个Store对应一个列族，负责管理列族内的数据存储和访问。

## 7 内存存储 (MemStore)

- **功能**：临时存储新写入的数据，当达到阈值时，数据会被刷新到磁盘上的StoreFile。

## 8 存储文件 (StoreFile)

- **功能**：是MemStore中数据的持久化形式，基于HFile格式存储在HDFS上。

## 9 写前日志 (HLog)

- **功能**：记录所有数据变更操作，用于灾难恢复，确保在RegionServer失败时能够从日志中恢复数据。

# HBase 基础用法

## 1 进入HBase Shell

```shell
hbase shell
```

## 2 创建表

```shell
create '表名', '列族名'
```

或者更详细的定义：

```shell
create '表名', {NAME => '列族名', VERSIONS => '版本数', TTL => '存活时间', BLOCKCACHE => '是否缓存'}
```

## 3 列出所有表

```shell
list
```

## 4 获取表的描述

```shell
describe '表名'
```

## 5 修改表结构

```shell
alter '表名', {NAME => '列族名', METHOD => 'delete'}
```

## 6 删除表

先禁用表，然后删除：

```shell
disable '表名'
drop '表名'
```

## 7 查询表是否存在

```shell
exists '表名'
```

## 8 查看表是否可用

```shell
is_enabled '表名'
```

## 9 插入数据

```shell
put '表名', '行键', '列族:列名', '值'
```

## 10 获取数据

获取指定行的数据：

```shell
get '表名', '行键'
```

获取指定列族的数据：

```shell
get '表名', '行键', '列族'
```

获取指定列的数据

```shell
get '表名', '行键', '列族:列'
```

使用版本号获取指定列的数据

> `VERSIONS` 未指定 => 显示最新版本数据  
> `VERSIONS` 指定 `n` => 显示最新 `n` 个版本数据

```shell
get '表名', '行键', {COLUMN => '列族:列', VERSIONS => 版本号}
```

使用时间戳获取指定列的数据

```shell
get '表名', '行键', {COLUMN => '列族:列', TIMESTAMP => 时间戳}
```

## 11 更新数据

```shell
put '表名', '行键', '列族:列名', '新值'
```

## 12 删除数据

删除指定列的数据：

```shell
delete '表名', '行键', '列族:列名'
```

删除指定行的所有数据：

```shell
deleteall '表名', '行键'
```

## 13 扫描表

扫描整个表：

```shell
scan '表名'
```

扫描指定列族的数据：

```shell
scan '表名', {COLUMNS => ['列族']}
```

## 14 计数

计算表中的行数：

```shell
count '表名'
```

## 15 通过时间戳获取数据

获取指定时间戳的数据：

```shell
get '表名', '行键', {COLUMN => '列族:列名', TIMESTAMP => 时间戳}
```
