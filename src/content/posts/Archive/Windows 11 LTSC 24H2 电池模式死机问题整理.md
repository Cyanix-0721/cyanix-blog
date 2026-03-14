# Windows 11 LTSC 24H2 电池模式死机问题整理

## 1 系统与硬件信息

- **电脑型号**：Lenovo 82JW  
- **CPU**：AMD Ryzen 7 5800H with Radeon Graphics  
- **GPU**：NVIDIA GeForce RTX 3050 Ti Laptop GPU  
- **BIOS**：HHCN37WW 01/17/2024  
- **操作系统**：Windows 11 LTSC 24H2  
- **已知问题出现时间**：升级至 24H2 后首次出现  

## 2 问题现象

- **仅在 Windows 下发生**  
- **仅在不插电（电池模式）下发生**  
- **直接卡死（完全冻结，CapsLock 灯不动）**  
- **Linux / BIOS / WinPE 下正常**  
- **更换硬盘、重装系统后仍出现**  

### 2.1 电池信息（battery report）

- 设计容量：80,000 mWh  
- 满充容量：71,810 mWh（约 90% 健康度）  
- 循环次数：113  
- 无明显电池衰退迹象  

---

## 3 分析

- 问题与电池健康无关  
- 问题高度疑似 **Windows 11 LTSC 24H2 + Ryzen 电源管理 bug**  
- 核心原因：电池模式下 **CPU / GPU 深度省电状态（C-state / CPPC / P-state）** 触发内核冻结  
- GPU（Optimus / PCIe 节能）在电池模式下也可能触发死锁  

---

## 4 已尝试的解决方案

### 4.1 启用卓越性能计划

```powershell
# 添加并激活卓越性能电源计划
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
# 执行后会出现新计划的 GUID（例如 {a2921590-001e-4f36-8f60-6dd1a0fec8ed}），复制该 GUID 并激活
powercfg -setactive "这里替换为你的GUID"
```

- 作用：启用隐藏的“卓越性能”计划，该计划默认禁用 CPU 深度节能状态，有助于稳定电池模式下的供电。
- 若需一键完成，可使用以下脚本自动提取 GUID 并激活：

```powershell
$perf = powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 | Select-String -Pattern "\{.*?\}" | ForEach-Object { $_.Matches.Value }
powercfg -setactive $perf
```

> [!note] 手动操作路径  
> 控制面板 → 电源选项 → 显示附加计划 → 勾选“卓越性能”（若未显示，需先通过命令行启用）

### 4.2 禁用 PCIe 链路电源管理

```powershell
# 禁用 PCI Express 链路状态电源管理
powercfg -setacvalueindex scheme_current SUB_PCIEXPRESS ee12f906-d277-404b-b6da-e5fa1a576df5 0
powercfg -setdcvalueindex scheme_current SUB_PCIEXPRESS ee12f906-d277-404b-b6da-e5fa1a576df5 0
powercfg -setactive scheme_current
```

- 作用：防止 PCIe 设备（如独立显卡、固态硬盘）因省电而意外进入低功耗状态，避免设备响应延迟或掉线导致系统冻结。
- 数值 `0` 表示关闭电源管理，`1` 为中等节能，`2` 为最大节能。

> [!note] 手动操作路径  
> 控制面板 → 电源选项 → 当前电源计划 → 更改计划设置 → 更改高级电源设置 → PCI Express → 链接状态电源管理 → 将“使用电池”和“接通电源”均设为 **关闭**

### 4.3 禁用 CPU 深度降频

```powershell
# 禁用 CPU 深度降频（最小处理器状态设为 100%）
powercfg -setacvalueindex scheme_current sub_processor PROCTHROTTLEMIN 100
powercfg -setdcvalueindex scheme_current sub_processor PROCTHROTTLEMIN 100
powercfg -setactive scheme_current
```

- 作用：防止 CPU 进入深度 C-state 导致死锁，强制 CPU 始终运行在高性能状态。
- AC / DC（插电/电池）模式均生效。

> [!note] 手动操作路径  
> 控制面板 → 电源选项 → 当前电源计划 → 更改计划设置 → 更改高级电源设置 → 处理器电源管理 → 最小处理器状态 → 将“使用电池”和“接通电源”均设为 **100%**

### 4.4 驱动更新

- **AMD Chipset Driver** 更新至最新稳定版
- **注意**：不要依赖 Windows Update，请从 AMD 官网或笔记本厂商官网下载。

### 4.5 BIOS 检查

- BIOS 中无相关 C-state / CPPC 设置
- 已确认 BIOS 版本为最新可用版本（HHCN37WW 01/17/2024）

---

## 5 临时测试结果

- 正在进行二次测试
- 初步观察：禁用深度降频 + 电源计划调整 + PCIe 管理关闭，似乎有效缓解了死机

---

## 6 注意事项

- 问题仅在电池模式下触发
- 插电模式正常
- 如果日常使用仍需电池模式，建议持续观察几天
- 可进一步编写开机脚本自动应用 PowerShell 设置，避免每次手动操作
