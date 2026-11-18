---
tags: [密钥扫描, gitleaks, 信息安全, CI]
title: Gitleaks 密钥扫描
aliases: Gitleaks 密钥扫描
date created: 2026-09-29 11:18:26
date modified: 2026-11-16 06:31:13
---

# Gitleaks 密钥扫描

> [!abstract] 定位（原理 / 选型附篇）
> gitleaks 是 Go 写的正则 + 熵密钥扫描器，上游已 **feature complete**、只发安全补丁，作者团队重心转向继任者 **Betterleaks**（本机实际部署见姊妹篇 [[Betterleaks 与 chezmoi 跨平台部署]]）。本篇只保留仍有长期参考价值的三块：**检测模型心智模型、已知安全漏洞教训、与同类工具的选型位置**；CLI flag / 完整 `gitleaks.toml` / 安装命令等操作细节已略去（换用 Betterleaks 后基本用不上，需要时查上游 README）。

## 1 背景与适用条件

- **gitleaks**：Go 编写的密钥/凭据扫描器，机制是**关键词预筛 + 正则匹配 + 香农熵阈值 + allowlist**，单文件静态二进制，可离线运行。
- 结论基于 `repo:gitleaks/gitleaks@v8.30.1`（2026-03-21，Go 1.24 工具链）。上游已宣布 **feature complete**，后续只发安全补丁；新能力在继任项目 **Betterleaks**（作者同一批人，含原作者，Aikido 赞助）。
- 一手来源：[gitleaks README](https://github.com/gitleaks/gitleaks/blob/master/README.md)、[作者博客「Regex is (almost) all you need」](https://lookingatcomputer.substack.com/p/regex-is-almost-all-you-need)、[Betterleaks README](https://github.com/betterleaks/betterleaks/blob/main/README.md)。

## 2 一句话结论

gitleaks 已 feature complete，重心迁往 Betterleaks。选型：**存量 CI 继续用 gitleaks**（配置/生态成熟）没问题；**新建项目优先评估 Betterleaks**。

## 3 检测模型（核心心智模型）

官方定位 "Regex is (almost) all you need"。单条规则的匹配链：

```text
关键词预筛 keywords（Aho-Corasick 风格快速字符串比对）
  → 正则 regex 命中
  → secretGroup 抽取候选密钥
  → 香农熵 entropy 阈值过滤（默认规则常见 3.0~4.5）
  → allowlist / gitleaks:allow / .gitleaksignore 过滤
  → finding
```

要点：

- **Golang 正则不支持 lookahead**，写规则别用 `(?!...)`。
- `keywords` 是纯字符串包含；取值必须是正则/标识符里的**独有片段**，写错了规则会**静默不触发**（性能优化的坑）。
- `entropy` 作用对象是 `secretGroup` 抓出的那段，不是整行。
- v8.28.0 复合规则：主规则 + `[[rules.required]]` 辅助规则，可用 `withinLines`/`withinColumns` 做邻近度约束；README 自评 experimental，且 git 模式只看新增行，价值有限。

## 4 抑制误报的四个层级（从粗到细）

1. **规则级 allowlist**：写进 toml，团队共享。
2. **全局 `[[allowlists]]`**：可用 `targetRules` 定向绑定到指定规则。
3. **行内注释**：`api_key = "..." #gitleaks:allow`（`--ignore-gitleaks-allow` 可禁用）。
4. **指纹级 `.gitleaksignore`**：每条 finding 的 `Fingerprint`（`<commit>:<file>:<rule-id>:<line>`）贴进去精确豁免。

**基线（baseline）**：`-r` 生成存量报告，后续 `-b <报告>` 只显示新增问题——适合「老仓库一上来扫出几百条历史泄漏」。但基线豁免＝承认历史泄漏仍在 git 里，**凭据该轮换还是要轮换**。

> [!warning] 安全提醒
> gitleaks **默认把命中值明文打进 stdout / 日志**。输出会落盘或进 CI 日志时，必须显式加 `--redact`，否则等于亲手把密钥写进日志。

## 5 已知安全漏洞 / 踩坑（最重要的一块）

### 5.1 CVE-2026-63728：报告模板经 Sprig 外带密钥

- 影响 **< 8.30.1**（即 ≤ v8.30.0），**修复 v8.30.1**；CWE-1336。
- 机制：`--report-format=template` 走 Go `text/template` + Masterminds/sprig，而 sprig 有**非密闭函数** `env` / `expandenv` / `getHostByName`。攻击者只要能影响报告模板，就能**读取宿主任意环境变量**并经 DNS 查询把凭据外带——**包括本次扫描发现的那批密钥**。
- 评分：CVSS v4.0 = 8.1 HIGH；v3.1 = 6.3 MEDIUM。补丁提交 `83d9cd68…`（v8.30.1）。
- 缓解：**升级 ≥ v8.30.1**；无法升级时，绝不对「模板来源不可信」的场景用 `--report-template`——模板通常就在被扫仓库里，所以**扫外部 PR 正是高危场景**。
- 一手：[CIRCL CVE-2026-63728](https://vulnerability.circl.lu/api/vulnerability/CVE-2026-63728)、[VulnCheck 公告](https://www.vulncheck.com/advisories/gitleaks-secret-exfiltration-via-non-hermetic-sprig-template-functions-in-report-template-feature)。

### 5.2 二进制自身依赖链反复被报 CVE

Go 标准库与 `golang.org/x/crypto` 是重灾区，多次由社区 PR 修（#2272 / #2103 / #1868 / #1768 / #1342）。**在 CI 里把 gitleaks 二进制塞进容器镜像会触发镜像扫描告警**，需要在准入策略里豁免或跟进升级。

- 例：v8.30.1 Linux 二进制被 Trivy 报 stdlib CVE-2025-68121（构建用 Go 1.24.11）。
- 例：`x/crypto` 钉在 v0.35.0 → 9 条 advisory（7 条 critical），修复需 ≥ v0.52.0（要求 go ≥ 1.25）。

### 5.3 其他踩坑

- `GITLEAKS_CONFIG_TOML` 传内容会进 CI 日志 / 进程环境，本质仍是明文密钥面。
- `git` 模式基于 `git log -p`，**只匹配新增行**：「删掉密钥」不会让 finding 消失，历史提交照样命中。
- 解码与归档扫描**默认关闭**，不加 `--max-decode-depth` / `--max-archive-depth` 就扫不到 base64 编码的密钥与 zip 内的 `.env`。

## 6 与同类工具的位置

| 工具 | 机制 | 适用 |
| --- | --- | --- |
| **gitleaks** `@v8.30.1` | 正则 + 熵 + allowlist，单 Go 二进制 | 快、离线、CI 友好；**已 feature complete** |
| **Betterleaks** | Expr 过滤器 + 异步 HTTP **有效性校验** + BPE token 稀有度过滤 + 多源 | 继任者；误报治理与「这个密钥还活着吗」是卖点 |
| **TruffleHog** | 700+ 内置校验器，验证优先 | 需要对告警做存活验证；默认打外网 |
| **detect-secrets**（Yelp） | 插件式 + 熵，需显式构建 baseline | Python 生态、pre-commit 常见 |

选型关键判断：**是否需要「验证密钥是否仍然有效」**——这决定要不要引入带网络出站的扫描器。

## 7 与 Betterleaks 的关系

Betterleaks 是 gitleaks 作者团队的继任者，机制不同（Expr + HTTP 存活校验 + BPE）。**本机现在用的是 Betterleaks**——跨平台部署、版本解析、prefilter 性能、配置接缝都在姊妹篇 [[Betterleaks 与 chezmoi 跨平台部署]]；本篇只作原理与安全面的背景参考。两者的 `extend` / `filter` / `prefilter` 配置语义一脉相承，看 Betterleaks 配置前先懂 gitleaks 的检测链更顺。

## 8 相关

- [[Betterleaks 与 chezmoi 跨平台部署]]
- [[DSH 第三方插件安全审计]]
- [[信息安全]]
- [[Git]]
- [[chezmoi]]
