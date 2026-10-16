---
tags: [DSH, 浏览器自动化, MCP, PDF]
title: DSH 浏览器能力与 PDF 处理
aliases: [dsh-0.1.6-browser-and-pdf]
date created: 2026-09-17 22:33:02
date modified: 2026-10-14 23:39:00
---

# DSH 浏览器能力与 PDF 处理

> [!abstract] 适用场景
> 厘清 DeepSeek Harness（DSH）里被统称为「浏览器能力」的三个不同东西：给人看的侧边栏浏览器、给模型用的 Browser Use、以及用户自行挂载的 Playwright MCP。适用于需要在 WSL 中让模型驱动浏览器、或想给模型补一个 PDF/DOCX 等文档读取入口的场景。读完可以判断该挂哪个 MCP、哪些做法走不通，以及 MarkItDown 的能力边界在哪。

## 1 背景与适用条件

**DSH** 是一个可扩展的 AI agent 运行时（CLI + Web/桌面壳），通过 profile 目录下的 `cordis.patch.yml` 以插件与 MCP server 的形式扩展能力。本文讨论其中与「浏览器」和「文档读取」相关的部分。

适用前提：

- 已在 Linux/WSL 中用 npx 安装 DSH，可读写 `~/.dsh/profiles/<profile>/cordis.patch.yml`。
- 需要一个能操作浏览器 DOM 的模型工具，或需要读取 PDF/DOCX/XLSX 等 `read` 工具不支持的格式。

版本敏感性：以下结论基于 **`@deepseek-ai/dsh@0.1.6-alpha.2`**，更新版本可能变化。DSH 仓库内**没有 `CHANGELOG.md`**（`main`/`master`/`docs/` 下均 404），权威变更来源只有 GitHub Releases：

- https://github.com/deepseek-ai/deepseek-harness/releases

适用范围：判断该挂哪个 MCP、侧边栏浏览器到底能做什么、Windows 端浏览器能否被模型驱动。**不适用**：扫描件 PDF 的 OCR（MarkItDown 不做 OCR，见 §5）。

## 2 结论速览

1. **0.1.6 的「浏览器能力」是两个不同的东西**：`alpha.2` 的侧边栏浏览器是**给人看的 UI**（iframe tab）；`alpha.1` 的 Browser Use 是**给模型用的工具**，但属 experimental 且**默认不装**。只装 `alpha.2` 的实例 → 侧边栏浏览器有，Browser Use **没有**。
2. **`sidebar_open` 不是 DSH 的能力**，是第三方插件 `dsh-better-sidebar` 提供的。
3. 真正让**模型**操作浏览器的，是用户自己在 `cordis.patch.yml` 里挂的 Playwright MCP。它可以**驱动 Windows 端浏览器**（CDP attach 方式，已实测通过），但**不能**用 `executablePath` 直接启动 Windows 的 `.exe`（实测失败）。
4. **MarkItDown MCP 可用、值得装**（stdio、只读本地文件、1 个工具），但它**不是 OCR 方案**：纯图片扫描件 PDF 输出空字符串。

## 3 0.1.6 引入的浏览器能力

### 3.1 两个独立特性

| | 侧边栏浏览器 | Browser Use |
|---|---|---|
| 引入版本 | **0.1.6-alpha.2** | **0.1.6-alpha.1** |
| 包 | `dsh-client-ui-sidebar-browser` | `dsh-browser-use` + 3 个 provider |
| 归属 | **用户 UI** | **模型工具** |
| 默认是否安装 | ✅ 有（在安装树里） | ❌ 没有（默认不装、未挂载） |
| 配置 | 无（README 明说 "The package has no configuration"） | 需显式 mount，experimental |

release note 原文（`dsh-v0.1.6-alpha.2`）：

> Open a specified URL in browser mode in the sidebar. by @imccyu

release note 原文（`dsh-v0.1.6-alpha.1`）：

> Add experimental Browser Use through Playwright MCP, Chrome DevTools MCP, and Stagehand browser backends. by @tianyicui
> Add experimental Computer Use through Cua Driver MCP or the native driver for local computer interaction and screenshots. by @tianyicui

### 3.2 侧边栏浏览器 ≠ 模型工具（关键区分）

`dsh-client-ui-sidebar-browser` 的 Model Experience 一节原文：

> **None.** Browser tabs are user-facing presentation state and register no tool,
> prompt section, or Session event.

即：它只给人看，**模型拿不到任何工具**，浏览内容也不进模型请求（KV cache 影响：无）。

实现上它是 **iframe + 应用维护的 history**，不是 Electron `<webview>`，也不是 CDP。决策记录明说未实现：

