---
tags: [DSH, Agent Teams, AGENTS.md, 上下文工程]
title: DSH Agent Teams 与 AGENTS.md 纪律
aliases: [dsh-agent-teams-agents-md]
date created: 2026-10-04 15:55:27
date modified: 2026-10-14 23:39:00
---

# DSH Agent Teams 与 AGENTS.md 纪律

> [!abstract] 适用场景
> 回答一个具体的工程问题：Agent Teams 已启用时，是否还需要在全局 `AGENTS.md` 里复述团队协作纪律？适用于维护 DSH 全局/项目级 `AGENTS.md`、或评估「哪些内容该写进指令文件」的场景。读完可以理解 DSH 的 prompt 注入层级、为什么某些纪律写入即重复，以及 Agent Teams profile 下两套委派面并存这个盲区。

## 1 背景与适用条件

**DSH** 是一个可扩展的 AI agent 运行时。它把工作区指令文件（`AGENTS.md` / `CLAUDE.md`）作为 **user-role 的 durable baseline** 消息注入，同时把平台级策略作为 **system prompt 段**注入。**Agent Teams** 是 DSH 的一个实验特性（`@deepseek-ai/dsh-experimental-agent-team` 系列包），启用后可委派 teammate、查看成员与共享任务。

本文讨论的是**指令文件的写作决策**：哪些内容值得写进 `AGENTS.md`，哪些写了也是重复。参考框架是 `writing-for-agents` 的两条判据 —— **duplication**（与既有注入重复）与 **sediment**（上游改词后文档失效）。

版本敏感性：以下结论基于 **`@deepseek-ai/dsh@0.2.1-alpha.1`** 与 **`@wenaixi/dsh-superpower@7.2.1`**，更新版本可能变化（尤其 profile 与 preset 的文件布局）。仓库没有 `CHANGELOG.md`，权威来源是 GitHub Releases。

前置条件：能读取 DSH 安装树（`node_modules/@deepseek-ai/`）与 `~/.dsh/profiles/<profile>/` 下的配置文件。适用于判断「全局指令文件该写什么」；**不适用**于替代上游文档 —— 机制细节应以安装树源码为准。

## 2 结论

**不需要在全局 AGENTS.md 写 Agent Teams 的协作纪律。** 三条独立理由，各有一手证据：

1. **该纪律已由 harness 每轮作为 system prompt 段注入**（`team:policy`，order 600，Lead 与每个 teammate 都收到）⇒ 写入即 duplication。
2. **即使写了也改变不了行为** —— AGENTS.md 以 user-role baseline 注入且自述 `do not override system, developer, or direct user instructions`；其自身优先级约定也把全局文件排在第 3 位。两个层级都劣于 `team:policy`。
3. **真正查不到的是另外两件事**，而它们与该纪律无关：本 profile 下 subagent 与 teammate **同时可用**（与 bundle README 相反）；强制的 Superpowers 流程对 teammate **零覆盖**。

字节预算不是反对理由：上限 65536 B，实测文件 11324 B，占用 17%。

## 3 结论摘要（可核查条目）

1. `@deepseek-ai/dsh-experimental-tool-agent-team` 在 `lib/index.js:21` 定义 `const POLICY`，`:238` 注册为 system prompt 段 `team:policy`，段位 `TEAM_POLICY: 600`（`dsh-system-prompt/lib/index.js:14`）。
2. 该段**对 Lead 与每个 teammate 都注入**，且**全仓唯一** —— 全树 grep `explicitly asks to use Agent Teams` 仅一处命中。
3. AGENTS.md 是 **user-role durable baseline**，非 system prompt；注入器自述不覆盖 system 指令（`dsh-agent-instructions/lib/index.js:114`）。
4. 全局 AGENTS.md 自定的优先级里，全局文件位列第 3 —— 低于用户当回合指令与项目根 AGENTS.md。
5. **盲区 A**：`dsh-experimental-agent-team-profile` 的 `disabled: true` 只写在 **host 平面**，而四个 subagent 行在 **preset 平面**被 `standard.patch.yml:84-118` 重新声明 ⇒ 禁用落空，两套委派面并存。其 `README.zh.md` 自称「普通 subagent 委派…会被禁用」**与实测不符**。
6. **盲区 B**：`@wenaixi/dsh-superpower@7.2.1` 的 15 个 `SKILL.md` 对 `teammate|Agent Team|spawn_teammate|team_task` **零命中**；`subagent-driven-development/SKILL.md:28` 的判据图只有「内联执行或没有 subagent 工具」二分叉，无 teammate 分支。
7. 附带发现（当时**未**修改）：全局 AGENTS.md 三处技能计数漂移，写「14 个 / 共 38 个」，实为 **15 / 39**。

