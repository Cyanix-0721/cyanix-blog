---
tags: [Bootloader, Linux, Grub]
title: GRUB
aliases: GRUB
date created: 2024-08-15 04:19:28
date modified: 2026-03-14 09:35:22
date: 2026-03-15 02:52:39
---

# GRUB

> [!note]  
>
> [GRUB](https://www.gnu.org/software/grub/) [GRUB - Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/GRUB)  
> [[引导损坏修复]]

## 1 安装GRUB

首先，需要在安装了Arch Linux的硬盘上安装GRUB。可以通过以下步骤完成：

```bash
sudo pacman -S grub os-prober
```

`grub` 是GRUB引导程序的核心包，`os-prober` 是用来探测其他操作系统的工具。

## 2 安装GRUB到硬盘

假设Arch Linux安装在`/dev/sda`上，Windows 11安装在`/dev/sdb`上。我们需要将GRUB安装到`/dev/sda`的主引导记录（MBR）或EFI系统分区中。

### 2.1 确认EFI系统分区（ESP）的挂载情况

首先，确认你的EFI系统分区（ESP）是否正确挂载到`/boot/efi`。这是GRUB安装时的重要前提。

1. **检查ESP的挂载**：

	```sh
    lsblk -f
    ```

2. **如果未挂载，手动挂载ESP**：

	```sh
	sudo mount /dev/sda1 /boot/efi
	```

> [!warning]
> - 如果你只有一个 `vfat` 分区，并且它挂载在 `/boot` 目录下，这意味着你的EFI系统分区（ESP）和Linux内核、初始RAM磁盘（initramfs）等文件都存放在同一个分区里。  
> 
> **查看分区内容**：`ls /boot`
>
> 你应该能看到类似 `EFI`、`vmlinuz-linux`、`initramfs-linux.img` 等文件或目录。  
> 后面安装的时候修改 `--efi-directory=/boot`。

### 2.2 BIOS系统

如果你的系统是BIOS（非UEFI），你可以使用以下命令将GRUB安装到MBR中：

```bash
sudo grub-install --target=i386-pc /dev/sda [--recheck]
```

### 2.3 UEFI系统

如果你的系统是UEFI，则使用以下命令将GRUB安装到EFI系统分区中：

```bash
sudo grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB [--recheck]
```

## 3 配置GRUB

在安装GRUB之后，下一步就是生成GRUB的配置文件。

首先，编辑`/etc/default/grub`文件，确保以下内容正确：

```bash
GRUB_DEFAULT=0
GRUB_TIMEOUT=5
GRUB_DISTRIBUTOR="Arch"
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=3 quiet"
GRUB_CMDLINE_LINUX=""

GRUB_DISABLE_OS_PROBER=false
```

然后，运行`os-prober`来识别其他硬盘上的操作系统，并更新GRUB配置：

如果前面的 `/etc/default/grub` 文件中没有 `GRUB_DISABLE_OS_PROBER=false`，`os-prober` 将不会运行并检测其他可引导分区，这意味着在生成 GRUB 配置文件时，可能没有将 Windows 添加到 GRUB 引导菜单中。

```bash
sudo os-prober
```

最后，生成GRUB配置文件：

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

这个命令将扫描所有硬盘，查找操作系统，并在GRUB配置中添加对应的引导条目。

## 4 验证和调整

重启计算机，你应该会看到GRUB菜单，其中列出了Arch Linux和Windows 11。如果没有看到Windows 11的选项，可能是`os-prober`没有正确探测到Windows 11。在这种情况下，你可以手动编辑`/etc/grub.d/40_custom`文件，添加Windows 11的启动条目。

### 4.1 手动添加Windows 11引导条目

打开`/etc/grub.d/40_custom`文件，并添加以下内容：

```bash
menuentry "Windows 11" {
    insmod part_gpt
    insmod ntfs
    search --no-floppy --fs-uuid --set=root YOUR_UUID_HERE
    chainloader (${root})/EFI/Microsoft/Boot/bootmgfw.efi
}
```

请将`YOUR_UUID_HERE`替换为Windows 11所在分区的UUID。你可以使用以下命令来查找UUID：

```bash
sudo blkid /dev/sdb1
```

### 4.2 手动创建UEFI引导项

如果GRUB安装后未自动创建UEFI引导项，可以手动创建。

1. **使用`efibootmgr`创建引导项**：

   ```bash
   sudo efibootmgr --create --disk /dev/sda --part 1 --label "GRUB" --loader /EFI/GRUB/grubx64.efi
   ```

   这里假设你的硬盘为`/dev/sda`，并且`vfat`分区是该硬盘的第一个分区。如果是其他编号，请相应修改。

2. **确认引导项**：  
   使用`efibootmgr`查看引导项并调整顺序。

   ```bash
   sudo efibootmgr
   ```

   确保GRUB的引导项在启动顺序中位于首位。

### 4.3 确认并删除其他引导项

1. **查看当前引导项**：

   ```bash
   sudo efibootmgr
   ```

   找到`systemd-boot`的引导项，并记录下其编号。

2. **删除`systemd-boot`引导项**（可选）：

   ```bash
   sudo efibootmgr -b XXXX -B
   ```

   其中`XXXX`是`systemd-boot`的引导编号。

3. **检查`/boot`目录**：  
   确保`/boot/EFI/GRUB/grubx64.efi`文件存在并且位置正确。

## 5 更新GRUB配置

在添加或更改自定义引导条目后，记得再次生成GRUB配置文件：

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

## 6 卸载 GRUB

### 6.1 确认当前使用的引导加载程序

在卸载 GRUB 之前，请确保你已经设置并确认了其他的引导加载程序（如 `systemd-boot`、`rEFInd`）能够正常工作，否则系统可能无法启动。

### 6.2 卸载 GRUB 包

打开终端，执行以下命令来卸载 GRUB 包：

```bash
sudo pacman -R grub
```

### 6.3 删除 GRUB 配置文件和引导文件

GRUB 卸载后，它的配置文件和引导文件可能仍然保留在 `/boot/grub` 目录下。可以手动删除这些文件：

```bash
sudo rm -rf /boot/grub
```

如果你有 EFI 系统引导分区 (ESP)，还可以删除与 GRUB 相关的文件。一般来说，GRUB 的 EFI 文件位于 `/boot/EFI/grub` 或 `/boot/EFI/BOOT` 下：

```bash
sudo rm -rf /boot/EFI/grub
```

### 6.4 更新引导顺序（可选）

如果你的系统中安装了多个引导加载程序，可能需要调整引导顺序，以确保正确的加载程序被优先使用。可以在 BIOS 或 UEFI 设置中手动调整，也可以使用以下命令更新引导顺序：

```bash
sudo efibootmgr
```