> The proposed Electron `<webview>` carrier, per-tab cookie partitions, native
> history, and target-specific CDP connection are not implemented.

**所以：侧边栏浏览器无法选择用哪个浏览器渲染**（不是系统浏览器、也不是发行版 chromium），它就是你当前 DSH GUI 页面里的一个 iframe。已知限制里还明确写了：很多站点拒绝 iframe 嵌入；工具栏那个「在系统浏览器中打开」是唯一的外跳口子。

### 3.3 Browser Use（模型工具，默认不装）

架构（`docs/subsystems/browser-use.md`）：`dsh-browser-use` 只注册 provider **名额**，三个 provider 各自实现：

- `dsh-experimental-browser-use-playwright-mcp` — pin `@playwright/mcp@0.0.80`
- `dsh-experimental-browser-use-chrome-devtools-mcp` — pin `chrome-devtools-mcp@1.9.0`
- `dsh-experimental-browser-use-stagehand-native` — 工具名 `stagehand_act/_extract/_navigate/_observe/_screenshot/_tabs`

Playwright 后端的工具命名空间：`mcp__playwright-mcp__<tool>`。

**默认关闭**，官方原文：

> The providers are experimental public npm packages and require explicit activation.
> Tool schemas follow the pinned experimental dependency and carry **no DSH stability promise**.

npm dist-tags 有个坑（2026-09-17 查询）：五个包都是 `{"alpha":"0.1.6-alpha.2","latest":"0.1.6-alpha.1"}`，**裸装会拿到 alpha.1**。唯一例外拼写：运行时包叫 `dsh-experimental-browser-use-runtime`（`dsh-browser-use-runtime` 不存在，404）。

### 3.4 `sidebar_open` 的真实来源

`sidebar_open` **在整个 DSH 安装树里 grep 命中 0 次**。它来自第三方插件：

- 包：`dsh-better-sidebar`（`~/.dsh/profiles/web/node_modules/`，v0.19.1）
- 来源：其 README `Model-driven sidebar opens (opt-in)`，PR #353
- 全局设置项 `agentOpenTools`，**默认 off**
- 行为：让模型在**调用方 session 的侧边栏**打开本地文件 / 文件夹 / HTTP(S) 页面 —— 即「帮你把东西摆到侧边栏」，**不是**抓页面内容给模型

源码：`dsh-better-sidebar/src/agent-opens.ts`（`AgentOpenRegistry`，经 `/sidebar/ws/agent-opens` 推送，per-session 队列）。

**结论：不能用它替代 Playwright。** 它没有任何 DOM/截图/点击能力。

## 4 让模型驱动 Windows 端浏览器

**能，走 CDP attach；但不能直接 launch Windows exe。** 两种情况都已实测。

### 4.1 现状：Playwright MCP 配置

`~/.dsh/profiles/web/cordis.patch.yml` 里：

```yaml
- id: mcp-playwright
  name: '@deepseek-ai/dsh-mcp-client'
  config:
    serverName: playwright
    transport: stdio
    command: /home/<user>/.local/share/fnm/aliases/default/bin/node
    args: [... '/usr/bin/chromium', '--headless']
```

即默认复用发行版安装的 `/usr/bin/chromium`（可用，`browser_navigate` 实测成功）。

> [!warning] `command` 用绝对路径
> MCP 子进程会清洗掉匹配 `/KEY|PASSWORD|SECRET|TOKEN/i` 的变量，且 fnm 的 PATH 条目带会话临时 ID，重启后失效。因此 node 必须写 fnm aliases/default 的**绝对路径**，不要依赖 PATH 里的裸 `node`/`npx`。

### 4.2 Windows 侧浏览器

Windows 侧的 Chromium 系浏览器可能**不在** `Program Files`，而在用户目录下（例如某些 Chromium 分支装在 `AppData/Local/<vendor>/`）。从 WSL 可以直接执行：

```bash
/mnt/c/Users/<user>/AppData/Local/<vendor>/<Browser>/Application/chrome.exe --version
```

走 WSL interop 可以正常执行，但**执行得起来 ≠ Playwright 能 launch 它**（见下）。

### 4.3 ❌ 方案 A：`--executable-path` 直接起 Windows exe —— 失败

用 `playwright-core` 以 `executablePath: "/mnt/c/.../chrome.exe"` 从 WSL launch：

```text
LAUNCH-FAIL Error: browserType.launch: Target page, context or browser has been closed
```