## 4 版本事实

| 项 | 值 |
| --- | --- |
| `@deepseek-ai/dsh` | `0.2.1-alpha.1` |
| `@deepseek-ai/dsh-experimental-agent-team` | `0.2.1-alpha.1` |
| `@deepseek-ai/dsh-experimental-tool-agent-team` | `0.2.1-alpha.1` |
| `@deepseek-ai/dsh-experimental-agent-team-profile` | `0.2.1-alpha.1` |
| `@wenaixi/dsh-superpower` | `7.2.1` |
| `dsh-system-prompt` / `dsh-agent-instructions` | `0.2.1-alpha.1` |
| `agent-instructions` 字节预算 | `maxBytes: 65536`（`dsh-base/cordis.patch.yml:292`） |
| 实测全局 AGENTS.md | 11324 B / 162 行，md5 `ce15fb51c13ba8b2e903563150820ebe` |

实测环境中 `~/.dsh/profiles/` 下**只有 `web` 一个 profile**，其 `package.json` 的 `dsh.profile.bundles` 明确包含 `@deepseek-ai/dsh-experimental-agent-team-profile` ⇒ 「智能体团队」在该环境已启用。

## 5 证据一：协作纪律已由 harness 每轮注入

`@deepseek-ai/dsh-experimental-tool-agent-team@0.2.1-alpha.1` 的 `lib/index.js:21`，逐字开头：

