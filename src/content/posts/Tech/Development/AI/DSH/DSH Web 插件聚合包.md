---
tags: [DSH, 插件, Web, 依赖分析]
title: DSH Web 插件聚合包
aliases: [dsh-web-plugin-bundle]
date created: 2026-09-15 20:03:43
date modified: 2026-10-14 23:39:00
---

# DSH Web 插件聚合包

> [!abstract] 适用场景
> 拆解第三方「全家桶」聚合包 `@linxin666/dsh-web-all` 到底装了什么、体积从哪来、
> 与已装插件哪些重复、以及如何只挑需要的子包单装。
> 适用于准备一键安装该聚合包、或想评估其磁盘与依赖代价的读者。

## 1 背景与适用条件

- **DSH**（DeepSeek Harness）的 Web 界面能力由 profile 里挂载的 bundle 决定；
  `dsh plugin --profile web add <pkg>` 会把插件写进 `~/.dsh/profiles/<name>/package.json`
  的依赖并追加 bundle 行，DSH 启动时按顺序叠加各 bundle 的 `cordis.patch.yml`。
- **聚合包**（meta-package）指自身不实现功能、只把一批子包聚合为一次安装的 npm 包；
  本文对象是社区项目 `zhu1090093659/dsh-web` 的 `@linxin666/dsh-web-all`。
- 本文结论基于 `@linxin666/dsh-web-all@0.3.22`（dev 分支）与 DSH `0.1.5-rc.1`。
  **版本敏感**：子包清单、`inactive` 列表与体积都随聚合包版本变化，
  升级后请以 `aggregate.yml` 为真值源重新核对。
- 前置条件：可访问 npm registry 与 GitHub；隔离安装需要一次完整的 `npm install`。
- **适用范围**：评估与拆解该聚合包、按需挑选子包。
  **不适用**：DSH 插件机制的官方规范细节（以官方文档为准）。

## 2 结论摘要

1. **dsh-web 不是一个插件，是 20 个插件的聚合包**。`dsh plugin add @linxin666/dsh-web-all`
   一次装 19 个家族子包 + 1 个外部包。
2. 其中 **5 个出厂就是关闭的**（`aggregate.yml` 的 `inactive` 清单），装了也不加载。
3. `@linxin666/dsh-client-ui-git-graph@0.3.22`、`dsh-better-sidebar@0.19.1` 与聚合包
   **逐字节重复**。
4. `dsh-pet@0.2.9`（PC2005-cloud）与 `dshmarket@1.47.0`（dsh-market）与聚合包内同名功能的
   **不是同一个包**，会并存。
5. 全新隔离安装 = 252 个包 / 463 MB；叠加到已有 profile 的**边际成本 = 78 个新包 / 约 102 MB**，
   其中 cloudflared 38 MB、`@linxin666/dsh-pet` 15 MB、lightningcss 9.6 MB。

## 3 聚合包实际装了什么

真值源：`packages/dsh-web-all/aggregate.yml`（patchFrom / deps / rows / inactive）。

### 3.1 随包加载（默认启用，14 个）

