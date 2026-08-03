# Asisten Pribadi AI guides

Start with the path that matches your background. Every path uses the same
backend and endpoints; only the tools and depth of explanation change.

| Background | Start here |
| --- | --- |
| No coding experience | [No-code path](no-coding.md) |
| Vibe coder / comfortable prompting | [Vibe coder path](vibe-coder.md) |
| Software developer | [Developer path](developer.md) |
| Custom GPT or agent builder | [Agent builder path](agent-builder.md) |
| Platform, DevOps, or maintainer | [Platform and operations path](platform-operations.md) |

Open `/docs` in the application for the onboarding wizard and interactive
endpoint map. Open `/demo` for a ready-to-run example with synthetic data.

## Rules for every path

- Never put a token in chat, screenshots, issues, or source control.
- The backend derives tenant scope from a token or verified identity, never from a client payload.
- Request explicit user confirmation before any write operation.
- Use a new `requestId` for each new order; reuse it only when retrying an identical payload.
- Start with one read operation before testing a write.
