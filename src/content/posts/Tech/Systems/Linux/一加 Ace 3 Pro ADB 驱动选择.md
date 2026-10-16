---
tags: [Android, ADB, Windows, 驱动, OnePlus]
title: 一加 Ace 3 Pro ADB 驱动选择
aliases: [oneplus-ace3pro-adb-driver-choice]
date created: 2026-09-17 00:11:49
date modified: 2026-10-14 23:39:00
---

# 一加 Ace 3 Pro ADB 驱动选择

> [!abstract] 适用场景
> 在 Windows 上给一加 Ace 3 Pro（代号 corvette / 型号 PJX110）配置 USB 驱动，
> 让 `adb devices` 能识别设备。核心结论是：**platform-tools 不含任何驱动，必须另装**，
> 而在常见的六个候选驱动包里只需要装 OPLUS 官方那一个。
> 读完可以判断自己手上那堆 `adb_driver.exe` / `fastboot_driver_*.exe` 该留哪个，
> 并知道"设备管理器显示正常、`adb devices` 却空白"的成因。

## 1 背景与适用条件

- **platform-tools** 是 Google 提供的主机端命令行工具集（`adb` / `fastboot` / `etc1tool` / `hprof-conv`），
  官方下载：<https://developer.android.com/tools/releases/platform-tools>
- **USB 驱动** 决定 Windows 能否把手机识别成 Android 复合设备。
  两者职责不同：**platform-tools 解决 adb 命令，驱动解决 Windows 认不认设备，互不替代。**

**版本敏感性**：本文引用的驱动包版本（OPLUS `4.0.1.6`、platform-tools `37.0.1`）与 INF
日期均为实测快照。厂商会更新驱动包，以下结论基于该版本，更新版本可能变化；
判定方法（比对 USB VID/PID 与接口 GUID）本身不受版本影响。

**前置条件**：

- Windows 10/11；
- 手机已开启 USB 调试，且能进入 ADB / fastboot / EDL 模式；
- 安装驱动需要**管理员权限**。

**适用范围**：一加 / OPPO（OPLUS）系高通平台机型的 Windows USB 驱动选择。
**不适用**：MediaTek 平台机型、iOS 设备、以及只需要无线调试的场景。

## 2 前提：platform-tools 不含任何驱动

已核对两个来源，两者都只给主机端程序：

| 来源 | 内容 | 有驱动吗 |
|---|---|---|
| AS SDK | `platform-tools/` 下 `.inf`/`.cat`/`.sys` 数量 = **0** | ❌ |
| scoop `adb` | `platform-tools_r37.0.1-win.zip`，`bin` 只声明 `adb.exe`/`etc1tool.exe`/`fastboot.exe`/`hprof-conv.exe` | ❌ |

scoop bucket 原文（`ScoopInstaller/Main/bucket/adb.json`）：

```json
"version": "37.0.1",
"url": "https://dl.google.com/android/repository/platform-tools_r37.0.1-win.zip",
"bin": ["platform-tools\\adb.exe", "platform-tools\\etc1tool.exe",
        "platform-tools\\fastboot.exe", "platform-tools\\hprof-conv.exe"]
```

## 3 为什么是 OPLUS 那个包

### 3.1 只有它覆盖 Ace 3 Pro 的 USB ID

Ace 3 Pro 的 ADB 接口（实测实例）：

```text
USB\VID_22D9&PID_2765&MI_01\...   -> ADB Interface
USB\VID_22D9&PID_2765&MI_00\...   -> OnePlus Ace 3 Pro (WPD/MTP)
USB\VID_22D9&PID_2765\...         -> USB Composite Device
```

解包 `Oppo+USB+Driver+Setup+V4.0.1.6.exe`（Inno Setup，内嵌 LZMA 载荷
22.6 MB，`zlb\x1a` 魔数）后统计其 `android_winusb.inf`：

| 项 | 值 |
|---|---|
| `VID_22D9` 命中 | **188** 行（含 `PID_2765&MI_01` 共 4 条，x86/amd64 各 2） |
| `VID_2A70` 命中 | 16 行 |
| INF 头部 | `; Copyright (C) [2011] OPPO Corporation` |
| Provider | `"OPLUS, Inc."` |
| ClassGuid | `{3F966BD9-FA04-4ec5-991C-D326973B5128}` |
| DriverVer | `01/04/2023,11.0.0000.00000` |

