---
tags: [DSH, cc-safety-net, 安全, 命令拦截, 插件]
title: cc-safety-net 命令安全网
aliases: [cc-safety-net]
date created: 2026-10-11 19:41:12
date modified: 2026-10-14 23:39:00
---

# cc-safety-net 命令安全网

> [!abstract] 适用场景
> 在 DSH（DeepSeek Harness）里安装并配置 cc-safety-net —— 一个在命令执行前拦截
> 破坏性操作与凭据读取的安全闸门插件。适用于想给 agent 加一层命令护栏、
> 或已经装了却发现「DSH 自家凭据没被保护」的读者。
> 读完能知道怎么装、必须自补哪些 `deny_paths`、以及哪些坑不能踩。

## 1 背景与适用条件

- **cc-safety-net** 是一个面向 coding CLI 的命令安全网：在 shell 命令真正执行前分析命令文本，
  按规则拦截破坏性命令（`git push --force`、危险 `rm -rf` 等）与凭据读取，
  并写审计日志。上游仓库 <https://github.com/kenryu42/cc-safety-net>，
  官网 <https://ccsafetynet.com>。
- **DSH** 侧它以 profile 插件 bundle 的形式**进程内**挂载（不是 hook 子进程），
  通过 DSH 的 `tools.guard` 接缝介入。
- 本文结论基于 `cc-safety-net@2.6.8` 与 DSH `0.2.1-alpha.2`。
  **版本敏感**：内置规则条数（本文为 138 条）、`secret.cli.*` 覆盖的 CLI 名单
  （本文为 13 家）都随版本变化，升级后请以官方密钥保护文档为准：
  https://ccsafetynet.com/docs/reference/secret-protection.md
  （该站每页加 `.md` 后缀可取纯文本，比抓 HTML 干净）。
- 前置条件：DSH 提供 `tools.guard` 接缝（本文实测的 `0.2.1-alpha.2` 有）；
  安装插件需要 pnpm / Node；**修改策略文件需要真人操作**（见 §7）。
- **适用范围**：给 DSH 加命令级安全护栏、理解其规则模型与盲区。
  **不适用**：把它当沙箱用 —— 它**不是沙箱**（见 §10）。

## 2 结论摘要

1. **它官方支持 DSH，且是一等公民插件**：以 profile 插件 bundle 进程内挂载（非 hook 子进程），
   入口自包含、**零运行时依赖、零生命周期脚本** ⇒ 不需要 `allowBuilds`。
2. **DSH 插件市场搜不到它**，但**不是它的问题** —— 市场查的是自己的精选目录，
   它没被收录；npm 上一搜就有。
3. ⚠️ **默认不保护 DSH 自家凭据**：`secret.cli.*` 13 家里**没有 deepseek-harness**，
   `~/.dsh/.credentials.yaml`、`~/.dsh/jet-hub/state.json`、
   `~/.dsh/openai-gateway/api-key` 默认全部 ALLOWED ⇒ 必须自补 `deny_paths`。
4. ⚠️ **`~/.cc-safety-net/policy.json` 是防篡改路径，agent 改不了** ——
   装完的策略编辑必须由人来做（GUI / 编辑器 / `policy apply`）。
5. `.env` 等通用凭据**内置覆盖、无需配置**；`deny_paths` 只用来补工具「不认识」的路径。
6. `dsh plugin add` 与官方 `npx cc-safety-net install --deepseek-harness` **结果等价**，
   唯一差异是 dep spec（`^x.y.z` vs 精确 `x.y.z`）。
7. 装完**宿主侧立即生效**（安装前启动的进程，装完 guard 立刻拦命令，无需重启）。

## 3 安装

两条路等价，推荐 `dsh plugin`（统一由 dsh 管理依赖）：

```sh
  # A. 纯 dsh 方式（推荐）
  dsh plugin --profile web add cc-safety-net

  # B. 官方 installer（会自己调 dsh plugin，并为绕开 pnpm minimumReleaseAge 而精确钉版）
  npx -y cc-safety-net@latest install --deepseek-harness
```

**两者差异**：B 会写 `"cc-safety-net": "2.6.8"`（精确），
A 走 pnpm 默认 `save-prefix` 写 `"^2.6.8"`。
`pnpm config get save-prefix` 为 `undefined` 时即默认 `^`。
要可复现就用 A + 精确版本：`dsh plugin --profile web add cc-safety-net@2.6.8`。

### 3.1 为什么不需要 allowBuilds

