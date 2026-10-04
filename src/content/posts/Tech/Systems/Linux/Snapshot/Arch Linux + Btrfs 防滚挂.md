---
tags: []
title: Arch Linux 上 Btrfs 快照与 Btrbk 工具的使用
aliases: Arch Linux 上 Btrfs 快照与 Btrbk 工具的使用
date created: 2024-08-15 10:18:47
date modified: 2026-03-27 07:11:08
---

# Arch Linux 上 Btrfs 快照与 Btrbk 工具的使用

## 1 介绍

在 Arch Linux 使用 Btrfs 时，为了防止系统更新导致无法启动或出现重大问题（俗称 "滚挂"），你可以采用多种方案。本文将详细介绍如何使用 Btrfs 快照功能以及 btrbk 工具来管理快照和备份。

## 2 防止滚挂的方案

### 2.1 快照与回滚

Btrfs 支持内置的快照功能，可以在系统更新前创建快照，以便在出现问题时快速回滚到更新前的状态。

- **手动创建快照**：  
  使用 `btrfs` 命令手动创建快照，例如：

  ```bash
  sudo btrfs subvolume snapshot / /mnt/@snapshot
  ```

  这会在 `/mnt/@snapshot` 目录下创建一个当前根分区的快照。

- **自动快照**：  
  可以使用 [[#3 Snapper 详细配置与使用|snapper]] 或 [[#4 Btrbk 详细配置与使用|btrbk]] 等工具来自动管理快照。

### 2.2 系统分区和数据分区分离

将系统分区和用户数据分开，可以降低系统分区滚挂时对数据的影响。这样即使系统出问题，数据分区仍然是安全的，可以通过快照回滚系统分区。

### 2.3 双系统或双根分区

设置双根分区（例如，一个用于正常使用，另一个用于备用），在进行大版本更新或不稳定更新时，可以先更新备用分区，确保系统稳定后再切换到主用分区。

### 2.4 慎重选择软件源

使用 Arch Linux 官方仓库或者更为稳定的镜像源，并定期进行系统备份。你也可以使用 `Arch Linux Archive (ALA)`，如果滚挂，能够通过 ALA 将系统恢复到某个具体的时间点。

### 2.5 定期离线备份

尽管快照非常有用，但面对硬件故障或无法通过快照恢复的问题时，定期的离线备份（例如使用 `rsync` 或 `btrbk`）仍然是最安全的选择。

### 2.6 使用稳定的内核

对于生产环境或需要高稳定性的系统，考虑使用 `linux-lts` 内核包，该内核相对较少地更新，并且更稳定。

## 3 Snapper 详细配置与使用

Snapper 是另一个强大的 Btrfs 快照管理工具，由 openSUSE 团队开发，被广泛用于管理 Btrfs 子卷的快照。它可以与 `pacman` 钩子集成，在系统更新前后自动创建快照。

### 3.1 安装 Snapper

安装 `snapper` 以及可选的 GUI 支持工具：

> [!info] Btrfs-Assistant：Snapper 的图形化界面
>
> `btrfs-assistant` 是一个图形化工具，提供了对 Btrfs 文件系统和 Snapper 快照的直观管理。

```bash
sudo pacman -S snapper btrfs-assistant
```

### 3.2 配置 Snapper

1. **创建配置**：

   首先，你需要为要管理的 Btrfs 子卷创建一个 Snapper 配置。例如，为根目录创建配置：

   ```bash
   sudo snapper -c root create-config /
   ```

   这会在 `/etc/snapper/configs/` 目录下创建名为 `root` 的配置文件。

2. **编辑配置文件**：

   配置文件位于 `/etc/snapper/configs/root`。以下是一些关键配置选项：

   ```bash
   # 快照保存的目录
   SNAPPER_CONFIGS="/etc/snapper/configs"

   # 设置快照的子卷路径（通常是根目录）
   SUBVOLUME="/"

   # 保留策略：每小时快照保留数量
   NUMBER_LIMIT="10"
   NUMBER_LIMIT_IMPORTANT="5"

   # 时间保留策略：保留最近10个快照，重要快照保留5个
   TIMELINE_CREATE="yes"
   TIMELINE_CLEANUP="yes"
   TIMELINE_LIMIT_HOURLY="5"
   TIMELINE_LIMIT_DAILY="7"
   TIMELINE_LIMIT_WEEKLY="2"
   TIMELINE_LIMIT_MONTHLY="1"
   TIMELINE_LIMIT_YEARLY="0"
   ```

3. **调整权限**：

   默认情况下，Snapper 创建的快照目录可能只有 root 可读。为了让普通用户能够访问快照，可以调整权限：

   ```bash
   sudo chmod a+rx /.snapshots
   sudo chown :users /.snapshots
   ```

### 3.3 自动创建快照

Snapper 可以与 `pacman` 集成，在系统更新前后自动创建快照：

1. **安装 `snapper-support`**：

   ```bash
   paru -S snapper-support
   ```

   这个包提供了 `pacman` 钩子，可以在执行 `pacman` 事务（如安装、更新或删除软件包）前后自动触发 Snapper 创建快照。

2. **启用 `snapper-boot` 服务**：

   为了在系统启动时创建启动快照，启用以下服务：

   ```bash
   sudo systemctl enable snapper-boot.timer
   sudo systemctl start snapper-boot.timer
   ```

3. **启用时间线快照**：

   Snapper 可以按时间线自动创建快照（每小时、每天等）。启用时间线计时器：

   ```bash
   sudo systemctl enable snapper-timeline.timer
   sudo systemctl start snapper-timeline.timer
   ```

### 3.4 使用 Snapper 管理快照

- **列出快照**：

  ```bash
  sudo snapper -c root list
  ```

- **创建手动快照**：

  ```bash
  sudo snapper -c root create -d "手动快照描述"
  ```

- **删除快照**：

  ```bash
  sudo snapper -c root delete <快照ID>
  ```

- **比较快照差异**：

  ```bash
  sudo snapper -c root status <快照ID1>..<快照ID2>
  ```

## 4 Btrbk 详细配置与使用

`btrbk` 是一个强大的工具，用于自动化 Btrfs 快照管理和备份。它可以定期创建和删除快照，支持本地和远程备份。

### 4.1 安装 Btrbk

首先，安装 `btrbk`：

```bash
sudo pacman -S btrbk
```

### 4.2 配置 Btrbk

- **配置文件位置**：`/etc/btrbk/btrbk.conf`

- **基本配置示例**：

```bash
# 基本设置
timestamp_format        long
transaction_log         /var/log/btrbk.log
snapshot_dir            /.snapshots

# 根卷配置
volume /
  # 本地快照保留策略
  snapshot_preserve_min   2d
  snapshot_preserve       14d
  
  # 备份目标配置
  target /mnt/backup
    subvolume /
    # 备份保留策略 - 保留2个月份的备份
    target_preserve_min   no
    target_preserve       2m
```

### 4.3 运行 Btrbk

- **手动运行快照创建**：

  ```bash
  sudo btrbk run
  ```

  这会根据配置文件中的策略立即创建快照。

- **设置定时任务**：  
  为了自动化，你可以将 `btrbk run` 添加到定时任务中，例如使用 `cron`：

  ```bash
  sudo crontab -e
  ```

  添加如下行来每日运行 `btrbk`：

  ```bash
  0 2 * * * /usr/bin/btrbk run
  ```

  这将在每天凌晨 2 点运行 `btrbk`。

### 4.4 备份快照到远程

btrbk 还支持将快照备份到远程服务器：

- **配置远程备份**：

  ```bash
  target = user@remote:/path/to/backup           # 配置远程目标
  
  volume /                                       # 管理本地根分区
      snapshot create = daily
      snapshot keep = 7d                         # 保留7天的本地快照
      send receive = user@remote:/path/to/backup # 发送快照到远程服务器
      receive keep = 30d                         # 在远程保留30天的快照
  ```

- **SSH 无密码登录**：  
  如果你计划自动备份到远程服务器，建议配置 SSH 无密码登录：

  ```bash
  ssh-keygen -t rsa -b 4096
  ssh-copy-id user@remote
  ```

  然后，`btrbk` 将能够在没有密码提示的情况下备份到远程服务器。

### 4.5 Btrbk 的高级功能

- **压缩和加密**：你可以配置 `btrbk` 在备份时启用压缩和加密。
- **多目标备份**：btrbk 支持同时备份到多个目标，包括本地和远程。
- **日志和邮件通知**：你可以配置 `btrbk` 在备份完成后发送邮件通知或写入日志文件。

通过使用 `btrbk` 进行自动化管理，你可以确保系统在出现问题时能够轻松回滚，同时也能将关键数据安全地备份到其他位置。