安装器自身版本信息（Inno Setup `.rsrc/1033/version.txt`）：
`Guangdong OPPO Mobile Telecommunications Corp., Ltd.` / `OPLUS Tool Driver`
/ `4.0.1.6` / 构建于 2024-07-12 —— 这批文件里唯一厂方签发且最新的。

### 3.2 它注册了 adb 需要的接口 GUID（关键差异）

Windows 版 `adb.exe` 按 **Android 专用设备接口 GUID** 枚举设备，该 GUID 就在
二进制里：

```text
$ strings adb.exe | grep F72FE0D4
{F72FE0D4-CBCB-407d-8814-9ED673D0DD6B}
Failed to convert Android USB GUID string to wide
```

Windows 自带的 `winusb.inf` **不注册**这个 GUID（`grep -c` = 0），
OPLUS 的 INF 注册了，且值一致：

```ini
[USB_Install.HW]
AddReg = Dev_AddReg
[Dev_AddReg]
HKR,,DeviceInterfaceGUIDs,0x10000,"{F72FE0D4-CBCB-407d-8814-9ED673D0DD6B}"
```

**这就是「设备管理器显示正常、`adb devices` 却空白」的机理来源。**

### 3.3 不干扰 platform-tools（重要）

| 检查 | 结果 |
|---|---|
| OPLUS 安装目录里有 `adb.exe` 吗 | **0 个**（`C:\Program Files\OPLUS\` 全树搜索） |
| 会往 PATH 加自己吗 | 否（Machine/User PATH 均无 OPLUS/OnePlus 条目） |

> [!note] 解包时的误报
> 解包时 grep 到的 `adb.exe` 字符串其实是 `CleanCom.bat` 里的
> `taskkill /F /IM adb.exe`，**不是文件**。

对比 `adb_driver.exe` 就危险得多：它真会落
`C:\Program Files (x86)\OnePlus USB Drivers\Android\adb.exe`，
实测版本 **Android Debug Bridge 1.0.32**（2016 年）。

### 3.4 顺带覆盖 EDL 救砖，可省掉独立 Qualcomm 包

OPLUS 包内含 Qualcomm 全套，版本比独立的 2018 包**更新**：

| INF | OPLUS 包内 | 独立 `Qualcomm_...20180705...exe` |
|---|---|---|
| `qcfilter.inf` | 08/24/2023, 1.0.7.7 | 07/05/2018, 1.0.5.3 |
| `qcser.inf` | 08/24/2023, 2.1.5.2（含 `PID_9008`/`900E` 12 处） | 07/05/2018, 2.1.3.2 |
| `qdbusb.inf` | 08/24/2023, 1.0.3.1 | 07/05/2018, 1.0.1.6 |

另外还带 `qcadb.inf`、`tetherxp.inf`、`cdc-acm.inf`、`mtkmbim*_x64.inf`。
**所以独立 Qualcomm 包在新机器上可以直接不装。**

## 4 六个候选最终判定（新机器视角）

| 文件 | 真实身份 | 新机器 |
|---|---|---|
| **`Oppo+USB+Driver+Setup+V4.0.1.6.exe`** | OPLUS 官方 2024-07-12；覆盖 22D9×188 + 9008/900E；不落 adb、不进 PATH | ✅ **只装这个** |
| `Qualcomm_USB_Host_Drivers_...20180705...exe` | InstallShield；2018 版 qc 驱动 | ⛔ 冗余，OPLUS 包内已是 2023 版 |
| `adb_driver.exe` | `OnePlus USB Drivers 1.00`；落 adb **1.0.32** + 旧 adb/fastboot | ⛔ 品牌对但过时，且会抢 adb |
| `fastboot_driver_32.exe` | 2013-11 小米包；inf 1.87 MB / 24650 处 `VID_`；`VID_22D9` 命中 **0** | ⛔ 无 22D9，来路不明的堆料包 |
| `fastboot_driver_64.exe` | 2016-11 Google 通用包；inf 仅 13904 字节，VID 只有 `05C6/18D1/2B0E` | ⛔ 无 22D9 |
| `fastboot_driver_64_another.exe` | 2016-03 RAR SFX，实为**华为** `hw_goadb.inf` | ⛔ 厂商都不对 |
| `MTK_USB_All_v1.0.8.zip` | MediaTek 通用（Preloader/VCOM） | ⛔ 平台不匹配 |

平台判定：corvette 的 `Rannki/` 里 31 个分区是
`xbl/abl/aop/cpucp/devcfg/tz/hyp/modem` 等高通命名，`preloader`/`lk`/`scp`
为 **0** → 骁龙 8 Gen 3，MTK 包直接排除。

## 5 新机器推荐流程

```powershell
  # 1) 先装 platform-tools（二选一，别同时装两个来源）
