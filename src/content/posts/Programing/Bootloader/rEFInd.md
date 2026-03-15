---
tags: [Bootloader, Linux, rEFInd]
title: rEFInd
date created: 2024-08-15 04:19:28
date modified: 2026-03-14 09:35:22
date: 2026-03-15 02:52:39
---

# [rEFInd](http://www.rodsbooks.com/refind/)

## 1 rEFInd 简介

rEFInd 是一个功能强大的 EFI 引导管理器，支持多个操作系统的启动，包括 Linux、Windows 和 macOS。它具有直观的图形界面，并且易于配置和使用。

## 2 rEFInd 的安装

### 2.1 在 Arch Linux 上安装 rEFInd

```bash
sudo pacman -S refind
```

### 2.2 安装到 EFI 系统分区

```bash
sudo refind-install
```

rEFInd 安装脚本会自动检测并安装到系统的 EFI 分区，并将 rEFInd 配置为默认引导管理器。

## 3 配置 rEFInd

rEFInd 的配置文件位于 `/boot/EFI/refind/refind.conf`，可以通过编辑此文件来定制引导菜单和行为。

### 3.1 启用图形主题

**安装主题步骤：**
1. 定位到 rEFInd 安装目录（例如 `/boot/EFI/refind`）
2. 在该目录下创建 `themes` 文件夹（如果不存在）
3. 克隆 Catppuccin 主题到 themes 文件夹：

   ```bash
   git clone https://github.com/catppuccin/refind.git catppuccin
   ```

4. 在 `refind.conf` 配置文件中添加主题引用：

```conf
include themes/catppuccin/mocha.conf
```

**注意：** 您可以根据喜好将 `mocha` 替换为其他口味：`latte`、`frappe`、`macchiato` 或 `mocha`。

### 3.2 设置默认启动项

可以通过 `default_selection` 选项设置默认启动项。

```conf
default_selection "Arch Linux"
```

可以使用操作系统的名字或者使用 `+` 来指定上一次启动的系统。

### 3.3 隐藏不必要的启动项

通过 `dont_scan_dirs` 和 `dont_scan_files` 选项，可以隐藏某些启动项。例如，隐藏不需要的 EFI 文件：

```conf
dont_scan_files bootmgfw.efi
```

### 3.4 手动添加启动项

如果 rEFInd 未自动检测到某些操作系统，可以编辑 `refind.conf` 手动添加启动项。

### 3.5 添加 Windows 启动项

```conf
menuentry "Windows 11" {
    icon \EFI\refind\icons\os_win.png
    loader \EFI\Microsoft\Boot\bootmgfw.efi
    options "root=PARTUUID=your-partuuid"
    submenuentry "Boot Windows Recovery" {
        loader \EFI\Microsoft\Boot\bootx64.efi
    }
}
```

### 3.6 配置 Linux 启动项

> [!warning]
>
> - 使用 `btrfs` 需要在 `options` 使用 `rootflags=subvol=@` 才能正常挂载文件系统根目录
> - 在 `refind.conf` 中，根目录是 `/boot`

```conf
menuentry "Arch Linux" {
    icon     /EFI/refind/themes/rEFInd-minimal/icons/os_arch.png
    volume   "Arch Linux"
    loader   vmlinuz-linux
    initrd   initramfs-linux.img
    options  "root=PARTUUID=your-partuuid rootflags=subvol=@ rw add_efi_memmap"
    submenuentry "Boot using fallback initramfs" {
        initrd initramfs-linux-fallback.img
    }
    submenuentry "Boot to terminal" {
        add_options "systemd.unit=multi-user.target"
    }
}
```

## 4 解决常见问题

### 4.1 启动 Windows 后 rEFInd 消失

这种情况可能是由于 Windows 覆盖了引导顺序。可以使用以下方法解决：

- **检查 BIOS/UEFI 引导顺序**，确保 rEFInd 是首选引导项。
- **在 rEFInd 配置文件中添加 Windows 引导项**，并禁用自动修复，设置默认引导为 rEFInd：

  ```conf
  bcdedit /set {default} recoveryenabled No
  bcdedit /set {bootmgr} path \EFI\refind\refind_x64.efi
  ```

- 可使用使用 `EasyUEFI` 等软件调整引导，解决引导文件在不同硬盘导致的无法正常读取问题

## 5 Windows 重启后取代 rEFInd 变成默认启动项

### 5.1 配置文件设置默认使用第一个启动项

BIOS 设置 rEFInd 为第一个启动项后修改 `refind.conf`

```conf
default_selection 1
```

### 5.2 rEFInd 未检测到操作系统

- **确保内核和引导文件位于正确的分区和目录**。
- **手动添加启动项**，如上所述。

### 5.3 [[如何在 Windows 11 中打开或关闭快速启动|关闭快速启动和休眠]]

## 6 卸载 rEFInd

如果不再需要 rEFInd，可以通过以下步骤卸载：

1. **进入 Linux 系统**并卸载 rEFInd：

   ```bash
   sudo refind-install --uninstall
   ```

2. **删除 rEFInd 文件**：

   ```bash
   sudo rm -rf /boot/EFI/refind
   ```