| 行 id | npm 包 | 作用 | 解包 |
| --- | --- | --- | --- |
| `web-ui-compat` | `@linxin666/dsh-web-all` 自身 | 故障隔离 shell：每个家族行挂在一个永不失败的壳后面，坏插件只降级自身；提供 `/api/dsh-web-all/rows`、`/degraded` 健康路由 | 7.51 MB |
| `web-ui-settings` | `dsh-client-ui-web-ui-settings` | 设置页一级分区，托管家族插件的开关与配置表单；声明子槽位 `web-ui.plugin.item` | 0.12 MB |
| `web-ui-plugin-manager` | `dsh-client-ui-plugin-manager` | 插件管理器：经官方 host 通道从 npm / git 装插件、启停、冲突撤销 | 0.38 MB |
| `web-ui-community-plugins` | `dsh-client-ui-community-plugins` | 社区插件索引数据源（`community.json`，37 项），供工坊卡片消费 | 0.06 MB |
| `web-ui-market` | `dsh-client-ui-market` | 创意工坊商店卡：浏览 dsh-market.com 的皮肤 / 宠物 / 插件 / 预设并一键安装 | 0.28 MB |
| `web-ui-task-board` | `dsh-client-ui-task-board` | 任务看板：五列 + 真实 DSH 会话执行 + Host cron 定时 + 可选空闲睡眠保护 | 1.30 MB |
| `web-ui-git-graph` | `dsh-client-ui-git-graph` | 分支选择器 + 提交历史图谱 + git worktree 并行会话 | 0.82 MB |
| `web-ui-remote-web-ui` | `dsh-remote-web-ui` | 扫码配对手机 / PC 浏览器，共享同一份官方 Web GUI | 2.01 MB |
| `web-ui-pet` | `@linxin666/dsh-pet` | 注册表驱动的悬浮宠物（内置鲸鱼娘等 7 只） | 15.03 MB |
| `web-ui-usage` | `dsh-usage` | 使用统计：token 台账、供应商余额、套餐额度、鲸元券 | 1.60 MB |
| `web-ui-session-archive` | `dsh-session-archive` | 会话归档管理：清单 / 筛选 / 批量归档恢复 / 级联物理删除 / 自动策略 | 0.54 MB |
| `web-ui-model-capabilities` | `dsh-client-ui-model-capabilities` | 自定义供应商逐模型声明图片输入与推理档位，并停用 / 启用供应商 | 0.21 MB |
| `web-ui-preset-center` | `dsh-client-ui-preset-center` | 社区 agent 预设的安装 / 启用 / 禁用 / 卸载 | 0.13 MB |
| `web-ui-skin-center` | `dsh-client-ui-skin-center` | 皮肤唯一加载器 + 内置 blue-fantasy 资产 | 1.61 MB |
| `web-ui-better-sidebar` | `dsh-better-sidebar`（外部） | VSCode 式右侧面板：资源管理器 / 编辑器 / 终端 / Git / 浏览器 | 14.00 MB |
| `web-ui-i18n` | `@linxin666/dsh-i18n` | 注册**俄语**并携带全部家族命名空间的 ru 字典 | 0.31 MB |

> 上表 16 行对应 17 个 npm 包（compat 是自身）。

### 3.2 出厂关闭（`inactive`，装但不加载，5 个）

| 行 id | npm 包 | 作用 | 解包 |
| --- | --- | --- | --- |
| `web-ui-ssh` | `dsh-ssh` | SSH 面板：Web 终端 / SFTP / 端口转发 / 集群执行 + 6 个 agent 工具 | 2.47 MB |
| `web-ui-describe-image` | `dsh-tool-describe-image` | 给纯文本模型加 `describe_image` 工具 | 1.00 MB |
| `web-ui-liangshen` | `dsh-liangshen` | 「梁神」agent 预设 + PTC 工具模式 | 0.39 MB |
| `web-ui-skill-explorer` | `dsh-client-ui-skill-explorer` | Skill 中心：按来源浏览 / 启停 / 增删 | 0.22 MB |
| `web-ui-doctor` | `dsh-doctor` | 事务化救援模式：受管启动器、恢复胶囊、健康监控 | 1.04 MB |

这些行在 `cordis.patch.yml` 里被追加 `disabled: true` 覆盖，但 **npm 包照样下载到磁盘**，
只是不 import。

## 4 体积构成

### 4.1 家族包自身（npm unpackedSize，含各自 dependencies）

```text
15.03 MB  29.5%  @linxin666/dsh-pet
14.00 MB  27.4%  dsh-better-sidebar (外部)
 7.51 MB  14.7%  @linxin666/dsh-web-all (shell)
 2.47 MB   4.8%  @linxin666/dsh-ssh
 2.01 MB   3.9%  @linxin666/dsh-remote-web-ui
 1.61 MB   3.2%  @linxin666/dsh-client-ui-skin-center
 1.60 MB   3.1%  @linxin666/dsh-usage
 1.30 MB   2.5%  @linxin666/dsh-client-ui-task-board
 1.04 MB   2.0%  @linxin666/dsh-doctor
 1.00 MB   2.0%  @linxin666/dsh-tool-describe-image
 0.82 MB   1.6%  @linxin666/dsh-client-ui-git-graph
 0.54 MB   1.1%  @linxin666/dsh-session-archive
 ... 其余 9 个均 < 0.4 MB
---------
51.03 MB  合计
```

