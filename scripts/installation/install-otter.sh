#!/usr/bin/env bash
# Otter Code — install / upgrade helper (Linux / macOS)
#
# Default: clone or update the repo under ~/.local/share/otter-code, build, bundle,
#          and install globally with npm (same result as a local dev link).
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Heron11/otter-code/main/scripts/installation/install-otter.sh | bash
#   curl ... | bash -s -- --npm
#   ./install-otter.sh --help
#
# Environment:
#   OTTER_REPO       Git URL (default: https://github.com/Heron11/otter-code.git)
#   OTTER_BRANCH     Branch or tag (default: main)
#   OTTER_HOME       Clone directory (default: ~/.local/share/otter-code)
#   OTTER_NPM_PACKAGE npm package for --npm (default: @heronsamuel/otter-code)

set -euo pipefail

if [ -z "${BASH_VERSION:-}" ]; then
  echo "This script requires bash." >&2
  exit 1
fi

OTTER_REPO="${OTTER_REPO:-https://github.com/Heron11/otter-code.git}"
OTTER_BRANCH="${OTTER_BRANCH:-main}"
OTTER_HOME="${OTTER_HOME:-${XDG_DATA_HOME:-$HOME/.local/share}/otter-code}"
OTTER_NPM_PACKAGE="${OTTER_NPM_PACKAGE:-@heronsamuel/otter-code}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ${NC}  $*"; }
log_ok() { echo -e "${GREEN}✓${NC}  $*"; }
log_warn() { echo -e "${YELLOW}!${NC}  $*"; }
log_err() { echo -e "${RED}✗${NC}  $*" >&2; }

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log_err "Missing command: $1"
    exit 1
  fi
}

require_node_20() {
  need_cmd node
  node -e '
    const m = /^v(\d+)/.exec(process.version);
    const major = m ? parseInt(m[1], 10) : 0;
    if (major < 20) { process.exit(1); }
  ' 2>/dev/null || {
    log_err "Node.js 20 or later is required (found $(node -v 2>/dev/null || echo none))."
    log_info "Install from https://nodejs.org or use your version manager (nvm, fnm, asdf)."
    exit 1
  }
}

usage() {
  cat <<'EOF'
Otter Code installer

  --git              Install from GitHub (default): clone or pull, build, bundle, npm install -g .
  --npm              Install from the npm registry (requires a published package).
  --uninstall        Remove global installs (tries common package names) and optionally delete OTTER_HOME.
  -h, --help         Show this help.

Environment: OTTER_REPO, OTTER_BRANCH, OTTER_HOME, OTTER_NPM_PACKAGE

Examples:
  curl -fsSL .../install-otter.sh | bash
  curl -fsSL .../install-otter.sh | bash -s -- --npm
  OTTER_BRANCH=develop curl -fsSL .../install-otter.sh | bash
EOF
}

MODE="git"
DO_UNINSTALL=0

while [ $# -gt 0 ]; do
  case "$1" in
    --git) MODE="git"; shift ;;
    --npm) MODE="npm"; shift ;;
    --uninstall) DO_UNINSTALL=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *)
      log_err "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

uninstall_otter() {
  log_info "Removing global Otter Code package (if present)…"
  npm uninstall -g "${OTTER_NPM_PACKAGE}" 2>/dev/null || true
  npm uninstall -g "@heronsamuel/otter-code" 2>/dev/null || true
  npm uninstall -g "@qwen-code/qwen-code" 2>/dev/null || true
  if command -v otter >/dev/null 2>&1; then
    log_warn "The 'otter' command is still on PATH; check npm global bin and shell config."
  else
    log_ok "Global package removed."
  fi
  if [ -d "${OTTER_HOME}" ]; then
    if [ -t 0 ] && [ -t 1 ]; then
      read -r -p "Delete source checkout at ${OTTER_HOME}? [y/N] " ans || true
      case "${ans:-}" in
        y|Y|yes|YES) rm -rf "${OTTER_HOME}" && log_ok "Removed ${OTTER_HOME}" ;;
        *) log_info "Kept ${OTTER_HOME}" ;;
      esac
    else
      log_info "Non-interactive: keeping ${OTTER_HOME} (delete manually if desired)."
    fi
  fi
}

install_from_npm() {
  require_node_20
  need_cmd npm
  log_info "Installing ${OTTER_NPM_PACKAGE}@latest from npm…"
  if npm install -g "${OTTER_NPM_PACKAGE}@latest"; then
    log_ok "Installed. Run: otter --version"
  else
    log_err "npm install failed. Is the package published and the name correct? (OTTER_NPM_PACKAGE=${OTTER_NPM_PACKAGE})"
    log_info "Try install from Git instead: curl ... | bash"
    exit 1
  fi
}

install_from_git() {
  require_node_20
  need_cmd git
  need_cmd npm

  if [ -d "${OTTER_HOME}/.git" ]; then
    log_info "Updating existing clone at ${OTTER_HOME}…"
    git -C "${OTTER_HOME}" fetch origin "${OTTER_BRANCH}"
    git -C "${OTTER_HOME}" checkout "${OTTER_BRANCH}"
    if ! git -C "${OTTER_HOME}" reset --hard "origin/${OTTER_BRANCH}"; then
      log_warn "Hard reset failed; try manually in ${OTTER_HOME}"
      exit 1
    fi
  else
    log_info "Cloning ${OTTER_REPO} (branch ${OTTER_BRANCH})…"
    mkdir -p "$(dirname "${OTTER_HOME}")"
    rm -rf "${OTTER_HOME}"
    git clone --depth 1 --branch "${OTTER_BRANCH}" "${OTTER_REPO}" "${OTTER_HOME}" || {
      log_warn "Shallow clone failed; trying full clone…"
      git clone --branch "${OTTER_BRANCH}" "${OTTER_REPO}" "${OTTER_HOME}"
    }
  fi

  log_info "Installing dependencies (npm install --ignore-scripts)…"
  log_info "Skipping lifecycle scripts so install does not run prepare (build+bundle) twice."
  (cd "${OTTER_HOME}" && npm install --ignore-scripts)

  log_info "Running core postinstall (ripgrep permissions, etc.)…"
  (cd "${OTTER_HOME}/packages/core" && node scripts/postinstall.js) || true

  log_info "Building…"
  (cd "${OTTER_HOME}" && npm run build)

  log_info "Bundling CLI…"
  (cd "${OTTER_HOME}" && npm run bundle)

  log_info "Installing globally (npm install -g . --ignore-scripts)…"
  log_info "Skipping lifecycle scripts: global install cannot run prepare (workspaces + husky)."
  (cd "${OTTER_HOME}" && npm install -g . --ignore-scripts)

  log_ok "Otter Code is ready. Run: otter --version"
}

if [ "${DO_UNINSTALL}" -eq 1 ]; then
  uninstall_otter
  exit 0
fi

case "${MODE}" in
  npm) install_from_npm ;;
  git) install_from_git ;;
  *)
    log_err "Invalid mode: ${MODE}"
    exit 1
    ;;
esac
