---
tags: [package-management, linux, appimage]
title: AppImage
date modified: 2026-03-27 07:11:07
date created: 2024-08-15 04:19:28
---

# AppImage

> [!abstract] 概览  
> AppImage 是 Linux 的免安装应用分发格式。一个文件即可运行，不依赖系统包管理数据库。

## 安装 / 启用

> [!info] 说明  
> AppImage 通常无需安装，下载后赋予执行权限即可使用。

```bash
chmod +x appimage_filename.AppImage
```

## 常用命令

```bash
./appimage_filename.AppImage
```

## 进阶用法

```bash
flatpak install flathub io.github.prateekmedia.appimagepool
```

## 注意事项

> [!tip] 建议
> - 将 AppImage 统一放在 `~/Applications` 目录。
> - 优先从官方发布页下载并校验来源。
