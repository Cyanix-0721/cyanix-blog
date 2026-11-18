---
tags: [KernelSU, Android, Root, 挂载, 模块]
title: KernelSU 元模块 MMRS 与 Hybrid Mount 对比
aliases: [mmrs-vs-hybrid-mount]
date created: 2026-11-16 14:20:00
date modified: 2026-11-16 14:20:00
---

# KernelSU 元模块 MMRS 与 Hybrid Mount 对比

> [!abstract] 适用场景
> 回答「给 KernelSU 装元模块做 systemless 修改，选 MMRS 还是 Hybrid Mount」。结论：**MMRS = 单一 Magic Mount 实现 + WebUI，简单稳但功能有限；Hybrid Mount = 三后端调度器（OverlayFS / Magic Mount / 自研 VFS），功能强但复杂、包大、官方自认未达稳定。** 适用于挑 root 元模块、判断能否做 overlay 整层替换。纯源码调研，无本机实测。

## 1 背景与适用条件

- 两者都是 KernelSU（及 SukiSU-Ultra 等 fork）用的「元模块」，负责把各模块的文件 systemless 地挂到系统分区上。
- 仓库快照（调研时间 2026-10-28，来源全为一手：两仓库 README、`docs/`、浅克隆源码）：
  - MMRS = `Tools-cx-app/meta-magic_mount-rs`，v4.0.12（2026-10-16），★584
  - Hybrid Mount（HM）= `Hybrid-Mount/meta-hybrid_mount`，v6.2.5（2026-10-21），★1774
- **版本敏感**：以下结论基于上述具体版本，升级后需重核。
- 适用范围：选型、理解两种挂载模型差异。不适用：具体某 ROM 的刷入教程。

## 2 一句话定位

**MMRS 是 Magic Mount 这一种挂载方式的完整实现 + 好看的 WebUI；Hybrid Mount 是一个挂载策略调度器，把 OverlayFS / Magic Mount / 自研 VFS 三种后端按模块、按路径分流。**

## 3 核心差异表

| 维度 | MMRS (v4.0.12) | Hybrid Mount (v6.2.5) |
| --- | --- | --- |
| 后端数量 | 1（Magic Mount） | 3（OverlayFS / Magic Mount / VFS） |
| 后端可否混用 | — | 可按模块、按路径混用 |
| 规则优先级 | 无（只有 custom 文件里的 ignore/bind） | 路径规则 > 模块默认 > 全局默认 |
| staging 存储 | `/debug_ramdisk` 挂 tmpfs | tmpfs **或** ext4 loop 镜像（`modules.img`） |
| ext4 的 sysfs 隐藏 | 不涉及 | KSU 走官方 `NukeExt4Sysfs` ioctl；非 KSU 走随包 LKM |
| whiteout 语义 | **不支持** | 支持（记录 + 挂载时生效） |
| `.replace` | 支持（`.replace` 文件 + `trusted.overlay.opaque` xattr） | 支持 |
| 跨模块冲突检测 | 无 | 有，规划阶段直接报错、启动失败 |
| 内置分区表 | 4 个：`vendor`/`system_ext`/`product`（需 symlink）、`odm` | 20 个：含 `mi_ext` 与 `my_*` 全套，`apex` 显式排除 |
| 运行时热操作 | 无（只有 emulated-soft-reboot） | `runtime load/unload/reload`（纯 VFS 模块热插拔） |
| 启动去重 | 无 | boot generation + operation lock + ownership ledger |
| 代码量 | 2475 行 Rust | 28791 行 Rust + 2974 行 C（VFS 内核）+ nuke LKM |
| 包内二进制 | 4 架构各 1 个 | 4 架构 + 7 个 VFS `.ko` + 8 个 nuke `.ko` |
| 许可证 | GPL-3.0 | 核心 GPL-3.0-only / WebUI Apache-2.0 / LKM GPL-2.0 / VFS GPL-2.0 |

## 4 后端实现细节

### 4.1 MMRS：只有 Magic Mount

`src/magic_mount.rs:720` 的 `magic_mount()` 是唯一入口：

1. `collect_module_files()` 扫模块，构建 `Node` 树
2. `mount(mount_source, "/debug_ramdisk", "tmpfs", ...)` 建工作目录
3. 递归 `MagicMount::do_mount()`，按类型分派：
   - 普通文件 → `bind` + `MS_REMOUNT|MS_BIND` 打只读
   - 目录 → tmpfs skeleton 或直接 mount-move
   - 符号链接 → 直接 `symlink()`
4. 收尾 `unmount("/debug_ramdisk", DETACH)`

`grep -rn "whiteout" src/` 无命中 —— MMRS 确实不做 whiteout。`grep -rln "overlayfs" src/` 只命中 `defs.rs` 里的 `trusted.overlay.opaque` xattr 常量（用于 `.replace` 目录），**不是** overlayfs 挂载。

### 4.2 Hybrid Mount：三后端 + 规划层

`src/pipeline.rs:472-501` 的执行顺序是硬编码的三段：

```text
overlay_phase → magic_phase → vfs_phase → commit_unmount_list()
```

