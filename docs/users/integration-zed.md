# Zed Editor

> Zed supports AI assistants via the Agent Client Protocol (ACP). This page describes integrating the **Otter Code** CLI (`otter`). The Zed registry may still list “Qwen Code”; if you use this fork, install the CLI from [GitHub](https://github.com/Heron11/otter-code) and point the agent at the **`otter`** binary.

![Zed Editor Overview](https://img.alicdn.com/imgextra/i1/O1CN01aAhU311GwEoNh27FP_!!6000000000686-2-tps-3024-1898.png)

### Features

- **Native agent experience**: Integrated AI assistant panel within Zed
- **Agent Client Protocol**: ACP for IDE interactions
- **File management**: @-mention files for context
- **Conversation history**: Past conversations in Zed

### Requirements

- Zed Editor (latest recommended)
- Otter Code CLI installed — [one-line install](https://github.com/Heron11/otter-code#installation) or build from source

### Installation

#### Install from ACP Registry

1. Install the CLI (example — GitHub installer):

   ```bash
   curl -fsSL https://raw.githubusercontent.com/Heron11/otter-code/main/scripts/installation/install-otter.sh | bash
   ```

2. Install [Zed](https://zed.dev/).

3. In Zed: **settings → Add agent → Install from Registry**. If an “Otter” entry is not listed, use **Create a custom agent** below.

#### Manual install (custom agent)

1. Install the CLI as above.

2. In Zed, **Add agent → Create a custom agent** with:

```json
"Otter Code": {
  "type": "custom",
  "command": "otter",
  "args": ["--acp"],
  "env": {}
}
```

Use `"command": "otter"` if `otter` is on your `PATH`, or an absolute path to the binary.

## Troubleshooting

### Agent not appearing

- Run `otter --version` in a terminal.
- Validate JSON configuration.
- Restart Zed.

### Agent not responding

- Check network connectivity.
- Run `otter` alone to verify the CLI.
- Report issues: [github.com/Heron11/otter-code/issues](https://github.com/Heron11/otter-code/issues)
