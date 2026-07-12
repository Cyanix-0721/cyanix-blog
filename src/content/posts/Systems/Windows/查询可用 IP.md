---
tags: []
date created: 2026-04-30 10:00:52
date modified: 2026-07-10 07:18:19
title: 查询可用 IP
---

# 查询可用 IP

## 1 Windows 环境 (CMD / PowerShell)

### 1.1 PowerShell (推荐，支持高亮显示结果)

直接在 PowerShell 窗口粘贴。将 `1.` 替换为你需要扫描的段。

- **扫描已占用 IP：**

```powershell
1. | % { if (Test-Connection 192.168.1.$_ -Count 1 -Quiet) { Write-Host "192.168.1.$_ [USED]" -ForegroundColor Red } }
```

- **扫描空闲 IP：**

```powershell
1. | % { if (!(Test-Connection 192.168.1.$_ -Count 1 -Quiet)) { Write-Host "192.168.1.$_ [FREE]" -ForegroundColor Green } }
```

### 1.2 CMD (传统方式)

在 CMD 窗口直接运行。第一步利用并行机制大幅缩短 Ping 的等待时间。

- **第一步：快速激活全网段 ARP 缓存 (并行扫描)：**

```cmd
for /L %i in (1,1,254) do @start /b ping -n 1 -w 100 192.168.1.%i >nul
```

- **第二步：查看 ARP 表记录：**

```cmd
arp -a | findstr "192.168.1."
```

## 2 Linux 环境 (Bash)

利用 `&` 放入后台并行执行，几秒钟即可完成全网段扫描。

- **扫描并查看邻居表 (获取最准的已占用列表)：**

```bash
for i in {1.}; do ping -c1 -W1 192.168.1.$i >/dev/null 2>&1 & done; wait; ip neigh | grep "192.168.1."
```

- **仅列出空闲 (FREE) 的 IP 地址：**

```bash
for i in {1.}; do (ping -c1 -W1 192.168.1.$i >/dev/null 2>&1 || echo "192.168.1.$i FREE") & done; wait
```

## 3 核心避坑指南

- **Ping 的局限性：** 很多设备（如防火墙开启的电脑）会“禁 Ping”。如果 Ping 不通，不代表 IP 一定没人用。  
$1
- **ARP 的权威性：** 只要设备联网，`arp -a` (Win) 或 `ip neigh` (Linux) 记录到的 MAC 地址才是证明 IP 被占用的最直接证据。  
$1
- **分配策略：**  
$1
    - **避开池子：** 确认路由器 DHCP 地址池（通常为 `` 到 ``）。  
$1
    - **静态区间：** 建议手动给基站等设备分配 `` 以上的地址。

## 4 总结：最快操作流程

1. **Windows：** 复制 **PowerShell** 命令运行。  
$1
2. **Linux：** 复制 **Bash 并行** 命令运行。  
$1
3. **最后确认：** 选定地址后，尝试 `ping` 一下，确认不通后再去配置基站。
