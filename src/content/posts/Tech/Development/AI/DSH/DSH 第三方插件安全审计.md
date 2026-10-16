---
tags: [DSH, 插件, 安全审计, 供应链, 凭据泄漏]
title: DSH 第三方插件安全审计
aliases: [plugin-security-audit]
date created: 2026-09-15 22:52:30
date modified: 2026-10-14 23:39:00
---

# DSH 第三方插件安全审计

> [!abstract] 适用场景
> 对一套已安装的 DSH 第三方插件做静态安全审计：查进程执行、网络出口、凭据访问、
> 代码混淆与持久化五类模式，并交叉验证落地文件与权限。
> 适用于准备批量安装社区插件、或想知道「装完这些插件等于交出了什么」的读者。
> 读完能拿到一份可复用的审计方法、五类真实风险清单与处置口径。

## 1 背景与适用条件

- **DSH**（DeepSeek Harness）的第三方插件以 npm / git 包形式安装进 profile，
  在宿主进程内运行，**权限等同当前用户**：能读写文件、发起网络请求、spawn 子进程。
  因此「装了插件」在安全上等价于「引入了一段以你身份运行的代码」。
- 本文审计对象是某一 profile 下的第三方插件集合，方法为**静态源码审计**：
  `lib/` 已构建产物 + `src/` 源码 + `package.json` + `cordis.patch.yml`，
  逐项核对进程执行、网络出口、凭据访问、混淆、持久化五类模式；
  关键结论用运行时环境（`DISPLAY`、文件权限、实际落地文件）交叉验证。
- 本文结论基于 DSH `0.1.5-rc.1` 与所审计插件的当时版本。
  **版本敏感**：插件升级后源码与行为都可能变化，本文结论**不自动延续到新版本**；
  重新审计时请以新版本源码为准。
- 前置条件：能读到插件的安装目录；建议具备 `node` 环境以便解压多帧 zstd 会话日志。
- **适用范围**：给出审计维度、判据与处置清单，可作为模板套用到其他插件集合。
  **不适用**：替代动态分析（未做 strace / 抓包）；也不覆盖传递依赖。

> [!warning] 密钥处理口径
> 本文只描述**哪个字段、哪个文件、什么权限、是否泄漏**，
> **不复述任何真实密钥的字符**（哪怕前缀）。正文如需举例，一律使用一眼假的
> `fc-CANARY-NOT-A-REAL-KEY` 这类占位值。

## 2 总体结论

**未发现恶意代码、后门或数据外泄。** 没有发现 `eval` / `new Function` 混淆、
没有 shell 配置持久化、没有把工作区内容外发。

但发现 **4 项真实风险**，其中 2 项建议立即处理：

| # | 等级 | 问题 | 处置 |
|---|---|---|---|
| 1 | **高** | Firecrawl API key 明文写在 `cordis.patch.yml`，且已泄漏进会话转录 | 轮换 key + 改用环境变量 |
| 2 | **中** | `dsh-pet` 自动下载并运行约 220 MB Electron 二进制 | 明确是否需要桌面宠物 |
| 3 | **中** | 3 个 MCP server 用 `npx -y` 不锁版本，供应链面 | 锁定版本 |
| 4 | **低** | 2 个插件有遥测心跳（已披露，仅包名 + 匿名 ID） | 知情即可 |

## 3 插件清单与来源

| 插件 | 版本 | 来源仓库 | 生命周期脚本 |
|---|---|---|---|
| `dsh-find-plugin` | 0.3.7 | npm | `prepack`（仅发布时） |
| `dshmarket` | 1.47.0 | github.com/dsh-market/dsh-market | `prepare`、`prepack` |
| `@wenaixi/dsh-superpower` | 6.3.1 | npm | `prepare`、`prepack` |
| `dsh-whale-widget` | 0.3.0 | npm | 无 |
| `@nonamelego/dsh-catppuccin` | 0.5.2 | npm | `prepare` |
| `dsh-pet` | 0.2.9 | github.com/PC2005-cloud/dsh-pet | `prepare`、`prepack` |
| `dsh-better-sidebar` | 0.19.1 | github.com/omdsh-dev/DSH-better-sidebar | 无 |
| `dsh-context` | 0.52.2 | github.com/bowenliang123/dsh-context | `prepare` |
| `@linxin666/dsh-client-ui-git-graph` | 0.3.22 | github.com/zhu1090093659/dsh-web | 无 |
| `dsh-router-core` | 0.3.16 | npm | `prepublishOnly` |
| `dsh-router-codebuddy` | 0.3.17 | npm | 无 |
| `@linxin666/dsh-client-ui-task-board` | 0.3.22 | github.com/zhu1090093659/dsh-web | 无 |