### 4.2 传递依赖才是大头

隔离目录 `npm install @linxin666/dsh-web-all@0.3.22` → **252 个包 / 463 MB**。最重的三个来源：

| 依赖 | 大小 | 被谁拉进来 |
| --- | --- | --- |
| `react-icons` | 85 MB | dsh-better-sidebar |
| `mermaid`（+cytoscape / katex / es-toolkit 等） | 84 MB | dsh-better-sidebar |
| `node-pty` | 63 MB | dsh-better-sidebar |
| `cloudflared` | 38 MB | dsh-remote-web-ui |
| `lightningcss-linux-x64-gnu` | 9.6 MB | dsh-client-ui-skin-center |

### 4.3 叠加到已有 profile 的边际成本

若 profile 已有 192 / 252 个包（`@deepseek-ai/*` SDK 大量复用），
**新增 78 个包 / 约 102 MB**：

```text
38.04 MB  cloudflared                 ← remote-web-ui
15.03 MB  @linxin666/dsh-pet
 9.58 MB  lightningcss-linux-x64-gnu  ← skin-center
 7.16 MB  @linxin666/dsh-web-all
 5.65 MB  @xterm/xterm                 ← ssh
 4.30 MB  react-dom
 2.47 MB  @linxin666/dsh-ssh
 2.01 MB  @linxin666/dsh-remote-web-ui
 ...
```

## 5 与已装插件的重复

`~/.dsh/profiles/web/package.json` 的 bundles 示例：

```text
@deepseek-ai/dsh-base, @deepseek-ai/dsh-web-app,
dsh-find-plugin, dshmarket, @wenaixi/dsh-superpower, dsh-whale-widget,
@nonamelego/dsh-catppuccin, dsh-pet, dsh-better-sidebar, dsh-context,
@linxin666/dsh-client-ui-git-graph, dsh-router-core, dsh-router-codebuddy
```

| 已装 | 聚合包内的对应物 | 关系 |
| --- | --- | --- |
| `@linxin666/dsh-client-ui-git-graph@0.3.22` | `@linxin666/dsh-client-ui-git-graph@0.3.22` | **同一个包**，完全重复（行 id 不同：`ui-git-graph` vs `web-ui-git-graph`，双挂载去重，无收益） |
| `dsh-better-sidebar@0.19.1` | `dsh-better-sidebar@0.19.0`（被 pin） | **同一个包**，版本还会被拉低 |
| `dsh-pet@0.2.9`（PC2005-cloud） | `@linxin666/dsh-pet@0.3.22` | **不同包**，两只会同时出现 |
| `dshmarket@1.47.0`（dsh-market） | `@linxin666/dsh-client-ui-market@0.3.22` | **不同包**，两个工坊入口并存 |
| `@nonamelego/dsh-catppuccin@0.5.2` | `skin-center` 的 catppuccin 皮肤资产 | 功能重叠（主题 vs 皮肤） |
| `dsh-whale-widget@0.3.0` | `dsh-usage` 的宠物公告气泡 / 余额 | 功能重叠（余额展示） |
| `dsh-find-plugin@0.3.7` | `dsh-client-ui-plugin-manager` + `dsh-client-ui-market` | 功能重叠（找插件 / 装插件） |
| `@wenaixi/dsh-superpower` | `dsh-liangshen`（inactive） | 功能重叠（agent 预设 / 流程） |
| `dsh-context@0.52.2` | 无对应 | 无重复 |

## 6 按需安装对照表

单独安装用包名即可，行 id 与聚合包的 `web-ui-*` 不同，不冲突：

