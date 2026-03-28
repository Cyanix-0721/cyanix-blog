---
tags: [package-management, linux, archlinux, pacman]
title: Pacman
date modified: 2026-03-27 07:11:07
date created: 2024-08-15 04:19:28
---

# Pacman

> [!abstract] 概览  
> `pacman` 是 Arch Linux 官方包管理器，负责安装、更新、卸载、查询与缓存维护。

## 安装 / 启用

> [!info] 说明  
> Pacman 随 Arch Linux 提供，无需额外安装。

## 常用命令

```bash
sudo pacman -S <package_name>
sudo pacman -Syu
pacman -Q
pacman -Qi <package_name>
pacman -Qs <keyword>
sudo pacman -Rns <package_name>
sudo pacman -U ./package_name-version.pkg.tar.zst
```

## 进阶用法

```bash
sudo pacman -S pacman-contrib
sudo paccache -r
sudo systemctl enable --now paccache.timer
sudo reflector --verbose -c 'China,Hong Kong,Taiwan,Japan,United States' -p https -l 40 -a 24 --save /etc/pacman.d/mirrorlist
```

## 注意事项

> [!warning] 风险提示
> - `pacman -Scc` 会清空全部缓存，回滚能力下降。
> - 大更新前建议先阅读 Arch News。