**`prepare` 脚本评估**：`prepare` 会在 `npm install` 后自动执行，是供应链关注点。逐个核对：

- `dshmarket` / `@nonamelego/dsh-catppuccin` / `@wenaixi/dsh-superpower`：`prepare` 只跑自己的
  `build`（tsdown / esbuild），**不下载外部二进制、不写用户目录**。
- `dsh-context`：`prepare: husky && tsdown` — husky 在非 git 环境静默跳过。
- `dsh-pet`：`prepare: node scripts/prepare.js` — **该文件在已安装产物中不存在**（只有
  `scripts/ensure-electron.mjs`），说明 `prepare` 实际未生效；Electron 下载走的是**运行时**路径（见 §5）。

## 4 高危：Firecrawl API key 明文泄漏

`~/.dsh/profiles/web/cordis.patch.yml` 第 68 行附近，MCP server 的 `env` 段里出现
**硬编码的明文 API key**（字段名 `FIRECRAWL_API_KEY`；**真实值不在本文复述**）：

```yaml
    - id: mcp-firecrawl
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        ...
        env:
          FIRECRAWL_API_KEY: <YOUR_API_KEY>   # ← 明文硬编码（真实值不复述）
```

**两个问题叠加**：

1. **文件本身权限 `644`**（`-rw-r--r--`）。虽然父目录 `~/.dsh` 是 `700` 挡住了其他用户，
   但这与同目录 `~/.dsh/.credentials.yaml`（`600`）的处理方式不一致 ——
   后者才是凭据应有的权限。
2. **key 会随会话转录扩散**：审计过程中该 key 曾出现在
   `~/.dsh/storages/session_projcache/sessions/` 的会话 JSON 里（因为它在 `grep` 输出中被
   回显，而工具输出会被写入转录）。会话转录是**明文 JSON**，任何能读到它的东西（备份、同步、
   贴日志、会读取会话的插件）都会连带拿到 key。

   **本次审计自身的教训**：首版报告把这个 key 完整复制了进去，等于在报告里二次泄漏。
   审计输出必须**只记录位置与类型，不复述密文**。

**注意这与全局 `AGENTS.md` 的约定冲突**：`~/.dsh/AGENTS.md` 明确要求「`env` 必须显式声明」，
但显式声明不等于把值硬编码 —— 值应通过环境变量注入，而非写死在 patch 文件里。

**处置**：

1. 到 Firecrawl 控制台**吊销该 key 并签发新 key**（已泄漏的 key 必须视为已失陷）。
2. 把新 key 放进 **`~/.dsh/.env`**（不是 `.credentials.yaml`，原因见下），
   patch 里改用 `!!js` 表达式引用：

```yaml
        env:
          FIRECRAWL_API_KEY: !!js process.env.FIRECRAWL_API_KEY
```

3. 顺手把该文件权限收到 600：`chmod 600 ~/.dsh/profiles/web/cordis.patch.yml`。
4. 清理那条会话转录里的 key（或整个删除该会话）。

### 4.1 更正：`${VAR}` 不是 DSH 支持的写法，`.credentials.yaml` 也喂不到 MCP

首版建议「patch 里写 `${FIRECRAWL_API_KEY}`、值放 `.credentials.yaml`」。**这是错的**，
经查 DSH 源码后更正：

| 机制 | 是否可用 | 依据 |
|---|---|---|
| `${VAR}` 字符串内插 | ❌ **不存在** | loader 的 `interpolate()` 只处理 `__jsExpr` 节点，`${VAR}` 会作为**字面字符串**传给 MCP server（实测解析结果就是 `"${FIRECRAWL_API_KEY}"`） |
| `.credentials.yaml` → MCP `env` | ❌ **不可能** | `dsh-mcp-client` 的 `env` 是 `z.dict(String)`，且该包**完全不 import** `dsh-credentials`（0.1.5-rc.2 与 0.1.6-alpha.1 均如此） |
| `!!js process.env.X` | ✅ **官方写法** | `dsh-mcp-client` README 的 env 示例即 `GITHUB_TOKEN: !!js process.env.GITHUB_TOKEN` |

