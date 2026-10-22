---
tags: [DSH, 插件, pnpm, 认证]
title: DSH CodeArts 认证插件安装
aliases: [dsh-codearts-auth-install]
date created: 2026-10-11 19:42:16
date modified: 2026-10-14 23:39:00
---

# DSH CodeArts 认证插件安装

> [!abstract] 适用场景
> 记录从 git 仓库安装 DSH 第三方插件 `dsh-codearts-auth` 的完整口径：首次 add 必失败以取得 pnpm 期望的 `allowBuilds` 键、装完的验证项、卸载与残留清理、以及上游 tag 反 semver 的坑。适用于任何「从 git 装一个带构建脚本的 DSH 插件」的场景，不限于本插件。读完能独立完成安装、验证与彻底卸载。

## 1 背景与适用条件

**DSH** 的插件通过 `dsh plugin --profile <name> <pnpm args>` 管理，该子命令把剩余参数**原样转发给 profile 目录下的 pnpm**（`@deepseek-ai/dsh/lib/bin.js:115-127`：`argument("[args...]", "pnpm arguments, forwarded verbatim")`），因此 `add <pkg>` / `remove <pkg>` / `why <pkg>` / `list` 都可用。

`dsh-codearts-auth` 是一个第三方 DSH 插件（上游 Gitee 仓库），注入由 dsh base 提供的 `credentials`、`commands` 和 `llm` 服务，并起一个 OpenAI 兼容网关。

上游：https://gitee.com/iJetLi/deepseek-harness-codearts

> [!tip] Gitee 正文要取 raw
> Gitee 页面本体经 `web_fetch` 只能拿到导航壳，README 正文必须走 raw 域名：`https://raw.giteeusercontent.com/iJetLi/deepseek-harness-codearts/raw/master/README.md`。

版本敏感性：以下结论基于 **`@deepseek-ai/dsh@0.2.1-alpha.2`** + **`pnpm 12.6.0`** + **`node v26.9.0`**，更新版本可能变化（尤其 pnpm 大版本会改变报错分支）。

前置条件：

- 可写 `~/.dsh`（若在受限沙箱下会只读，见 §7）。
- 已装 pnpm 与 node。
- 该插件是 git-hosted 且带 build 脚本，故必须走 `allowBuilds` 放行。

适用范围：从 git 安装带构建脚本的 DSH 插件、以及此类插件的卸载/残留清理。**不适用**于 npm registry 上的普通插件（无 git prepare 步骤）。

## 2 结论摘要

1. README 的「三步法」有效，但 **pnpm 12.6.0 走的是 pnpm 11.x 那条分支**（`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`），不是 README 先列的 pnpm 10.x 分支（`ERR_PNPM_INVALID_VERSION_UNION`）。
2. 放行键**必须带 `#<commit>`**；pnpm 自己会把完整键打印出来，照抄即可。
3. 装完**无需手动改 `package.json` 的 `dsh.profile.bundles`** —— dsh 有自动 reconcile。
4. 卸载只需 `dsh plugin --profile web remove dsh-codearts-auth`，bundle 行同样自动移除。
5. 安装后**当前 dsh 进程内立即生效**（实测网关已在监听），但 Jet Hub 设置页的 UI 需要刷新浏览器才带上客户端 bundle。
6. 插件在 `$DSH_HOME` 下留 **3 处**状态：`~/.dsh/jet-hub/`（7 个文件）、`~/.dsh/openai-gateway/api-key`、`~/.dsh/cache/opencode-capabilities.json`。**卸载不会回收**，且第三处不在 `jet-hub/` 里。
7. ⚠️ **上游 tag 反 semver**：`0.2.0-alpha.6` 比 `0.2.0-rc.5` **新**（晚 5 小时、相隔 21 提交）。选 tag 必须用 git 谱系或 tag 日期，别按版本号大小猜（见 §6.1）。

## 3 安装（方式一：从 git 仓库）

### 3.1 首次 `add` 必然失败，为的是拿到 pnpm 期望的键

```sh
dsh plugin --profile web add "https://gitee.com/iJetLi/deepseek-harness-codearts.git"
```

报错（实测原文）：

