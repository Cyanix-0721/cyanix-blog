---
tags: [package-management, linux, archlinux, aur, paru]
title: Paru
date modified: 2026-03-27 07:11:07
date created: 2024-08-15 04:19:28
---

# Paru

> [!abstract] 概览  
> `paru` 是 AUR 助手，命令风格兼容 `pacman`，可统一管理官方仓库与 AUR 软件。

## 安装 / 启用

```bash
sudo pacman -S paru
```

## 常用命令

```bash
paru -S <package_name>
paru -Syu
paru -Ss <keyword>
paru -Qi <package_name>
paru -Rns <package_name>
```

## 进阶用法

```bash
paru --needed -S <package_name>
paru --devel -Syu
paru --noconfirm -S <package_name>
```

## 注意事项

> [!warning] AUR 提示  
> AUR 为社区维护，安装前建议检查 PKGBUILD 与评论区。
