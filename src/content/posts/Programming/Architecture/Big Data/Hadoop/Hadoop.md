---
tags: []
title: Hadoop
date created: 2024-08-15 04:19:28
date modified: 2026-03-27 07:11:08
---

# Hadoop

> [!info]  
> [Hadoop Official Website](https://hadoop.apache.org/)  
> [Hadoop 2.7.7 Official Doc](https://hadoop.apache.org/docs/r2.7.7))  
> This doc used for CentOS 7, based by Hadoop 2.7.7

## 1 Setup Static IP

1. **查看当前的 IP 配置信息**。可以使用 `ip a` 命令
	- 输入以下命令来查看当前的网络配置，包括网关信息
		- `nmcli dev show | grep 'IP4.GATEWAY'`
	- 或者使用
		- `ip route | grep default`
	- 或者使用
		- `netstat -rn`
2. **配置 `hosts` 文件**。添加 `static_ip hostname`
3. **编辑网络接口配置文件**。这个文件通常位于`/etc/sysconfig/network-scripts/`目录下，并以`ifcfg-你的网卡名字`命名
4. 使用`vim`或其他文本编辑器打开配置文件，然后进行编辑。按`i`键进入编辑模式，修改如下参数：
	- `BOOTPROTO="static"`：表示使用静态IP地址，默认可能是dhcp
	- `IPADDR="你的静态IP地址"`：设置你的静态IP地址
	- `NETMASK="255.255.255.0"`：设置子网掩码
	- `GATEWAY="你的网关地址"`：设置网关地址
	- `DNS1="你的DNS服务器地址"`：设置DNS服务器地址
	- `ONBOOT=yes`：设置网卡启动方式为开机启动
5. **修改全局网络配置**。编辑`/etc/sysconfig/network`文件，确保`NETWORKING=yes`和`GATEWAY=你的网关地址`被正确设置
6. **重启网络服务**。使用 `service network restart` 命令应用更改

## 2 Download JDK & Hadoop & HBase

### 2.1 JDK

[Liberica JDK](https://bell-sw.com/pages/downloads/#jdk-17-lts)

### 2.2 Hadoop

[Hadoop](https://hadoop.apache.org/releases.html)

### 2.3 HBase

[HBase](https://hbase.apache.org/downloads.html)

## 3 Env

> Edit file both `/etc/profile` and `~/.bashrc`

### 3.1 JDK

```bash
#JDK
export JAVA_HOME=/usr/local/JDK/{JDK_VERSION}
export PATH=$JAVA_HOME/bin:$PATH
```

### 3.2 Hadoop

```bash
#Hadoop
export HADOOP_HOME=/usr/local/hadoop/{HADOOP_VERSION}
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
```

### 3.3 Hbase

```bash
#Hbase
export HBASE_HOME=/usr/local/hbase/{HBASE_VERSION}
export PATH=$PATH:$HBASE_HOME/bin
```

### 3.4 Active Change

```bash
source {FILENAME}
```

```bash
source /etc/profile
```

```bash
source ~/.bashrc
```

## 4 Setup Passphraseless SSH

[](SSH%20密钥管理与配置指南.md#1.2%20密钥生成)

## 5 Hadoop Conf

> Configure file path => `{HADOOP_HOME}/etc/hadoop/`

### 5.1 `hadoop-env.sh`

- Copy & Paste `JAVA_HOME` to instead the original part

### 5.2 `core-site.xml`

```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://hadoop0:9000</value>
        <description>NameNode URI</description>
    </property>
</configuration>
```

### 5.3 `hdfs-site.xml`

```xml
<configuration>
    <!-- Replication factor for HDFS -->
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>

    <!-- Directory where the datanodes will store their data -->
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:///usr/local/hadoop/data/datanode</value>
    </property>

    <!-- Directory where the namenode will store its metadata -->
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:///usr/local/hadoop/data/namenode</value>
    </property>

    <!-- HTTP address and port for the namenode -->
    <property>
        <name>dfs.namenode.http-address</name>
        <value>hadoop0:50070</value>
    </property>

    <!-- HTTP address and port for the secondary namenode -->
    <property>
        <name>dfs.namenode.secondary.http-address</name>
        <value>hadoop0:50090</value>
    </property>

    <!-- Enable or disable permissions in HDFS -->
    <property>
        <name>dfs.permissions.enabled</name>
        <value>false</value>
    </property>
</configuration>
```

### 5.4 `mapred-site.xml`

```bash
#将mapred-site.xml.template复制为mapred-site.xml
cp mapred-site.xml.template mapred-site.xml
```

```xml
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
</configuration>
```

### 5.5 `yarn-site.xml`

```xml
<configuration>
    <!-- Auxiliary services for NodeManager, enabling MapReduce shuffle service -->
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.nodemanager.aux-services.mapreduce_shuffle.class</name>
        <value>org.apache.hadoop.mapred.ShuffleHandler</value>
    </property>

    <!-- ResourceManager addresses with default ports -->
    <property>
        <name>yarn.resourcemanager.address</name>
        <value>hadoop0:8032</value> <!-- Default port for ResourceManager -->
    </property>
    <property>
        <name>yarn.resourcemanager.scheduler.address</name>
        <value>hadoop0:8030</value> <!-- Default port for Scheduler -->
    </property>
    <property>
        <name>yarn.resourcemanager.resource-tracker.address</name>
        <value>hadoop0:8031</value> <!-- Default port for Resource Tracker -->
    </property>
</configuration>
```

### 5.6 Hadoop File Format

> *If not configured the environment variable, cd to sbin of hadoop location*

```bash
cd {HADOOP_LOCATION}/sbin
```

- File format

```bash
hadoop namenode -format
```

- Make the HDFS directories required to execute MapReduce jobs:

```bash
$ bin/hdfs dfs -mkdir /user
$ bin/hdfs dfs -mkdir /user/<username>
```

## 6 HBase Conf

### 6.1 `hbase-env.sh`

```sh
export JAVA_HOME=$JAVA_HOME
export HBASE_MANAGES_ZK=true
```

### 6.2 `hbase-site.xml`

```xml
<configuration>
	<!-- hbase.rootdir与hadoop配置中fs.default.name一致 -->
	<property>
		<name>hbase.rootdir</name>
		<value>hdfs://hadoop0:9000/hbase</value>
	</property>
	<property>
		<name>hbase.cluster.distributed</name>
		<value>true</value>
	</property>
	<property>
		<name>hbase.zookeeper.quorum</name>
		<value>hadoop0</value>
 	</property>
</configuration>
```

## 7 Hadoop Service

### 7.1 Start

```bash
start-dfs.sh
```

```bash
start-yarn.sh
```

```bash
start-hbase.sh
```

### 7.2 Stop

> Remember stop before **shutdown**

```bash
stop-dfs.sh
```

```bash
stop-yarn.sh
```

```bash
stop-hbase.sh
```

### 7.3 Hadoop Shell

> 列出集群中每个数据节点的状态信息，包括节点的存储容量、副本数量等

```bash
hdfs dfsadmin -report
```

> 查看正在运行或已完成的作业状态

```bash
mapred job -list
```

### 7.4 Web

- [HDFS 集群状态](http://hadoop:50070)  
- [YARN ResourceManager](http://hadoop0:8088)  
- [HBase](http://hadoop0:16010)

### 7.5 JPS

使用 `jps` 命令可以查看Java虚拟机进程状态，结合 `grep` 命令可以检查特定Hadoop服务进程是否在运行，例如 `jps | grep NameNode`

### 7.6 HDFS Command

[HDFS](HDFS.md)

### 7.7 HBase Command

[HBase](HBase.md)

### 7.8 Debugging Locally

#### 7.8.1 Install Hadoop

[Hadoop预编译版本(Win)](https://github.com/srccodes/hadoop-common-2.2.0-bin)

#### 7.8.2 Win Env

1. 设置 `HADOOP_HOME`
2. 设置 `path`
3. `Hadoop.dll` 添加到 `System32`
	- 版本 >= 目标版本
	- [winutils](https://github.com/steveloughran/winutils)