**原因**：WSL 里的 Playwright 用 Linux 语义 spawn 一个 Windows PE；它能起来，但 Playwright 与它之间的 stdio/pipe 握手协议跨了 OS 边界，拿不到调试端点。所以 `executablePath` 指 Windows 二进制这条路**不通**。

（同理，0.1.6 Browser Use 的 Playwright provider 的 `executablePath` 标注是 "Chromium executable for launch"，且源码硬编码 `--browser chromium` —— 对它也没有帮助，因为它是 launch 语义。）

### 4.4 ✅ 方案 B：CDP attach —— 成功

关键前提是 WSL2 的 **mirrored 网络模式**。`%USERPROFILE%\.wslconfig`（Windows 侧）：

```ini
[wsl2]
networkingMode = mirrored
[experimental]
hostAddressLoopback = true
```

**mirrored 网络模式下，WSL 的 `127.0.0.1` 就是 Windows 的 `127.0.0.1`**（实测 WSL 里 `curl http://127.0.0.1:9333/json/version` 直接命中 Windows 的 CDP 端点）。

步骤：

1. 在 Windows 侧带调试端口起浏览器（`--user-data-dir` 必须给独立目录，否则会占用日常 profile；用 `cmd.exe /c` 从 WSL 拉起即可）：

   ```bash
   chrome.exe --headless=new --remote-debugging-port=9333 \
     --user-data-dir='C:\Users\<user>\AppData\Local\Temp\browser-cdp' about:blank
   ```

2. Playwright MCP 加 `--cdp-endpoint http://127.0.0.1:9333` 挂载。

实测结果（MCP 协议直连 `browser_navigate` + `browser_evaluate`）：返回的 `platform` 为 `Win32`，User-Agent 含 `Windows NT 10.0; Win64; x64`，即**确实是 Windows 端浏览器在执行**，不是 WSL chromium。具体数值见 §8。

对应到 0.1.6 Browser Use 的 Playwright provider，同一套机制：`mode: attach` + `endpoint: http://127.0.0.1:9333`（`endpoint` 是 attach 专属字段）。

### 4.5 场景选择

| 场景 | 选择 |
|---|---|
| 一般抓取/自动化/截图 | **继续用 WSL `/usr/bin/chromium`** —— 零额外进程、无跨 OS 开销、最稳 |
| 需要 Windows 侧身份/登录态/Cookie | Windows 浏览器 via CDP attach |
| 需要看站点在 Windows 渲染下的真实表现 | Windows 浏览器 via CDP attach |

> [!warning] attach 是有状态的
> attach 模式用的是 Windows 上那个浏览器的真实 profile（登录态、Cookie）。这既是它的价值也是风险；务必用独立 `--user-data-dir`，别指着日常 profile 跑自动化。

## 5 MarkItDown MCP 与 PDF 读取

### 5.1 事实

- 包名/启动：**`uvx markitdown-mcp`**（Python 生态，**不在 npm**）
  - 注：`markitdown-mcp` 这个 MCP server 包自带 `markitdown[all]` 依赖
  - 而裸 `uvx markitdown` **不带** `[pdf]` extra，读 PDF 会报 `MissingDependencyException`
- 传输：**默认 stdio**；`--http`/`--sse` 才切 HTTP（`--host` 默认 `127.0.0.1`，`--port` 3001）→ 与 DSH `dsh-mcp-client` 的 `stdio` 传输兼容
- 工具：**只有 1 个** `convert_to_markdown`，参数只有 `uri`（string）
  - 支持 `http:` / `https:` / `file:` / `data:` URI
  - **本地文件必须用 `file:///abs/path`**；裸路径会被**拒绝**（实测）：

    ```text
    Unsupported URI scheme: /etc/hostname. Supported schemes are: file:, data:, http:, https:
    ```

  - 相对路径与 UNC 路径同样不支持；**没有**传原始字节/上传的参数
- 版本：PyPI 最新 `0.0.1a7`（2026-09-14），classifier 为 `Development Status :: 4 - Beta`
- 需要 API key 吗：**纯本地文件转换不需要**（PDF 走 pdfminer/pdfplumber）—— 源码只传 `enable_plugins`，**从不构造 `llm_client`**，故无密钥路径；联网仅发生在 http(s)/YouTube、音频转写与 Azure 可选路径

实测转换结果：

| 输入 | 结果 |
|---|---|
| 文本型 PDF | ✅ 抽出预置的文本层内容 |
| DOCX | ✅ 含标题、段落、表格 |
| XLSX | ✅ `\| col \| val \|` 表格形式 |
| **图片型扫描 PDF** | ⚠️ **输出空字符串**（`isError: false`，内容为空） |

