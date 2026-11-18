---
tags: [DSH, Agent Teams, AGENTS.md, 上下文工程]
title: DSH Agent Teams 与 AGENTS.md 纪律
aliases: [dsh-agent-teams-agents-md]
date created: 2026-10-04 15:55:27
date modified: 2026-11-16 13:50:00
---

# DSH Agent Teams 与 AGENTS.md 纪律

> [!abstract] 适用场景
> 回答：Agent Teams 已启用时，还需不需要在 AGENTS.md 里写团队协作纪律？结论：不需要——它已由 harness 每轮注入，且 AGENTS.md 层级低于 system，写了也改不动。顺带查清两件事：本 profile 下 subagent 与 teammate 同时可用（与 bundle README 相反），以及 Superpowers 流程对 teammate 零覆盖。适用于维护 DSH 指令文件、或排查「teammate 开了却不被调用」。

## 1 背景与适用条件

- DSH 把 AGENTS.md 作为 **user-role** 的 durable baseline 注入，把平台策略作为 **system prompt 段**注入。
- Agent Teams 是 DSH 实验特性（`@deepseek-ai/dsh-experimental-agent-team*`），启用后可委派 teammate。
- 本文结论基于 `@deepseek-ai/dsh@0.2.1-alpha.3` 与 `@wenaixi/dsh-superpower@7.7.2`（早期 alpha.1 / 7.2.1 阶段的结论已复验，仍成立）。版本敏感，升级后核对安装树源码。

## 2 结论

**不在 AGENTS.md 写 Agent Teams 协作纪律。** 三条理由：

1. 该纪律已由 harness 每轮作为 system 段 `team:policy` 注入（Lead 与每个 teammate 都收到）⇒ 写入即 duplication。
2. AGENTS.md 是 user-role，自述 `do not override system, developer, or direct user instructions`，且全局文件自身优先级排第 3 ⇒ 两个层级都低于 `team:policy`，写了也改不动行为。
3. 真正查不到的是另外两件事（本 profile 两套委派面并存、Superpowers 对 teammate 零覆盖），与该纪律无关。

字节预算不是理由：上限 65536 B，实测占用约 22%。

## 3 关键机制与证据

### 3.1 team:policy 每轮注入

`dsh-experimental-tool-agent-team/lib/index.js` 定义 `POLICY`，首句即：

> `Agent Teams is available in this session, but create teammates only when the user explicitly asks to use Agent Teams or teammates.`

注册为 system 段 `team:policy`，段位 `TEAM_POLICY: 600`（`dsh-system-prompt/lib/index.js:14`）。对 `ctx.agents.list()` 的全部 agent 及后续 `agent/created` 安装 ⇒ Lead 与每个 teammate 都收到。全仓唯一，无第二份竞争。

### 3.2 AGENTS.md 是 user-role，层级更低

`dsh-agent-instructions/lib/index.js` 注入引言逐字：`They do not override system, developer, or direct user instructions.` 全局 AGENTS.md 自定优先级里，全局文件仅列第 3（低于用户当回合指令、项目根 AGENTS.md）。⇒ 写团队纪律既排在注入段之下、也改不动措辞强度。

### 3.3 盲区 A：subagent 与 teammate 同时可用（README 说法不成立）

`dsh-experimental-agent-team-profile/README.zh.md` 自称「普通 subagent 委派会被禁用」，**实测不成立**。原因是平面作用域错配：`disabled: true` 只写在 **host 平面**，而四个 subagent 行在 **preset 平面**被 `dsh-web-app/presets/standard.patch.yml`（delegation 组）重新声明 ⇒ 禁用落空。实测工具目录同时有 `subagent`/`subagent_fork` 与 `spawn_teammate`/`send_message`/`list_agents`/`wait_agent`/`team_task_*`。

### 3.4 盲区 B：Superpowers 流程对 teammate 零覆盖

该插件 15 个 `SKILL.md` 对 `teammate|spawn_teammate|team_task` 零命中；`subagent-driven-development/SKILL.md` 的判据图只有「内联执行 / 没有 subagent 工具」二分叉，无 teammate 分支。⇒ 强制流程把模型推向 subagent 面，且没提 teammate。

## 4 为什么 teammate / subagent 不被调用（用户实报根因）

用户实报：DeepSeek v4.1-flash 下「子 agent 很不积极，智能体团队开了却不会调用，一直是 lead 在跑」。根因分三层：

- **根因 1（决定性）：`teamPolicy` 首句是道否定式闸门** —— 它在 system 段，AGENTS.md 改不动。默认「不建 teammate，除非用户显式要求」。
- **根因 2：工具描述的动机不对称** —— `subagent` 描述约 294 字符、含「不消耗本会话上下文」的正面动机；`spawn_teammate` 仅约 74 字符、纯机制。小模型靠工具描述触发，缺动机就不选。
- **根因 3：Superpowers 判据图无 teammate 分支**（见 §3.4），流程只导向 subagent。

分层杠杆（哪些真能改）：

| 杠杆 | 层级 | 能否影响闸门 |
| --- | --- | --- |
| 用户当回合显式说「用 teammates」 | 用户指令 | **能**（闸门的既定触发条件，最可靠、零配置） |
| persona `prefix`/`suffix` | system 段 | **能**（suffix 在最后，位置利于指令遵循） |
| AGENTS.md 补规则 | user-role | **不能**（自述低于 system） |
| 改 `teamPolicy` 文案 | — | 不可行（policy 文本硬编码、无覆盖点） |

结论：想让 teammate 被调用，唯一可靠的触发是当回合明说「用 teammates」；改 AGENTS.md 对此症状无效。

## 5 并发：真实收益与代价

用户问「并发起来效果应该会好不少吧」。结论：**并发是真的，但不提升能力，只提升吞吐与上下文隔离。**

- `spawn_teammate` 非阻塞：`execute → spawnTeammate → startActivation` 在「消息已入队」后立即返回，不等子 turn 完成 ⇒ 真并发。
- 上限 **8 个 teammate**（+1 lead；lead 由投影合成，不计入 `state.members`）。
- ⚠️ **teammate 无法指定模型**，全量继承 Lead ⇒ 并发是「同一个 flash 的 N 份拷贝」，同模型同盲区，不能靠并发补判断力。`subagent` 反而能选模型。

| 真实收益 | 代价 / 反作用 |
| --- | --- |
| 上下文隔离（本机跑 billion-context，最大收益：子任务不挤主上下文、少缴压缩税） | 不解决「不被调用」（并发只在 spawn 之后生效，先解决触发） |
| 独立子任务墙钟并行（上限 8 足够） | token 成本线性放大 |
| 独立上下文可做对抗性审查 | 写冲突：write-scope 重叠只是 advisory 非锁，bash/格式化器不受版本守卫，须 Lead 复核 diff |

校准：只对「子任务弱耦合 + 每个上下文量大」受益；强串行/强耦合、或指望并发补判断力，都不受益。

## 6 相关

- [[DSH Web 插件聚合包]]
- [[DSH 第三方插件安全审计]]
- [[chezmoi]]