git 托管包（如 CodeArts 认证插件）要在安装时跑 `prepare`，会被 pnpm 拦下、
须手写带 `#<commit>` 的 `allowBuilds` 键。
**cc-safety-net 不需要**：它是 npm 预构建包，`prepare` / `postinstall` / `install`
**三个生命周期脚本全无**，`dist/` 在发布时就打好了（`files: ["dist"]`）。

### 3.2 安装后验证

| 检查项 | 命令 / 位置 | 期望结果 |
| --- | --- | --- |
| 依赖 | `package.json` → `dependencies` | `^2.6.8`（或精确版） |
| bundle 行 | `dsh.profile.bundles` | 自动加入（`reconcile()`） |
| profile 树 | `dsh --profile web --dump-config` | `- id: cc-safety-net` → `file://…/dist/deepseek-harness/index.js` |
| 宿主入口 | `dist/deepseek-harness/index.js` | 自包含，`{name:"cc-safety-net", inject:["tools"], apply}` |
| guard API | `@deepseek-ai/dsh-tools/lib/types/index.d.ts:515-525`、`:646-652` | 实测所用 dsh 确有 `tools.guard`（deny-only 单调闸门，跑在 `tools/pre-execute` waterfall 之后） |
| doctor | `npx -y cc-safety-net@latest doctor` | **Detected / Configured / Verified**，自检 `3/3 passed` |
| status | `cc-safety-net status` | verdict `ready` |
| 网关 / 端口 | — | 本插件**不监听端口**，无冲突 |

### 3.3 「进程内立即生效」的口径

安装完成于某时刻，而所在 `dsh web` 进程启动于更早 —— 但装完 guard **立刻**拦下了
`git push --force`（审计日志时间戳早于 `policy.json` 创建时间）。
⇒ **宿主侧无需重启**（与 CodeArts 认证插件同机制：`"patchReload": "live"`）。
⚠️ 但**客户端 UI 需刷新浏览器**；且**已加载模块的代码更新**能否热替换未确证
（见 [[DSH CodeArts 认证插件安装]] 的升级章节）。

## 4 为什么市场搜不到

DSH 市场**不查 npm registry**，查自己的精选目录。两条取数路径
（`dshmarket/lib/regions.js:80,105`）：

| 路径 | 实测 |
| --- | --- |
| `https://awesome-dsh-plugin.com/plugins.json`（`CATALOG_OFFICIAL`，`regions.js:63`） | 4489 条 |
| npm 包 `dsh-plugin-catalog`（国内镜像走这条） | 同样 4489 条 |
| 搜 `cc-safety` / `kenryu` | **0 命中** |
| 搜 `safety-net` | 2 命中，均他人同名项目（`JohnXu22786/safety-net`、`PlutoKeating/dsh-lark-bot`） |

⇒ **纯粹没被收进那份社区目录**（该目录条目以 `owner` / `url` 指向 github.com 为主）。
npm 侧正常可见：`curl "https://registry.npmjs.org/-/v1/search?text=cc-safety-net"`。
另有一份目录 <https://deepseek-harness-plugin.com/zh-CN/plugins/cc-safety-net/>
收录了它（但分类误标为「界面增强」，实为安全类）。

## 5 核心缺口：DSH 自家凭据不在默认保护名单

`secret.cli.*`（coding CLI 凭据层，默认开）全量 13 家：

```text
amp  antigravity  claude-code  codex  copilot-cli  cursor  devin
droid  gemini  grok-build  kimi-code  opencode  pi
```

**没有 `secret.cli.deepseek-harness`**；官方文档搜 `.dsh` / `deepseek` 均 0 命中。
实测确认以下路径**默认全部 ALLOWED**：

```sh
$ cc-safety-net explain "cat ~/.dsh/.credentials.yaml"      → ✓ Allowed (no matching rules)
$ cc-safety-net explain "cat ~/.dsh/jet-hub/state.json"     → ✓ Allowed (no matching rules)
$ cc-safety-net explain "cat ~/.dsh/openai-gateway/api-key" → ✓ Allowed
```

### 5.1 补法：`deny_paths`

```json
{
  "version": 1,
  "secret_protection": {
    "deny_paths": [
      "~/.dsh/.credentials.yaml",
      "~/.dsh/jet-hub",
      "~/.dsh/openai-gateway"
    ]
  }
}
```

⚠️ **必须是这 3 条「最小必要集」，不要图省事写整个 `~/.dsh`**。实测发现一条关键行为：

```sh
$ cc-safety-net explain "cd ~/.ssh && ls"   → BLOCKED
$ cc-safety-net explain "ls -la ~/.ssh"     → ALLOWED
```