### 5.2 关键限制：不做 OCR

**MarkItDown 不做 OCR。** PDF 转换器源码用 `pdfminer.high_level.extract_text` 与 `pdfplumber`，二者都只抽**已存在的文本层**；扫描件没有文本层 → 空输出。关键细节：这是 **`isError: false` 的静默空串**，不是报错 —— 模型看到空结果，不会知道「其实是扫描件」，容易误判成「这文件没内容」。

扫描件的 OCR 出路在 markitdown 生态里只有两条，都**不适用于纯本地无密钥场景**：Azure Document Intelligence（云端、要密钥）或单独的 `markitdown-ocr` 插件（需 LLM vision 客户端）；而 **MCP server 从不构造 `llm_client`**，所以经 markitdown-mcp 走扫描件永远拿不到 OCR。扫描件仍须走 `pdf` 技能 + tesseract（或先转图再识别）。另外它对图片只读 EXIF/元数据，不做图像文字识别。

### 5.3 与现有能力的关系

- `firecrawl_parse`（已挂的 Firecrawl MCP，本可解析本地 PDF）**在托管版下实际不可用**：

  ```text
  firecrawl_parse requires FIRECRAWL_API_URL to be set to a self-hosted Firecrawl API instance
  ```

  托管版不提供本地文件解析。
- 已装 skill `pdf` / `docx` / `xlsx` 能读这些格式，但**每次要写脚本**（`uv run --with pypdf python ...`）。
- 系统若已装 `pdftotext`（poppler），纯文本 PDF 一条命令搞定。
- DSH 的 `read` 工具**明确不支持 PDF**：「`read` 只处理 UTF-8 文本文件；图像使用独立的 `read_image` 工具；**PDF、音频和视频仍延期处理**」。

### 5.4 结论：建议装，但定位要清楚

**值得装的理由**：1 个工具、极小 schema（token 开销可忽略），换来**一个统一入口**读 PDF/DOCX/XLSX/PPTX/HTML/EPub/ZIP/音视频 → markdown，覆盖 DSH `read` 明确不支持的格式，且**不需要每次写脚本**。这是 skills 路线（要写代码）和 `pdftotext`（只管 PDF）都给不了的便利。

**不要指望它**：扫描件 OCR。扫描件仍要走 `pdf` 技能 + tesseract。

> [!warning] 安全边界
> MarkItDown 的定位是**本地可信 agent 的本地工具**，README 原文自陈：
>
> > MarkItDown performs I/O with the privileges of the current process. … Sanitize your
> > inputs in untrusted environments.
> > The server does not support authentication, and runs with the privileges of the user running it.
> > … meant for **local use**, with local trusted agents … **DO NOT bind the server to other interfaces.**
>
> stdio + `127.0.0.1` + 可信本地没问题，但**不要**给它开 `--http` 并暴露到 LAN。

**成本注意**：`markitdown[all]` 依赖较重（含 onnxruntime、magika、pandas 等），`uvx` 首次拉取约 100MB+；之后命中缓存则秒起。

### 5.5 建议配置

追加到 `~/.dsh/profiles/web/cordis.patch.yml` 的 insert 列表：

```yaml
    # MarkItDown — 本地文件 → markdown（PDF/DOCX/XLSX/PPTX/HTML/EPUB/ZIP…）
    # 1 个工具 convert_to_markdown，参数只有 uri（本地文件须 file:///abs/path）。
    # 注意：不做 OCR，扫描件静默返回空串（isError:false）；扫描件请走 pdf 技能 + tesseract。
    - id: mcp-markitdown
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: markitdown
        transport: stdio
        command: /home/<user>/.local/bin/uvx
        args:
          - 'markitdown-mcp==0.0.1a7'
```

**关于本配置的两条硬约束**：

1. **`command` 用 `uvx` 的绝对路径**（如 `/home/<user>/.local/bin/uvx`）—— 比 node/npx 那条链简单：`uvx` 是自包含二进制，**不依赖 PATH 找 node**，也**不受 fnm multishell 目录失效影响**。
   注：`uvx markitdown-mcp` 直接可用，**不需要** `--from markitdown-mcp`（该包自带 `markitdown[all]` 依赖；而裸 `uvx markitdown` 不带 `[pdf]` extra，读 PDF 会报错）。
   锁定 `==0.0.1a7` 是为了可复现 —— 该包目前只有 a1–a4/a7，仍属 alpha。
