# Otter Code overview

[![GitHub](https://img.shields.io/github/stars/Heron11/otter-code?style=social)](https://github.com/Heron11/otter-code)

> **Otter Code** is a fork of [Qwen Code](https://github.com/QwenLM/qwen-code): the same agentic coding tool for your terminal, with Otter branding and the `otter` command. This overview uses Otter-specific install paths; upstream Qwen docs may still refer to `qwen` and the npm registry.

## Get started in 30 seconds

### Install Otter Code

**Linux / macOS (recommended — installs from GitHub, no npm registry required)**

```sh
curl -fsSL https://raw.githubusercontent.com/Heron11/otter-code/main/scripts/installation/install-otter.sh | bash
```

Run the same command again anytime to update (pull latest, rebuild, reinstall globally).

> [!note]
>
> Restart your terminal after installation if `otter` is not found. If install fails, see [Manual installation](./quickstart#manual-installation) in the Quickstart guide or the [repository README](https://github.com/Heron11/otter-code/blob/main/README.md).

### Start using Otter Code

```bash
cd your-project
otter
```

Select **Qwen OAuth (Free)** authentication and follow the prompts to log in. Then try:

```
what does this project do?
```

![](https://cloud.video.taobao.com/vod/j7-QtQScn8UEAaEdiv619fSkk5p-t17orpDbSqKVL5A.mp4)

You'll be prompted to log in on first use. That's it! [Continue with Quickstart (5 mins) →](./quickstart)

> [!tip]
>
> See [troubleshooting](./support/troubleshooting) if you hit issues.

> [!note]
>
> **VS Code extension (upstream Qwen)**: A graphical companion exists on the marketplace as [Qwen Code Companion](https://marketplace.visualstudio.com/items?itemName=qwenlm.qwen-code-vscode-ide-companion). Otter Code focuses on the `otter` CLI; check the Otter repo for IDE-specific notes.

## What Otter Code does for you

- **Build features from descriptions**: Describe what you want in plain language. Otter Code will plan, write code, and help verify behavior.
- **Debug and fix issues**: Describe a bug or paste an error; it will analyze the codebase and suggest or apply fixes.
- **Navigate any codebase**: Ask questions about structure and behavior; use [MCP](./features/mcp) for external tools and data sources.
- **Automate tedious tasks**: Lint fixes, merge conflicts, release notes — from your machine or in CI.
- **[Followup suggestions](./features/followup-suggestions)**: Ghost-text suggestions you can accept with Tab.

## Why developers love it

- **Works in your terminal**: Meets you where you already work.
- **Takes action**: Edits files, runs commands, and can use MCP for your stack.
- **Unix-friendly**: Pipelines and scripting work as you expect, e.g. `tail -f app.log | otter -p "…"`.
