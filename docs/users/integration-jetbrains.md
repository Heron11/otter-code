# JetBrains IDEs

> JetBrains IDEs can use ACP-based agents. For **Otter Code**, install the **`otter`** CLI from [GitHub](https://github.com/Heron11/otter-code) and register the agent with `otter --acp`. Registry listings may still say “Qwen Code”; use a custom agent if needed.

### Features

- **Native agent experience** in the AI Chat tool window
- **Agent Client Protocol** (ACP)
- **Symbol management** via #-mentions
- **Conversation history**

### Requirements

- A JetBrains IDE with ACP support
- Otter Code CLI installed

### Installation

#### From ACP registry

1. Install the CLI:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/Heron11/otter-code/main/scripts/installation/install-otter.sh | bash
   ```

2. In the IDE, open the AI Chat tool window → **Add ACP Agent** → install from registry if an Otter-compatible entry exists.

#### Manual configuration

1. Install the CLI as above.

2. **Configure ACP Agent** and use a command that runs `otter` with `--acp`, for example:

```json
{
  "agent_servers": {
    "otter": {
      "command": "otter",
      "args": ["--acp"],
      "env": {}
    }
  }
}
```

Replace `"command"` with an absolute path if `otter` is not on the default PATH used by the IDE.

## Troubleshooting

### Agent not appearing

- Run `otter --version` in a terminal.
- Confirm the IDE version supports ACP.
- Restart the IDE.

### Agent not responding

- Check connectivity.
- Verify `otter` runs interactively in a terminal.
- Issues: [github.com/Heron11/otter-code/issues](https://github.com/Heron11/otter-code/issues)
