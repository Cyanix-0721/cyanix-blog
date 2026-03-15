---
tags: 
title: Flatpak
date created: 2025-10-08 17:02:35
date modified: 2026-03-14 09:35:26
date: 2026-03-15 02:52:39
---

# Flatpak

## 1 安装 Flatpak

```bash
sudo pacman -S flatpak
```

### 1.1 可选：安装桌面集成支持（推荐）

如果你使用 GNOME / KDE：

```bash
# GNOME
sudo pacman -S gnome-software-packagekit-plugin

# KDE
sudo pacman -S plasma-discover flatpak-kcm
```

安装后重启系统或重新登录。

## 2 添加 Flathub 仓库（推荐）

Flathub 是最大的 Flatpak 应用仓库。

```bash
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
```

### 2.1 查看已添加的仓库

```bash
flatpak remotes
```

## 3 搜索软件

```bash
flatpak search keyword
```

示例：

```bash
flatpak search firefox
```

## 4 安装软件

```bash
flatpak install flathub <应用ID>
```

示例：

```bash
flatpak install flathub org.mozilla.firefox
```

> 注意：Flatpak 使用的是 **应用 ID**，不是传统软件包名。

### 4.1 安装到用户目录（无需 sudo）

```bash
flatpak install --user flathub <应用ID>
```

## 5 运行软件

```bash
flatpak run <应用ID>
```

例如：

```bash
flatpak run org.mozilla.firefox
```

通常安装后会自动生成桌面快捷方式。

## 6 更新软件

### 6.1 更新全部 Flatpak 软件

```bash
flatpak update
```

### 6.2 更新指定软件

```bash
flatpak update <应用ID>
```

## 7 卸载软件

```bash
flatpak uninstall <应用ID>
```

### 7.1 同时删除无用依赖

```bash
flatpak uninstall --unused
```

## 8 查看已安装软件

```bash
flatpak list
```

仅查看应用：

```bash
flatpak list --app
```

## 9 权限管理

Flatpak 默认沙箱隔离。

查看权限：

```bash
flatpak info --show-permissions <应用ID>
```

推荐使用图形工具：

```bash
flatpak install flathub com.github.tchx84.Flatseal
```

运行：

```bash
flatpak run com.github.tchx84.Flatseal
```

> Flatseal 可以方便管理文件系统、网络、设备权限。

## 10 清理缓存与空间优化

查看占用空间：

```bash
flatpak list --columns=application,size
```

清理未使用运行时：

```bash
flatpak uninstall --unused
```

删除旧版本：

```bash
flatpak repair
```

## 11 常见问题

### 11.1 应用无法访问主目录？

需要手动授予权限：

```bash
flatpak override --user --filesystem=home <应用ID>
```

### 11.2 Wayland / X11 切换？

强制使用 Wayland：

```bash
flatpak override --user --env=MOZ_ENABLE_WAYLAND=1 org.mozilla.firefox
```

# Flatpak 结构说明

Flatpak 主要包含：

- **App（应用）**
    
- **Runtime（运行时环境）**
    
- **SDK（开发环境）**

应用共享 Runtime，因此更新通常比较集中。

# 常用命令速查表

|操作|命令|
|---|---|
|搜索|`flatpak search xxx`|
|安装|`flatpak install flathub id`|
|运行|`flatpak run id`|
|更新|`flatpak update`|
|卸载|`flatpak uninstall id`|
|清理|`flatpak uninstall --unused`|
|查看|`flatpak list`|