即 **`cd` 进受保护目录本身就算命中**。把整个 `~/.dsh` 加进去，
`cd ~/.dsh/profiles/web && dsh plugin …` 这类正常运维操作会被拦死。逐条验证过不误伤：

| 路径 | 加策略前 | 加策略后 |
| --- | --- | --- |
| `~/.dsh/.credentials.yaml` | ALLOWED | **BLOCKED** |
| `~/.dsh/jet-hub/state.json` | ALLOWED | **BLOCKED** |
| `~/.dsh/openai-gateway/api-key` | ALLOWED | **BLOCKED** |
| `~/.dsh/AGENTS.md` | ALLOWED | ALLOWED ✓ |
| `~/.dsh/profiles/web/package.json` | ALLOWED | ALLOWED ✓ |
| `cd ~/.dsh/profiles/web && dsh plugin …` | ALLOWED | ALLOWED ✓ |

**排除掉的候选**（查过之后放弃，避免过度拦截）：

- `~/.dsh/llm-deepseek/` —— 只是附件元数据（字段 `scope` / `attachmentId` / `bytes` / `expiresAt`），无凭据
- `~/.dsh/sessions/` —— 会话日志，加进去会拦住大量正常读取

### 5.2 为什么这些必须手写：内置规则的匹配维度

| 机制 | 匹配方式 | 覆盖范围 | 要配置吗 |
| --- | --- | --- | --- |
| 内置 basename 规则 | 按**文件名** | **任意目录**下该文件名 | 否 |
| 内置 home 规则 | 按**路径** | `~/.ssh`、`~/.aws` 等固定目录 | 否 |
| `deny_paths` | 按**你给的路径** | 只覆盖内置清单**不认识**的东西 | **是** |

`.credentials.yaml` 落在所有内置规则的缝里：

- `secret.basename.credentials` 只匹配**精确** `credentials`
- `.yaml` 不在受保护扩展名列表里
- 变体规则的后缀是 `.bak` / `.backup` / `.copy` / `.disabled` / `.key` / `.old` / `.orig` /
  `.pem` / `.save` / `.tmp` —— **没有 `.yaml`**

## 6 `.env` 等通用凭据：内置覆盖，不用写

实测（**不要**把这些加进 `deny_paths`）：

| 测试 | 结果 |
| --- | --- |
| `cat ~/.dsh/.env` | **BLOCKED** · `secret.basename.env` |
| `cat <repo-root>/.env`（任意目录） | **BLOCKED** |
| `cat /tmp/.env.local`（变体） | **BLOCKED** |
| `cat /tmp/.env.example`（模板） | ALLOWED（豁免） |

内置规则开箱即用：

- **9 个精确 basename**（任意目录）：`.env`、`.npmrc`、`.pypirc`、`.netrc`、
  `.git-credentials`、`id_rsa`、`id_ed25519`、`id_ecdsa`、`credentials`
- **`.env.*` 变体**：`secret.pattern.env-variant` 拦所有 `.env.` 开头的名字
- **home 目录**：`~/.ssh`、`~/.aws`、`~/.gcp`、`~/.config/gcloud`、`~/.kube/config`、
  `~/.docker/config.json`、`~/.config/gh/hosts.yml`
- **受保护扩展名**：`.pem`、`.key`、`.p12`、`.pfx`、`.kdbx` 等
- **13 家 coding CLI 凭据**（见 §5）

**豁免**（给人看的模板，放行）：`.env.example`、`.env.sample`、`.env.template`、
`.env.tpl`、`.env.defaults`，以及 `.env.example.*` / `.env.sample.*`。
⚠️ 前缀豁免**不往下延伸**：`.env.example.local` 放行，但 `.env.template.local` 会被拦。

## 7 `policy.json` 是防篡改路径 —— agent 改不了，只能人改

实测（尝试备份 / 写它，两次都被拦）：

```text
Reason: This path contains the protected policy config and you must not modify or delete it.
Rule: guard.policy-config
```

设计如此：user 与 project 两处 `policy.json` 在**任何运行状态**下都是保护路径，
且该检查**跑在策略快照加载之前** —— 坏配置也无法削弱它。硬停的操作：

- 任何工具的写 / 编辑 / patch
- shell 命令把它当操作数
- 重定向写入
- 递归 `rm` 其目录或任何祖先
- `find … -delete` / `find … -exec rm`
- `mv` 以其文件 / 目录 / 祖先为源

**读取仍允许**（只读白名单：`[` `cat` `file` `grep` `head` `jq` `less` `ls` `more` `rg`
`sed` `stat` `tail` `test` `wc`；`sed` 仅在不带 `-i` / `--in-place` 时算只读）。
Grep / Glob 这类只读工具完全豁免。

