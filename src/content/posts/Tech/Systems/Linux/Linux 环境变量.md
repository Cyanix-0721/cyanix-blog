---
tags: [Linux, 环境变量]
title: Linux 环境变量
date created: 2026-10-04 00:30:00
date modified: 2026-10-04 00:50:00
---

# Linux 环境变量

## 1 系统级别环境变量文件

这些文件定义的环境变量对所有用户生效，通常由系统管理员管理：

- `/etc/environment`：主要用于设置系统范围的环境变量，如 `PATH`。
- `/etc/profile`：在用户登录时读取，用于设置所有用户的环境变量。
- `/etc/profile.d/`：该目录下的脚本文件在用户登录时会被 `/etc/profile` 调用，用于设置特定应用程序或服务的环境变量。
- `/etc/bash.bashrc`：在每次打开新的 Bash shell 时读取，用于设置所有用户的 Bash 特定的环境变量。

## 2 用户级别环境变量文件

这些文件定义的环境变量仅对特定用户生效：

- `~/.bash_profile` 或 `~/.profile`：在用户登录时读取，用于设置用户特定的环境变量。
- `~/.bashrc`：在每次打开新的 Bash shell 时读取，用于设置用户特定的 Bash 环境变量。

**注意：**

- `~` 表示用户的主目录。
- 在某些系统中，可能同时存在 `~/.bash_profile` 和 `~/.profile`，也可能只存在其中一个。
- `~/.profile` 通常被认为是更通用的配置文件，而 `~/.bash_profile` 则更特定于 Bash shell。
- 具体的环境变量设置可能因 Linux 发行版而异。
- 修改后，需要重新登录或者执行 `source ~/.bashrc` 使修改生效。

## 3 `PATH`

- `$PATH` 决定了 `PATH` 的搜索路径
	- 如 `export PATH=$JAVA_HOME/bin:$PATH`，优先搜索添加的 `$JAVA_HOME/bin` 然后搜索已有的 `PATH`，反之亦然

## 4 相关

- Windows 侧的环境变量备份与恢复见 [[Windows 环境变量备份和恢复]]。
- 登录 shell 与非登录 shell 的差异见 [[Shebang详解]]。
