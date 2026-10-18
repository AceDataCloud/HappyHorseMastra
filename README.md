# HappyHorse by Ace Data Cloud for Mastra

Use **HappyHorse video generation, image-to-video, reference-to-video, video editing, and task queries** in Mastra agents. This independent integration is maintained by Ace Data Cloud and connects to its existing [HappyHorse MCP server](https://github.com/AceDataCloud/MCPs/tree/main/happyhorse). It is not affiliated with HappyHorse or Mastra.

[简体中文](readme/README_zh_Hans.md) · [Get an application API key](https://platform.acedata.cloud/console/applications?utm_source=github&utm_medium=referral&utm_campaign=evergreen&utm_content=happyhorsemastra_readme_api_key) · [Current access and pricing](https://platform.acedata.cloud/models?utm_source=github&utm_medium=referral&utm_campaign=evergreen&utm_content=happyhorsemastra_readme_pricing)

## 1. Install this integration

**Version 0.1.0** is an independent community ToolProvider. Use the versioned package from [GitHub Releases](https://github.com/AceDataCloud/HappyHorseMastra/releases/tag/v0.1.0). The package name is `@acedatacloud/mastra-happyhorse`; npm registry publication is a separate distribution channel. Mastra closed the proposed official integration-guide request for now, so this package has no official Mastra directory listing.

With Node 22.13 or newer, install the release in your existing Mastra project:

```bash
npm install https://github.com/AceDataCloud/HappyHorseMastra/releases/download/v0.1.0/acedatacloud-mastra-happyhorse-0.1.0.tgz @mastra/editor@0.16.0
```

The release includes compiled JavaScript and TypeScript declarations. Compare its SHA256 with `SHA256SUMS.txt` on the release page if you download it first. Then register the provider as shown below. [Mastra documents the ToolProvider interface](https://mastra.ai/reference/editor/tool-provider); installing a package alone does not register it with your project.

Tested with `@mastra/core@1.75.0`, `@mastra/editor@0.16.0`, and MCP SDK `1.32.1`. The package uses MCP directly so a dropped response does not automatically resubmit a paid generation. Your Mastra agent/workflow can still submit another call: disable generation retries there too.

## 2. Get an API key

1. Register or sign in at [Ace Data Cloud → Applications](https://platform.acedata.cloud/console/applications?utm_source=github&utm_medium=referral&utm_campaign=evergreen&utm_content=happyhorsemastra_readme_api_key). If needed, choose **Initialize General Application**.
2. Open **General application**. Copy its application API key, or choose **Manage Keys → Create** to make a dedicated key named `Mastra HappyHorse`.
3. Check HappyHorse access, current balance, expiration, and current prices before generation. If **Allowed APIs** is enabled, this guide needs `/happyhorse/videos` and `/happyhorse/tasks`; other optional tools require their respective API permissions.

![Copy an application key or open Manage Keys](https://raw.githubusercontent.com/AceDataCloud/SunoDify/8d3d03570e73324220f111f7fe343da0792a8071/_assets/tutorial/get-api-key-en.png)

![Create a dedicated application key](https://raw.githubusercontent.com/AceDataCloud/SunoDify/8d3d03570e73324220f111f7fe343da0792a8071/_assets/tutorial/create-api-key-en.png)

These are real Ace console screenshots from the linked SunoDify commit, reused for the same console steps; they are not Mastra screenshots. Reference checked 2026-10-18. Copy only the token string, without `Bearer ` or quotation marks. A platform management token is not the application key used here.

Store it in your **Mastra server's** uncommitted environment:

```dotenv
ACEDATACLOUD_API_KEY=your_application_api_key
```

The example gives the server owner's service access to agents that can execute these tools. Authenticate and authorize those users in your application. This adapter does not implement per-user OAuth or tenant-specific billing. Never put this key in a prompt, browser bundle, stored tool settings, or exported agent.

## 3. Register the provider and select tools in Studio

Add the provider to the entry point that already creates your Mastra instance:

```typescript
import { MastraEditor } from '@mastra/editor';
import { HappyHorseToolProvider } from '@acedatacloud/mastra-happyhorse';

export const happyhorse = new HappyHorseToolProvider({
  apiKey: process.env.ACEDATACLOUD_API_KEY!,
  allowedTools: ['happyhorse_generate_video', 'happyhorse_get_task', 'happyhorse_list_models'],
});

const editor = new MastraEditor({ toolProviders: { happyhorse } });
// Pass editor to your existing new Mastra({ ...existingConfig, editor }).
// Keep its existing agents, authentication, and database storage configuration.
```

[Mastra's Editor setup](https://mastra.ai/docs/studio/editor) documents storage and permissions. With this server running, open **Studio → Agents → your agent → Editor → Tools**. Find **Integration Tools**, choose **HappyHorse by Ace Data Cloud**, and select the generation, task-query, or static guide tools. Save a draft before testing; publish an agent change only when ready. If the service is absent, verify that this exact server registered `editor.toolProviders.happyhorse` and that the agent permits tool edits.

The provider supports catalog search, pagination, an exact tool allowlist, original MCP input schemas, and stored description overrides. It exposes only `happyhorse_` tools. No browser-side key form is required: authentication is configured in server code above. **The actual Ace entry in Studio still needs a visual check; no fabricated installation screenshot is included.**

For a code-configured agent, skip Editor selection and resolve the same tools:

```typescript
const tools = await happyhorse.resolveTools(['happyhorse_generate_video', 'happyhorse_get_task']);
// Supply tools to your existing new Agent({ ...existingAgentConfig, tools }).
```

Call `await happyhorse.disconnect()` in your application's shutdown hook.

## 4. First use: submit once, query the same task

The following generation is a **user action that can incur charges**, not an installation check:

1. After reviewing current pricing, call `happyhorse_generate_video` once with a short prompt, such as `A slow cinematic camera move along a quiet coastline at sunrise`. Choose a model supported by the live tool schema; this package does not substitute models or set prices.
2. Save the returned `task_id`. A submitted task or intermediate preview is not a completed result.
3. Call `happyhorse_get_task` with **that same ID**, respecting the server's polling guidance. Never rerun generation to check progress. A lost generation response needs investigation before resubmission.
4. Continue only while the task is pending/running. Stop on a terminal success or failure. Present final media URLs only after the query reports completion and `response.success: true` (or equivalent explicit completion guidance).

The adapter preserves the MCP content envelope and async hints. JSON/MCP errors and explicit failed tasks reject with `AceToolError`. Safe `statusCode`, `code`, and `requestId` are retained only when actually supplied; raw upstream messages are not copied into error logs. Error metadata omitted by a server cannot be reconstructed.

## 5. Free checks and troubleshooting

```bash
npm ci
npm run check
npm run pack:check
```

The normal suite uses local MCP/model fixtures and a real Mastra Editor/Agent. No secret or paid generation is required. Canonical MCP source catalog verification is separate from hosted authentication and real media completion.

| Symptom | Action |
|---|---|
| HappyHorse missing in Studio | Confirm server registration, database-backed Editor setup, and tool editing permission; package installation alone is insufficient. |
| No matching tool | Check `allowedTools`, service prefix, toolkit filter, and the live server catalog. |
| 401/403 | Check application key, expiration, HappyHorse access and both generation/query API permissions. |
| 429 | Respect the service limit; avoid retrying generation automatically. |
| Pending task | Query the original ID; do not submit a new generation. |
| Failed call / disconnected | Check server connectivity and task history before resubmitting. After `disconnect()`, create a new provider instance. |
| Another LLM provider needed | Configure the agent's reasoning model separately; HappyHorse here is a tool integration. |

To use an existing local MCP installation instead of the hosted endpoint, pass an MCP SDK `StdioClientTransport` through `transport`. Set its `ACEDATACLOUD_API_TOKEN` and `ACEDATACLOUD_API_BASE_URL` in the server-owned child environment; do not also pass `apiKey`. Use a dummy token and a loopback API base for local discovery-only tests.

## Official discovery and contribution

Mastra supports registered ToolProviders, user-configured MCP connections, and a separate managed Connect catalog. This integration uses the first mechanism. It has **not** been admitted to Mastra Connect or the official integration directory. The [official integration-guide request](https://github.com/mastra-ai/mastra/issues/27373) was closed by a maintainer on 2026-10-18 (Asia/Shanghai), stating that this is not being pursued now. Independent ToolProvider installation remains the supported path; this package has no official directory admission. See the [maintainer decision](https://github.com/mastra-ai/mastra/issues/27373#issuecomment-6239261501). See the concrete proposal in [the contribution material](readme/mastra-submission.md). LLM dropdown discovery is a separate [models.dev contribution](https://github.com/anomalyco/models.dev/pull/8873), not a feature of this package.
