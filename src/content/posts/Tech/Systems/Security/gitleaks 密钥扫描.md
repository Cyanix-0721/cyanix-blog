---
tags: [密钥扫描, gitleaks, 信息安全, CI]
title: gitleaks 密钥扫描
aliases: [gitleaks]
date created: 2026-09-29 11:18:26
date modified: 2026-10-14 23:39:00
---

# gitleaks 密钥扫描

> [!abstract] 适用场景
> 这篇梳理 gitleaks（Go 写的正则 + 熵密钥扫描器）的检测模型、CLI、配置与抑制误报的层级，并给出选型判断与已知 CVE。适合需要在本地或 CI 里给仓库、配置目录、会话目录加一道密钥门禁的人，读完能写出可用的 `gitleaks.toml` 并避开 `--report-template` 的已知风险。

## 1 背景与适用条件

- **gitleaks** 是一个用 Go 编写的密钥/凭据扫描器，核心机制是**关键词预筛 + 正则匹配 + 香农熵阈值 + allowlist**，产出单文件二进制，可离线运行。
- 官方资料：[gitleaks README](https://github.com/gitleaks/gitleaks/blob/master/README.md)、[gitleaks-action](https://github.com/gitleaks/gitleaks-action)、[作者博客「Regex is (almost) all you need」](https://lookingatcomputer.substack.com/p/regex-is-almost-all-you-need)。
- **版本敏感**：本文所有结论基于 `repo:gitleaks/gitleaks@v8.30.1`（2026-03-21 发布，Go 1.24 工具链构建）。gitleaks 上游已宣布 **feature complete**，后续只发安全补丁；更新版本或继任项目可能改变行为。
- **前置条件**：无特殊权限要求；`git` 模式需要一个 git 仓库，`dir` 模式只需文件系统读权限。二进制为静态编译，无需安装语言运行时。
- **适用**：本地预检、pre-commit、CI 门禁、扫描 dotfiles / 配置目录 / 会话日志目录。
- **不适用 / 需注意**：
  - **不做密钥有效性校验**——它只判断「像不像密钥」，不判断「这个密钥还活着吗」；需要存活验证要选带网络出站的工具（见 §10）。
  - **解码与归档扫描默认关闭**，不显式加 flag 就扫不到 base64 编码的密钥与归档内的 `.env`。
  - **`git` 模式只看新增行**，历史里已提交的泄漏不会因为后续删除而消失。
- **安全提醒**：gitleaks 默认会把命中的密钥值打进 stdout / 日志。若输出会落盘或进 CI 日志，**必须显式加 `--redact`**；否则等于亲手把密钥写进日志。

## 2 一句话结论

gitleaks 是 Go 写的正则 + 熵密钥扫描器（`repo:gitleaks/gitleaks@v8.30.1`），**上游已宣布 feature complete，后续只发安全补丁**，作者把重心迁到继任项目 Betterleaks（`repo:betterleaks/betterleaks`）。新项目选型时：

- **存量 CI 继续用 gitleaks**（配置/生态成熟）没问题；
- **新建项目应优先评估 Betterleaks**。

一手来源：

- feature-complete 声明 + 迁移指向（原文 WARNING 块）：[gitleaks README](https://github.com/gitleaks/gitleaks/blob/master/README.md)
- [Betterleaks README](https://github.com/betterleaks/betterleaks/blob/main/README.md)（作者与 Gitleaks 同一批人，含原作者；Aikido 赞助）
- 媒体报道（HN 讨论汇总）：[rdintel](https://rdintel.com/news/item/hn/47353454)、[Help Net Security](https://www.helpnetsecurity.com/2026/03/19/betterleaks-open-source-secrets-scanner/)

## 3 版本与时间线

数据来自 `releases.atom`（非训练数据）：

| 版本 | 日期 | 关键内容 |
| --- | --- | --- |
| v8.30.1 | 2026-03-21 | 仅 goreleaser / 报告模板清理，Go 1.24 构建 |
| v8.30.0 | 2025-11-26 | Looker / Airtable PAT 规则；递归解码文档 |
| v8.29.x | 2025-11 | 配置 min version、timeout 上下文、Amazon Bedrock key 规则 |
| v8.28.0 | 2025-07-20 | **复合规则（composite rules）**、Anthropic key 规则、allowlist 性能优化 |
| v8.27.0 | 2025-06-01 | **归档扫描 `--max-archive-depth`**、unicode 解码、diagnostics |
| v8.26.0 | 2025-05-12 | **解码器**（hex / percent / base64）、1Password 规则 |
| v8.25.0 | 2025-04 | `[allowlist]` → `[[allowlists]]` + `targetRules` |
| v8.24.2 | — | README 里 pre-commit 示例钉的版本 |

来源：[gitleaks releases.atom](https://github.com/gitleaks/gitleaks/releases.atom)。
（注：GitHub REST API 无 token 时 403 rate limit，用 `releases.atom` 更稳。）

## 4 检测模型（核心心智模型）

README 官方定位是 "Regex is (almost) all you need"（见 [作者博客](https://lookingatcomputer.substack.com/p/regex-is-almost-all-you-need)）。

单条规则（rule）的匹配链：

```text
关键词预筛(keywords, Aho-Corasick 风格快速字符串比对)
  → 正则 regex 命中
  → secretGroup 抽取候选密钥
  → 香农熵 entropy 阈值过滤（默认规则里常见 3.0~4.5）
  → allowlist / gitleaks:allow / .gitleaksignore 过滤
  → finding
```

要点：

- **Golang 正则引擎，不支持 lookahead**（README 原文注明）。写规则时别用 `(?!...)`。
- `keywords` 是纯字符串包含检查，理想取值应出现在标识符或规则正则里的独有片段；写错了会导致规则**静默不触发**（性能优化换来的坑）。
- `entropy` 作用对象是 `secretGroup` 抓出来的那段，不是整行匹配。
- v8.28.0 的复合规则：主规则 + `[[rules.required]]` 辅助规则，可用 `withinLines` / `withinColumns` 做邻近度约束（都为空 = 同一 fragment 内任意位置即可）。README 自评「experimental」，且提醒 git 扫描只看新增行，复合规则在 git 场景价值有限。见 [README](https://github.com/gitleaks/gitleaks/blob/master/README.md)。

## 5 CLI 速查

三个扫描模式：`git` / `dir`（别名 `files`、`directory`）/ `stdin`。

```bash
gitleaks git  -v                          # 扫当前 git 仓库（git log -p，含历史）
gitleaks git  --log-opts="--all A..B" .   # 限定提交范围
gitleaks git  --log-opts="--since=2026-01-01" .
gitleaks dir  -v path/                    # 工作树扫描（不看历史）
cat f | gitleaks stdin -v
```

关键 flag：

| flag | 作用 / 默认 |
| --- | --- |
| `-c, --config` | 配置路径（优先级见 §6） |
| `-b, --baseline-path` | 基线，抑制历史存量告警 |
| `-r, --report-path` / `-f, --report-format` | 报告；格式 `json/csv/junit/sarif/template` |
| `--report-template` | Go `text/template` + sprig，自定义格式 |
| `--max-decode-depth` | 递归解码（percent/hex/base64），**默认 0 = 关闭** |
| `--max-archive-depth` | 归档内扫描（zip/tar…，mholt/archives 支持的格式），**默认 0 = 关闭** |
| `--max-target-megabytes` | 跳过大文件 |
| `--redact[=pct]` | 日志 / stdout 脱敏，`--redact=20` 只遮 20% |
| `--exit-code` | 命中时退出码，默认 1 |
| `--enable-rule` | 只启用指定 rule id |
| `--ignore-gitleaks-allow` | 忽略代码里的 `gitleaks:allow` 注释 |
| `-i, --gitleaks-ignore-path` | `.gitleaksignore` 位置，默认 `.` |
| `--timeout` | 秒，默认 0（不限） |
| `--diagnostics` | `http` 或 `cpu,mem,trace`；`http` 模式会拉起 `net/http/pprof`，历史上因此被报 stdlib CVE-2025-22871（见 §9） |

退出码：`0` 无泄漏 · `1` 有泄漏或出错 · `126` 未知 flag。
v8.19.0 起 `detect` / `protect` 已废弃（仍可用但隐藏）。
命令对照 gist：[zricethezav/b325bb9](https://gist.github.com/zricethezav/b325bb93ebf41b9c0b0507acf12810d2)。

## 6 配置：`gitleaks.toml`

配置加载优先级（README 明文）：

1. `--config` / `-c`
2. `GITLEAKS_CONFIG`（文件路径）
3. `GITLEAKS_CONFIG_TOML`（**文件内容**，适合 CI 注入）
4. `<target>/.gitleaks.toml`
5. 都无 → 用编译进二进制的默认配置

两种写法二选一：

- **自研**：不写 `[extend]`，默认规则全部不生效（必须自己覆盖全部想扫的类型）。
- **扩展**：`[extend] useDefault = true`，或 `path = "common.toml"`；可 `disabledRules = ["generic-api-key"]`；扩展链最多 2 层；allowlist 数组是**追加**，可重复。

```toml
[extend]
useDefault = true
disabledRules = ["generic-api-key"]

[[rules]]
id = "awesome-rule-1"
description = "awesome rule 1"
regex = '''one-go-style-regex-for-this-rule'''   # 不支持 lookahead
secretGroup = 3
entropy = 3.5
path = '''a-file-path-regex'''                    # 可与 regex 并用/单独用
keywords = ["auth", "password", "token"]
tags = ["tag"]

  [[rules.allowlists]]
  condition = "OR"                # 默认 OR；多条件 AND 需显式
  commits = ["commit-A"]
  paths = ['''go\.mod''', '''go\.sum''']
  stopwords = ['''client''', '''endpoint''']   # 作用于抽取出的 secret
  # regexTarget: "secret"(默认) | "match" | "line"

[[allowlists]]                    # 全局，优先级高于规则级；v8.25.0 起复数
targetRules = ["awesome-rule-1"]  # v8.25.0 新增：把公共 allowlist 绑定到指定规则
paths = ['''gitleaks\.toml''']
regexes = ['''219-09-9999''']
```

版本相关：

- v8.21.0 起 `[rules.allowlist]` 改为 `[[rules.allowlists]]`（旧写法仍向后兼容）；
- v8.25.0 起顶层 `[allowlist]` 改为 `[[allowlists]]`；
- 配置语义若与版本不匹配会报错（v8.29.0 加了 min version 校验）。

## 7 抑制误报的四个层级（从粗到细）

1. **规则级 allowlist**：最优先，写进 toml，团队共享。
2. **全局 allowlist**：`[[allowlists]]`，或 `targetRules` 定向绑定。
3. **行内注释**：`api_key = "..." #gitleaks:allow`（加 `--ignore-gitleaks-allow` 可禁用）。
4. **指纹级 `.gitleaksignore`**：report 里每条 finding 带 `Fingerprint`，形如 `<commit>:<file>:<rule-id>:<line>`，把它贴进 `.gitleaksignore` 即可精确豁免。README 标注此特性 experimental。示例文件：[.gitleaksignore](https://github.com/gitleaks/gitleaks/blob/master/.gitleaksignore)。

**基线（baseline）**：先用 `gitleaks git -r gitleaks-report.json` 生成存量报告，后续 `gitleaks git -b gitleaks-report.json -r findings.json`，输出只剩新增问题。适合「老仓库一次扫出 800 条历史泄漏」的场景——**但注意**：基线豁免等于承认历史泄漏仍在 git 历史里，凭据该轮换还是要轮换。

## 8 集成路径

- **pre-commit**（`.pre-commit-config.yaml`，README 钉的 rev 是 `v8.24.2`）：
  ```yaml
  repos:
    - repo: https://github.com/gitleaks/gitleaks
      rev: v8.30.1          # 用最新，别照抄 README 的旧 rev
      hooks:
        - id: gitleaks      # Docker 版本用 gitleaks-docker
  ```
  `SKIP=gitleaks git commit -m ...` 可临时跳过。
- **原生 git hook**：仓库提供 `pre-commit.py` 示例，拷到 `.git/hooks/`。
- **GitHub Action**：[gitleaks-action](https://github.com/gitleaks/gitleaks-action)。
- **Docker**：`zricethezav/gitleaks:latest` 或 `ghcr.io/gitleaks/gitleaks:latest`（扫宿主目录需 `-v $PWD:/path`，工作目录在容器内）。
- **构建**：`go` + `make build`（v8.30.1 用 Go 1.24 工具链）。

## 9 已知安全漏洞 / 踩坑

### 9.1 CVE-2026-63728：报告模板经 sprig 外带密钥

- 标题：*Gitleaks Secret Exfiltration via Non-Hermetic Sprig Template Functions in Report Template Feature*
- 影响：`repo:gitleaks/gitleaks` **< 8.30.1**（即 ≤ v8.30.0）；**修复版本 v8.30.1**
- 类型：CWE-1336 模板引擎特殊元素未中和
- 机制：gitleaks 的 `--report-format=template` 走 Go `text/template` **+ Masterminds/sprig**，而 sprig 里有**非密闭（non-hermetic）**函数：`env`、`expandenv`、`getHostByName`。攻击者只要能提供 / 影响报告模板，就能**读取宿主进程任意环境变量**，并通过 DNS 查询把凭据、token、API key **外带出去**——包括 gitleaks 本次扫描自己发现的那批密钥。
- 评分：CVSS v4.0 = 8.1 HIGH（`AV:L/AC:L/PR:N/UI:A`，C:H/SC:H）；CVSS v3.1 = 6.3 MEDIUM。CISA ADP 标记 `Exploitation: poc`。
- 补丁提交：`83d9cd684c87d95d656c1458ef04895a7f1cbd8e`（即 v8.30.1 的 "update goreleaser" 那次）
- 一手记录：[CIRCL CVE-2026-63728](https://vulnerability.circl.lu/api/vulnerability/CVE-2026-63728)；发现者 Fatih Çelik 的[利用细节与修复说明](https://fatihhcelik.github.io/posts/gitleaks-abusing-sprig-for-exfiltration/#the-fix)；[VulnCheck 公告](https://www.vulncheck.com/advisories/gitleaks-secret-exfiltration-via-non-hermetic-sprig-template-functions-in-report-template-feature)
- 缓解：**升级到 ≥ v8.30.1**；无法升级时，绝不对「模板来源不可信」的场景使用 `--report-template`（模板通常来自仓库本身 → 扫一个恶意仓库即可触发）。注意这与扫描目标是否恶意无关：`--report-template` 指向的文件就在被扫仓库里，所以「CI 里扫描外部 PR」正是高危场景。

### 9.2 二进制自身依赖链反复被报 CVE

Go 标准库与 `golang.org/x/crypto` 是重灾区，多次由社区 PR 修（`repo:gitleaks/gitleaks` PR #2272、#2103、#1868、#1768、#1342）。

影响：**在 CI 里把 gitleaks 二进制塞进容器镜像，会触发镜像扫描告警**，需要在准入策略里豁免或跟进升级。

- 例：v8.30.1 的 Linux 二进制被 Trivy 报 stdlib CVE-2025-68121（构建用 Go 1.24.11）。[PR #2103](https://github.com/gitleaks/gitleaks/pull/2103)
- 例：`golang.org/x/crypto` 钉在 v0.35.0 → 9 条 advisory（7 条 critical），修复需 ≥ v0.52.0（要求 go ≥ 1.25）。[PR #2272](https://github.com/gitleaks/gitleaks/pull/2272)

### 9.3 其他踩坑

- **`GITLEAKS_CONFIG_TOML` 传内容时注意**：值会进 CI 日志 / 进程环境，本质仍是明文密钥面。
- **扫描只看 git 增量**：`git` 模式基于 `git log -p`，**只匹配新增行**（README 明说），所以「删掉了密钥」不会让 finding 消失——历史里的提交照样命中。
- **解码与归档默认关闭**：不显式加 `--max-decode-depth` / `--max-archive-depth` 就扫不到 base64 编码的密钥和 zip 内的 `.env`。

## 10 与同类工具的位置

| 工具 | 机制 | 适用 |
| --- | --- | --- |
| **gitleaks** `@v8.30.1` | 正则 + 熵 + allowlist，单 Go 二进制 | 快、离线、CI 友好；**已 feature complete** |
| **Betterleaks** | Expr 过滤器 + 异步 HTTP **有效性校验** + BPE token 稀有度过滤 + 多源（GitHub/GitLab/HF/S3/R2） | 继任者；误报治理和「这个密钥还活着吗」是核心卖点 |
| **TruffleHog** | 700+ 内置校验器，验证优先 | 需要对告警做「存活验证」时；默认会打外网 |
| **detect-secrets**（Yelp） | 插件式 + 熵，需显式构建 baseline | Python 生态、pre-commit 常见 |

对比来源（二手，仅作线索）：[safeguard.sh 工具对比](https://safeguard.sh/resources/blog/best-secrets-detection-tools-compared-2026)。

选型关键判断：**是否需要「验证密钥是否仍然有效」**——这决定了要不要引入带网络出站的扫描器。

## 11 本机实测环境与数值

> [!warning] 单机单次结果
> 以下为一次实测环境中的观察，仅说明「工具是否可用」与用法取向，不构成通用基准。

### 11.1 实测环境

| 项 | 值 |
| --- | --- |
| 扫描器版本 | gitleaks `v8.30.1`（未在本机安装，结论来自上游 README / release feed / CVE 库 / PR 的一手核对） |
| 被检目录 | `<repo-root>`（非 git 仓库） |
| 会话日志目录 | `~/.dsh/sessions/<workspace>/session-<id>/session.v3.jsonl.zstd` |

### 11.2 实测观察

- `command -v gitleaks` **无输出** —— 该 WSL 环境未安装 gitleaks。
- `<repo-root>` **不是 git 仓库**（`git rev-parse` 报 `fatal: not a git repository`），所以 `gitleaks git` 在此目录无从下手，只能 `gitleaks dir`。
- 同一环境下已记录过一起真实事故：Firecrawl API key 明文写在 `cordis.patch.yml` 且**已泄漏进会话转录**（详见 [[DSH 第三方插件安全审计]]），与「密钥进入工具输出即视为已失陷」的纪律同源。
  → 因此 gitleaks 在此类环境最有价值的用法不是扫业务代码，而是**给 `~/.dsh` 这类配置 / 会话目录做 `dir` 扫描**，以及给 chezmoi dotfiles 仓库加 pre-commit 钩子。

### 11.3 安装与首次扫描（命令供参考）

安装（官方二进制，推荐，不引入语言运行时）：

```bash
ver=8.30.1   # 上线前先查 https://github.com/gitleaks/gitleaks/releases 是否有更新
curl -sSL "https://github.com/gitleaks/gitleaks/releases/download/v${ver}/gitleaks_${ver}_linux_x64.tar.gz" \
  | tar -xz -C ~/.local/bin gitleaks && gitleaks version

# 或 Docker（免安装）
docker run --rm -v "$PWD:/p" ghcr.io/gitleaks/gitleaks:latest dir /p -v
```

首次扫描建议（注意工具输出会进会话日志，用 `-r` 落文件而非回显 stdout，并加 `--redact`）：

```bash
gitleaks dir ~/.dsh --redact -r /tmp/gitleaks-dsh.json -f json -v
gitleaks dir ~ --redact -r /tmp/gitleaks-home.json -f json \
  --max-archive-depth 2 --max-decode-depth 2
```

## 12 相关

- [[Betterleaks 与 chezmoi 跨平台部署]]
- [[DSH 第三方插件安全审计]]
- [[信息安全]]
- [[Git]]
- [[chezmoi]]
