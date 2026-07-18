# OpenAI Platform opportunities for TemanUsaha AI

## Recommendation

Keep the current hackathon path—Custom GPT, GPT Actions, Convex, and the verification dashboard. The smallest high-value additions are stronger tool schemas and repeatable evaluations. Voice and an Apps SDK surface are good follow-ups, not requirements for the current demo.

## Priority 1: safer, testable actions

### Strict function calling and Structured Outputs

If TemanUsaha later adds a Responses API runtime, define every operation with strict function schemas. OpenAI recommends `strict: true`; strict schemas require all properties to be listed as required and object schemas to use `additionalProperties: false`. This directly supports reliable order quantities, payment states, pickup times, and action receipts.

Source: [Function calling — strict mode](https://developers.openai.com/api/docs/guides/function-calling#strict-mode)

### Evals and trace graders

Create a small Bahasa Indonesia dataset covering:

- correct `create_order` selection;
- item and quantity extraction;
- confirmation before mutations;
- insufficient-stock rejection;
- idempotent retries;
- AI Action Receipt completeness.

OpenAI's agent evaluation guidance recommends starting with traces while debugging, then moving to datasets and repeatable eval runs. Trace graders can inspect tool selection, tool arguments, guardrail compliance, and workflow regressions.

Source: [Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals)

## Priority 2: voice-first warung workflow

The Realtime API can support low-latency speech-to-speech sessions that call server-side tools. A later demo could let Bu Sari say an order aloud, review the parsed order, and confirm before the existing Convex action runs.

Keep voice optional. The existing text flow remains the reliable fallback and source of demo truth.

Source: [Realtime and audio](https://developers.openai.com/api/docs/guides/realtime)

## Priority 3: richer ChatGPT surface

The Apps SDK uses MCP as the connection between model, tools, and inline UI components. TemanUsaha could expose its five existing operations through an MCP server and render a compact order confirmation or daily-summary card directly inside ChatGPT.

This is most useful after the GPT Actions demo is complete because it introduces another client surface and authentication path.

Source: [Apps SDK — MCP](https://developers.openai.com/apps-sdk/concepts/mcp-server)

## Platform building blocks worth knowing

The Responses API is OpenAI's unified interface for agent-like applications. Its built-in tools include web search, file search, computer use, code interpreter, and remote MCP, with native multimodal and multi-turn support.

For this project:

- Function tools or remote MCP: relevant for the five Convex operations.
- Realtime: relevant for optional voice order capture.
- Evals and traces: relevant immediately for demo reliability.
- Apps SDK: relevant for a future inline ChatGPT dashboard.
- Web search: only for clearly sourced external questions such as supplier research; never for order or stock truth.
- File search/RAG: skip until the project has real documents worth retrieving.
- Computer use: skip; direct Convex actions are safer and simpler.
- Code interpreter: skip for the narrow operational demo; consider only for later ad-hoc analysis.

Sources: [Responses API overview](https://developers.openai.com/api/docs/guides/migrate-to-responses#about-the-responses-api), [MCP and Connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp), [OpenAI Platform](https://platform.openai.com/home)

## Suggested implementation order

1. Finish and rehearse the current GPT Actions flow.
2. Add a 10–20 case action-eval dataset.
3. Prototype one voice order flow with explicit confirmation.
4. Only then consider an Apps SDK/MCP version of the five operations.