**为什么凭据库喂不到**：`credentials-local` 源码明确自述它是一个
「**never materializes into the environment**」的存储 —— 它只经 `ctx.credentials.resolve()`
（**异步**）供插件按需取值，从不写入 `process.env`。而 `!!js` 求值是**同步**的，
所以 `!!js ctx.credentials.resolve('X')` 只会得到一个 `Promise`，被 `z.dict(String)` 拒绝。

**`process.env` 的真实来源**（`dsh-app-boot` 的 `loadLayeredEnv`）：启动环境 → 项目 `.env`
→ `$DSH_HOME/.env`。所以 MCP 密钥的正确落点是 **`~/.dsh/.env`**。
`FIRECRAWL_API_KEY` 不在 `BOOTSTRAP_NAMES`、也不匹配 `BOOTSTRAP_PREFIXES`
（`DSH_` / `XDG_` / `DYLD_` / `BASH_FUNC_`），因此**允许**放在 `.env` 里。

**安全性**：`!!js` 表达式在 `dsh --dump-config` 中**原样打印不求值**（源码注释：
「`!!js` expressions print verbatim, unevaluated」），所以改用 `!!js` 后 dump 也不会泄漏值。

**顺带**：`.credentials.yaml` 里那条 `FIRECRAWL_API_KEY` 对 MCP **不起作用**，可以删掉
（它只对支持 `credentialRef` 接缝的插件有意义，而 Firecrawl 不是 LLM 供应商）。

### 4.2 附：`.credentials.yaml` 本身是否需要重签？

**不需要。** 该文件与上面的 patch 文件是两种处境，逐项核对如下：

| 检查项 | `cordis.patch.yml` | `.credentials.yaml` |
|---|---|---|
| 权限 | `644` ❌ | `600` ✅ |
| 值是否进过会话转录 | **是** ❌ | 否 ✅ |
| 是否纳入 chezmoi 版本控制 | 否 | **否**（chezmoi 只跟踪 `private_dot_dsh/private_AGENTS.md`） |
| 是否在 git 仓库中 | 否 | 否（`~/.dsh` 非 git 仓库） |
| 是否被 dshmarket 备份包含 | — | **否**（备份只走 profile 目录，该文件在 `~/.dsh/` 根，在范围外） |
| 磁盘上是否有副本 | — | 否（全盘扫描：3 个凭据值各 0 处副本） |
| 是否被插件直接读取 | — | 否（`dsh-pet` 仅在注释中提及，实际经官方 `credentialRef` 接缝解析） |

**结论**：`.credentials.yaml` 的三个值（字段名 `DEEPSEEK_API_KEY`、`XIAOMI_API_KEY`、
`browser-session/secret`）**未发生任何泄漏** —— 没进转录、没进版本控制、没进备份、
磁盘无副本、无插件直读。因此**无需重签**。

两者唯一的共性是「都含凭据」，但 `cordis.patch.yml` 的问题是**值被硬编码**
（本该引用而非内联），`.credentials.yaml` 的问题**不存在** —— 它本来就是凭据库，
`600` 权限，设计正确。

**判据（可复用）**：一个凭据是否需要轮换，取决于它是否离开过受控边界
（权限收紧的单一文件），而不取决于它「看起来是否敏感」。
`.credentials.yaml` 从未离开；Firecrawl key 离开过。

## 5 中危：dsh-pet 自动下载并运行 Electron

`dsh-pet` 不只是「一个悬浮宠物」——它会在**运行时自动下载约 220 MB Electron 二进制并启动**：

```text
~/.dsh/electron/electron   ~220,986,616 bytes   ← 已实际落地
```

触发链（`dsh-pet/lib/index.js`）：

```js
function hasGraphicalDisplay() {
  if (process.platform !== "linux") return true;
  if (process.env.DSH_PET_DESKTOP_FORCE === "1") return true;
  return Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);   // ← 实测环境命中
}
```

在实测环境中 `DISPLAY` / `WAYLAND_DISPLAY` 均已设置，且 `~/.dsh/dsh-pet/main-config.json`
里 `"display": "both"`（桌面 + 浏览器），因此 `hasDesktopPet === true`，启动时会：

1. `resolveElectronPath()` 找不到 → 走 `ensureElectronDownload()`
2. 从 `https://npmmirror.com/mirrors/electron/`（**第三方镜像**，非官方源）
   下载 Electron（当时为 43.3.0）
