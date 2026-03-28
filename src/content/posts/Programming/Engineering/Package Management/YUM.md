---
tags: [package-management, linux, rpm, yum]
title: Yum
date modified: 2026-03-27 07:11:07
aliases: Yum
date created: 2024-08-15 04:19:28
---

# Yum

> [!abstract] 概览  
> Yum 是基于 RPM 的包管理器，常见于 CentOS/RHEL 旧版本生态。

## 安装 / 启用

> [!info] 说明  
> Yum 通常由系统预装。

## 常用命令

```bash
yum install <package_name>
yum update
yum update <package_name>
yum remove <package_name>
yum info <package_name>
yum search <keyword>
```

## 进阶用法

```bash
yum check-update
yum history
```

## 注意事项

> [!warning] 版本说明  
> 新版 RHEL/Fedora 多数场景已转向 `dnf`，但常用命令语义相近。
