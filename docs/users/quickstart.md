# Quickstart

> Welcome to Otter Code!

This quickstart will get you to productive AI-assisted coding in a few minutes. The CLI command is **`otter`** (see the [repository README](https://github.com/Heron11/otter-code/blob/main/README.md) for install options).

## Before you begin

Make sure you have:

- A **terminal** or command prompt open
- A code project to work with
- A [Qwen account](https://chat.qwen.ai/auth?mode=register) if you plan to use **Qwen OAuth** (recommended free tier)

## Step 1: Install Otter Code

### Quick install (recommended)

**Linux / macOS** — downloads the installer from GitHub, clones/updates the repo under `~/.local/share/otter-code`, builds, and installs `otter` globally (no public npm package required):

```sh
curl -fsSL https://raw.githubusercontent.com/Heron11/otter-code/main/scripts/installation/install-otter.sh | bash
```

**Windows:** Use [WSL](https://learn.microsoft.com/en-us/windows/wsl/) and run the command above, or clone [Heron11/otter-code](https://github.com/Heron11/otter-code) and follow **Build from source** below.

> [!note]
>
> Restart your terminal after installation if `otter` is not on your `PATH`.

### Manual installation

**Prerequisites:** Node.js 20 or later — [nodejs.org](https://nodejs.org/en/download).

**From a git clone** (typical for contributors):

```bash
git clone https://github.com/Heron11/otter-code.git
cd otter-code
npm install
npm run build
npm run bundle
npm link
```

The `otter` binary uses the bundled `dist/cli.js`. After code changes, run **`npm run bundle`** (not only `npm run build`) so the CLI matches your tree.

**Optional — global install from a clone directory**

```bash
npm install -g .
```

Use the same package name for removal as shown by `npm list -g --depth=0` (often `@qwen-code/qwen-code` until you publish under a custom scope).

## Step 2: Log in to your account

Otter Code needs authentication. In an interactive session started with **`otter`**, you will be prompted to sign in:

```bash
otter
```

```bash
/auth
```

Select **Qwen OAuth**, complete the browser flow, and confirm. Credentials are stored locally.

> [!note]
>
> Authenticating with Qwen creates a **`.qwen`** workspace for usage tracking (paths and behavior match upstream Qwen Code).

> [!tip]
>
> You can also run **`otter auth`** and **`otter auth status`** from the terminal without a full session. See [Authentication](./configuration/auth).

## Step 3: Start your first session

```bash
cd /path/to/your/project
otter
```

You should see the welcome UI. Type `/help` for slash commands.

## Chat with Otter Code

### Ask your first question

```
explain the folder structure
```

```
what can Otter Code do?
```

> [!note]
>
> Otter Code reads files as needed and can explain its own features.

### Make your first code change

```
add a hello world function to the main file
```

Otter Code will propose changes and ask before editing.

### Use Git with Otter Code

```
what files have I changed?
```

```
commit my changes with a descriptive message
```

```
create a new branch called feature/quickstart
```

### Fix a bug or add a feature

Describe what you want in natural language; Otter Code will locate code, propose changes, and run tests when available.

### Other workflows

**Refactor**

```
refactor the authentication module to use async/await instead of callbacks
```

**Tests**

```
write unit tests for the calculator functions
```

**Docs**

```
update the README with installation instructions
```

**Review**

```
review my changes and suggest improvements
```

> [!tip]
>
> Describe outcomes clearly, like you would to a teammate.

## Essential commands

| Command             | What it does                       | Example              |
| ------------------- | ---------------------------------- | -------------------- |
| `otter`             | Start Otter Code                   | `otter`              |
| `/auth`             | Change authentication (in session) | `/auth`              |
| `otter auth`        | Configure auth from the terminal   | `otter auth`         |
| `otter auth status` | Show auth status                   | `otter auth status`  |
| `/help`             | Help for slash commands            | `/help` or `/?`      |
| `/compress`         | Summarize history to save tokens   | `/compress`          |
| `/clear`            | Clear screen                       | `/clear` (`Ctrl+L`)  |
| `/theme`            | Change theme                       | `/theme`             |
| `/language`         | UI / output language               | `/language ui zh-CN` |
| `/quit`             | Exit                               | `/quit` or `/exit`   |

See the [CLI reference](./features/commands) for the full list (some examples there may still say `qwen`; use `otter` in this fork).

## Pro tips

**Be specific** — e.g. “fix the login bug where the screen stays blank after wrong credentials” instead of “fix the bug”.

**Break work into steps** — multi-step prompts work well.

**Explore first** — e.g. `analyze the database schema` before large refactors.

**Shortcuts** — `?` for keys, Tab for completion, ↑ for history, `/` for slash commands.

## Getting help

- **In the app:** `/help` or ask how to do something.
- **Docs:** This site and the [GitHub README](https://github.com/Heron11/otter-code/blob/main/README.md).
- **Issues:** [github.com/Heron11/otter-code/issues](https://github.com/Heron11/otter-code/issues).
