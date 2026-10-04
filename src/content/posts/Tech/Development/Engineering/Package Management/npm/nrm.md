---
tags: [package-management, nodejs, npm, registry, nrm]
title: Nrm
date modified: 2026-03-27 07:11:16
aliases: Nrm
date created: 2024-11-27 15:55:11
---

# Nrm

> [!abstract] 概览  
> `nrm` 用于快速切换 npm registry，优化不同网络环境下的依赖下载体验。

## 安装 / 启用

```bash
npm install -g nrm
```

## 常用命令

```bash
nrm ls
nrm use <registry>
nrm test
nrm add <name> <url>
nrm del <name>
nrm use npm
```

## 进阶用法

```bash
npm ping
npm config get registry
```

## 注意事项

> [!info] 实操建议  
> 镜像源可能有同步延迟，遇到版本找不到时切回官方源重试。