```text
Error: ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED

  × adding a new package
  ╰─▶ The git-hosted package "dsh-codearts-auth@0.2.0-rc.3" needs to execute
      build scripts but is not in the "allowBuilds" allowlist.
  help: Add the package to "allowBuilds" in your project's pnpm-workspace.yaml
        to allow it to run scripts. For example:
        allowBuilds:
          dsh-codearts-auth@git+https://gitee.com/iJetLi/deepseek-harness-
        codearts.git#<commit>: true
```

> [!warning] 报错里的键会被终端折行
> 上面 `deepseek-harness-` / `codearts.git` 被断成两行。拼接时必须去掉折行 —— 直接复制粘贴会装不上。

### 3.2 写进 profile 的 `pnpm-workspace.yaml`

路径：`~/.dsh/profiles/web/pnpm-workspace.yaml`。在原有 `node-pty: true` 旁边追加：

```yaml
allowBuilds:
  node-pty: true
  dsh-codearts-auth@git+https://gitee.com/iJetLi/deepseek-harness-codearts.git#<commit>: true
```

### 3.3 重跑即成功

```sh
dsh plugin --profile web add "https://gitee.com/iJetLi/deepseek-harness-codearts.git"
```

这次 pnpm 在临时目录里跑 `prepare` → `pnpm build:all`（= `build && build:assets && build:client`），日志可见三步：

```text
. prepare: $ tsc -p tsconfig.json
. prepare: $ node scripts/copy-assets.mjs
. prepare: Wrote /tmp/.tmpXXXXXX/lib/qoder-auth-wasm.wasm
. prepare: $ node plugin-src/client/build.mjs
. prepare: Wrote /tmp/.tmpXXXXXX/lib/client/jet-hub.js
```

退出码 0（尾部会带一条 `dsh-find-plugin@0.4.0` peer 不兼容告警，**与本插件无关**）。

## 4 安装后验证

| 检查项 | 命令 / 位置 | 期望结果 |
| --- | --- | --- |
| 依赖落地 | `node_modules/dsh-codearts-auth/` | pnpm 报 `+ dsh-codearts-auth <version>` |
| git 锁 | `pnpm-lock.yaml` | `version: git+…codearts.git#<commit>`，`resolution: {commit: <commit>, type: git}` |
| 宿主产物 | `lib/index.js` | `node --check` 通过；`import()` 得 `Config,apply,inject,makeReadImage,makeReadImageRequest,name` |
| 客户端 bundle | `lib/client/jet-hub.js` | `node --check` 通过 |
| bundle 行 | `package.json` → `dsh.profile.bundles` | 末尾自动追加 `dsh-codearts-auth` |
| profile 树 | `dsh --profile web --dump-config` | 出现 `# == dsh-codearts-auth` / `- id: codearts-auth` / `name: dsh-codearts-auth` |
| 运行时挂载 | `(ss -ltn) \| grep 8326` | `LISTEN 127.0.0.1:8326`，owner = 当前 `dsh web` pid |
| 网关鉴权 | `curl :8326/v1/models` | 无头 → **401**（预期）；带 `Bearer <YOUR_API_KEY>` → **200** |
| 独有路由 | `/v1/models` 响应 | 出现 `aggregate/auto`、`jet-hub-auto/auto`（本插件独有命名空间） |
| 状态落盘 | `~/.dsh/jet-hub/state.json`、`~/.dsh/openai-gateway/api-key` | 均已生成 |

### 4.1 `package.json` 的 bundle 行是自动加的

`@deepseek-ai/dsh-plugin-manager/lib/index.js` 的 `reconcile()`（`:264-293`）在 pnpm 跑完后执行：把新依赖里声明了 `dsh.bundle` 的包 push 进 `dsh.profile.bundles`（`:274-283`），并 filter 掉已不在 dependencies 里的旧行（`:270-273`）。`activateNewBundles` 默认非 false（`:696`），所以 `dsh plugin add/remove` 都会自动维护该清单。

**推论**：装/卸都不需要手编 `package.json`；手编反而可能被下一次 reconcile 覆盖。

### 4.2 「进程内立即生效」的口径

机制物证：`package.json` 里有 `"patchReload": "live"` —— profile 层补丁是**热加载**的，所以 bundle 行的新增被运行中的进程直接拾取，**宿主侧无需重启**。

> [!warning] 两条边界
> - **客户端 bundle 不会自动重载**：Jet Hub 设置页的 UI（`lib/client/jet-hub.js`）需要**刷新浏览器页面**才生效。
> - **卸载不走这条路**：`remove` 只改磁盘，进程不会热卸载已加载的插件，**必须重启**（见 §5.2）。

