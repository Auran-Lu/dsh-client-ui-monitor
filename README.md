# @auranlu/dsh-client-ui-monitor

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web plugin that pins a usage dashboard to the bottom-left of the sidebar.

[简体中文](README.zh.md)

It shows, live for the current session:

- **Token usage** — input (with cache read/write), output.
- **Estimated cost** — computed from DeepSeek's published pricing, displayed in CNY or USD.
- **API balance** — your DeepSeek account balance, queried via `GET https://api.deepseek.com/user/balance`.

Features: Chinese/English toggle, currency selector (CNY/USD), manual balance refresh, auto-refresh every 30s.

## Prerequisites

- DeepSeek Harness `web` profile.
- A DeepSeek API key configured in **Settings → Models** (stored as the `DEEPSEEK_API_KEY` credential).

## Install

### Method 1 — GitHub

```bash
dsh plugin --profile web add github:Auran-Lu/dsh-client-ui-monitor
```

**After installing**, register the plugin and restart:

Edit `~/.dsh/profiles/web/cordis.patch.yml` and add this entry to its top-level array:

```yaml
- insert:
    - id: ui-monitor
      name: '@auranlu/dsh-client-ui-monitor'
```

Then restart the server (`dsh web`) and expand the left sidebar.

### Method 2 — one-sentence install (paste to an LLM agent)

Copy the whole block below to a coding agent that has shell access to the machine:

> Install the DeepSeek Harness client plugin from GitHub: run `dsh plugin --profile web add github:Auran-Lu/dsh-client-ui-monitor`, then append this entry to the top-level array of `~/.dsh/profiles/web/cordis.patch.yml`:
>
> ```yaml
> - insert:
>     - id: ui-monitor
>       name: '@auranlu/dsh-client-ui-monitor'
> ```
>
> Finally restart the `dsh web` server and confirm the dashboard appears at the bottom of the left sidebar.

## Configuration

Edit `lib/client.js` before installing / publishing:

| Constant | Default | Meaning |
|---|---|---|
| `PRICING.inputPerM` | `0.27` | USD per 1M prompt tokens (cache miss) |
| `PRICING.cacheReadPerM` | `0.07` | USD per 1M prompt tokens (cache hit) |
| `PRICING.cacheWritePerM` | `0.07` | USD per 1M prompt tokens (cache write) |
| `PRICING.outputPerM` | `1.10` | USD per 1M completion tokens |
| `USD_TO_CNY` | `7.2` | USD → CNY exchange rate |

## How it works

- **Client half** (`lib/client.js`) registers a component into the `sidebar.footer.action` slot and reads the current session's `tokenUsage` projection.
- **Host half** (`lib/index.js`) registers `GET /api/deepseek-balance`, proxying DeepSeek's balance API with the stored key.

## License

MIT
