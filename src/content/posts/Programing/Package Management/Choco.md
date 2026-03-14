# Chocolatey (choco)

[Chocolatey](https://chocolatey.org/)，通常简称为 choco，是一个适用于 Windows 的命令行包管理器。它简化了在系统上安装、更新和管理软件包的过程。

## 1 安装

在使用 choco 之前，您需要先安装它。以管理员身份打开命令提示符并运行以下命令：

```sh
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

安装完成后，您可以通过运行以下命令来验证安装：

```sh
choco -v
```

## 2 基本用法

### 2.1 安装软件包

使用 choco 安装软件包的基本命令如下：

```sh
choco install <package_name>
```

例如，要安装 Google Chrome，您可以运行：

```sh
choco install googlechrome
```

### 2.2 升级软件包

要升级已经安装的软件包，使用以下命令：

```sh
choco upgrade <package_name>
```

例如，升级 Google Chrome：

```sh
choco upgrade googlechrome
```

### 2.3 卸载软件包

要卸载软件包，使用以下命令：

```sh
choco uninstall <package_name>
```

例如，卸载 Google Chrome：

```sh
choco uninstall googlechrome
```

### 2.4 搜索软件包

要搜索可用的软件包，使用以下命令：

```sh
choco search <search_term>
```

例如，搜索与 "chrome" 相关的软件包：

```sh
choco search chrome
```

## 3 选项详解

### 3.1 全局选项

- `-y` 或 `--yes`：自动确认所有提示，相当于对所有询问都回答“是”。
- `-v` 或 `--version`：显示 Chocolatey 的版本信息。
- `--debug`：显示调试信息。
- `--force`：强制执行操作，即使可能存在潜在问题。
- `--limit-output`：限制输出信息，适用于需要简洁输出的情况。

### 3.2 安装命令选项

- `-f` 或 `--force`：强制重新安装即使已经安装的软件包。
- `-s` 或 `--source`：指定软件包源。
- `-i` 或 `--ignore-dependencies`：安装时忽略依赖项。
- `--allow-downgrade`：允许降级安装，即安装比当前版本更低的版本。
- `--pre`：允许安装预发布版本。

### 3.3 升级命令选项

- `-f` 或 `--force`：强制升级，即使是当前最新版本。
- `-u` 或 `--uninstall`：在升级之前卸载旧版本。
- `--ignore-pinned`：忽略已固定版本的软件包，仍然执行升级。

### 3.4 卸载命令选项

- `-f` 或 `--force`：强制卸载，即使存在潜在问题。
- `-n` 或 `--noremove`：仅卸载软件包本身，不删除依赖项。
- `-a` 或 `--all`：卸载所有安装的软件包。

## 4 示例

### 4.1 批量安装多个软件包

```sh
choco install googlechrome firefox 7zip
```

### 4.2 升级所有已安装的软件包

```sh
choco upgrade all
```

### 4.3 安装指定版本的软件包

```sh
choco install git --version=2.29.2
```

### 4.4 从特定源安装软件包

```sh
choco install mypackage -s http://mycustomsource/choco
```

### 4.5 调试模式下安装软件包

```sh
choco install notepadplusplus --debug
```
