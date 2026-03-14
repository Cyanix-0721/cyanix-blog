> [!info]
> - [HDFS Commands Guide](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HDFSCommands.html)  
> - [HDFS Commands Guide (Hadoop 2)](https://hadoop.apache.org/docs/r2.7.7/hadoop-project-dist/hadoop-hdfs/HDFSCommands.html)  
> - [](Hadoop.md#6.6%20HDFS%20Command)

## 1 Hadoop 中的 HDFS 基本语法

### 1.1 简介

HDFS（Hadoop Distributed File System）是 Hadoop 分布式文件系统，是 Hadoop 存储数据的核心组件。HDFS 提供了一个高可扩展、高容错的文件系统，能够存储海量的非结构化数据。

HDFS 的基本操作可以通过 HDFS Shell 进行。HDFS Shell 提供了一系列命令，用于对 HDFS 文件系统进行操作。

### 1.2 命令格式

HDFS Shell 命令通常具有以下格式：

```
hdfs dfs <command> [options] [paths]
```

其中：

* `hdfs dfs`：表示使用 HDFS Shell
* `<command>`：要执行的命令
* `[options]`：命令选项
* `[paths]`：命令参数

### 1.3 基本命令

以下是 HDFS Shell 的一些基本命令：

| 命令    | 描述             |
| ----- | -------------- |
| ls    | 列出目录中的文件和目录    |
| mkdir | 创建目录           |
| rmdir | 删除空目录          |
| rm    | 删除文件或目录        |
| put   | 将本地文件上传到 HDFS  |
| get   | 将 HDFS 文件下载到本地 |
| cat   | 显示 HDFS 文件的内容  |
| chmod | 更改文件或目录的权限     |
| chown | 更改文件或目录的所有者    |
| chgrp | 更改文件或目录的所属组    |
| du    | 显示文件或目录的大小     |
| stat  | 显示文件或目录的状态信息   |

### 1.4 命令示例

以下是一些 HDFS Shell 命令示例：

* 列出当前目录下的文件和目录：

```
hdfs dfs ls
```

* 创建名为 `mydir` 的目录：

```
hdfs dfs mkdir mydir
```

* 删除空目录 `mydir`：

```
hdfs dfs rmdir mydir
```

* 删除文件 `myfile`：

```
hdfs dfs rm myfile
```

* 将本地文件 `myfile` 上传到 HDFS 目录 `/mydir`：

```
hdfs dfs put myfile /mydir
```

* 将 HDFS 文件 `/mydir/myfile` 下载到本地：

```
hdfs dfs get /mydir/myfile
```

* 显示文件 `/mydir/myfile` 的内容：

```
hdfs dfs cat /mydir/myfile
```

* 更改文件 `/mydir/myfile` 的权限为 755：

```
hdfs dfs chmod 755 /mydir/myfile
```

* 更改文件 `/mydir/myfile` 的所有者为 `root`：

```
hdfs dfs chown root /mydir/myfile
```

* 更改文件 `/mydir/myfile` 的所属组为 `hadoop`：

```
hdfs dfs chgrp hadoop /mydir/myfile
```

* 显示文件 `/mydir/myfile` 的大小：

```
hdfs dfs du /mydir/myfile
```

* 显示文件 `/mydir/myfile` 的状态信息：

```
hdfs dfs stat /mydir/myfile
```

### 1.5 总结

HDFS Shell 是 HDFS 的基本操作工具，可以用于对 HDFS 文件系统进行各种操作。通过学习 HDFS Shell 的基本命令，您可以轻松管理 HDFS 中的数据。