### 4.3 一个 OCR 误差（备忘）

README 原文是「插件注入由 dsh base 提供的 `credentials`、`commands` 和 **`llm`** 服务」，截图 OCR 出的是 `lim`。

## 5 卸载

### 5.1 命令

```sh
dsh plugin --profile web remove dsh-codearts-auth
```

之后 dsh 走同一个 `reconcile()`：依赖摘除 + bundle 行自动移除。

### 5.2 必须重启

卸载只改磁盘，**不会热卸载已加载的插件**。当前 `dsh web` 进程仍持有该插件（含 8326 网关）。

```sh
kill <dsh web 的 pid>     # pid 用 ps 查，或 Ctrl+C 前台进程
dsh web
```

### 5.3 卸载后验证

```sh
dsh plugin --profile web list | grep codearts          # 期望无输出
python3 -c "import json;print('dsh-codearts-auth' in json.load(open('$HOME/.dsh/profiles/web/package.json'))['dsh']['profile']['bundles'])"
  # 期望 False
(ss -ltn 2>/dev/null || netstat -ltn) | grep 8326 || echo "8326 已关闭"
```

## 6 升级注意

带 `#<commit>` 的精确键**在 commit 变化后失效**：每次重新 `add` 拉到新 commit，就要按新报错里的键替换。嫌烦可用两代通用写法（但放宽了权限，放行该 profile 里**所有**依赖的构建脚本）：

```yaml
dangerouslyAllowAllBuilds: true
```

> [!warning] 不要省略 `#<commit>`
> **不要**写 `dsh-codearts-auth@git+https://gitee.com/…`（不带 `#<commit>`）—— README 明确这个「最自然」的键在两代 pnpm 上都不工作。

### 6.1 ⚠️ 上游 tag 反 semver，必须用 git 谱系验证「谁更新」

按 semver 直觉 `0.2.0-rc.5` > `0.2.0-alpha.6`，**但事实相反**。

| tag | commit | tag 日期（UTC） |
| --- | --- | --- |
| `0.2.0-rc.5` | `72f40679` | 2026-10-10 **11:26** |
| `0.2.0-alpha.6` | `04de37c1` | 2026-10-10 **16:31** ← 晚 5 小时 |

```sh
$ git merge-base --is-ancestor 72f4067 04de37c && echo YES
YES          # rc.5 是 alpha.6 的祖先 ⇒ alpha.6 更新，相隔 21 个提交
```

⇒ **别按版本号大小选 tag**。可靠口径（任选其一）：

```sh
  # A. 按 tag 日期排序
git for-each-ref --sort=-creatordate \
  --format='%(creatordate:iso8601)  %(refname:short)' refs/tags | head

  # B. 谱系判定
git merge-base --is-ancestor <旧commit> <新commit> && echo "新commit 更新"

  # C. Gitee API（含日期，无需克隆）
curl -s "https://gitee.com/api/v5/repos/iJetLi/deepseek-harness-codearts/tags?per_page=100"
```

> [!warning] `package.json` 的 `version` 字段不可信
> `rc.5` 与 `alpha.6` 两个 tag 里它都写着 `0.2.0-rc.3`（上游未更新）。判断实际版本**只能看 tag 或 commit**。

### 6.2 按 tag 更新（可复现）

```sh
dsh plugin --profile web add "https://gitee.com/iJetLi/deepseek-harness-codearts.git#<tag>"
```

流程与首次安装**完全相同**（含「首次必失败 → 更新 `allowBuilds` 键 → 重跑」三步）。

⚠️ **master 可能比最新 tag 更靠前**。实测更新当天 `origin/master` HEAD 比 `alpha.6` 领先 8 个提交（含 `fix(auto)` 用量徽标/计费倍率、`fix(gateway)` 413 与 keep-alive、`fix(minimax)` 请求级换号等修复）。要追 master 就用 `#<master-sha>` 或省略 `#`（跟分支头，但不可复现）。

### 6.3 alpha.6 相对 rc.5 的实质变化

135 文件 / +20928 −6452 行的大重构：新增**能力注册表**（`src/provider-registry.ts`，注释自述为「有哪些 provider、各自有什么能力」的**唯一真相源**），把 13 处同构分支收敛为查表（`createCredentialResolver` 收敛 12 个闭包、`createModelCatalog` 收敛 3 个目录方法、`credits.*`/`onboarding`/临期折算/永久积分白名单改查表、`getAvailableAccount` 泛型化删 19 处收窄断言）。

