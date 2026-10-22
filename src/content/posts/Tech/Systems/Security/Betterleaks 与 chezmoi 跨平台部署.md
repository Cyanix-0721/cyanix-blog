---
tags: [betterleaks, chezmoi, mise, 密钥扫描, 跨平台]
title: Betterleaks 与 chezmoi 跨平台部署
aliases: [betterleaks-chezmoi-provision]
date created: 2026-10-01 02:25:19
date modified: 2026-10-14 23:39:00
---

# Betterleaks 与 chezmoi 跨平台部署

> [!abstract] 适用场景
> 这篇记录用 chezmoi + mise 把 Betterleaks 2.0 同时供给到 Linux/WSL 与 Windows 两端的完整做法：为什么只能走 mise、配置接缝怎么接、prefilter 怎么排掉 `.git` 与构建缓存、跨平台 `[env]` 模板怎么写。适合已经用 chezmoi 管理 dotfiles、需要在双平台统一安装同一套 CLI 工具并共享一份配置的人；读完能照着落地，也能看懂每一步的取舍与代价。

## 1 背景与适用条件

- **Betterleaks** 是 gitleaks 作者团队的继任密钥扫描器，核心卖点是**异步 HTTP 有效性校验**、Expr 过滤器与 BPE token 稀有度过滤，支持多源（GitHub / GitLab / HuggingFace / S3 / R2）。上游：[Betterleaks README](https://github.com/betterleaks/betterleaks/blob/main/README.md)。
- **chezmoi** 是跨平台 dotfiles 管理器，同一份源（source）可 apply 到多台机器；[官方文档](https://www.chezmoi.io/)。
- **mise** 是版本管理器 / 环境管理器，`[tools]` 声明工具版本、`[env]` 声明环境变量；[官方文档](https://mise.jdx.dev/)。
- **版本敏感**：以下结论基于 `betterleaks@2.0.0-rc.1`、`go@1.27.1`、mise 的 aqua backend。Betterleaks 2.x 当时**仅发布预发布版**，版本解析语义（§3）尤其容易踩；更新版本可能改变渠道可用性与解析行为。
- **前置条件**：
  - 两个平台各自有一份同源的 chezmoi 克隆（本例为 WSL 与 Windows 双克隆）；
  - 两端均已安装 mise，且 mise 配置为 chezmoi 管理的 dotfile；
  - 能访问 GitHub Releases（aqua backend 从上游 release 拉二进制）。
- **适用范围**：任何「一份配置、多平台供给同一个 CLI 工具」的场景；本文的机制事实（mise `[env]` 模板、betterleaks 配置接缝、prefilter 语义）与具体平台无关。
- **不适用 / 需注意**：
  - Betterleaks **没有** XDG 自动发现，配置文件必须由环境变量显式指向（§5.2）；
  - `filesystem` 模式**不读 `.gitignore`**（§6.3.1）；
  - 本文的字节数、耗时均为**单机单次**实测（§9），只用于说明相对量级。

## 2 为什么只能走 mise

各分发渠道在目标版本上的实测结论：

| 渠道 | 实测结论 |
| --- | --- |
| winget | ID `Betterleaks.Betterleaks` 存在，但只到 **1.9.0** |
| Homebrew tap cask | 仍 `version "1.8.1"` |
| scoop main bucket | 只有 `gitleaks.json` / `trufflehog.json`，无 betterleaks |
| GHCR | 有 `v2.0.0-rc.1`，**无 `:v2` tag**；README 自述包管理器与 Docker `latest` 可能仍给 v1 |
| **mise（aqua backend）** | ✅ 唯一可用渠道。backend 标识 `aqua:betterleaks/betterleaks` |

⇒ 在包管理器尚未跟进 2.x 的阶段，**mise 的 aqua backend 是唯一能拿到目标版本的渠道**。

## 3 版本解析语义（关键，易踩）

- `betterleaks = "2.0"` → 解析失败，`mise ls` 显示 `2.0 (missing)`
- `betterleaks = "latest"` → 解析到 **1.8.1**（❌ 绝不能写）
- `betterleaks = "2.0.0-rc.1"` → ✅ 必须写完整版本号
- `mise ls-remote betterleaks` 只列到 `1.9.0`（结果在 100 条 release 处截断），**不能用来判断可用性**
- `mise install betterleaks@2`（模糊）→ `404 Not Found .../releases/tags/2`

## 4 改动清单

改动为「4 改 1 增 + 全局约束 1 增」：

| 文件 | 改动 |
| --- | --- |
| `dot_config/mise/config.toml` | `[tools]` 增 `go = "1.27"`、`betterleaks = "2.0.0-rc.1"`；新增 `[env] BETTERLEAKS_CONFIG` |
| `dot_config/betterleaks/betterleaks.toml` | **新增**。`minVersion` + 顶层 `prefilter`（补回 `.git` 排除 + 排除 `.uvcache`/`.gradle`/`.kotlin` 构建缓存）+ `[extend] useDefault = true` + 自定义规则落点注释 |
| `scripts/wsl-quickstart/01-essential-packages.sh` | **补上缺失的 `mise install` 步骤**（原先只装 mise 本体，从不按配置装工具） |
| `AGENTS.md` | dot_config 平台速查表补 `betterleaks`（否则双端不同步）+ 接缝说明 |
| `README.md` | 「主要配置」表补两行 |
| `private_dot_dsh/private_AGENTS.md` | §3 增加「跑密钥扫描器必须带 `--redact`」硬约束；顺手修正 §6 的源路径笔误；补记 `filesystem` 不读 `.gitignore` 的实际排除范围 |

Windows 侧 quickstart（`scripts/windows-quickstart/02-development-tools.ps1:85-108`）**本来就有** `mise install` 步骤，无需改动。

### 4.1 `dot_config/mise/config.toml`（最终内容）

```toml
[tools]
java = "temurin-17"
go = "1.27"
# betterleaks 2.x 仅发布预发布版;必须写完整版本号
# 注意:`2.0` / `latest` 均无法解析到 2.x(latest 会退回 1.8.1),不要改写成模糊范围
betterleaks = "2.0.0-rc.1"

[env]
# betterleaks 不会自动发现 XDG 路径或工程内 .betterleaks.toml,必须显式指向配置文件。
# {{env.HOME}} 在 Windows 上未定义会直接报错,故用 default() 回退到 USERPROFILE。
BETTERLEAKS_CONFIG = "{{env.HOME | default(value=env.USERPROFILE)}}/.config/betterleaks/betterleaks.toml"
```

> [!note] 提交拆分
> 这次改动落地为**七个关注点分离的提交**（仓库风格：单行中文 subject、无正文），提交边界即回退边界（见 §8）。示例：
> `feat(mise): 引入 betterleaks 2.0 与 go 工具链并导出 BETTERLEAKS_CONFIG`、
> `fix(wsl-quickstart): 补齐缺失的 mise install 步骤`、
> `fix(betterleaks): 补回 .git 目录排除，避免扫描对象库`、
> `docs(dsh): 密钥扫描器必须加 --redact，避免明文落盘`、
> `fix(dsh): 修正 AGENTS.md 中 chezmoi 源路径笔误`、
> `fix(betterleaks): 排除 uv/gradle/kotlin 缓存目录，消除构建产物误报`、
> `docs(dsh): 补记 betterleaks filesystem 不读 .gitignore 的实际排除范围`。
> 提交哈希属于具体仓库，换机器复现时只需沿用「一个关注点一个提交」的拆法。

## 5 两个必须记住的机制事实

### 5.1 mise `[env]` 的跨平台写法

`{{env.HOME}}` 在 Windows 上**未定义**，会硬报错：

```text
mise ERROR failed to parse template: '{{env.HOME}}/...'
mise ERROR error: Field `HOME` is not defined. Available fields: =::, ALLUSERSPROFILE, ..., USERPROFILE, ...
```

- `{{ get_env(...) }}` / `{{ env_var(...) }}` 在 mise 的 tera 里**不存在**
- 唯一可用形式：`{{env.HOME | default(value=env.USERPROFILE)}}`
- mise 的 `[env]` **所有值都会被求值**（即使加了 `os = [...]` 过滤），所以**不能用 per-OS 过滤隔离**一个坏模板
- 模板失败会**连带破坏 shell 激活**（`mise hook-env` rc=1、stdout 0 字节）

实测渲染结果（路径已占位化）：

- Linux（`HOME` 已设）→ `/home/<user>/.config/betterleaks/betterleaks.toml`
- Windows 形（`HOME` 未设 / `USERPROFILE` 已设）→ `C:\Users\<user>/.config/betterleaks/betterleaks.toml`

> mise 会把**整份配置**当模板渲染，包括注释；但注释里出现未定义变量**不会**报错（已验证）。

### 5.2 `BETTERLEAKS_CONFIG` 是**唯一**接缝（必读）

- betterleaks **没有** XDG 自动发现：即使把配置放在 `~/.config/betterleaks/betterleaks.toml`，`config path` 仍打印 `default`，规则被忽略
- **不会**从扫描目标或 cwd 自动加载 `.betterleaks.toml`（`-l trace` 显示 `DBG using config source=default`）
- 优先级：`-c` → `BETTERLEAKS_CONFIG`（路径）→ `BETTERLEAKS_CONFIG_TOML`（内联内容）→ 内嵌默认
- 配置不存在时**硬失败**，不会静默回退到默认

**env 注入覆盖范围（已实测）**：mise shim **确实**会注入 `[env]` —— 只要该工具有已安装版本。

| 路径 | `BETTERLEAKS_CONFIG` |
| --- | --- |
| 交互式 fish（`mise activate fish`） | ✅ 注入 |
| shim 在 PATH 上（无 activation） | ✅ 注入 |
| `mise exec --` | ✅ 注入 |
| `mise activate --shims` **但工具未安装** | ❌ 不注入（早前误判的来源） |

⇒ 脚本 / cron / git hook 走 shim 时同样拿得到变量，**无需**在脚本里显式 `-c`。

## 6 betterleaks 配置语义

### 6.1 `[extend]` 是必须的

自定义配置**不继承**任何默认规则（不写 `[extend]` 会静默丢掉全部 465 条默认规则，只剩自己写的）。`useDefault = true` 或 `path = ...`，且追加式。

本次落点**规则集仍是 465 条**（只追加了下面的 prefilter，不新增规则）：

```text
$ betterleaks config check   # OK: 465 rules (227 with validation, 238 without validation)
$ betterleaks config hash    # 200827cb0f7f80fce9d88033ea9ace70929807adb8e262c3003b167617a1e8d2
```

> hash `200827cb...` 是**加了 `.git` prefilter 之后**的值。未加 prefilter 时与内嵌默认完全一致，为 `2b8e48142a4a505d626346caef5a5e2bc46af95893529cfcd80928efbc98ec70`。

参照值：空配置 → `0 rules`，hash `709e80c8...8147c`；默认 → `465 rules`，hash `2b8e4814...98ec70`；默认 + 1 条自定义 → `466`。

### 6.2 顶层键必须写在所有表头**之前**

把 `prefilter` 写在 `[extend]` 之后会被解析成 `extend.prefilter` 并硬失败：

```text
FTL unable to load config error="config \"/tmp/pf/b.toml\": unknown configuration fields: extend.prefilter (line 3, column 1): strict mode: fields in the document are missing in the target struct"
```

⇒ `minVersion` / `prefilter` / `filter` 必须排在 `[extend]`、`[[rules]]` 之前。

### 6.3 prefilter：补回 `.git` 排除 + 构建缓存排除

v2 的默认 prefilter **不再排除 `.git`**（gitleaks v1 会排除），于是 `filesystem` 扫描会走进 `.git/` 的对象库、reflog、packfile —— 那些是 zlib 压缩内容，几乎不可能匹配明文，却要付出完整遍历与解压开销。实测（在某项目仓库根目录）：

| 配置 | 扫描字节 |
| --- | --- |
| 纯内嵌默认（无 `.git` 排除） | **152,004,660 B（152 MB）** |
| 追加 `.git` 排除（当前配置） | **419,705 B（419.7 KB）** |

⇒ 约 **362×** 的字节量削减，扫描耗时从 444 ms 降到 100 ms。

#### 6.3.1 追加：构建 / 缓存目录排除

**根因**：betterleaks **不读 `.gitignore`** —— `filesystem --help` 与顶层 `--help` 中**无任何** gitignore/respect/exclude 选项。实测在 `.gitignore` 写 `ignored/` 后，`ignored/s.txt` 与 `kept/s.txt` **都被扫描**。于是被 git 忽略的产物目录照样会被完整遍历。

**代价实测**（某项目仓库，tracked 196 文件 / 磁盘 10937 文件）：

| 配置 | 扫描字节 | 耗时 | 命中 |
| --- | --- | --- | --- |
| 仅排 `.git`（改动前） | 720,339,271（720 MB） | 10.58 s | **20（全部误报）** |
| `+ .?uvcache` | 169,980,121（170 MB） | 4.26 s | 0 |
| `+ .?uvcache + .gradle + .kotlin`（改动后） | **158,395,291（158 MB）** | — | **0** |
| `+ .?uvcache + build + .gradle + .kotlin`（未采用） | 5,721,485（5.7 MB） | 0.49 s | 0 |

那 20 条误报的性质：`private-key` 13 / `generic-api-key` 6 / `generic-credential-uri` 1，全部落在 uv 缓存内的 `libgnutls-*.so`、`libonnxruntime.so`、`numpy/random/tests/test_generator_mt19937.py`、`urllib3/util/url.py` —— 二进制与第三方测试数据的偶然字符串，**不是真实凭据**。

**最终采用的 4 条**（`.git` + `.?uvcache` + `.gradle` + `.kotlin`）：

```toml
prefilter = '''
matchesAny(attributes["path"], [
  `(?:^|/)\.git(?:/.*)?$`,
  `(?:^|/)\.?uvcache(?:/.*)?$`,
  `(?:^|/)\.gradle(?:/.*)?$`,
  `(?:^|/)\.kotlin(?:/.*)?$`,
])
'''
```

`\.?uvcache` 必须同时覆盖 `.uvcache/` 与 `uvcache/` 两种拼写：uv 在 `<project>/app/build/uvcache/` 下用的是**无点前缀**版本。

**刻意不排除**（这是明确的选择，不是遗漏）：

- `build/`、`dist/` —— 通用名，可能被某些项目用作**源码**目录，全局排除会导致**漏扫**。代价是 `build/` 里的 152 MB 仍被遍历（158 MB vs 5.7 MB）。需要时用 `betterleaks git .`（只扫跟踪内容，天然避开所有被忽略产物），或临时 `-c` 指定更激进的配置。
- `artifacts/`、`target/`、`__pycache__/`、`.venv/` —— 项目特异名，不适合放进全局配置。

**风险评估**：该项目 tracked 文件中落在候选排除目录的数量 = **0**；同盘其余 6 个仓库（含博客、商城、本知识库、Android 构建、学习与阅读类项目）tracked 的 `uvcache/` 与 `build/` 均为 0；dotfiles 仓库 `build/` 也为 0 ⇒ 当下无副作用。

顶层 prefilter 与内嵌默认是**取并集**而非替换，已实测确认：

只加 `.git` 后，默认的 `node_modules` 排除**依然生效**（回归样本：`node_modules/dep.js` 仍被跳过，`.git/config` 同时被跳过，只剩 `app.js` 与 `sub/mod.js`）。因此该覆盖不会静默丢掉默认的 lockfile / vendor / 图片字体等排除。

prefilter 在**任何正则匹配之前**执行，只能访问 `attributes`（如 `path`），是「跳过」谓词。

#### 6.3.2 边界回归：完整路径段锚定，不误伤相似名

`(?:^|/)X(?:/.*)?$` 精确匹配 `X` **目录**及其内容。已逐项验证（同值 canary 分别放入各文件，用 `-o json` 读取实际命中路径）：

| 路径 | 期望 | 实测 |
| --- | --- | --- |
| `.git/config`（顶层与 `nested/.git/`） | 跳过 | ✅ 跳过 |
| `.gitignore` | 扫描 | ✅ 命中 |
| `.gitmodules` | 扫描 | ✅ 命中 |
| `.gitattributes` | 扫描 | ✅ 命中 |
| `.github/workflows/ci.yml` | 扫描 | ✅ 命中 |
| `.gitlab/x.yml` | 扫描 | ✅ 命中 |
| `plain.js` | 扫描 | ✅ 命中 |

新增 3 条 pattern 的边界样本（12 例，全部符合预期）：

| 路径 | 期望 | 实测 |
| --- | --- | --- |
| `.uvcache/x.txt` / `uvcache/x.txt` | 跳过 | ✅ 跳过 |
| `sub/.uvcache/x.txt` / `sub/uvcache/x.txt` | 跳过 | ✅ 跳过 |
| `.gradle/x.txt` / `.kotlin/x.txt` | 跳过 | ✅ 跳过 |
| `.gradle.kts` / `.kotlin.md` / `uvcache.md` | 扫描 | ✅ 命中 |
| `gradle.properties` | 扫描 | ✅ 命中 |
| `my.gradle/x.txt` | 扫描 | ✅ 命中 |
| `src/uvcache_helper.py` | 扫描 | ✅ 命中 |

（更早一轮 7 条 pattern 试测同样通过：应跳过的 9/9 跳过 —— 含 `build/x.txt`、`artifacts/x.txt`、`.venv/x.txt`、`sub/build/x.txt`；应扫描的 6/6 命中 —— 含 `build.gradle.kts`、`artifacts.md`、`rebuild/`、`prebuild/`、`src/build.rs`、`my.artifacts/`。）

⇒ 结尾的 `(?:/.*)?$` 与前置的 `(?:^|/)` 共同保证了目标必须是完整路径段，`.github` / `.gitlab` / `.gitignore` / `.gradle.kts` / `src/uvcache_helper.py` 等前缀或后缀相同的名字**不会**被连带排除。

**Windows 侧同样成立**：betterleaks 在 Windows 上给出的 `location.path` 是**正斜杠归一化**的（`C:/Users/<user>/AppData/Local/Temp/blgit/.git/config`），因此同一条以 `/` 为分隔符的正则无需分平台变体。已在 Windows 原生 `betterleaks.exe` 下实测：5 个同值 canary 中 `.git/config` 与 `sub/.git/config` 被跳过，`.gitignore` / `.github/ci.yml` / `keep.js` 全部照常命中；新增排除集在某项目仓库下实测 `scanned ~2.31 MB in 93.9 ms / no leaks found`，Windows 侧边界样本（`build.gradle.kts`、`artifacts.md`、`rebuild/`、`src/build.rs` 命中；`build/x.txt`、`.gradle/x.txt`、`artifacts/x.txt`、`sub/build/x.txt` 跳过）亦全部符合预期。

**未新增规则**：`config check` 仍是 `OK: 465 rules`，`config show ids | wc -l` 仍为 465。新配置 hash = `74df7e0f3a722bf2a2aad9a57ef3985540397f654f5f732124d86efd88c81781`（旧值：仅排 `.git` 时 `200827cb…`，`.git` 排除前 `2b8e4814…`，空配置 `709e80c8…`）。

### 6.4 仍未覆盖顶层 `filter`

顶层 `filter` 的**谓词方向未能确定**：`filter = '''true'''` 与 `filter = '''false'''` 在自定义规则下都得到 `no leaks found`，无法用单一语义解释 ⇒ 本配置刻意不覆盖 `filter`。

### 6.5 要不要给某个仓库加**仓库级**配置？（结论：不需要）

针对某个项目仓库的实测结论：**不需要**任何仓库级 betterleaks 配置。

- 全局配置**已覆盖所有子目录**：在该项目 `app/src` 内执行 `betterleaks config path` → `env:BETTERLEAKS_CONFIG:/home/<user>/.config/betterleaks/betterleaks.toml`。
- **仓库内放配置文件是死重**：betterleaks 帮助原文写死 `Config files in scan targets or the current directory are not loaded automatically`。实测在扫描目录内放 `betterleaks.toml` **完全无效**（仍走全局配置，`config hash` 不变）。
- 唯一可行的仓库级接缝是 `.betterleaksignore`（**会**从扫描目标目录自动发现，实测生效），但它用 `match.value` 的 SHA-256 **值指纹** —— 产物目录一重建指纹即失效，**不适合**治路径噪音。治路径噪音应改 prefilter。
- **不要**用仓库 `.mise.toml` 加 `[env]` 来覆盖配置路径：加了 `[env]` 后该文件变成「需信任」，新克隆未 `mise trust` 时 mise **硬失败**（`mise ERROR Config files in ... are not trusted.`，rc=1），连 `betterleaks` 都调不起来；且与该仓库自身的约定冲突 —— 其项目文档写明「仓库根 `.mise.toml` **保持纯配置无注释**…**全局工具声明不属本仓库管辖范围**」。
- 该仓库正确用法就是 `betterleaks git .`（零配置、0 误报、1.74 s、天然只扫跟踪内容）或依赖本次扩大的全局 prefilter。

### 6.6 扫描模式选择

`filesystem` 扫工作树，`git <path>` 扫提交历史（`--staged` / `--unstaged` / `--log-opts` 可细分）。同一仓库对比：`filesystem` + `.git` 排除 = 419.7 KB / 100 ms；`git` 模式 = 101.24 MB / 1.39～1.52 s、3 条命中。

⇒ **日常用 `filesystem`（快），查历史泄漏用 `git`。**

### 6.7 其他实测约束

- `minVersion` 要匹配预发布版：写 `"v2.0.0"` 在 `2.0.0-rc.1` 下报 `requires Betterleaks v2.0.0 or newer; running 2.0.0-rc.1`
- 未知 TOML 字段 → **硬失败**（strict mode），不是警告
- `~` **不展开**：`-c '~/c.toml'` → `FTL unable to load config error="open ~/c.toml: no such file or directory"`。必须绝对路径
- 命中泄漏时退出码 = 1；`-s/--silent` 只压输出不改退出码
- 查找对象是**值指纹**（`match.value` 原始字节的小写 64 位 hex SHA-256），由 `betterleaks fingerprint` 从 stdin 生成，只从扫描目标目录发现；旧 `.gitleaksignore` 的位置指纹与 `sha256:` 前缀**被拒绝**；`--hmac-key` → `hmac-sha256:<hex>`
- v2 **不再**默认排除 `.git` ⇒ 同样目录比 v1 扫更多字节、报更多
- v2 **无** shell 补全子命令；**无** CSV/SARIF/JUnit/template reporter，**无** `--baseline-path`（gitleaks 的 CI SARIF 玩法在 v2 不存在）
- JSON 输出是对象 `{schema_version, findings, scan}`；findings 里**没有**顶层 `file` / `start_line`，真实形状为 `location.path` / `location.start_line`、`match.fingerprint` / `match.value`、`rule_id`、`attributes`（如 `resource: fs.content`）

## 7 部署命令

### 7.1 WSL / Linux

```bash
# 1) 部署 chezmoi 改动
cd ~/.local/share/chezmoi
chezmoi diff          # 预期：新增 ~/.config/betterleaks/betterleaks.toml，以及改动 ~/.config/mise/config.toml
chezmoi apply

# 2) 按全局配置安装（幂等：只补缺失的 go / betterleaks）
mise install

# 3) 验证
mise ls
go version
betterleaks --version
betterleaks config path    # 期望 env:BETTERLEAKS_CONFIG:/home/<user>/.config/betterleaks/betterleaks.toml
betterleaks config check   # 期望 OK: 465 rules (227 with validation, 238 without validation)
```

### 7.2 Windows

若 mise store 里早前已装好 `betterleaks 2.0.0-rc.1`（`C:\Users\<user>\AppData\Local\mise\installs\betterleaks\2.0.0-rc.1\betterleaks.exe`），但 `C:\Users\<user>\.config\mise\config.toml` 尚未声明它，shim 会报 `mise ERROR No version is set for shim: betterleaks`。在 config 里声明后跑 `mise install` 即被正常接管（**幂等，未重装**）——**无需清理**。

```powershell
# 1) 拉取 chezmoi 最新源并部署
cd $HOME\.local\share\chezmoi
git pull
chezmoi apply

# 2) 安装 + 验证
mise install
mise ls
go version
betterleaks --version
betterleaks config path
betterleaks config check
```

> 如需从零重来（非必需）：`Remove-Item -Recurse -Force "$env:LOCALAPPDATA\mise\installs\betterleaks"` 后再 `mise install`。

### 7.3 双端同步

两个 chezmoi 克隆（WSL `~/.local/share/chezmoi`、Windows `C:\Users\<user>\.local\share\chezmoi`）同源同一个 dotfiles 仓库，**必须都同步**。

落地为**七个关注点分离的提交**（仓库风格：单行中文 subject、无正文）：

| 提交 | 内容 | 推送状态 | apply 状态 |
| --- | --- | --- | --- |
| `b382bd7` | `feat(mise): 引入 betterleaks 2.0 与 go 工具链并导出 BETTERLEAKS_CONFIG` | ✅ 已推送 | ✅ 已 apply |
| `976bf98` | `fix(wsl-quickstart): 补齐缺失的 mise install 步骤` | ✅ 已推送 | ✅ 已 apply |
| `a85a436` | `fix(betterleaks): 补回 .git 目录排除，避免扫描对象库` | ✅ 已推送 | ✅ 已 apply |
| `c85c91a` | `docs(dsh): 密钥扫描器必须加 --redact，避免明文落盘` | ✅ 已推送 | ✅ 已 apply |
| `4782e9f` | `fix(dsh): 修正 AGENTS.md 中 chezmoi 源路径笔误` | ✅ 已推送 | ✅ 已 apply |
| `3253cce` | `fix(betterleaks): 排除 uv/gradle/kotlin 缓存目录，消除构建产物误报` | ⚠️ **待推送** | ⚠️ **待 apply** |
| `72ccc47` | `docs(dsh): 补记 betterleaks filesystem 不读 .gitignore 的实际排除范围` | ⚠️ **待推送** | ⚠️ **待 apply** |

前五个提交已推送并在 WSL 侧完成 `chezmoi apply`（实测 `~/.dsh/AGENTS.md:108` 已含 `--redact` 条目、`~/.config/betterleaks/betterleaks.toml` 已含 `.git` 排除）。后两个待推送，`git rev-list --left-right --count origin/main...HEAD` → `0 2`。

**推送与双端 `chezmoi apply` 由用户执行**：

```bash
# WSL（先确认 SSH 通道可用）
cd ~/.local/share/chezmoi && GIT_SSH_COMMAND="$HOME/bin/win-ssh" git push origin main && chezmoi apply
```

```powershell
# Windows
cd $HOME\.local\share\chezmoi; git pull; chezmoi apply
```

> 若 `git push` 报 `kex_exchange_identification: Connection closed by remote host`，那不是本文的 mise/配置问题，而是出口网络对 22 端口的封锁，见 [[GitHub SSH 22 端口被封改用 443]]。

### 7.4 全局约束补记：密钥扫描器必须 `--redact`

betterleaks **默认把命中值明文打进输出**（实测会完整打印形如 `aws_key = "AKIA…"` 的命中），而工具输出会明文落盘到 `~/.dsh/sessions/<workspace>/session-<id>/session.v3.jsonl.zstd`，且纪律是「**密钥进入工具输出即视为已失陷，须轮换**」——两者直接冲突。故在全局约束文档末尾补了一条硬约束（源文件 `private_dot_dsh/private_AGENTS.md`）：

```markdown
- **跑密钥扫描器（betterleaks）**：**默认会把命中值明文打进输出**（因此落盘）⇒
  **必须显式带 `--redact`**，否则等于亲手把密钥写进会话日志。
  查提交历史 `betterleaks git <path>`——它只扫跟踪内容，天然避开所有被忽略的产物，**日常首选**。
  扫工作树用 `betterleaks filesystem <path>`：注意它**不读 `.gitignore`**，会连构建产物一起遍历
  （全局配置已排除 `.git/`、`.uvcache/`、`.gradle/`、`.kotlin/`，以及内嵌默认的 `node_modules/`、
  lockfile、图片字体等；但**未**排除 `build/`、`dist/`、`target/` 等通用产物名）；
  在大仓库上先确认路径范围，别直接扫仓库根。
  回报只给 `rule_id` / 路径 / 行号，**不复述 `match.value`**。
```

**刻意不写**的内容及理由：不写安装 / 配置教程（属 `README` 与本文档，全局约束文件是行为约束，有注入上限）；**不在仓库 `AGENTS.md` 写「提交前扫密钥」**——因为目前**没有** git hook 或 CI 接线，写了即是文档与实况不符。要做门禁是独立任务，需先有 hook。

## 8 回滚

按提交回退（提交边界就是关注点边界，回退粒度与改动粒度一致）：

```bash
cd ~/.local/share/chezmoi
# 只撤 betterleaks 供给（保留 .git 排除与约束补记）
git revert --no-edit b382bd7 976bf98
# 连 .git 排除与约束补记一起撤（更近的五个提交）
git revert --no-edit 4782e9f c85c91a a85a436 3253cce 72ccc47

chezmoi apply
rm -f ~/.config/betterleaks/betterleaks.toml   # revert 后 chezmoi 不会自动删已部署文件
mise uninstall go betterleaks                  # 可选：卸载工具链
```

| 提交 | 撤回影响 |
| --- | --- |
| `72ccc47` | 手册退回「配置已排除 `.git/`」的旧描述（与实际不符） |
| `3253cce` | 构建缓存不再排除 ⇒ 项目 `filesystem` 扫描回到 720 MB / 20 条误报 |
| `4782e9f` | 仅源路径文案（不影响行为） |
| `c85c91a` | 移除 `--redact` 硬约束（**不建议撤**：撤后无任何机制阻止明文密钥落盘） |
| `a85a436` | `.git` 不再排除 ⇒ 扫描字节量回到 152 MB / 444 ms |
| `976bf98` | WSL quickstart 不再跑 `mise install` |
| `b382bd7` | 移除工具声明、`[env]` 接缝、配置文件、平台表登记 |

> 注意：`b382bd7` 引入了 `dot_config/betterleaks/`，`git revert` 会删除源文件，但 chezmoi **不会**自动清理已部署的 `~/.config/betterleaks/betterleaks.toml`，需按上面手动 `rm`，否则该目录下的配置会变成无人管理的孤儿文件。

## 9 本机实测环境与数值

> [!warning] 单机单次结果
> 以下全部为一次实测环境中的单次测量值，用于说明**相对量级与幂等性**，不要当作通用基准；路径已占位化。

### 9.1 实测环境

| 项 | 值 |
| --- | --- |
| 平台 | Linux/WSL + Windows 双端（chezmoi 双克隆，同源） |
| 工具链 | `betterleaks 2.0.0-rc.1` / `go 1.27.1` / `java temurin-17.0.20+101` |
| 工具来源 | mise aqua backend，`mise install` 安装 |
| WSL 配置位置 | `~/.config/mise/config.toml`、`~/.config/betterleaks/betterleaks.toml` |
| Windows 配置位置 | `C:\Users\<user>\.config\mise\config.toml`、`C:\Users\<user>\.config\betterleaks\betterleaks.toml` |
| chezmoi 源 | `~/.local/share/chezmoi`（`dot_config/mise/config.toml`、`dot_config/betterleaks/betterleaks.toml`） |
| 被检项目仓库 | 某私有项目仓库（tracked 196 文件 / 磁盘 10937 文件） |

### 9.2 双端实机验收

**WSL**（`chezmoi apply` + `mise install`）：

```text
mise ls                    → betterleaks 2.0.0-rc.1 / go 1.27.1 / java temurin-17.0.20+101
betterleaks config path    → env:BETTERLEAKS_CONFIG:/home/<user>/.config/betterleaks/betterleaks.toml
betterleaks config check   → OK: 465 rules (227 with validation, 238 without validation)
```

**Windows**（原生 cwd `C:\Users\<user>`）：

```text
mise ls                    → betterleaks 2.0.0-rc.1 / go 1.27.1 / java temurin-17.0.20+101
                             （source 均为 C:\Users\<user>\.config\mise\config.toml）
mise install（二次）        → 3 already installed in 5ms；"mise all tools are installed"
go version                 → go version go1.27.1 windows/amd64
betterleaks --version      → 2.0.0-rc.1
betterleaks config path    → env:BETTERLEAKS_CONFIG:C:\Users\<user>/.config/betterleaks/betterleaks.toml
betterleaks config check   → OK: 465 rules (227 with validation, 238 without validation)
(Get-Command betterleaks)  → C:\Users\<user>\AppData\Local\mise\shims\betterleaks.exe
```

⇒ 关键结论：**mise shim 路径（无 shell activation）下 `[env]` 正常注入**，Windows 侧 `BETTERLEAKS_CONFIG` 经 `USERPROFILE` 回退渲染正确，路径混用正反斜杠（`C:\Users\<user>/.config/...`）是正常现象，betterleaks 能正确打开。

早前那次未声明的 Windows 安装（`installs\betterleaks\2.0.0-rc.1`）已被正常接管，`mise install` **未重装**（幂等），无需清理。

### 9.3 隔离环境自测（用实际落盘文件）

隔离环境（`MISE_CONFIG_DIR` / `MISE_DATA_DIR` / `MISE_CACHE_DIR` 全部重定向到 `/tmp`）中：

- 裸 `mise install`（无参数，读配置）→ rc=0，`real 0m19.062s`；`mise ls` 三条全部就位
- `mise exec -- go version` → `go version go1.27.1 linux/amd64`
- `mise exec -- betterleaks config path` → `env:BETTERLEAKS_CONFIG:/tmp/final/home/.config/betterleaks/betterleaks.toml`
- `mise exec -- betterleaks config check` → `OK: 465 rules (227 with validation, 238 without validation)`
- **非交互真实路径**（shim 在 PATH 上、无 activation、变量未预设、`HOME` 指向部署目录）扫描含 `ghp_` 前缀样本 → 命中，`leaks found: 1`，rc=1
- 默认规则在自定义配置下仍生效：`generic-api-key` 命中探针里**伪造的** AWS 形态串（`AKIA` + 16 位大写字母数字，非真实凭据；此处不复述完整值，避免扫描器误报）

CI 门禁（`.github/workflows/ci.yml` 四道）本地复跑：

| 门禁 | 结果 |
| --- | --- |
| `chezmoi execute-template --init --override-data '{...}'` 渲染全部 `*.tmpl` | PASS |
| `ruff check scripts/` | 未受本次改动影响 |
| `shellcheck -x -S warning $(find scripts dot_local/bin -name '*.sh')` | PASS（exit 0；本地无 shellcheck，临时取 v0.11.0 复跑） |
| PSScriptAnalyzer | 未受本次改动影响（未改 `.ps1`） |

prefilter 扩容那次提交单独复跑：

| 检查 | 结果 |
| --- | --- |
| `betterleaks -c <源文件> config check` | PASS：`OK: 465 rules (227 with validation, 238 without validation)`（规则数未变） |
| `betterleaks -c <源文件> config show ids \| wc -l` | `465` |
| `betterleaks -c <源文件> config hash` | `74df7e0f3a722bf2a2aad9a57ef3985540397f654f5f732124d86efd88c81781` |
| 项目仓库 `filesystem` 新旧对比 | 720,339,271 B / 20 条命中 → **158,395,291 B / 0 条命中** |
| dotfiles 仓库回归（应仍只有 1 条已知误报） | findings = 1（`generic-password` `./scripts/windows-quickstart/02-development-tools.ps1:500`） |
| 边界回归 12 样本 | 跳过 6/6、命中 6/6，全部符合预期 |
| `chezmoi diff` | 只改 `~/.config/betterleaks/betterleaks.toml` 一个文件，与源文件一致 |
| 模板渲染 / `bash -n` | PASS（该文件无 `{{ }}`，改动不涉及脚本） |

### 9.4 新机首次部署的 `mise trust`

首次部署到**全新机器**时，chezmoi 刚写入的全局 mise 配置需要 `mise trust`（实测两份均已 trust，形如 `home-<user>-<hash>`、`Users-<user>-<hash>`）。已验证：**编辑已受信的配置不需要重新 trust**。

### 9.5 排查备注（网络与 SSH 身份）

- **网络**：早前 push 期间 `~/bin/win-ssh -o BatchMode=yes -T git@github.com` 报 `kex_exchange_identification: Connection closed by remote host`，且 `curl https://github.com` 报 `TLS connect error: ... unexpected eof while reading`。这**不是**端口 22 封锁（`~/.ssh/config` 已正确指向 `ssh.github.com:443`，TCP 可建连），而是出口网络对 GitHub 的间歇性中断——稍后重试即可。
- **SSH 身份**：某次重试网络已恢复（能走到认证阶段），但报 `git@ssh.github.com: Permission denied (publickey).`。诊断结果：Windows `ssh-agent` 服务 `Running`、KeePassXC 进程存在，但 `ssh-add -l` 返回 `The agent has no identities.` ⇒ **KeePassXC 的 SSH Agent 集成未把密钥加载进 Windows OpenSSH agent**（或未启用「SSH Agent 集成」）。属用户环境侧操作，非本次改动引入。参见 [[SSH 密钥管理与配置指南]]。

## 10 相关

- [[gitleaks 密钥扫描]]
- [[chezmoi]]
- [[WSL]]
- [[SSH 密钥管理与配置指南]]
- [[GitHub SSH 22 端口被封改用 443]]
- [[Linux 环境变量]]
- [[uv]]
- [[信息安全]]
