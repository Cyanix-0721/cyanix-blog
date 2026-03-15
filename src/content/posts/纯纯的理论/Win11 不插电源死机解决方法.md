---
tags: 
title: Windows 电源计划开启 CPU 频率设置
aliases: Windows 电源计划开启 CPU 频率设置
date created: 2025-03-29 02:56:21
date modified: 2026-03-14 09:35:21
date: 2026-03-15 02:52:39
---

# Windows 电源计划开启 CPU 频率设置

powershell 管理员执行

```shell
powercfg -attributes SUB_PROCESSOR 75b0ae3f-bce0-45a7-8c89-c9611c25e100 -ATTRIB_HIDE
```