**可观测接口变化**：

- 宿主导出 6 → **7 个**，新增 `probeById`
- RPC 移除 3 个遗留标签 `'buddy'` / `'codearts'` / `'workbuddy'`，改走通用 `provider.status`（已确认新版客户端 bundle 对这三者的引用为 **0**，改用 `provider.status`，前后端对齐）
- 未知 RPC 方法兜底返回 `{ ok:false, error:{ code:'bad-request', message:'unknown method: …' } }`

## 7 踩坑清单

| 坑 | 现象 | 处置 |
| --- | --- | --- |
| 沙箱只读 | `EROFS: read-only file system, open '…/package.json.lock'` | `~/.dsh` 在 workspace-write 下只读，需 `danger-full-access` 一次性放行 |
| 折行键 | 照抄报错里断成两行的键 → 装不上 | 拼接 `deepseek-harness-codearts.git` 再去重 |
| 误判分支 | pnpm 12 走 11.x 分支，README 先列的是 10.x | 以 pnpm **实际打印的键**为准，不按版本号猜 |
| 误以为要手编 bundles | — | `reconcile()` 会自动维护，别手编 |
| 以为装完要重启 | 宿主侧已生效 | 只需刷新浏览器；卸载则**必须**重启 |
| `repo` 字段 | 与 `type: git` 并列出现 | pnpm 12 锁文件新写法，正常 |
| ⚠️ tag 反 semver | 按版本号选 tag → 选到旧的 | 用 `git for-each-ref --sort=-creatordate` 或 `git merge-base --is-ancestor` 判谱系（§6.1） |
| ⚠️ `version` 字段陈旧 | 两个 tag 里都写 `0.2.0-rc.3` | 只看 tag / commit，不看 `package.json` 的 `version` |
| ⚠️ master 领先最新 tag | 按 tag 装会漏掉 master 上的修复 | 要最新就用 `#<master-sha>`，但牺牲可复现性（§6.2） |

## 8 卸载**不会**清掉的残留

`remove` 只动 pnpm 依赖；下列位置由插件运行时自行写入、**不回收**：

| 位置 | 内容 | 处理建议 |
| --- | --- | --- |
| `~/.dsh/jet-hub/state.json` | 账号池、`disabledModels`、`gatewayEnabled`、`providerOrder`、`aggregateRejections`、`loomyPermanentLocked` | 留着重装即复用 |
| `~/.dsh/jet-hub/token-ledger.json` | Token 历史日聚合（UTC+8 日界，90 天） | 同上 |
| `~/.dsh/jet-hub/permanent-locks.json` | 永久积分锁定表 | ⚠️ README 明确「**不与账号池同放**」，避免多 profile 互相覆盖 |
| `~/.dsh/jet-hub/ui-preferences.json` | 用量徽标显示偏好 | 同上 |
| `~/.dsh/jet-hub/auto-checkin.json` | 自动签到记账 | 同上 |
| `~/.dsh/jet-hub/dead-models.json` | 死模型表 | 同上 |
| `~/.dsh/jet-hub/gemini-sigs.json` | Gemini 签名缓存 | 同上 |
| `~/.dsh/cache/opencode-capabilities.json` | OpenCode 能力缓存 | ⚠️ **不在 `jet-hub/` 下**，`rm -rf ~/.dsh/jet-hub` 清不掉；**且 `~/.dsh/cache/` 是 DSH 共享缓存目录**（内含 `attachments/`），只能删这一个文件，别整个删 |
| `<token-ledger.json>.lock/owner.json` | Token 账本的跨进程写锁（pid/nonce/createdAt） | 瞬时锁目录，通常用完即清 |
| `~/.dsh/openai-gateway/api-key` | 网关 Bearer 密钥（明文，`0600`） | 想彻底清就删 |
| `~/.dsh/.credentials.yaml` | 账号凭据记录 | ⚠️ 见下 |
| `~/.dsh/profiles/web/pnpm-workspace.yaml` 的 `allowBuilds` 键 | 那条带 `#<commit>` 的放行项 | 变死键，碍眼但无害 |