**OverlayFS**（`src/overlayfs/overlayfs.rs`）：
- `fsopen("overlay")` 为主路径，失败回退到传统 `mount(2)`（`:205` 拼 `lowerdir=`）
- `MAX_LAYERS = 64`（`:107`），超过就把尾部层先叠进 staging 再作为新一层（`:124` collapse_staging_layers）
- 根挂完之后从 `/proc/self/mountinfo` 逐个重建子挂载（`:319` mount_overlay_child）

**Magic Mount**（`src/magic_mount/exec.rs`）：
- 私有随机 tmpfs staging，不占固定路径
- whiteout 只记录、不实际挂载（`:9` 注释 "whiteouts are recorded but not mounted"）

**VFS**（`src/vfs/`）：
- 走 keyring 把规则下发给自有的 `hybridmount` 内核模块（fork 自 NoMount）
- 读回确认，读回失败的整批丢弃（所以不会虚报 active_mounts）
- **不是真挂载** —— 不进 `/proc/self/mountinfo`，靠 provider 读回确认
- 与 NoMount 不互操作：注册的 key type 不同，内核不会阻止两者共存，所以会撞

## 5 配置对比

### 5.1 MMRS

`/data/adb/magic_mount/config.toml`：

```toml
mountsource = "KSU"
umount = false
partitions = []
extra_mount = []
```

规则文件 `/data/adb/magic_mount/custom`，只有四种命令：`ignore` / `bind` / `file` / `add`。

### 5.2 Hybrid Mount

`/data/adb/hybrid-mount/config.toml`：

```toml
moduledir = "/data/adb/modules"
overlay_mode = "ext4"      # ext4 | tmpfs
disable_umount = false
default_mode = "overlay"   # overlay | magic | vfs
extra_mount = []

[rules.example_module]
default_mode = "magic"

[rules.example_module.paths]
"system/etc/hosts" = "overlay"
```

HM 多出来的能力：`default_mode` 三选一、模块级覆盖、路径级覆盖、`vfs_strict`、`vfs_isolate_uids`、`module_blacklist.toml`。

> [!warning] HM 已移除自定义 bind
> `src/config.rs:141` 注释写得很清楚：`Upgrade-only input from releases that exposed custom bind mounts. The backend no longer implements that feature`。所以想 `bind` 任意路径的，反而 MMRS 更合适。

## 6 风险与代价

### 6.1 Hybrid Mount

- 自己文档 `docs/RUNTIME.md:5` 写着 `This implementation needs rooted-device validation before being treated as stable.` —— **官方自认未达稳定**
- VFS 需要 `insmod`，有熔断标记：内核崩溃后下次启动拒绝自动重试，得手动清
- 包内 15 个 `.ko`，装包体积和复杂度远超 MMRS
- 三后端混用时，同一路径不能进两个后端，文件/类型/`.replace` 冲突会在规划阶段直接让启动失败 —— 安全，但配错了就是开不了机

### 6.2 MMRS

- README 自述「作者由于学业原因，更新会放缓」
- 无 whiteout、无 overlay，大目录整体替换只能靠 `.replace` + 逐文件 bind，inode 和挂载点数量都会爆
- 无跨模块冲突检测，两个模块抢同一路径时行为未定义
- `ksucalls.rs` 注释：`The ioctl function of SukiSU-Ultra has been broken, and umount is now disabled.` —— SukiSU-Ultra 上 umount 相关功能不可用

## 7 怎么选

### 7.1 选 MMRS

- 只要 systemless 覆盖，不需要 overlay 的层叠能力
- 设备内核老 / 不想 insmod 任何东西
- 想用 `bind` 把任意路径绑过去（HM 已移除该功能）
- 追求配置简单、装包小、出问题好排查

### 7.2 选 Hybrid Mount

- 需要 overlay 做整层替换（大目录、`system/app` 整包换掉这类）
- 需要按路径细粒度分流：某模块整体走 magic，但它里面的 `etc/hosts` 单独走 overlay
- 想要 VFS 的无痕注入（不是真挂载，`mountinfo` 里看不到）
- 愿意承担：内核崩溃风险、包大、配置复杂

### 7.3 两个都别装

设备上已有 NoMount —— HM 的 VFS 会跟它撞（同劫持 inode ops）。

## 8 相关

- [[一加 Ace 3 Pro ADB 驱动选择]]
- 上游仓库：[MMRS](https://github.com/Tools-cx-app/meta-magic_mount-rs)、[Hybrid Mount](https://github.com/Hybrid-Mount/meta-hybrid_mount)
- HM VFS 文档：[docs/RUNTIME.md](https://github.com/Hybrid-Mount/meta-hybrid_mount/blob/main/docs/RUNTIME.md)、[module/vfs/README.md](https://github.com/Hybrid-Mount/meta-hybrid_mount/blob/main/module/vfs/README.md)
- 上游血缘：[NoMount](https://github.com/maxsteeel/nomount)（HM 的 VFS 上游）、[KernelSU](https://github.com/5ec1cff/KernelSU)（MMRS 的 Magic Mount 原始实现来源）