⇒ **改策略的三条路**（都须人来做）：

```sh
  # A. 图形面板（推荐，自动写对权限 0600）
  npx -y cc-safety-net@latest gui          # 只绑 127.0.0.1

  # B. 手工编辑 + 校验
  $EDITOR ~/.cc-safety-net/policy.json
  npx -y cc-safety-net@latest status       # verdict 应为 ready

  # C. 提案 + 交互确认（需终端里按 y，非交互会 exit 1）
  npx -y cc-safety-net@latest policy check <提案>.json --global
  npx -y cc-safety-net@latest policy apply <提案>.json --global
```

⚠️ **`policy apply` 会整份重写文件**（补全所有默认字段）。手写精简配置后用它，
必须把**完整意图**放进提案，否则可能被默认值覆盖。手工编辑无此问题。
✅ **改完不用重启** —— 运行时**每次工具调用都重读**该文件。

## 8 配置文件全貌

| 文件 | 作用 | 实测状态 |
| --- | --- | --- |
| `~/.cc-safety-net/policy.json` | 档位、开关、`deny_paths` / `allow_paths`、审计保留 | ✅ 有 |
| `~/.cc-safety-net/rule.json` | 自定义规则 + `transparent_wrappers` | ❌ 无（不需要） |
| `<项目>/.cc-safety-net/policy.json` | 项目级策略（随仓库分发，sparse，叠在 user 之上） | ❌ 无（不需要） |
| 环境变量（`CC_SAFETY_NET_LEVEL` 等 10 个） | 只能**抬高**档位、强制打开能力，**不能反向降低** | 全未设置 |

路径要点：**带点**（`~/.cc-safety-net/`）。设 `CC_SAFETY_NET_HOME` 可改 user 文件位置
（文件直接放该目录下）。

## 9 操作坑：命令文本里出现 `.env` 字面量会被拦

这个坑值得单独记 —— 实测踩过**两次**：

```sh
$ for f in .env .env.local ...; do ...; done      # ← 整条命令被拦
Reason: Access to a sensitive path is not allowed.
Rule: secret.basename.env
Segment: .env
```

```sh
$ find . -maxdepth 2 -type f -name "*.json" -o -name ".env"   # ← 同样被拦
```

**原因**：标准模式把命令文本里出现的 `.env` 当作**读取意图**（不要求文件真存在）。
**处置**：不要在 shell 命令里直接写 `.env` 字面量 —— 哪怕只当测试参数、循环变量、
`find -name` 的值。
⚠️ 也不要用字符串拼接去规避：那是在绕自己的安全闸门，且工具返回明确要求不要 workaround。

## 10 能力与边界

**拦什么**

- 破坏性命令：`git push --force`（`git.push-force`）、`git reset --hard`、
  危险目标的 `rm -rf`、`dd` 写设备等
- 凭据读取（**读也拦**）：`cat .env`、`strings id_rsa`、`dd if=.env`、`curl -d @.env` …
- **能透过包装**：`bash -c`、`python -c`、`sh -c`、flag 重排都藏不住（会递归分析解释器代码）

**不拦 / 盲区**

- **不是沙箱**：不限制文件系统权限、不看网络出口（README 首段明说 "It is not a sandbox"）
- DSH 侧：PTC 模式的 `run_code` 里 `node:fs` 写不经过 guard；
  `terminal_send` 写进持久 shell 的文本不分析
- 二进制内部行为无法推断（`some-tool --task destructive-cleanup` 看着无害）
- `eval` / 动态执行：从远端取回或变量拼装的代码在分析时不可见
- 未声明为透明包装器的代理命令（`rtk git reset --hard`）不会被拆开
- Windows `cmd /c` 用有界文本检查而非 cmd 解析器（可能误拦 `cmd /c 'echo rmdir /s /q C:\'`）
- 自定义规则（`rule.json` / rulebook）**无防篡改**（只有 `policy.json` 有）

**档位**：`standard`（默认）/ `strict`（开 `fail_closed`）/
`paranoid`（再加 `paranoid_rm`、`paranoid_interpreters`）。
环境变量只能往上抬，不能往下压。DSH 侧 guard 是 **deny-only**：
任何 guard 都不能把别人拒掉的调用改成放行。

## 11 审计与自查

审计日志：`~/.cc-safety-net/logs/<workspace-slug>/<YYYY-MM>/<YYYY-MM-DD>-<session>.jsonl`，
记录 `decision` / `ruleId` / `toolName` / `command` / `segment`。
保留期 `audit.retention_days`（默认 30）。