> `jet-hub/` 下的 7 个文件名取自 `lib/*.js` 的字面量常量（`AUTO_CHECKIN_FILE` / `BADGE_PREFERENCES_FILE` / `DEAD_MODELS_FILE` / `GEMINI_SIG_FILE` / `PERMANENT_LOCKS_FILE` / `TOKEN_LEDGER_FILE` 六个，加 `state.json` 直接在 `join(home, 'jet-hub', 'state.json')` 里硬写）；实测当时只生成了 `state.json` 与 `openai-gateway/api-key`，其余按需惰性创建。
>
> ⚠️ `captcha-carrier` **不是磁盘文件**，而是插件的 HTTP 路由 `/api/jet-hub/captcha-carrier`（`lib/captcha-carrier-server.js`），别当成状态文件去找。

### 8.1 彻底清干净

```sh
rm -rf ~/.dsh/jet-hub ~/.dsh/openai-gateway
rm -f  ~/.dsh/cache/opencode-capabilities.json    # ← 只有这一个文件，别删 ~/.dsh/cache/
```

> [!warning] 三条硬约束
> 1. **清 `jet-hub/` 前先导出备份**。`state.json` 有账号池，`~/.dsh/.credentials.yaml` 里是对应凭据原文；只删 `jet-hub/` 会留下**孤儿凭据**。要连凭据一起清，先在 Jet Hub 面板用「**删除**」按钮逐个删账号（走正规路径同步清凭据），再卸载插件。
> 2. **别手编 `.credentials.yaml`** —— 那是 dsh 凭据库托管文件（顶层 `version` / `records` / `refs`）。
> 3. **别 `rm -rf ~/.dsh/cache/`** —— 那是 DSH 共享缓存目录，同时装着 `attachments/` 等非本插件数据。

`allowBuilds` 那条想删就删，注意保留同级 `node-pty: true`。

## 9 参考

- 上游 README（安装/卸载/网关/备份章节）：https://gitee.com/iJetLi/deepseek-harness-codearts
- 插件实现细节：`~/.dsh/profiles/web/node_modules/dsh-codearts-auth/lib/`（`openai-gateway/config.js:2` 的 `DEFAULT_GATEWAY_PORT = 8326`）
- bundle 自动 reconcile：`@deepseek-ai/dsh-plugin-manager/lib/index.js:264-293`
- `dsh plugin` 转发实现：`@deepseek-ai/dsh/lib/bin.js:115-127`

## 10 本机实测环境与数值

> 以下为**单机单次**实测记录，仅作复现参考；路径中的用户名已占位化。

| 项 | 值 |
| --- | --- |
| 实测时间 | 2026-10-10 ~ 2026-10-11 |
| OS | Linux / WSL2 |
| DSH | `0.2.1-alpha.2`（npx 缓存 checkout：`/home/<user>/.npm/_npx/<hash>/`） |
| pnpm | `12.6.0`（`/home/<user>/.local/share/pnpm/bin/pnpm`） |
| node | `v26.9.0`（fnm aliases/default） |
| profile | `web` → `~/.dsh/profiles/web` |
| 安装方式 | README「方式一：从 git 仓库安装（推荐）」 |
| 落地版本字段 | `dsh-codearts-auth@0.2.0-rc.3`（`package.json` 的 `version`，**上游陈旧、不可信**，见 §6.1） |
| 当时 tag | `0.2.0-alpha.6`（2026-10-11 更新；首次安装时为 `0.2.0-rc.5`） |
| 锁定 commit（首次） | `72f4067922e9052903c1551e1f7dac4662d4dc50` |
| 锁定 commit（更新后） | `04de37c12528a177751d35844bd2bcdfb80ef8f4` |

其它实测数值：

- 客户端 bundle `lib/client/jet-hub.js` 体积 530,872 B。
- `opencode-capabilities.json` 实测 24,456 B（安装时刻生成）。
- 网关 api-key 文件为明文、43 B、权限 `0600`。
- 「进程内立即生效」时间线：安装完成于 `23:58:59`（`package.json` mtime），所在 `dsh web` 进程启动于 `23:53:46`（**进程启动早于安装**），但 `23:59:01` 已生成 `openai-gateway/api-key` 且 `8326` 在监听。
- 更新当天 `origin/master` HEAD 为 `93d2023`，比 `alpha.6` 领先 8 个提交。

## 11 相关

- [[cc-safety-net 命令安全网]]
- [[DSH 第三方插件安全审计]]
- [[pnpm]]