| 想要 | 安装命令 |
| --- | --- |
| 任务看板 + cron | `dsh plugin --profile web add @linxin666/dsh-client-ui-task-board@latest` |
| 手机 / PC 远程 | `dsh plugin --profile web add @linxin666/dsh-remote-web-ui@latest` |
| SSH 运维 | `dsh plugin --profile web add @linxin666/dsh-ssh@latest` |
| 使用统计 | `dsh plugin --profile web add @linxin666/dsh-usage@latest` |
| 模型能力 | `dsh plugin --profile web add @linxin666/dsh-client-ui-model-capabilities@latest` |
| 会话归档 | `dsh plugin --profile web add @linxin666/dsh-session-archive@latest` |
| 皮肤 | `dsh plugin --profile web add @linxin666/dsh-client-ui-skin-center@latest` |
| 插件管理器 | `dsh plugin --profile web add @linxin666/dsh-client-ui-plugin-manager@latest` |
| 创意工坊卡片 | `dsh plugin --profile web add @linxin666/dsh-client-ui-market@latest` |

**注意**：`dsh-client-ui-task-board` 的设置卡注册进 `web-ui.plugin.item` 子槽位，
该槽位由 `dsh-client-ui-web-ui-settings` 声明。单独装 task-board 时设置卡不出现
（`slots.inject` 对未声明槽位是安全的等待，不报错）；需要设置界面就一起装
`dsh-client-ui-web-ui-settings`。

## 7 加载与隔离机制（技术备注）

- **挂载方式**：全部经官方 profile bundle 机制（`dsh.profile.bundles` 顺序叠加 bundle 的
  `cordis.patch.yml`，再叠 `~/.dsh/profiles/web/cordis.patch.yml` 用户层）。不改 DSH 源码。
- **故障隔离**：DSH loader 把一批 patch 行当**一个事务组**挂载，任一行 import / start 失败
  会回滚整组并中止 `dsh web`。聚合包因此让每个家族行 `name` 指向自己的 shell 子路径导出
  （`@linxin666/dsh-web-all/<family>`），真插件包名放 `config.plugin`，
  壳负责 `await import()` 并捕获异常。
- **浏览器半区**：`lib/client.js` 是**把全部家族 client bundle 内联进单个 2.9 MB 产物**
  （已验证：task-board / ssh / doctor / usage / skill-explorer / skin-center 的字面量
  97%+ 在聚合 client.js 里逐字命中）。所以家族包即使行被 `disabled`，
  其浏览器代码仍在磁盘上、也仍被下载——只是不 mount。
  mount 门控靠 `GET /api/dsh-web-all/rows`（1.5 s 超时，任何不确定都 fail-open 全挂）。
- **双挂载**：行 id 加 `web-ui-` 前缀，与独立包的原 id 共存不报错；
  host 半区只注册一次，浏览器半区按包名去重。官方文档明确「两个来源并存没有额外收益」。

## 8 一手来源

- 仓库 README：https://github.com/zhu1090093659/dsh-web/blob/dev/README.md
- 聚合包使用指南：https://github.com/zhu1090093659/dsh-web/blob/dev/packages/dsh-web-all/README.zh.md
- 装配清单（真值源）：`packages/dsh-web-all/aggregate.yml`
- 生成的 patch 层：`packages/dsh-web-all/cordis.patch.yml`
- npm：https://www.npmjs.com/package/@linxin666/dsh-web-all

## 9 本机实测环境与数值

> 以下为单机单次实测结果；换机器 / 换版本后需重新核对。

| 项 | 值 |
| --- | --- |
| OS / 运行环境 | WSL2 Linux |
| DSH CLI | `@deepseek-ai/dsh@0.1.5-rc.1` |
| profile 路径 | `~/.dsh/profiles/web` |
| profile 现有包数 / node_modules 体积 | 192 个包 / 424 MB |
| 隔离安装结果 | 252 个包 / 463 MB |
| 叠加边际成本 | 78 个新包 / 约 102 MB |
| 聚合包版本 | `@linxin666/dsh-web-all@0.3.22`（dev 分支） |
| 关键源码引用 | `@deepseek-ai/dsh/lib/plugin-Ddi42qoW.js`、`profile-boot-Dk-7KqJc.js` |

## 10 相关

- [[DSH 是否内置 Playwright]]
- [[DSH TUI 的引入与移除]]
- [[DSH 第三方插件安全审计]]
- [[DSH 浏览器能力与 PDF 处理]]
