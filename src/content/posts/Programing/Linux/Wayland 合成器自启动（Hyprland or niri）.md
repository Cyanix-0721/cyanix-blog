---
tags: 
title: Wayland 合成器自启动（Hyprland / niri）
aliases: Wayland 合成器自启动（Hyprland / niri）
date created: 2025-10-08 17:02:35
date modified: 2026-03-14 09:35:24
date: 2026-03-15 02:52:39
---

# Wayland 合成器自启动（Hyprland / niri）

在 **Wayland 合成器（Compositor）** 环境下，例如：

- Hyprland
    
- niri

传统 Linux 桌面环境使用的：

```
~/.config/autostart
```

通常 **不会自动生效**。

原因是：

- 该机制依赖 **XDG Autostart 规范**
    
- 由完整桌面环境（如 **GNOME** 或 **KDE Plasma**）负责执行
    
- 纯 Wayland compositor **不会自动执行 `.desktop` 自启动**

因此需要使用以下几种方式：

|方法|推荐度|适用|
|---|---|---|
|compositor 原生配置|⭐⭐⭐⭐|GUI程序|
|dex|⭐⭐⭐|兼容 `.desktop`|
|systemd user service|⭐⭐⭐⭐|后台服务|
|autostart 脚本|⭐⭐|复杂逻辑|

---

# 1 Compositor 原生自启动（推荐）

最直接的方法是使用 **合成器自带的自启动语法**。

优点：

- 无额外依赖
    
- 启动速度最快
    
- 与 compositor 生命周期一致

---

# 1.1 Hyprland 自启动

配置文件：

```
~/.config/hypr/hyprland.conf
```

Hyprland 提供两个命令：

|命令|说明|
|---|---|
|`exec`|每次 reload 都执行|
|`exec-once`|仅在 compositor 启动时执行|

推荐使用：

```
exec-once
```

示例：

```ini
# Waybar
exec-once = waybar

# NetworkManager
exec-once = nm-applet --indicator

# 剪贴板
exec-once = wl-paste --watch cliphist store

# 壁纸
exec-once = swww-daemon
exec-once = swww img ~/Pictures/wallpaper.jpg
```

---

# 1.2 Niri 自启动

niri 使用 **spawn-at-startup**。

配置文件：

```
~/.config/niri/config.kdl
```

示例：

```kdl
spawn-at-startup "waybar"

spawn-at-startup "nm-applet"

spawn-at-startup "wl-paste" "--watch" "cliphist" "store"

spawn-at-startup "swww-daemon"
```

如果需要执行 shell：

```kdl
spawn-at-startup "sh" "-c" "swww img ~/Pictures/wallpaper.jpg"
```

特点：

- 每次 **niri session 启动**执行
    
- 不会在 reload 时重复运行

---

# 2 使用 dex（兼容 `.desktop`）

如果希望继续使用：

```
~/.config/autostart/*.desktop
```

可以使用 **dex**。

安装：

```bash
sudo pacman -S dex
```

在 compositor 配置中添加：

Hyprland：

```ini
exec-once = dex --autostart --environment hyprland
```

niri：

```kdl
spawn-at-startup "dex" "--autostart" "--environment" "niri"
```

示例 `.desktop`：

```
~/.config/autostart/waybar.desktop
```

```ini
[Desktop Entry]
Type=Application
Name=Waybar
Exec=waybar
```

优点：

- 兼容 GNOME / KDE 自启动
    
- 迁移配置简单

---

# 3 使用 Systemd 用户服务（推荐后台程序）

适用于：

- daemon
    
- CLI service
    
- 长期运行程序

例如：

- Syncthing
    
- mpd

创建目录：

```bash
mkdir -p ~/.config/systemd/user
```

创建服务：

```
~/.config/systemd/user/redshift.service
```

示例：

```ini
[Unit]
Description=Redshift

[Service]
ExecStart=/usr/bin/redshift -v
Restart=always

[Install]
WantedBy=default.target
```

启用：

```bash
systemctl --user enable --now redshift.service
```

优点：

- 自动重启
    
- 依赖管理
    
- 日志管理

查看日志：

```bash
journalctl --user -u redshift.service -b
```

---

# 4 Autostart 脚本（复杂逻辑）

如果需要：

- 启动顺序控制
    
- 条件判断
    
- 批量启动

可以写脚本。

创建：

```
~/.config/autostart/autostart.sh
```

```bash
#!/usr/bin/env sh

sleep 3

waybar &
nm-applet &
wl-paste --watch cliphist store &
```

赋权：

```bash
chmod +x ~/.config/autostart/autostart.sh
```

在 compositor 中调用：

Hyprland：

```ini
exec-once = ~/.config/autostart/autostart.sh
```

niri：

```kdl
spawn-at-startup "~/.config/autostart/autostart.sh"
```

---

# 5 Wayland 常见问题

## 1 程序没有启动

手动运行检查：

```bash
/path/to/program
```

检查 systemd：

```bash
journalctl --user -b
```

---

## 2 Wayland 后端问题

某些程序默认使用 X11。

可以指定：

GTK：

```bash
GDK_BACKEND=wayland program
```

Qt：

```bash
QT_QPA_PLATFORM=wayland program
```

例如：

```ini
exec-once = QT_QPA_PLATFORM=wayland obsidian
```

---

## 3 启动顺序问题

某些程序依赖：

- dbus
    
- polkit

可以延迟：

Hyprland：

```ini
exec-once = sleep 3 && program
```

niri：

```kdl
spawn-at-startup "sh" "-c" "sleep 3 && program"
```

---

# 6 推荐实践

一般建议：

## 1 GUI 程序

使用 compositor 原生方式：

- Hyprland → `exec-once`
    
- niri → `spawn-at-startup`

例如：

- Waybar
    
- nm-applet

---

## 2 后台服务

使用 **systemd user service**

例如：

- syncthing
    
- mpd
    
- redshift

---

## 3 兼容 `.desktop`

使用 **dex**

---

# 7 推荐结构（Dotfiles）

示例：

```
~/.config
├─ autostart
│  └─ autostart.sh
│
├─ hypr
│  └─ hyprland.conf
│
├─ niri
│  └─ config.kdl
│
└─ systemd
   └─ user
      ├─ syncthing.service
      └─ redshift.service
```