3. `spawn` 该二进制，加载 `runtime/electron-helper/main.js`，开透明置顶窗口

**风险评估**：

- 下载走 `@electron/get`（官方库，带 SHA256 校验），镜像可换。校验存在，风险可控。
- 但这是**第三方镜像**上的**未签名约 220 MB 二进制**，且在 DSH 宿主进程外独立运行、
  权限等同当前用户。
- Electron helper 用 `execFileSync(process.execPath, [__filename, '--dsh-pet-dpi-probe'])` —
  只重入自身做 DPI 探测，**不是任意命令执行**，这点没问题。
- helper 的 `preload.js` 只经 `contextBridge` 暴露窗口控制原语（`setBounds` / `setInteractive` /
  `openDshSite`），**没有暴露 fs 或 ipc 任意调用**，隔离做得不错。

**结论**：代码本身没有恶意行为，但「一个装饰性宠物插件在后台下载运行约 220 MB 浏览器内核」
与它呈现给人的印象不匹配。若不需要桌面宠物：

```sh
  # 方案 A：只保留浏览器内宠物（不下载 Electron）
  # 编辑 ~/.dsh/dsh-pet/main-config.json，把 "display": "both" 改成 "display": "browser"
  rm -rf ~/.dsh/electron          # 回收约 220 MB

  # 方案 B：整个卸载
  dsh plugin --profile web remove dsh-pet
```

## 6 中危：MCP server 供应链面

`cordis.patch.yml` 中三个 MCP 都用 `npx -y` **不锁版本**：

```yaml
- '-y'
- '@upstash/context7-mcp'      # 无版本约束
- 'firecrawl-mcp'              # 无版本约束
- '@playwright/mcp@latest'     # 永远取最新
```

含义：每次 npx 缓存失效后拉取的都是**当时的最新版**。上游一旦被投毒或被接管，
下次启动即执行任意代码（MCP server 是宿主进程内 stdio 子进程，权限等同 DSH）。

这不是这三个包「有问题」——它们都是知名项目——而是**默认信任模型**的问题。
若想收紧，把版本钉死：

```yaml
- '@upstash/context7-mcp@1.0.14'    # 换成实际使用的版本
- 'firecrawl-mcp@3.4.0'
- '@playwright/mcp@0.0.41'
```

权衡：钉版本会失去自动修复与更新。若当前注释里已说明这是**有意为之**
（「有新版自动取最新」），属于知情选择，记录在案即可。

## 7 关于「自动脱敏」：DSH 没有

**结论：DSH 不提供自动脱敏。工具输出里的密钥会原样落盘，没有任何内置机制拦截。**

### 7.1 实测（canary 验证）

往工具输出里打两个假密钥，然后解压会话日志查找：

```sh
$ echo "CANARY_FAKE_SECRET=fc-CANARY-NOT-A-REAL-KEY"
$ echo "api_key: sk-CANARY-NOT-A-REAL-KEY"
```

解压 `~/.dsh/sessions/<workspace>/session-<id>/session.v3.jsonl.zstd`
（约 973 个 zstd 帧，解压后约 6.8 MB）后统计：

| 内容 | 落盘次数 |
|---|---|
| 假 canary 标记 | **39** |
| `fc-CANARY-NOT-A-REAL-KEY`（假值） | **19** |
| 真实旧密钥（值不复述） | **248** |

**明文原样落盘，零脱敏。**

> 排查提示：会话日志是**多帧 zstd**（一个文件 900+ 个独立帧），
> `zstd -d` 与 Node 的 `zstdDecompressSync` 都只解第一帧（仅 203 字节，看着像空文件）。
> 必须按 magic `28 b5 2f fd` 逐帧解压再拼接。

### 7.2 DSH 里那几处 `redact` 分别管什么

| 位置 | 作用域 | 能否保护会话转录 |
|---|---|---|
| `dsh-settings` 的 `redact.js` | 设置项经**线缆**时按 `role('secret')` 剥离 | ❌ 只管 settings 读写，不碰会话 |
| `dsh-session-telemetry` | 上报**遥测**前跑 `session-telemetry/record` waterfall | ❌ 只影响外发遥测；且规则需 deployment 自己挂载，**默认无规则** |
| `dsh-better-sidebar` | **渲染层**遮蔽（`.env` / `id_rsa` / `sk-` / `AKIA` 等） | ❌ 源码自述 *"display-only: the session log and the tool results keep their original bytes"* |

