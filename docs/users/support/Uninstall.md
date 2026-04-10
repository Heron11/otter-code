# Uninstall

Your uninstall method depends on how you installed the CLI.

## Method 1: Using npx

npx runs packages from a temporary cache without a permanent installation. To clear packages run via npx, remove the npx cache folder inside your npm cache.

**macOS / Linux**

```bash
rm -rf "$(npm config get cache)/_npx"
```

**Windows** — Command Prompt:

```cmd
rmdir /s /q "%LocalAppData%\npm-cache\_npx"
```

**Windows** — PowerShell:

```powershell
Remove-Item -Path (Join-Path $env:LocalAppData "npm-cache\_npx") -Recurse -Force
```

## Method 2: Global npm install

If you installed with **`npm install -g .`** from a clone, the global name is the `name` field in the root `package.json` (often `@qwen-code/qwen-code` until you publish under another scope). Check with:

```bash
npm list -g --depth=0
```

Then uninstall, for example:

```bash
npm uninstall -g @qwen-code/qwen-code
```

## GitHub installer

If you used [install-otter.sh](https://raw.githubusercontent.com/Heron11/otter-code/main/scripts/installation/install-otter.sh), you can run:

```bash
curl -fsSL https://raw.githubusercontent.com/Heron11/otter-code/main/scripts/installation/install-otter.sh | bash -s -- --uninstall
```

That removes the global CLI and can optionally delete the checkout under `~/.local/share/otter-code` (when run interactively).
