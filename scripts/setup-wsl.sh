#!/usr/bin/env bash
# One-time setup inside WSL 2 (Ubuntu or Debian). Installs what the verifier and the Claude Code
# sandbox need, checks that bubblewrap can build a sandbox, installs the site's Node dependencies and
# the Playwright browser, then runs the full verification.
#
#   ./scripts/setup-wsl.sh
#
# Uses sudo for apt-get. On Ubuntu 24.04+ it may add the AppArmor profile for bwrap that the
# Claude Code sandboxing docs give. It does not change Git or Claude Code settings.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
sudo=""
[ "$(id -u)" -eq 0 ] || sudo="sudo"

step() { printf '\n==> %s\n' "$*"; }
fail() { printf 'ERROR %s\n' "$*" >&2; exit 1; }

step "Checking the environment"
case "$(uname -r)" in
  *-Microsoft) fail "This distribution runs on WSL 1. The sandbox needs WSL 2: in PowerShell, run 'wsl --set-version <distro> 2'." ;;
  *microsoft*) echo "WSL 2" ;;
  *) echo "NOTE  Not running under WSL. Continuing: these steps also apply to Ubuntu and Debian." ;;
esac
case "$PWD" in
  /mnt/*) fail "The repository is under $PWD. Clone it into the Linux file system instead, such as ~/sandbox." ;;
esac
command -v apt-get >/dev/null 2>&1 || fail "apt-get not found. Install git, python3, bubblewrap, and socat with your package manager."

step "Installing git, python3, bubblewrap, and socat"
$sudo apt-get update
$sudo apt-get install -y git python3 bubblewrap socat

step "Checking whether AppArmor lets bubblewrap create user namespaces"
if [ "$(sysctl -n kernel.apparmor_restrict_unprivileged_userns 2>/dev/null || echo 0)" != "1" ]; then
  echo "Not restricted; nothing to do."
elif [ -e /etc/apparmor.d/bwrap ]; then
  echo "/etc/apparmor.d/bwrap already exists; leaving it as is."
else
  echo "Adding /etc/apparmor.d/bwrap, as the Claude Code sandboxing docs describe."
  $sudo tee /etc/apparmor.d/bwrap >/dev/null <<'EOF'
abi <abi/4.0>,
include <tunables/global>

profile bwrap /usr/bin/bwrap flags=(unconfined) {
  userns,
  include if exists <local/bwrap>
}
EOF
  $sudo systemctl reload apparmor || $sudo apparmor_parser -r /etc/apparmor.d/bwrap
fi

step "Checking that bubblewrap can build a sandbox"
if bwrap --ro-bind / / --dev /dev --unshare-user --unshare-net true; then
  echo "OK"
else
  fail "bubblewrap could not create a sandbox. See https://code.claude.com/docs/en/sandboxing#set-up-linux-and-wsl2"
fi

step "Installing the site's dependencies (Node 22+)"
# WSL appends the Windows PATH, so a Windows node or npm can answer here and then fail on the
# \\wsl.localhost\... path. Only a Linux install inside the distribution works.
for tool in node npm; do
  case "$(command -v "$tool" || true)" in
    /mnt/*) fail "$tool resolves to the Windows install ($(command -v "$tool")). Install Node inside WSL with nvm (https://github.com/nvm-sh/nvm): 'nvm install 22', open a new terminal, then run this script again." ;;
  esac
done
node_major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
if [ "$node_major" -lt 22 ]; then
  fail "Node.js 22 or newer is required (found: $(node -v 2>/dev/null || echo none)). Install it with nvm (https://github.com/nvm-sh/nvm): 'nvm install 22', then run this script again."
fi
npm ci
npx playwright install --with-deps chromium

step "Running the full verification"
./scripts/verify.sh --full

step "Next steps"
if [ -z "$(git config --global user.email || true)" ]; then
  echo "- Set your Git identity, using your GitHub noreply address (GitHub: Settings > Emails):"
  echo "    git config --global user.name \"Your Name\""
  echo "    git config --global user.email \"<id>+<username>@users.noreply.github.com\""
fi
cat <<EOF
- Start the site: npm run dev (then open http://localhost:5173)
- Open this folder in the Claude desktop app: Code tab, new session, environment picker, WSL, $PWD
- Optional, for /permissions, /sandbox, and claude doctor: install the CLI inside WSL with
    curl -fsSL https://claude.ai/install.sh | bash
- Then run the probes in CONTRIBUTING.md, under "Check the effective configuration".
EOF
