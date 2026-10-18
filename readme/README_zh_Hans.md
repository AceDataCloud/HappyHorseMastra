# HappyHorse by Ace Data Cloud：Mastra 接入指南

在 Mastra Agent 中使用 HappyHorse 视频生成、图生视频和任务查询。此独立集成由 Ace Data Cloud 维护，复用 [HappyHorse MCP](https://github.com/AceDataCloud/MCPs/tree/main/happyhorse)，不代表 HappyHorse 或 Mastra 官方。

[English](../README.md) · [获取应用 API Key](https://platform.acedata.cloud/console/applications?utm_source=github&utm_medium=referral&utm_campaign=evergreen&utm_content=happyhorsemastra_readme_api_key) · [当前服务权限与价格](https://platform.acedata.cloud/models?utm_source=github&utm_medium=referral&utm_campaign=evergreen&utm_content=happyhorsemastra_readme_pricing)

## 1. 安装版本化集成包

这是独立社区集成 **0.1.0**，版本化安装包位于 [GitHub Release](https://github.com/AceDataCloud/HappyHorseMastra/releases/tag/v0.1.0)，包名为 `@acedatacloud/mastra-happyhorse`。npm 登记是独立分发渠道；Mastra 官方指南提案已关闭，本包没有官方目录条目。

需要 Node 22.13+，在现有 Mastra 项目安装：

```bash
npm install https://github.com/AceDataCloud/HappyHorseMastra/releases/download/v0.1.0/acedatacloud-mastra-happyhorse-0.1.0.tgz @mastra/editor@0.16.0
```

发布包包含编译后的 JavaScript 和类型声明。手动下载时可按发布页 `SHA256SUMS.txt` 校验；随后按下文注册到服务器，才能在项目的 Studio 里选择工具。

## 2. 注册并获取应用密钥

1. 登录 [Ace Data Cloud → Applications](https://platform.acedata.cloud/console/applications?utm_source=github&utm_medium=referral&utm_campaign=evergreen&utm_content=happyhorsemastra_readme_api_key)。新账户没有 General application 时，先点 **Initialize General Application**。
2. 打开 **General application**，复制应用 Key；也可进入 **Manage Keys → Create** 创建名为 `Mastra HappyHorse` 的专用 Key。
3. 检查 HappyHorse 权限、余额、有效期和当前价格。若启用 **Allowed APIs**，本教程至少需要 `/happyhorse/videos` 与 `/happyhorse/tasks`；其他工具按需配置其对应 API。

![复制应用 Key 或打开密钥管理](https://raw.githubusercontent.com/AceDataCloud/SunoDify/8d3d03570e73324220f111f7fe343da0792a8071/_assets/tutorial/get-api-key-en.png)

![创建专用 Key](https://raw.githubusercontent.com/AceDataCloud/SunoDify/8d3d03570e73324220f111f7fe343da0792a8071/_assets/tutorial/create-api-key-en.png)

图片来自 SunoDify 固定提交中的真实 Ace 控制台，只展示同一控制台操作；不是 Mastra 截图。2026-10-18 核对引用。只复制 token 字符串，不带 `Bearer `、引号或截图打码字符。平台管理 token 不等于生成服务应用 Key。

将 `ACEDATACLOUD_API_KEY=你的应用Key` 放在 Mastra **服务器**的未提交环境中。不要放进提示词、浏览器代码或 Agent 导出。此版本使用服务器所有者的服务账户；应用需自己控制谁可调用工具，不提供每用户 OAuth 或租户账单隔离。

## 3. 在 Mastra 注册和选择工具

```typescript
import { MastraEditor } from '@mastra/editor';
import { HappyHorseToolProvider } from '@acedatacloud/mastra-happyhorse';
const happyhorse = new HappyHorseToolProvider({
  apiKey: process.env.ACEDATACLOUD_API_KEY!,
  allowedTools: ['happyhorse_generate_video', 'happyhorse_get_task', 'happyhorse_list_models'],
});
const editor = new MastraEditor({ toolProviders: { happyhorse } });
// 将 editor 传给现有 new Mastra({ ...existingConfig, editor })。
// 保留项目已有 Agent、身份认证和数据库 storage 配置。
```

根据 [Mastra Editor 官方设置](https://mastra.ai/docs/studio/editor)配置存储与权限。启动自己的服务，在 **Studio → Agents → 目标 Agent → Editor → Tools → Integration Tools** 中选择 **HappyHorse by Ace Data Cloud**，勾选工具，先保存草稿测试。当前 Ace 条目仍待实际界面验收，本文不使用伪造安装截图。

代码定义的 Agent 可直接使用 `await happyhorse.resolveTools(['happyhorse_generate_video', 'happyhorse_get_task'])` 返回的工具。应用退出时调用 `await happyhorse.disconnect()`。

## 4. 提交一次，始终查询同一任务

生成会产生费用，需要用户先检查当前价格后自己执行：调用一次 `happyhorse_generate_video`，例如 prompt 为 `A slow cinematic camera move along a quiet coastline at sunrise`；模型以当前工具 schema 为准。

保存返回的 `task_id`，按服务提示的间隔调用 `happyhorse_get_task` 查询**同一个 ID**。pending/running 和预览都不等于完成；不要重跑生成来查进度。查询明确完成且 `response.success: true` 后再展示最终媒体链接，失败则停止。生成响应丢失时先检查任务记录，再决定是否重新提交。

适配器不自动重试调用，也不改模型或价格。Agent/工作流上层仍可能再次调用，需同时关闭生成重试。MCP/JSON 错误和明确任务失败会抛出 `AceToolError`，只保留实际返回的安全状态码/代码/请求 ID，不把原始诊断复制进日志。

## 5. 验证与常见问题

`npm run check` 检查编译、示例类型与真实 Mastra Editor/Agent 的本地契约；`npm run pack:check` 检查包内容。真实 MCP 源码目录检查使用假密钥和 loopback API，不发收费生成。

Studio 没有条目时检查服务器是否注册 provider、Editor 存储和工具编辑权限；401/403 检查应用 Key、过期、服务权限和生成/查询 API 范围；429 遵守限流；pending 继续查原 ID；失败先检查任务记录再决定是否重发。此包提供视频工具，Agent 使用的推理 LLM 需另行配置。

Mastra 的 npm 集成、官方目录、Connect 和 LLM provider 下拉是不同入口。当前包尚未被 Mastra 官方收录；[models.dev PR](https://github.com/anomalyco/models.dev/pull/8873)负责另一条 LLM 发现路径。

[Mastra 官方集成指南提案 #27373](https://github.com/mastra-ai/mastra/issues/27373) 已被维护者关闭；[2026-10-18（Asia/Shanghai）维护者回复](https://github.com/mastra-ai/mastra/issues/27373#issuecomment-6239261501)表示目前不推进。此状态不是待审批，不代表禁止独立 ToolProvider；本包仍未获官方目录收录。
