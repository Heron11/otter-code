<div align="center">

[![License](https://img.shields.io/github/license/Heron11/otter-code.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

**An open-source AI agent that lives in your terminal.**

</div>

> Otter Code is a fork of [qwen-code](https://github.com/QwenLM/qwen-code) with a custom orange/white branding and the `otter` CLI command.

## Why Otter Code?

Otter Code is an open-source AI agent for the terminal. It helps you understand large codebases, automate tedious work, and ship faster.

- **Multi-protocol, OAuth free tier**: use OpenAI / Anthropic / Gemini-compatible APIs, or sign in with Qwen OAuth for 1,000 free requests/day.
- **Open-source, agentic**: rich built-in tools (Skills, SubAgents) for a full agentic workflow.
- **Terminal-first, IDE-friendly**: built for developers who live in the command line, with optional integration for VS Code, Zed, and JetBrains IDEs.

## Installation

### Prerequisites

Make sure you have Node.js 20 or later installed. Download it from [nodejs.org](https://nodejs.org/en/download).

### Install from npm (recommended when published)

The bundled CLI is published as **`@heronsamuel/otter-code`** (npm username scope). After it exists on the [npm registry](https://www.npmjs.com/), install globally:

```bash
npm install -g @heronsamuel/otter-code
```

**Updates:** `npm update -g @heronsamuel/otter-code` (or install a specific version with `@heronsamuel/otter-code@<version>`).

**Publishing** (maintainers): from the repo root, after a normal dev install:

```bash
npm ci
npm run bundle
npm run prepare:package
cd dist && npm publish --access public
```

Use the npm account that owns **`@heronsamuel`** (your username scope) and run `npm login` first. Publishing requires **2FA** (or a granular token with publish permissions) on npm. For GitHub Actions, add an **Automation** token as the **`NPM_TOKEN`** repository secret; the [Release workflow](.github/workflows/release.yml) runs `npm publish` from `dist/` when you trigger a release on `Heron11/otter-code`.

### One-command install from Git (no npm registry)

This mirrors the upstream “curl | bash” flow: it clones or updates the repo under `~/.local/share/otter-code`, runs `npm install`, `build`, `bundle`, and `npm install -g .` so `otter` is on your PATH.

**Linux / macOS**

```bash
curl -fsSL https://raw.githubusercontent.com/Heron11/otter-code/main/scripts/installation/install-otter.sh | bash
```

**Updates:** run the same command again. The script pulls the latest commit on the configured branch and rebuilds.

**More options**

- Custom branch or fork:  
  `OTTER_BRANCH=my-branch OTTER_REPO=https://github.com/you/otter-code.git curl -fsSL https://raw.githubusercontent.com/Heron11/otter-code/main/scripts/installation/install-otter.sh | bash`
- Uninstall (removes global package; optionally deletes the clone):  
  `curl -fsSL https://raw.githubusercontent.com/Heron11/otter-code/main/scripts/installation/install-otter.sh | bash -s -- --uninstall`
- **Install from npm via the same script:**  
  `curl -fsSL https://raw.githubusercontent.com/Heron11/otter-code/main/scripts/installation/install-otter.sh | bash -s -- --npm`  
  (Uses `OTTER_NPM_PACKAGE`, default `@heronsamuel/otter-code`.)

Environment: `OTTER_REPO`, `OTTER_BRANCH`, `OTTER_HOME`.

### Build from source

```bash
git clone https://github.com/Heron11/otter-code.git
cd otter-code
npm install
npm run build
npm run bundle
npm link
```

The `otter` command runs the bundled `dist/cli.js`. After code changes, run `npm run bundle` (not only `npm run build`) so the global `otter` binary picks up new slash commands and UI.

Then launch with:

```bash
otter
```

## Documentation

Extended guides live in this repo under [`docs/`](./docs/index.md) (Quickstart, overview, IDE integration, troubleshooting). They are aligned with **Otter** install URLs and the **`otter`** CLI; a few internal references may still mirror upstream Qwen wording—use **`otter`** and [github.com/Heron11/otter-code](https://github.com/Heron11/otter-code) as the source of truth.

## Quick Start

```bash
# Start Otter Code (interactive)
otter

# Then, in the session:
/help
/auth
```

On first use, you'll be prompted to sign in. You can run `/auth` anytime to switch authentication methods.

Example prompts:

```text
What does this project do?
Explain the codebase structure.
Help me refactor this function.
Generate unit tests for this module.
```

## Authentication

Otter Code supports two authentication methods:

- **Qwen OAuth (recommended & free)**: sign in with your `qwen.ai` account in a browser.
- **API-KEY**: use an API key to connect to any supported provider (OpenAI, Anthropic, Google GenAI, Alibaba Cloud ModelStudio, and other compatible endpoints).

#### Qwen OAuth (recommended)

Start `otter`, then run:

```bash
/auth
```

Choose **Qwen OAuth** and complete the browser flow. Your credentials are cached locally so you usually won't need to log in again.

> **Note:** In non-interactive or headless environments (e.g., CI, SSH, containers), you typically **cannot** complete the OAuth browser login flow. In these cases, please use the API-KEY authentication method.

#### API-KEY (flexible)

The **recommended** way to configure models and providers is by editing `~/.qwen/settings.json` (create it if it doesn't exist).

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3.6-plus",
        "name": "qwen3.6-plus",
        "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "description": "Qwen3-Coder via Dashscope",
        "envKey": "DASHSCOPE_API_KEY"
      }
    ]
  },
  "env": {
    "DASHSCOPE_API_KEY": "sk-xxxxxxxxxxxxx"
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "qwen3.6-plus"
  }
}
```

You can also configure multiple providers (OpenAI, Anthropic, Gemini) side by side and switch with `/model`.

> **Security note:** Never commit API keys to version control. The `~/.qwen/settings.json` file is in your home directory and should stay private.

## Usage

Otter Code can be used in four primary ways:

1. Interactive mode (terminal UI)
2. Headless mode (scripts, CI)
3. IDE integration (VS Code, Zed)
4. TypeScript SDK

#### Interactive mode

```bash
cd your-project/
otter
```

Run `otter` in your project folder to launch the interactive terminal UI. Use `@` to reference local files (for example `@src/main.ts`).

#### Headless mode

```bash
cd your-project/
otter -p "your question"
```

Use `-p` to run Otter Code without the interactive UI — ideal for scripts, automation, and CI/CD.

## Commands & Shortcuts

### Session Commands

- `/help` - Display available commands
- `/clear` - Clear conversation history
- `/compress` - Compress history to save tokens
- `/stats` - Show current session information
- `/bug` - Submit a bug report
- `/exit` or `/quit` - Exit Otter Code

### Keyboard Shortcuts

- `Ctrl+C` - Cancel current operation
- `Ctrl+D` - Exit (on empty line)
- `Up/Down` - Navigate command history

## Configuration

Otter Code can be configured via `settings.json`, environment variables, and CLI flags.

| File                    | Scope         | Description                                                                              |
| ----------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| `~/.qwen/settings.json` | User (global) | Applies to all your Otter Code sessions. **Recommended for `modelProviders` and `env`.** |
| `.qwen/settings.json`   | Project       | Applies only when running Otter Code in this project. Overrides user settings.           |

| Field                        | Description                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `modelProviders`             | Define available models per protocol (`openai`, `anthropic`, `gemini`, `vertex-ai`).                 |
| `env`                        | Fallback environment variables (e.g. API keys). Lower priority than shell `export` and `.env` files. |
| `security.auth.selectedType` | The protocol to use on startup (e.g. `openai`).                                                      |
| `model.name`                 | The default model to use when Otter Code starts.                                                     |

## Troubleshooting

If you encounter issues, run `/bug` from within the CLI and include a short title and repro steps.

## Acknowledgments

This project is based on [Google Gemini CLI](https://github.com/google-gemini/gemini-cli) and the work of the Gemini CLI and Qwen Code teams.
