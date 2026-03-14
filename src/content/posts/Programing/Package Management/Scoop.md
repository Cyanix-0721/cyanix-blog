# Scoop - Windows 命令行安装程序指南

> [GitHub - ScoopInstaller/Scoop: A command-line installer for Windows.](https://github.com/ScoopInstaller/Scoop)

## 1 什么是 Scoop？

Scoop 是一个用于 Windows 系统的命令行包管理器。它允许您通过简单的命令（如 `scoop install git`）来搜索、安装、更新和卸载软件。它的设计理念是：

* **简洁**： 命令简单直观。
* **便携**： 默认将软件安装到用户目录下（`C:\Users\<username>\scoop`），避免污染系统路径和注册表，实现绿色安装。
* **安全**： 尽可能从软件的官方来源下载，减少中间人攻击的风险。
* **专注于开发者工具**： 最初是为管理开源命令行工具而构建的，现已扩展至包含大量图形应用程序。

## 2 为什么选择 Scoop？

| 特性 | Scoop 优势 |
| :--- | :--- |
| **无需管理员权限** | 绝大多数软件安装在用户目录，无需每次安装都提权。 |
| **环境配置** | 自动为命令行工具（如 Python, Node.js, Java）配置环境变量。 |
| **绿色卸载** | 卸载软件会彻底删除其文件和配置，无残留。 |
| **软件版本管理** | 轻松安装和切换特定版本的开发工具（如不同版本的 Java 或 Python）。 |
| **集中管理** | 一个命令更新所有已安装的软件。 |

## 3 安装 Scoop

### 3.1 先决条件

* **Windows 10 或 Windows 11** 操作系统。
* **PowerShell 5.0+**（或更高版本，系统通常已自带）。在 PowerShell 中输入 `$PSVersionTable.PSVersion` 查看版本。
* **.NET Framework 4.5+**（通常系统也已自带）。

### 3.2 标准安装

1. 以**普通用户权限**打开 **PowerShell**（**无需管理员身份运行**）。
2. 执行以下命令以确保允许本地脚本运行：

    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    ```

    如果出现提示，输入 `Y` 确认。

3. 安装 Scoop 到默认位置（`C:\Users\<username>\scoop`）：

    ```powershell
    iwr -useb get.scoop.sh | iex
    ```

    *`iwr` 是 `Invoke-WebRequest` 的别名，`iex` 是 `Invoke-Expression` 的别名。*

## 4 基础使用

安装完成后，关闭并重新打开 PowerShell，即可开始使用 `scoop` 命令。

### 4.1 搜索软件

在安装前，可以先搜索一下软件在仓库中的准确名称。

```powershell
# 搜索包含 "python" 关键词的软件
scoop search python
```

### 4.2 安装软件

找到准确名称后，使用 `install` 命令安装。

```powershell
# 安装 Git
scoop install git

# 一次安装多个软件
scoop install python nodejs vscode
```

### 4.3 列出已安装软件

```powershell
# 列出所有已安装的软件
scoop list
# 或
scoop status
```

### 4.4 更新软件

```powershell
# 更新一个特定的软件
scoop update python

# 更新 Scoop 自身和所有已安装的软件
scoop update -ag
```

### 4.5 卸载软件

```powershell
# 卸载一个软件
scoop uninstall 7zip

# 卸载软件并同时删除其配置文件
scoop uninstall 7zip -p
```

### 4.6 查看软件信息

```powershell
# 查看一个软件的详细信息，包括版本、源码、安装路径等
scoop info python
```

## 5 高级功能

### 5.1 管理软件仓库（Buckets）

Scoop 通过 **Buckets** 来组织软件列表。官方维护了一个名为 `main` 的默认 bucket，主要包含命令行工具。您可以添加其他 bucket 来获取更多软件（如桌面应用程序、开发工具等）。

| Bucket           | 描述                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| **main**         | 默认 bucket，包含常见的命令行工具（如 `git`、`curl`、`wget`、`7zip` 等）。安装 Scoop 时会自动添加。                                    |
| **extras**       | ⭐ **强烈推荐添加**。包含大量流行的桌面应用程序，例如 Chrome、Firefox、VS Code、Spotify、Notion、Discord 等。                           |
| **versions**     | 提供软件的 **多个历史版本或 LTS 版本**，例如 `python2`, `python3.10`, `nodejs-lts`, `java8` 等。                            |
| **nerd-fonts**   | 包含各种 **Nerd Fonts 字体**，适用于终端和开发环境（如 `FiraCode-NF`、`JetBrainsMono-NF`）。                                   |
| **sysinternals** | 包含来自 **Sysinternals Suite** 的系统工具，例如 `Process Explorer`、`Process Monitor`、`Autoruns` 等高级 Windows 系统诊断工具。 |

```powershell
# 列出已知的官方 buckets
scoop bucket known

# 添加一个 bucket (例如 extras)
scoop bucket add extras

# 列出已添加的 buckets
scoop bucket list

# 从指定的 bucket 安装软件
scoop install extras/vlc
```

### 5.2 安装特定版本的软件

这需要 `versions` bucket。

```powershell
# 1. 添加 versions bucket
scoop bucket add versions

# 2. 搜索可用的版本（例如 openjdk）
scoop search openjdk

# 3. 安装特定版本（例如 openjdk11）
scoop install openjdk11

# 4. 切换已安装软件的版本（如果安装了多个版本）
scoop reset openjdk8
```

### 5.3 全局安装（需要管理员权限）

对于一些需要安装系统服务或驱动、需要管理员权限才能运行的软件（如 `ffmpeg`, `wget`, `python` 如需供所有用户使用），可以使用全局安装。

```powershell
# 以管理员权限打开 PowerShell，然后安装
scoop install sudo  # 先安装 sudo 来提权
sudo scoop install -g ffmpeg

# 或者，直接以管理员运行 PowerShell 后执行
scoop install -g ffmpeg
```

*全局安装的软件路径为 `C:\ProgramData\scoop`。*

### 5.4 清理缓存与旧版本

Scoop 会保留下载的安装包和软件的旧版本，方便回退。定期清理可以节省空间。

```powershell
# 删除所有软件的旧版本，只保留当前版本
scoop cleanup *

# 删除下载缓存
scoop cache rm *

# 一键清理所有旧版本和缓存
scoop cleanup -k *
```

## 6 配置与优化

### 6.1 Scoop 目录结构

了解目录结构有助于排查问题。

```
scoop/
├── apps/           # 所有已安装的软件都在这里
├── buckets/        # 添加的软件仓库（buckets）列表
├── cache/          # 下载缓存
├── persist/        # 每个软件的持久化数据（配置等）
└── shims/          # 用于在命令行中快速调用软件的快捷方式
```

### 6.2 多线程下载（使用 aria2）

Scoop 可以集成 `aria2` 来进行多线程加速下载。

```powershell
# 安装 aria2
scoop install aria2

# 禁用 aria2（如果遇到下载问题）
scoop config aria2-enabled false
```

### 6.3 代理配置

如果您需要使用代理网络，可以为 Scoop 配置代理。

```powershell
# 设置代理（请替换为您的代理地址和端口）
scoop config proxy 127.0.0.1:7897

# 移除代理配置
scoop config rm proxy
```
