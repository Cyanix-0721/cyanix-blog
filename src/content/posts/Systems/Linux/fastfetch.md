---
tags: []
title: Fastfetch
aliases: Fastfetch
date created: 2024-08-16 07:12:55
date modified: 2026-03-27 07:11:04
---

# Fastfetch

`fastfetch` 是一款轻量级且快速的系统信息工具，类似于 `neofetch`，用于在终端中展示系统和硬件信息。

## 1 安装

### 1.1 在 Arch Linux 上安装

```sh
sudo pacman -S fastfetch
```

## 2 基本用法

`fastfetch` 的基本用法非常简单，只需在终端中输入以下命令即可：

```bash
fastfetch
```

这将显示你的系统信息，如操作系统、内核版本、桌面环境、主题、图标、内存使用情况等。

## 3 配置

`fastfetch` 可以通过配置文件进行个性化定制。配置文件通常位于 `~/.config/fastfetch/config.jsonc`，你可以编辑该文件来自定义输出。

可以通过以下命令生成配置文件：

```sh
fastfetch --gen-config
# 生成完整版示例配置文件
# fastfetch --gen-config-full
```

### 3.1 示例配置文件

```json
{
  // JSON 模式定义，用于提供自动补全和验证
  "$schema": "https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json",

  // 模块配置，定义 fastfetch 将要显示的内容
  "modules": [
    "title",         // 系统标题（通常是主机名）
    "separator",     // 分隔符，用于将各部分内容隔开
    "os",            // 操作系统信息
    "host",          // 硬件主机信息
    "kernel",        // 内核版本信息
    "uptime",        // 系统运行时间
    "packages",      // 已安装的软件包数量
    "shell",         // 当前使用的 Shell 类型及版本
    "display",       // 显示信息（分辨率、刷新率等）
    "de",            // 桌面环境信息
    "wm",            // 窗口管理器信息
    "wmtheme",       // 窗口管理器主题信息
    "theme",         // 系统主题信息
    "icons",         // 系统图标主题信息
    "font",          // 系统字体信息
    "cursor",        // 光标主题信息
    "terminal",      // 当前使用的终端信息
    "terminalfont",  // 终端字体信息
    "cpu",           // CPU 信息
    "gpu",           // GPU 信息
    "memory",        // 内存使用信息
    "swap",          // 交换分区使用信息
    "disk",          // 磁盘使用信息
    "localip",       // 本地 IP 地址
    "battery",       // 电池状态信息（如果适用）
    "poweradapter",  // 电源适配器信息（如果适用）
    "locale",        // 本地化设置（语言、区域等）
    "break",         // 换行符，分隔内容
    "colors"         // 终端颜色示例
  ]
}
```

### 3.2 启动时加载配置文件

```bash
fastfetch -c ~/.config/fastfetch/custom.jsonc
```