2. **`env` 可不写**：`uvx` 只需要 `HOME` 来定位 `~/.cache/uv` 与 `~/.local/share/uv/tools`，而 DSH 的 `scrubbedParentEnv()` 只清洗 `/KEY|PASSWORD|SECRET|TOKEN/i` 与 `DSH_*` 前缀的变量，**`HOME` 会保留**。（对照 Firecrawl 那条必须显式传 `FIRECRAWL_API_KEY`，正因为它匹配 `KEY`。）

> [!tip] 生效方式
> 改完配置需 DSH 重启后生效。验证方式：让模型对一个本地 PDF 调 `mcp__markitdown__convert_to_markdown`。

## 6 对旧结论的修正

在 0.1.5-rc.1 时期写的调研（见 `[[DSH 是否内置 Playwright]]`，2026-09-15）中「本机没有这些包」等判断**已被后续升级取代**：升级到 0.1.6-alpha.2 后，侧边栏浏览器已在安装树中，但 Browser Use 系列**仍然不在**默认安装里（npm 上有，需显式挂载）。该文其余关于 provider 架构的分析仍然有效。

## 7 参考来源

- GitHub Releases（唯一 CHANGELOG 权威，`CHANGELOG.md` 不存在）：
  - https://api.github.com/repos/deepseek-ai/deepseek-harness/releases
  - https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.6-alpha.1
- Browser Use 文档与 provider：
  - https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/subsystems/browser-use.md
  - https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/subsystems/computer-use.md
  - https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/experimental/browser-use-playwright-mcp/README.md
- npm registry（dist-tags 查询）：
  - https://registry.npmjs.org/%40deepseek-ai%2Fdsh-browser-use
  - https://registry.npmjs.org/%40deepseek-ai%2Fdsh-experimental-browser-use-playwright-mcp
  - https://registry.npmjs.org/%40deepseek-ai%2Fdsh-experimental-browser-use-runtime
- 侧边栏浏览器（用户 UI，非工具）本地 README：`.../@deepseek-ai/dsh-client-ui-sidebar-browser/README.md`
- `sidebar_open` 第三方来源：
  - `~/.dsh/profiles/web/node_modules/dsh-better-sidebar/README_EN.md`
  - `~/.dsh/profiles/web/node_modules/dsh-better-sidebar/src/agent-opens.ts`
- MarkItDown：
  - https://github.com/microsoft/markitdown
  - 本地实测：`uvx markitdown-mcp` 的 `tools/list` 与 `convert_to_markdown`（PDF/DOCX/XLSX/扫描件）

## 8 本机实测环境与数值

> 以下为**单机单次**实测记录，仅作复现参考；路径中的用户名已占位化。

| 项 | 值 |
| --- | --- |
| OS / 发行版 | WSL2 Debian |
| DSH | `@deepseek-ai/dsh@0.1.6-alpha.2`（npx 缓存 checkout：`/home/<user>/.npm/_npx/<hash>/`） |
| WSL 侧浏览器 | apt 安装 `chromium 152.0.7977.82`（`/usr/bin/chromium`） |
| Windows 侧浏览器 | Helium（Chromium 分支），路径 `/mnt/c/Users/<user>/AppData/Local/imput/Helium/Application/chrome.exe` |
| Windows 浏览器 CDP 版本 | `Chrome/152.0.7977.82`（Helium 基于此版本） |
| WSL 网络模式 | mirrored + `hostAddressLoopback = true`（`/mnt/c/Users/<user>/.wslconfig`） |
| `uv` | `0.12.5`（`uvx` 位于 `/home/<user>/.local/bin/uvx`） |
| `markitdown-mcp` | `0.0.1a7`（PyPI，2026-09-14 发布） |
| `pdftotext` | poppler `25.03` |
| `dsh-better-sidebar` | `0.19.1`（`~/.dsh/profiles/web/node_modules/`） |

实测数值与结论：

- CDP attach 后 `browser_evaluate` 返回：`platform: "Win32"`、`cores: 14`、UA 含 `Windows NT 10.0; Win64; x64`、`HeadlessChrome/152` ⇒ 确认由 Windows 端浏览器执行。
- `executablePath` 指向 `/mnt/c/.../chrome.exe` 的 launch 实测报错：`browserType.launch: Target page, context or browser has been closed`。
- MarkItDown 文本型 PDF 抽出预置探针串 `DSH PDF parse probe: MARKITDOWN-CANARY-9917`；扫描件 PDF 返回 `isError: false` + 空内容。
- `uvx` 首次拉取 `markitdown[all]` 约 100MB+；命中缓存后启动为秒级。

## 9 相关

- [[DSH 是否内置 Playwright]]
- [[DSH 第三方插件安全审计]]