```js
const POLICY = `Agent Teams is available in this session, but create teammates only when the user explicitly asks to use Agent Teams or teammates.
```

注入点 `lib/index.js:236-241`（逐字，含外层 `try {`）：

```js
	try {
		register(scoped.systemPrompt.section({
			name: "team:policy",
			order: scoped.systemPrompt.getSectionOrder("TEAM_POLICY"),
			text: POLICY
		}));
```

- 段位常量：`dsh-system-prompt/lib/index.js:14` → `TEAM_POLICY: 600`（类型侧 `lib/types/index.d.ts:117: readonly TEAM_POLICY: 600;`）。
- `SECTION_ORDERS` 中 `PLAN_POLICY: 500`、`TEAM_POLICY: 600`、`TOOL_SUBAGENT: 2800`，故团队策略排在工具说明之前、计划策略之后。

**注入范围（关键）**：同文件 `maybeInstall`（`:539-543`）门控为

```js
if (installed.has(agent) || ctx.agentTeams.tryMembership(agent) === void 0) return;
installed.set(agent, install(agent, ctx, resolved));
};
for (const agent of ctx.agents.list()) maybeInstall(agent);
```

对 `ctx.agents.list()` 的全部现存 agent，以及 `ctx.on("agent/created")` 的后续 agent 安装 ⇒ **Lead 与每个 teammate 收到同一份 POLICY**。

**全仓唯一性**：对 `node_modules/@deepseek-ai/` 全树 grep 字符串 `explicitly asks to use Agent Teams`，唯一命中即 `dsh-experimental-tool-agent-team/lib/index.js:21`。该路由规则不存在第二份，也没有其它 prompt 文本竞争。

POLICY 已覆盖的运作细节（**全部无需在 AGENTS.md 重述**）：Lead 与 teammate 共享工作目录、编辑立即可见；拆分 write scope 并记到共享任务；写域重叠只是 advisory 不是锁；改文件优先 read/edit/write，遇 `FS_STALE_VERSION` 重读 rebase 后重试；bash/formatter/脚本不受版本守卫保护；`send_message` 在最近 step 边界投递、可唤醒 inactive 目标；inactive ≠ 完成；`provisioning` = 创建中、`failed` = 创建失败；send 成功即持久（显示 queued 也不要重发）；共享任务 = list → get → 用当前 revision claim → 执行 → complete；task readiness 不启动 owner；`wait_agent` 前先 `list_agents` 确认有 running/provisioning 成员；`wait_agent` 不唤醒成员、无可进展立即 `noProgress`；唤醒/超时后重新 list；Lead 必须在最终答复前等待必需 teammate。

⇒ 把它复述进 AGENTS.md 是 `writing-for-agents` 框架下的 **duplication**，并引入 **sediment** 风险（上游改词后文档失效）。

## 6 证据二：写了也没有用 —— 双重优先级劣势

**(a) 注入载体是 user-role 消息，不是 system prompt。** `dsh-agent-instructions/lib/index.js:114`，逐字：

```js
const REPLACEMENT_AGENT_INSTRUCTIONS_INTRO = "This complete workspace instruction baseline replaces all earlier workspace instruction baselines. The following workspace instructions may be relevant to your work. Use them as guidance when applicable. More specific instructions take precedence over broader ones. They do not override system, developer, or direct user instructions.";
```

（同文件 `:113` 的 `AGENT_INSTRUCTIONS_INTRO` 为首轮版本，措辞相同但无 "replaces" 句。）

**(b) AGENTS.md 自定的优先级已把全局文件放在第 3 位。** 全局 `AGENTS.md` 的生效优先级一节逐字：

```markdown
生效优先级（强 → 弱）
1. **用户当回合指令** — 可覆盖 2/3/4 的行为细节；不得违反认证链路与用户偏好硬约束。
2. **项目根目录 `AGENTS.md`**（若存在）— 最具体，项目内优先于全局。
3. **本文件（全局）** — 通用环境约束与 skills 清单。
4. **Superpowers 插件注入的协议引导** — 流程基线，与上三层一般不冲突。
```

`team:policy` 是 system prompt 段，**两个层级都在它之下**。结论：在 AGENTS.md 写团队纪律，既排在注入段之下，也改不动 harness 已注入的措辞强度。

## 7 证据三：两条真正查不到的盲区

### 7.1 盲区 A：subagent 与 teammate 同时可用（bundle README 说法不成立）

`@deepseek-ai/dsh-experimental-agent-team-profile/README.zh.md` 自述：

> 开启后可委派 teammate，并在 Web 中查看成员、任务看板和成员会话。**普通 subagent 委派及名称重叠的全局 child control 会被禁用**；Workflow 仍可创建 fresh 子代理。

**实测不成立。** 机制是三个平面的作用域错配：

| 平面 | 文件:行 | 对四个 subagent 行的处置 |
| --- | --- | --- |
| host | `dsh-base/cordis.patch.yml:364-388` | 声明 `tool-subagent-control`、`tool-subagent-list-agents`、`tool-subagent`（`provider: spawn, toolName: subagent, backgroundMode: continuable`）、`tool-subagent-fork`（`provider: fork, toolName: subagent_fork`） |
| host | `dsh-web-app/cordis.patch.yml:543-553` | **全部 `disabled: true`**；注释说明：`What a preset chooses is which delegation TOOLS its agent sees, below.` |
| preset | `dsh-web-app/presets/standard.patch.yml:84-118` | 在 `delegation` 组（`isolate: { workflowEngine: true }`）**重新声明**同样四行（`tool-subagent` / `tool-subagent-fork` 均带 `toolFilter.deny: [schedule_create, schedule_delete, schedule_list, schedule_update]`）⇒ **工具存活** |

而 `dsh-experimental-agent-team-profile/cordis.patch.yml` 只在 **host 平面**写：

```yaml
- id: tool-subagent-control
  disabled: true
- id: tool-subagent-list-agents
  disabled: true
- id: tool-subagent
  disabled: true
- id: tool-subagent-fork
  disabled: true
```

**碰不到 preset 平面的重声明** ⇒ 禁用落空。实测：本会话工具目录同时列出 `subagent` / `subagent_fork` 与 `spawn_teammate` / `send_message` / `list_agents` / `wait_agent` / `interrupt_agent` / `team_task_create` / `team_task_list` / `team_task_get` / `team_task_update`。

**旁证**：`dsh-web-app/cordis.patch.yml:474-482` 的注释记录了同一类「平面」陷阱 —— `tool-jobs` 注册表留在 host 面、只有模型可见的 `job_*` 控件随 preset 迁移，故 `tool-jobs` / `tool-fs` / `tool-fs-search` 在该处 `disabled: true`。

该 bundle 三个 insert 行的配置（`cordis.patch.yml`）：`agent-team`（`maxMembers: 8, maxTasks: 256, maxPendingMessagesPerMember: 64, maxMessageBytes: 65536, disposalTimeoutMs: 5000`）、`tool-agent-team`（`freshProvider: spawn, forkProvider: fork`）、`ui-agent-team`。其 `lib/index.js` 内容仅 `export {};`（纯 bundle 声明）。

### 7.2 盲区 B：强制的 Superpowers 流程对 teammate 零覆盖

全局 AGENTS.md 的启动协议要求**任何用户任务先按 Superpowers 协议匹配 skill**（brainstorming → writing-plans → executing-plans → TDD → debugging → code-review → verification）。

但对该插件 15 个 `SKILL.md` grep `teammate|Agent Team|智能体团队|spawn_teammate|team_task|list_agents` → **零命中**。

`skills/subagent-driven-development/SKILL.md:28` 的判据图只有二分叉，逐字：

```text
"human partner 选择内联执行，或没有 subagent 工具？" [shape=diamond];
```

⇒ 该流程**假设只有 subagent 一种委派面**，没有任何分支处理「teammates 可用且被显式要求」。`dispatching-parallel-agents/SKILL.md` 同样只认 subagent 一路。

**这是启动协议与 Agent Teams 之间真实的语义缝隙** —— 唯一可辩护的「值得写」候选。当时选择不写（见 §8），该结论留档备查。

## 8 附一：三处技能计数漂移（当时未修改）

| 位置 | 现文 | 实际 |
| --- | --- | --- |
| 全局 `AGENTS.md:10` | 「14 个技能经 `ctx.skills` 注入」 | 15 |
| 全局 `AGENTS.md:22` | 「合并注入（共 38 个）」 | 39 |
| 全局 `AGENTS.md:26` | 「插件注入的 14 个 `superpower-*`」 | 15 |

核实依据：插件 `package.json` 的 description 自述「15 个工程纪律技能注入 ctx.skills」；`skills/` 下实测 15 个 `SKILL.md`（brainstorming、diagnosing-superpowers、dispatching-parallel-agents、executing-plans、finishing-a-development-branch、receiving-code-review、requesting-code-review、subagent-driven-development、systematic-debugging、test-driven-development、using-git-worktrees、using-superpowers、verification-before-completion、writing-plans、writing-skills）；实测会话实际注入 39 个 skill。用户当时明确选择不改。

## 9 附二：若将来决定写入的最小补丁（未应用）

仅 3 行，正面措辞，不复制 POLICY。追加到优先级一节之后：

```markdown
委派面选择（Agent Teams 已启用时）
- 本 profile 同时提供 `subagent` / `subagent_fork` 与 `spawn_teammate` 两套委派面；团队协作纪律由 harness 每轮注入（system prompt 段 `team:policy`），本文不重复。
- 用户显式要求 teammates 时按 Agent Teams 执行；其余情况沿用 Superpowers 的 subagent 流程。
```

措辞依据（`writing-for-agents`）：用**正面表述**而非「不要用 X」式否定（否定式会把被禁行为拉进上下文）；不复制 POLICY 正文（避免 duplication / sediment）；每行须通过 **no-op 测试**（相对默认行为确有改变才保留）。第二行正面化了盲区 B 的缝隙 —— 它是唯一不重复注入内容、且补上了现有流程未覆盖分支的信息。

> [!warning] 若应用，须两处同步
> 全局 `~/.dsh/AGENTS.md` 若由 chezmoi 管理，源文件在 chezmoi 仓库内（无 `.tmpl` 后缀时非模板）。应用后须**两处同步**并提醒用户提交 chezmoi 仓库，否则变更只存在于本机。参见 `[[chezmoi]]`。

## 10 一手证据清单

- `<dsh-install-root>/node_modules/@deepseek-ai/dsh-experimental-tool-agent-team/lib/index.js:21`（POLICY 定义）、`:228`（`install()` 定义）、`:539-543`（`maybeInstall` 门控）、`:236-241`（`team:policy` 注册）
- `.../dsh-system-prompt/lib/index.js:14`（`TEAM_POLICY: 600`）、`:10-43`（`SECTION_ORDERS` 全文）、`lib/types/index.d.ts:117`
- `.../dsh-agent-instructions/lib/index.js:113-114`（注入引言双版本）、`:196`（目录级引言）
- `.../dsh-base/cordis.patch.yml:292`（`maxBytes: 65536`）、`:364-388`（host 面 subagent 四行，至 `tool-subagent-fork` 的 `backgroundMode: one-shot` 止）
- `.../dsh-web-app/cordis.patch.yml:474-482`（平面陷阱注释）、`:484-490`（`tool-jobs`/`tool-fs`/`tool-fs-search` 三行 `disabled: true`）、`:543-553`（host 面禁用四行）
- `.../dsh-web-app/presets/standard.patch.yml:5-9`（`preset-standard`, `id: standard, order: 1`）、`:84-118`（`delegation` 组重声明）
- `.../dsh-experimental-agent-team-profile/cordis.patch.yml`（host 面禁用 + 三个 insert）、`README.zh.md`（与实际不符的自述）、`lib/index.js`（`export {};`）
- `~/.dsh/profiles/web/package.json`（`dsh.profile.bundles` 16 项，含 agent-team-profile）
- `~/.dsh/profiles/web/node_modules/@wenaixi/dsh-superpower/package.json` + `skills/*/SKILL.md`（15 个；`:28` 判据图）
- 全局 `~/.dsh/AGENTS.md`（启动协议、优先级一节、三处计数漂移）

## 11 本机实测环境与数值

> 以下为**单机单次**实测记录，仅作复现参考；路径中的用户名已占位化。

| 项 | 值 |
| --- | --- |
| OS | Linux / WSL2 |
| DSH 安装方式 | npx 缓存 checkout（`/home/<user>/.npm/_npx/<hash>/`） |
| DSH 版本 | `@deepseek-ai/dsh@0.2.1-alpha.1` |
| 启用的 profile | `web`（`~/.dsh/profiles/web`） |
| profile bundles | 16 项，含 `@deepseek-ai/dsh-experimental-agent-team-profile` |
| `@wenaixi/dsh-superpower` | `7.2.1`（15 个 `SKILL.md`） |
| 全局 AGENTS.md | 11324 B / 162 行，md5 `ce15fb51c13ba8b2e903563150820ebe` |
| `agent-instructions` 字节预算 | `maxBytes: 65536`（占用约 17%） |
| 实测注入 skill 数 | 39 |

实测工具目录同时包含：`subagent`、`subagent_fork`、`spawn_teammate`、`send_message`、`list_agents`、`wait_agent`、`interrupt_agent`、`team_task_create`、`team_task_list`、`team_task_get`、`team_task_update`。

## 12 相关

- [[DSH 官方桌面版]]
- [[DSH Web 插件聚合包]]
- [[DSH 第三方插件安全审计]]
- [[chezmoi]]
