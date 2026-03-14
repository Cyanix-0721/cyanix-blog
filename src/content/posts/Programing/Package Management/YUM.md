> [!info] [YUM Official Wiki](http://yum.baseurl.org/wiki/Faq.html)

# Yum

Yum（Yellowdog Updater, Modified）是一个用于 Fedora、Red Hat 和 CentOS 等 Linux 发行版的命令行软件包管理器。它基于 RPM 包管理系统，能够从指定的服务器自动下载 RPM 包并安装，并自动处理依赖关系。Yum 使得安装、更新和删除软件包变得更加方便快捷。

## 1 Yum 的优势

* **易于使用:** Yum 提供了简单的命令行界面，即使是新手用户也可以轻松使用。
* **自动处理依赖关系:** Yum 可以自动处理软件包之间的依赖关系，无需用户手动解决。
* **功能强大:** Yum 支持多种功能，例如安装、更新、删除、查询和搜索软件包。
* **安全可靠:** Yum 使用 GPG 签名来验证软件包的完整性和来源，确保软件包的安全可靠。

## 2 Yum 的基本用法

### 2.1 安装软件包

要使用 Yum 安装软件包，请使用以下命令：

```
yum install {PACKAGE_NAME}
```

例如，要安装 `httpd` 软件包，请使用以下命令：

```
yum install httpd
```

### 2.2 更新软件包

要更新所有已安装的软件包，请使用以下命令：

```
yum update
```

要更新指定的软件包，请使用以下命令：

```
yum update {PACKAGE_NAME}
```

### 2.3 删除软件包

要删除软件包，请使用以下命令：

```
yum remove {PACKAGE_NAME}
```

### 2.4 查询软件包信息

要查询软件包的信息，请使用以下命令：

```
yum info {PACKAGE_NAME}
```

### 2.5 搜索软件包

要搜索软件包，请使用以下命令：

```
yum search {KEYWORD}
```