`better-sidebar` 那段注释把边界说得很清楚：

> It is **NOT a security boundary** against a same-context malicious plugin … it removes the
> tracer's own contribution to secret exposure.

### 7.3 为什么挂不上钩子

会话写入路径 `dsh-agent-loop` 的 `appendToolResult()` 直接
`session.append("tool/result", …)`，而 `tools/result` 是 **`emit`（观察者）不是 `waterfall`**，
回调无法改写 payload：

```js
const callbacks = this.ctx.events.dispatch("emit", [..., "tools/result", exec, result]);
```

全树 `waterfall(` 钩子只有 `agent/pre-step`、`agent/request`、`agent/request-error`、
`fs/edit-intent`、`fs/write-intent`、`session-telemetry/record` 等 ——
**没有一个是工具结果落盘前的改写点**。

### 7.4 有没有现成插件

查了 dsh-plugin 生态（`find_dsh_plugin`，中英文各一次）：**没有**脱敏 / 密钥保护类插件。

### 7.5 那实际怎么办

1. **最有效：不把密钥打出来**。这是唯一 100% 有效的办法 —— 一次真实泄漏就是因为
   `grep -r` 回显了匹配行，而工具输出被落盘。排查密钥时用 `grep -rl`（只列文件名）
   或 `grep -c`（只数次数），绝不打印匹配内容。
2. **查询时避免**：用 `grep -o` 配精确模式、或用脚本比对计数而不输出值。
3. **落盘后清理**：会话日志是 zstd 多帧，清理需解压 → 替换 → 重新压缩，
   或直接删除整个会话目录（`~/.dsh/sessions/<workspace>/session-<id>/`）。
4. **密钥轮换**：一旦落盘，按已失陷处理。

## 8 低危：遥测心跳（已披露）

`@linxin666/dsh-client-ui-git-graph` 与 `@linxin666/dsh-client-ui-task-board` 的浏览器半区
各有一个 telemetry 模块：

```js
const ENDPOINT = "https://dsh-market.com/api/telemetry/event";
const VISITOR_KEY = "dsh-web-ui-telemetry-visitor";
// ...
const body = JSON.stringify({
  kind: "heartbeat",
  visitor,          // localStorage 随机 UUID，16-64 字符
  items: [{ name: "@linxin666/dsh-client-ui-task-board", version: "0.3.22" }]
});
```

**实测载荷只有三项**：`kind`（固定 `"heartbeat"`）、`visitor`（随机 ID）、
`items`（包名 + 版本）。**不含**工作区路径、文件名、会话内容、环境变量、token ——
实测中专门扫过 `fetch(...)` 里拼接 `cwd` / `workspace` / `homedir` / `readFile` /
`process.env` 的模式，12 个插件全部为 0 命中。

频次：每个 UTC 日最多一次，`localStorage` 去重，`navigator.webdriver` 时跳过
（不采集自动化环境）。

**已在插件 README 中披露**（`README.zh.md`「数据遥测」节）：

> 浏览器半区每个 UTC 日向 dsh-market.com 发送一次匿名安装心跳：仅含一个 localStorage 随机 ID
> 与本包名，无其他数据。服务端只存储该 ID 的加盐哈希，不存 IP，且只暴露聚合计数。

**结论**：知情同意范围内，无需处置。若要阻断，把 `dsh-market.com` 加进 hosts
或浏览器拦截规则即可（失败是静默的，不影响插件功能）。

## 9 逐项核对结果

### 9.1 进程执行（`child_process`）

命中数高不等于危险 —— 多数是正则 `.exec()` 误报。逐个核实真实 `spawn`：

| 插件 | 真实 spawn 用途 | 判定 |
|---|---|---|
| `dshmarket` | 调 `pnpm` 装插件、`taskkill` 杀子进程树、`gh auth token` 取 token | 合法（插件市场本职） |
| `dsh-better-sidebar` | 终端（`node-pty`）、`git` 命令、`xdg-open` / `open` 打开文件 | 合法（右侧面板本职） |
| `dsh-pet` | 启动 Electron helper | 见 §5 |
| `@linxin666/dsh-client-ui-git-graph` | `git` 命令（分支 / 图谱 / worktree） | 合法 |
| `@linxin666/dsh-client-ui-task-board` | 执行 DSH 会话任务 | 合法 |
| `dsh-context` | 无 | — |
| 其余 6 个 | 无 | — |

