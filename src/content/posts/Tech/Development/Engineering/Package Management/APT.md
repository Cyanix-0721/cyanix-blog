---
tags: [package-management, linux, debian, ubuntu, apt]
title: APT
date modified: 2026-03-27 07:11:07
date created: 2024-08-15 04:19:28
---

# APT

> [!abstract] 概览  
> `apt` 是 Debian/Ubuntu 的包管理工具，用于安装、更新、卸载和查询软件包，并自动处理依赖。

## 1 安装 / 启用

> [!info] 说明  
> APT 随系统提供，通常无需额外安装。

## 2 常用命令

```bash
sudo apt update
sudo apt install <package_name>
sudo apt upgrade
apt search <keyword>
apt show <package_name>
sudo apt remove <package_name>
sudo apt purge <package_name>
sudo apt autoremove
```

## 3 进阶用法

```bash
sudo apt install <package_name>=<version>
sudo apt install <package_name> -t <repository>
sudo apt install -f
```

## 4 注意事项

> [!warning] 风险提示
> - 升级前先 `sudo apt update`。
> - 删除关键组件前先确认依赖影响范围。
