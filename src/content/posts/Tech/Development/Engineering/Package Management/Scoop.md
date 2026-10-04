---
tags: [package-management, windows, scoop]
title: Scoop
date modified: 2026-03-27 07:11:07
date created: 2025-09-21 07:05:36
---

# Scoop

> [!abstract] 概览  
> Scoop 是 Windows 用户态包管理器，默认安装到用户目录，适合开发工具链管理。

## 安装 / 启用

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
iwr -useb get.scoop.sh | iex
```

## 常用命令

```powershell
scoop search <keyword>
scoop install <app>
scoop list
scoop update <app>
scoop update -ag
scoop uninstall <app>
scoop info <app>
```

## 进阶用法

```powershell
scoop bucket add extras
scoop bucket add versions
scoop cleanup *
scoop cache rm *
```

## 注意事项

> [!tip] 建议  
> 常规开发环境优先使用用户态安装；仅在全局共享场景使用 `-g`。