**关键检查**：`spawnShim` 明确用 `shell: false`（`dsh-cli.js`）：

```js
return spawn(file, [...args], { ...spawnOptions, shell: false, windowsHide: true });
```

即**不经过 shell 解释**，无命令注入面。

### 9.2 混淆与动态代码执行

| 模式 | 结果 |
|---|---|
| `eval(` | **0** 命中（全 12 个插件） |
| `new Function(` | **0** 命中 |
| `atob(` / base64 解码 | 仅 `dsh-better-sidebar`（59 处）与 `dshmarket` / `dsh-whale-widget` 少量 |

逐个核实 `atob` 用途：mermaid 图表数据点解码、编辑器 head 字节嗅探、blob 构造 ——
**均为数据解码，非代码加载**。无混淆迹象。

### 9.3 持久化

检查 `writeFile` / `appendFile` 写入 `.bashrc`、`.zshrc`、`crontab`、`systemd`、
`LaunchAgents`、Windows `Run` 注册表 —— **12 个插件全部 0 命中**。

（`dshmarket` 初筛 228 处命中是 `.profile` 匹配到 `dsh.profile` 的假阳性，已排除。）

### 9.4 凭据访问

| 位置 | 权限 | 内容 | 判定 |
|---|---|---|---|
| `~/.dsh/.credentials.yaml` | `600` ✅ | `DEEPSEEK_API_KEY`、`XIAOMI_API_KEY`、browser-session secret | 正确 |
| `~/.dsh/profiles/web/data/auths/credentials.sqlite` | `644` ⚠️ | router 供应商 key（codebuddy / codebuddy-en） | 父目录 700 挡住，但建议收 600 |
| `~/.dsh/profiles/web/.dsh-market/data/auths/credentials.sqlite` | `644` ⚠️ | 同上（另一份） | 同上 |
| `~/.dsh/profiles/web/cordis.patch.yml` | `644` ❌ | **Firecrawl key 明文** | 见 §4 |

**余额查询类插件**（`dsh-whale-widget`、`dsh-pet`）会用 key 调供应商余额接口
（`api.deepseek.com/user/balance`、`opencode.ai/zen/go/v1/usage` 等）。这是**功能所需**，
且 key 只发往对应供应商官方域名，未见转发第三方。判定合法。

`dshmarket` 的 `gist.js`（GitHub Gist 备份）安全姿态良好，源码注释明确：

> Tokens are never persisted: the client sends one per request (session memory only) or the
> operator sets `DSH_GITHUB_TOKEN` on the host; nothing is written to disk by this module.

### 9.5 网络出口

逐个提取硬编码 URL 并人工判读：

- **官方 API**：`api.deepseek.com`、`api.moonshot.cn`、`api.siliconflow.cn`、`openrouter.ai`、
  `api.minimaxi.com`、`api.kimi.com`、`copilot.tencent.com`、`www.workbuddy.ai` 等 ——
  供应商余额 / 套餐接口，合法。
- **内容分发**：`awesome-dsh-plugin.com`（插件索引）、`dsh-market.com`（工坊 + 遥测）、
  `api.github.com`（搜索 / Gist）、`registry.npmjs.org`、`npmmirror.com`（Electron 镜像）—— 合法。
- **第三方 GitHub 代理**（`dshmarket`）：`gh-proxy.com`、`ghfast.top` —— 用于加速
  GitHub 下载。源码注释对此有清醒认识：
  > That fragility is the substance of #460's actual request (a mirror list and a visible setting)
  属知情设计；若不信任可在设置里关掉加速。
- **数据外发**：**0 命中**。专门扫描了把 `cwd` / `workspace` / `homedir` / `readFile` /
  `process.env` 拼进 `fetch()` 的模式。

### 9.6 权限边界

- `@linxin666/dsh-client-ui-task-board` 的 HTTP 路由有**完整信任围栏**（`src/loopback.ts`）：
  loopback socket 地址 + loopback Host 头 + 浏览器 same-origin 标记（`sec-fetch-site` /
  `origin` 与 Host 相等）三重校验，且明确「socket/Host/origin-equality checks carry the authority」。
- `dsh-better-sidebar` 的 `preload.js` 只经 `contextBridge` 暴露最小原语，无 fs / 任意 ipc。
- 各插件均未申请超出本职的权限（宠物不读文件、主题不联网、图谱不写配置）。