```sh
  cc-safety-net logs              # 浏览审计记录
  cc-safety-net explain "<cmd>"   # 逐步追踪某条命令如何被判
```

⚠️ `explain` 的 JSON trace **不能随便外发**：脱敏只覆盖已识别的凭据形态，
你给的命令文本、解析后的 token、含 home 的绝对路径、policy 文件路径都会原样带出。

### 11.1 密钥泄露自查方法（可复用）

担心「读凭据时值是否进了会话日志」时的自查口径 —— **只报 count / hash，绝不回显值**：

1. **解多帧 zstd**：`~/.dsh/sessions/<ws>/<session>/session.v4.jsonl.zstd` 是**多帧**流，
   按 magic `28 b5 2f fd` 切帧，逐帧 `zstdDecompressSync`（Node 26 原生支持）。
2. **按形状探针扫**，不要按关键词扫：
   - 实测环境网关密钥形态 = `randomBytes(32).toString('base64url')` ⇒
     **定长 43 位 `[A-Za-z0-9_-]`**（`dsh-codearts-auth/lib/openai-gateway/auth.js:12`
     的 `KEY_PATTERN`）
   - 通用：`sk-` / `ghp_` / `github_pat_` / `AKIA` / `AIza` / `xox` / `eyJ…`
3. **看访问形式**：`KEY=$(cat <file>)` + `Bearer $KEY`（变量）是安全的；
   `echo $KEY` / 把值插进输出才是泄露。
4. **误报识别**：实测唯一命中的 43 位串是文档锚点
   `what-standard-mode-does-not-count-as-a-read`（**恰好也 43 字符**）；
   长 hex 命中全是公开摘要（chezmoi digest、静态资源哈希、commit SHA、npm `shasum` /
   `gitHead`、翻译 recipe id）。

实测结论：78 个 `Authorization` 头里 76 个是 `Bearer $KEY`；
字面量仅 2 个且长度均非 43 ⇒ **密钥值未进入任何工具输出**。

## 12 卸载

```sh
  dsh plugin --profile web remove cc-safety-net
```

`reconcile()` 会自动摘依赖 + 移 bundle 行。**必须重启 dsh**（卸载不热生效）。

⚠️ 卸载**不会**删除 `~/.cc-safety-net/`（含 `policy.json`、`logs/`、`compile-cache/`）。
彻底清理需人来做（agent 改不了 `policy.json`）：

```sh
rm -rf ~/.cc-safety-net        # 由用户执行
```

## 13 参考

- 上游 README / 安装：https://ccsafetynet.com/docs/installation.md
- 策略契约（含 deny_paths 校验规则、防篡改段）：https://ccsafetynet.com/docs/configuration/policy.md
- 密钥保护规则全表：https://ccsafetynet.com/docs/reference/secret-protection.md
- 已知边界：https://ccsafetynet.com/docs/guides/known-limitations.md
- 集成架构（四种模型 / DSH 归属）：https://ccsafetynet.com/docs/guides/integration-architecture.md
- guard API：`@deepseek-ai/dsh-tools/lib/types/index.d.ts:515-525`、`:646-652`
- 姊妹篇：[[DSH CodeArts 认证插件安装]]（同一 profile 的另一个插件，含 allowBuilds / 热加载机制）

## 14 本机实测环境与数值

> 以下为单机单次实测结果；换机器 / 换版本后需重新核对。

| 项 | 值 |
| --- | --- |
| OS / 运行环境 | WSL2 Linux |
| dsh | `0.2.1-alpha.2`（npx 缓存 `/home/<user>/.npm/_npx/<hash>/`） |
| pnpm / node | `12.6.0` / `v26.9.0` |
| profile | `web` → `~/.dsh/profiles/web` |
| 落地版本 | `cc-safety-net@2.6.8`（dep spec `^2.6.8`） |
| 配置文件 | `~/.cc-safety-net/policy.json`（`0600`） |
| 审计日志 | `~/.cc-safety-net/logs/<workspace-slug>/<YYYY-MM>/<YYYY-MM-DD>-<session>.jsonl` |
| 宿主入口体积 | `dist/deepseek-harness/index.js` 1422 B |
| tarball | 606553 B / 23 files |
| 内置规则条数 | 138 |
| 安装生效实测 | 进程启动早于安装完成，装完 guard 立即拦下 `git push --force`（审计日志时间戳早于 `policy.json` 创建） |

## 15 相关

- [[DSH CodeArts 认证插件安装]]
- [[DSH 第三方插件安全审计]]
- [[DSH Agent Teams 与 AGENTS.md 纪律]]
- [[信息安全]]
- [[Linux 环境变量]]
