---
tags: []
title: CPU 频率设置
date created: 2025-03-30 05:03:29
date modified: 2026-03-27 07:11:04
---

# CPU 频率设置

## 1 使用 `cpufreq` 调节器（推荐）

Arch Linux 默认使用 `cpufreq` 进行 CPU 频率管理，可以通过 `cpupower` 或手动修改 `/sys` 文件系统来限制最大频率。

### 1.1 使用 `cpupower`

1. 安装 `cpupower`：

   ```bash
   sudo pacman -S cpupower
   ```

2. **查看当前 CPU 频率信息**：

   ```bash
   cpupower frequency-info
   ```

3. **设置频率上限**（例如限制到 `3.8GHz`）：

   ```bash
   sudo cpupower frequency-set --max 3800000  # 单位：kHz
   ```

4. **持久化设置**（通过 systemd 服务）：

   ```bash
   sudo systemctl enable --now cpupower.service
   ```

### 1.2 手动修改 `/sys` 文件

- 直接写入 `scaling_max_freq`：

  ```bash
  echo 3800000 | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq
  ```

- **持久化**（通过 `tmpfiles.d`）：

  ```bash
  echo "w /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq - - - - 3800000" | sudo tee /etc/tmpfiles.d/cpu_freq.conf
  sudo systemd-tmpfiles --create
  ```

## 2 使用 `ryzenadj`（调整 TDP/功耗墙，间接影响频率）

可以通过调整 **TDP（功耗墙）** 间接影响频率上限：

1. **安装 `ryzenadj`**：

   ```bash
   yay -S ryzenadj  # 或从 AUR 安装
   ```

2. **限制 TDP（例如 35W）**：

   ```bash
   sudo ryzenadj --stapm-limit=35000 --fast-limit=35000 --slow-limit=35000
   ```

   - 这不会直接限制频率，但会降低 CPU 的功耗，从而减少 Boost 频率的持续时间。

## 3 使用 `amdctl`（调整 PBO 设置，需 BIOS 支持）

如果你的笔记本 BIOS **解锁了 PBO（Precision Boost Overdrive）**，可以尝试：

1. **安装 `amdctl`**（AUR）：

   ```bash
   yay -S amdctl
   ```

2. **调整 PBO 参数**（例如降低 Boost 上限）：

   ```bash
   sudo amdctl --set-pbo=disabled  # 禁用 PBO，可能降低最大频率
   ```

   - 部分笔记本 BIOS 锁定了 PBO，可能无法调整。

## 4 使用 `thermald`（温度限制，间接影响频率）

如果 CPU 因高温而降频，可以调整温度阈值：

1. **安装 `thermald`**：

   ```bash
   sudo pacman -S thermald
   ```

2. **编辑 `/etc/thermald/thermal-conf.xml`**，设置更宽松的温度限制：

   ```xml
   <ThermalConfiguration>
     <Platform>
       <Name>AMD Ryzen 7 5800H</Name>
       <TripPoint>90</TripPoint>  <!-- 设置温度上限 -->
     </Platform>
   </ThermalConfiguration>
   ```

3. **启动服务**：

   ```bash
   sudo systemctl enable --now thermald
   ```

## 5 使用 `undervolt`（降压优化，减少降频）

可以尝试 **降压（Undervolt）** 以减少发热，间接提高 Boost 频率的稳定性：

1. **使用 `zenstates`（AUR）**：

   ```bash
   yay -S zenstates
   ```

2. **调整电压偏移**（需 BIOS 支持）：

   ```bash
   sudo zenstates --set CO=-10  # 尝试 -10mV 偏移
   ```

## 6 总结

| 方法 | 适用场景 | 备注 |
| --- | --- | --- |
| **`cpupower`** | 直接限制频率 | 推荐，简单有效 |
| **`ryzenadj`** | 限制 TDP | 间接影响 Boost 频率 |
| **`amdctl`** | 调整 PBO | 需 BIOS 支持 |
| **`thermald`** | 温度管理 | 防止降频 |
| **`undervolt`** | 降压优化 | 需稳定性测试 |

如果你的 **BIOS 未解锁**，推荐使用 **`cpupower`** 或 **`ryzenadj`** 进行限制。若需更精细控制，可尝试 **降压优化** 或 **调整温度管理**。