## 10 `@wenaixi/dsh-superpower` 附注

该插件往会话注入 14 个 skill，其中包含**可执行脚本**（非纯 markdown）：

```text
skills/superpower-brainstorming/scripts/start-server.sh   # 起本地 HTTP/WS 服务
skills/superpower-brainstorming/scripts/stop-server.sh
skills/superpower-brainstorming/scripts/server.cjs        # 723 行，自实现 WebSocket
skills/superpower-systematic-debugging/find-polluter.sh   # 二分定位测试污染
```

核实结果：

- `start-server.sh` 默认绑 **`127.0.0.1`**（`BIND_HOST="127.0.0.1"`），非 `0.0.0.0`。
- 会话目录 `umask 077`，token 文件 `chmod 600`，URL 带 `?key=` 一次性 token 鉴权。
- `stop-server.sh` 拒绝杀「无法证明是自己服务」的 PID（校验 `--brainstorm-server-id`），
  防 PID 复用误杀。
- `find-polluter.sh` 只跑 `npm test` 并检查文件是否出现，行为透明。

**这些脚本只在 skill 被显式触发时运行**（brainstorming / debugging 场景），不会自动执行。
判定合法，但用户应知道「装了 superpower 就等于装了几个能起服务、能跑测试的脚本」。

## 11 处置清单

**立即（建议今天）**：

1. 吊销并轮换 Firecrawl API key（已泄漏进会话转录）
2. `chmod 600 ~/.dsh/profiles/web/cordis.patch.yml`
3. 改用环境变量注入 key，不再硬编码
4. 清理会话转录中的残留。**注意**：`grep -r` 会把匹配行回显到工具输出，而工具输出又写进
   转录 —— 排查时用 `grep -rl`（只列文件名）或 `grep -c`（只数次数），不要用会打印匹配内容的
   形式，否则每排查一次就多一份泄漏。

**按需（看是否真需要桌面宠物）**：

5. `dsh-pet` 改 `"display": "browser"` 并 `rm -rf ~/.dsh/electron` 回收约 220 MB
   —— 或确认接受后保持现状

**可选（收紧供应链）**：

6. 给三个 MCP 钉版本
7. `chmod 600` 两个 `credentials.sqlite`

**无需动作**：

8. 遥测心跳（已披露、载荷极小、可拦截）
9. 其余插件的进程执行 / 网络访问（均为本职功能）

## 12 审计覆盖度说明

**已覆盖**：12 个插件的 `lib/` 构建产物全量静态扫描（进程执行、网络、凭据、混淆、持久化
五类模式）、`package.json` 生命周期脚本、`cordis.patch.yml`、实际落地文件与权限、
运行时环境变量。

**未覆盖**（如需可补）：

- `node_modules` 中的传递依赖（数百个包，仅审了插件本体）
- `@deepseek-ai/*` 官方 SDK（视为信任基线）
- 二进制内容（`~/.dsh/electron/electron` 约 220 MB 未做逆向；仅核验其来源与校验机制）
- 动态运行追踪（未做 strace / 网络抓包；结论基于静态审计 + 文件落地证据）

## 13 本机实测环境与数值

> 以下为单机单次实测结果；换机器 / 换版本后需重新核对。

| 项 | 值 |
| --- | --- |
| OS / 运行环境 | WSL2 Linux（图形显示可用） |
| DSH CLI | `@deepseek-ai/dsh@0.1.5-rc.1` |
| profile | `web` → `~/.dsh/profiles/web` |
| 审计插件数 | 12 个第三方插件 |
| 审计日期 | 2026-09-15 |
| Electron 落盘体积 | `~/.dsh/electron/electron` ≈ 220,986,616 bytes |
| 会话日志规模 | 约 973 个 zstd 帧，解压后约 6.8 MB |
| `DISPLAY` / `WAYLAND_DISPLAY` | 均已设置（故 `dsh-pet` 判定为有图形显示） |

## 14 相关

- [[DSH Web 插件聚合包]]
- [[DSH 是否内置 Playwright]]
- [[cc-safety-net 命令安全网]]
- [[DSH CodeArts 认证插件安装]]
- [[DSH Agent Teams 与 AGENTS.md 纪律]]
- [[信息安全]]
- [[Betterleaks 与 chezmoi 跨平台部署]]
- [[gitleaks 密钥扫描]]
