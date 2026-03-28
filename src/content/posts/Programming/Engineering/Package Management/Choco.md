---
tags: [package-management, windows, chocolatey, choco]
title: Chocolatey (choco)
aliases: Chocolatey (choco)
date modified: 2026-03-27 07:11:07
date created: 2024-08-15 04:19:28
---

# Chocolatey (choco)

> [!abstract] 概览  
> Chocolatey 是 Windows 的命令行包管理器，适合批量安装、升级和卸载软件。

## 安装 / 启用

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
choco -v
```

## 常用命令

```powershell
choco install <package_name>
choco upgrade <package_name>
choco uninstall <package_name>
choco search <keyword>
choco upgrade all -y
```

## 进阶用法

```powershell
choco install <package_name> --version=<version>
choco install <package_name> -s <source_url>
```

## 注意事项

> [!tip] 建议
> - 维护脚本中优先加 `-y` 以避免交互中断。
> - 核心工具建议固定版本，避免意外升级。
