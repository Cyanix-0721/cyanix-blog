---
tags: [package-management, linux, flatpak, desktop]
title: Flatpak
date modified: 2026-03-27 07:11:07
date created: 2025-10-08 17:02:35
---

# Flatpak

> [!abstract] 概览  
> Flatpak 通过沙箱机制分发桌面应用，跨发行版一致，适合隔离运行与快速获取新版本应用。

## 1 安装 / 启用

```bash
sudo pacman -S flatpak
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak remotes
```

## 2 常用命令

```bash
flatpak search <keyword>
flatpak install flathub <app_id>
flatpak run <app_id>
flatpak update
flatpak uninstall <app_id>
flatpak list
```

## 3 进阶用法

```bash
flatpak info --show-permissions <app_id>
flatpak uninstall --unused
flatpak override --user --filesystem=home <app_id>
```

## 4 注意事项

> [!info] 关键点  
> Flatpak 使用应用 ID（如 `org.mozilla.firefox`），不是传统包名。