scoop install adb
  # 或 AS SDK Manager -> SDK Tools -> Android SDK Platform-Tools

  # 2) 装 OPLUS 驱动（管理员）。直接双击即可 —— 它不落 adb、不改 PATH
  #    <下载目录>\Oppo+USB+Driver+Setup+V4.0.1.6.exe

  # 3) 插上手机（USB 调试已开），手机上确认 RSA 指纹
adb kill-server; adb start-server
adb devices -l
```

只想装 INF、不想跑安装器（更可控）：

```powershell
pnputil /add-driver "C:\Program Files\OPLUS\QcomMtkDriver\Driver\Adb_mtp_rndis\android_winusb.inf" /install
```

验收标准（任一即可）：

- `DEVPKEY_Device_DriverInfPath` = `android_winusb.inf`（而非 `winusb.inf`）
- 设备实例 `Device Parameters` 下出现 `DeviceInterfaceGUIDs`
- `adb devices -l` 出现 `PJX110`

## 6 注意事项

- **别同时装 AS 的 platform-tools 和 scoop 的 adb**。两个 `adb.exe` 都在 PATH
  会撞 server 版本（`adb server version doesn't match`）。选一个即可。
- OPLUS 安装器会执行 `CleanCom.bat`，内容是
  `taskkill /F /IM adb.exe` + 对 `VID_05C6`/`VID_0E8D`/`VID_22d9` 调
  `DeviceCleanupCmd_X64.exe`（清非在线的残留设备节点）。装完**拔插一次手机**。
- `fastboot` 模式 PID 不再是 2765。OPLUS inf 已覆盖
  `22D9&PID_2024`、`22d9&PID_0FFF`、`2A70&PID_D00D`(oem fastboot)，
  够用；不够时走 9008 EDL（`qcser` 已含）。
- 无线调试能用**不代表** USB 驱动没问题，两者独立。
- **「装过 ≠ 生效」**：目录还在不代表 INF 已发布。验收请以 §5 的三条为准。

## 7 本机实测环境与数值

> 以下为**单机单次**观测结果，仅用于说明量级与判定依据，换机器/换版本可能不同。

| 项 | 值 |
|---|---|
| 主机系统 | Windows 10/11 |
| 设备 | 一加 Ace 3 Pro（PJX110 / corvette，骁龙 8 Gen 3） |
| USB ID | `VID_22D9` / `PID_2765`（ADB 接口 `MI_01`） |
| 驱动包 | `Oppo+USB+Driver+Setup+V4.0.1.6.exe`（Inno Setup，LZMA 载荷 22.6 MB） |
| OPLUS 安装目录 | `C:\Program Files\OPLUS\` |
| INF 路径 | `C:\Program Files\OPLUS\QcomMtkDriver\Driver\Adb_mtp_rndis\android_winusb.inf` |
| platform-tools | scoop `adb` 37.0.1 / AS SDK（本机实测 `where.exe adb` 指向 AS 的 `platform-tools\adb.exe`，scoop 版在 `scoop\shims`，未安装） |
| 驱动包内统计 | `VID_22D9` 188 行、`VID_2A70` 16 行、`PID_2765&MI_01` 4 条 |
| 独立 Qualcomm 包 | `Qualcomm_USB_Host_Drivers_...20180705...exe`（qc 驱动 2018 版） |
| 历史教训 | OPLUS 驱动曾装过、目录还在，但 `android_winusb.inf` 当时**未发布**：`pnputil` 97 个包里 android 命中 0，`oem*.inf` 60 个无一提及，类注册表还留着悬空引用 `@oem60.inf,...,Android Phone`（`oem60.inf` 已不存在） |

## 8 相关

- [[Android SDK Platform-Tools]] —— platform-tools 的安装与基础用法；本文 §2 说明它不含驱动，两者配合使用
- [[Scoop]] —— 用 scoop 安装 `adb` 的方式
