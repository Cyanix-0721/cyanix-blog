---
tags: [Everything, WSL, 文件检索, 命令行工具]
title: Everything CLI（es.exe）在 WSL 中的使用
aliases: [everything-cli]
date created: 2026-10-06 00:47:16
date modified: 2026-10-14 23:39:00
---

# Everything CLI（es.exe）在 WSL 中的使用

> [!abstract] 适用场景
> 在 WSL 里检索 Windows 盘（`C:` / `D:` / `E:`）上的文件时，用 `es.exe` 查 Everything 的 NTFS 索引，替代 `find` / `fdfind` 遍历 `/mnt/c`。读完后你能判断什么时候该用 `es.exe`、什么时候必须换回 WSL 原生工具，并知道 GBK 输出与只读挂载这两个坑怎么绕。

## 1 背景与适用条件

- **Everything** 是 Windows 上的文件名索引器，基于 NTFS USN 日志建立常驻索引；**Everything CLI（`es.exe`）** 是它的命令行客户端，通过 IPC 查询已建好的索引，而不是实时遍历文件系统。
- 官方文档：[Everything 命令行接口](https://www.voidtools.com/support/everything/command_line_interface/)、[es 源码仓库](https://github.com/voidtools/es)。
- **根因（为什么在 WSL 里差距是数量级）**：`/mnt/c` 是 9p / drvfs 挂载，每一次 `stat` 都要走一次 9p 往返；而 `es.exe` 走的是预建 NTFS USN 索引 + IPC。因此遍历型工具（`find` / `fdfind`）在 `/mnt/c` 上会退化到不可用。
- **版本敏感**：以下结论基于 ES CLI `1.1.0.38` 与 Everything `1.5.0.1423b`（beta 通道）实测，更新版本行为可能变化。
- **前置条件**：
  - Windows 侧已安装并**常驻运行** Everything（GUI 或服务），且已对目标卷建立索引；
  - WSL 侧能执行 Windows PE 二进制（默认 WSL2 即可），`es.exe` 放在可访问路径上；
  - 目标卷是 NTFS（Everything 只索引 NTFS 卷）。
- **适用**：在 `C:` / `D:` / `E:` 上按**文件名 / 后缀 / 大小 / 修改时间**检索。
- **不适用**：WSL ext4 文件系统内的检索（`es.exe` 完全看不到）；按**文件内容**检索（索引未开启内容索引）；需要结构化导出且 `/mnt/c` 只读的场景（见 §4）。

## 2 调用方式与安装

WSL 侧可直接调用 Windows 侧安装的 `es.exe`；scoop 生成的 shim 位于 drvfs 上，实测**无需 `chmod +x` 即可裸名执行**。

```bash
# 方式一：WSL 侧自带一份 es.exe 并赋可执行位（≈70ms/次）
chmod +x es.exe && ./es.exe -n 5 "*.mp4"

# 方式二：显式指定 Windows 侧路径（shim 通常已在 PATH 上，可直接裸名调用）
/mnt/c/Users/<user>/scoop/shims/es.exe -n 5 "*.mp4"
```

安装（Windows 侧执行，用户自行操作）：

```powershell
scoop install everything-cli
# 或
winget install voidtools.Everything.Cli
```

常用查询形态：

```bash
es.exe -n 20 -sort size -size -path 'E:\' '*'   # 某盘最大文件
es.exe -n 10 'dm:today' -sort dm                # 今天改过的
es.exe -path 'D:\' 'pyproject.toml'             # 某目录下按名找
es.exe -regex '^requirements.*\.txt$'           # 正则匹配
es.exe -get-result-count 'ext:pdf'              # 只数条数
```

## 3 覆盖边界（不能替代 WSL 原生工具的场景）

1. **看不到 WSL ext4**：`es.exe -get-result-count "wsl.localhost"` 返回 0。WSL 仓库内按名找文件仍须 `fd` / `fdfind`。
2. **不索引内容**：索引进程的内容索引开关关闭时（`content_indexing_enabled=0`），`content:xxx` 查询会挂起（实测 >120s 无返回）。找文件**内容**一律用 `rg`。
3. **`Everything.exe` 没有 `-export-csv`**：那是 GUI 二进制，无此开关，传入会弹出搜索窗口并挂死。只有 `es.exe` 提供 `-export-csv`。

## 4 编码陷阱

- **搜索词必须是 UTF-8 原文**：直接传中文（如 `es.exe -get-result-count "青水庵"`）能正确匹配；先把词转成 GBK 再传会得到 0 条。
- **stdout 是 GBK 字节**（受 Windows 控制台代码页影响），不是 UTF-8；直接管道给下游会乱码。只要文本路径时加转码：
  ```bash
  es.exe -n 20 "*.mp4" | iconv -f GBK -t UTF-8
  ```
- **`-json` 输出到 stdout 仍是 GBK**，不能直接当 UTF-8 JSON 解析。
- **`-export-csv <file> -utf8-bom` 是唯一干净通道**：产出真正的 UTF-8 BOM + CRLF 文件，中文路径正确。
  ```bash
  es.exe -n 3 "青水庵" -export-csv "C:\\temp\\out.csv" -utf8-bom
  ```
- **注意导出目标路径**：若 `/mnt/c` 以只读方式挂载（挂载选项带 `ro`），导出文件只能落在 Windows 侧路径，再由 WSL 读取。

## 5 建议分工

| 场景 | 工具 |
| --- | --- |
| `C:` / `D:` / `E:` 上按名 / 后缀 / 大小 / 时间找文件、找最近改动 | `es.exe` |
| WSL ext4 仓库内按名找文件 | `fd` / `fdfind` |
| 任一文件系统内按内容找 | `rg`（Everything 内容索引未开启） |

## 6 本机实测环境与数值

> [!warning] 单机单次结果
> 下表为一次实测环境中的单次测量值，仅用于说明**数量级差异**；具体数值随磁盘、索引规模、冷热缓存与挂载参数变化，不要当作基准。

### 6.1 实测环境

| 项 | 值 |
| --- | --- |
| Everything 版本 | `1.5.0.1423b`（scoop `everything-beta`，`C:\Users\<user>\scoop\apps\everything-beta\current\`） |
| 运行实例 | PID 5900（服务）+ 4524（GUI，索引进程） |
| 索引卷 | `ntfs_volume_paths=C:,D:,E:`（`Everything.ini:2819`），全部 `includes=1` |
| 索引规模 | 2,875,940 对象 = 2,384,242 文件 + 491,698 文件夹 |
| ES CLI | 实测下载 `1.1.0.38` 可直连本机 IPC |
| 内容索引 | `content_indexing_enabled=0`（`Everything.ini:989`） |
| `/mnt/c` 挂载 | `9p` / drvfs，**`ro`**（只读），`cache=0x5` |

### 6.2 性能对比

| 任务 | WSL `find` | `es.exe` |
| --- | --- | --- |
| C: 全部 `*.mp4` | 90s 超时，只数到 109 个（实际 4274） | **0.069s**，4274 |
| `*.scoop*` in `C:\Users`（depth 6） | 29.9s | **0.080s** |
| `find /mnt/c/.../scoop -type f` | 2m4s（471,248 个） | — |
| `fdfind --type f` 同目录 | 56s（428,426 个） | — |
| E: 按大小排序 top20 | 24s 且 `sort` 被 SIGPIPE 打断 | **0.107s** |
| 20 次批量查询 | — | 1.281s（≈64ms/次，含进程启动） |

单次 `es.exe` 调用约 70–150ms，主要开销是进程启动与 IPC，而不是查询本身。

## 7 相关

- [[WSL]]
- [[高效命令行工具集：fzf、zoxide、ripgrep、fd、eza、bat]]
- [[Scoop]]
