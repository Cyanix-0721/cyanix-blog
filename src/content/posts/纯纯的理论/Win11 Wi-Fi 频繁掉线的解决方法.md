---
tags: 
title: Win11 Wi-Fi 频繁掉线的解决方法
date created: 2024-11-03 03:14:11
date modified: 2026-03-14 09:35:21
date: 2026-03-15 02:52:39
---

# Win11 Wi-Fi 频繁掉线的解决方法

## 1 方法一：修改注册表

1. 按 **Win + R**，输入 `regedit` 打开注册表编辑器。
2. 进入路径：`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\NlaSvc\Parameters\Internet`
3. 双击右侧的 `EnableActiveProbing`，将值修改为 `0`。

## 2 方法二：修改组策略

1. 打开组策略编辑器：按 **Win + R**，输入 `gpedit.msc`。
2. 进入路径：**管理模板** > **系统** > **Internet 通信管理** > **Internet 通信设置**
3. 找到“**关闭 Windows 网络连接状态指示器的活动测试**”，将其配置为“**已禁用**”。
