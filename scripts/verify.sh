#!/usr/bin/env bash
# Single verification entry point. Exits 0 when every check passes, 1 otherwise.
#
#   ./scripts/verify.sh            fast checks, run after each meaningful change
#   ./scripts/verify.sh --full     fast checks plus the verifier's own tests (what CI runs)
#   ./scripts/verify.sh --root DIR check DIR instead of this repository (the tests use this)
#
# Requires bash 4.4+, git, and python3 (to read JSON). Reports where a problem is, never a secret value.
set -uo pipefail

full=0
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
while [ $# -gt 0 ]; do
  case "$1" in
    --full) full=1 ;;
    --root) root="${2:?--root needs a directory}"; shift ;;
    -h | --help) sed -n '2,8p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done
root="$(cd "$root" && pwd)" || exit 2
failed=0

# check NAME FUNCTION: every line FUNCTION prints is a problem. No output and exit 0 means the check passed.
check() {
  local name="$1" out status
  out="$("$2" 2>&1)"
  status=$?
  if [ "$status" -eq 0 ] && [ -z "$out" ]; then
    echo "PASS  $name"
    return
  fi
  echo "FAIL  $name"
  [ -n "$out" ] || out="exited with status $status"
  printf '%s\n' "$out" | sed 's/^/        /'
  failed=$((failed + 1))
}

in_repo=0
if command -v git >/dev/null 2>&1 && git -C "$root" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  in_repo=1
fi

# Tracked files plus untracked files that are not ignored: everything a commit could pick up.
# Symlinks are skipped so the scans never read outside the repository.
files=()
if [ "$in_repo" -eq 1 ]; then
  while IFS= read -r -d '' f; do
    [ -f "$root/$f" ] && [ ! -L "$root/$f" ] && files+=("$f")
  done < <(git -C "$root" ls-files -z --cached --others --exclude-standard)
else
  echo "NOTE  Not a Git work tree (or git is not on PATH): checking every file under $root"
  while IFS= read -r -d '' f; do
    files+=("${f#./}")
  done < <(cd "$root" && find . -path ./.git -prune -o -type f -print0)
fi

check_settings() {
  local path="$root/.claude/settings.json"
  [ -f "$path" ] || { echo "file is missing"; return; }
  command -v python3 >/dev/null 2>&1 || { echo "python3 is required to read the settings"; return; }
  python3 -I - "$path" <<'PY'
import json, re, sys

try:
    with open(sys.argv[1], encoding="utf-8") as f:
        settings = json.load(f)
except (OSError, ValueError) as e:
    print(f"not valid JSON: {e}")
    sys.exit()
p = settings.get("permissions") or {}
allow, ask, deny = (list(p.get(k) or []) for k in ("allow", "ask", "deny"))

if p.get("disableBypassPermissionsMode") != "disable":
    print('permissions.disableBypassPermissionsMode must be "disable"')
if p.get("defaultMode") in ("bypassPermissions", "auto"):
    print(f"permissions.defaultMode must not be {p['defaultMode']}")
if p.get("blockReadsOutsideWorkingDirectories") is not True:
    print("permissions.blockReadsOutsideWorkingDirectories must be true")
whole_shell = [r for r in allow if re.fullmatch(r"\*|(Bash|PowerShell)(\(\s*(\*|:\*)?\s*\))?", r)]
if whole_shell:
    print("permissions.allow must not allow a whole shell: " + ", ".join(whole_shell))
if "Read(.env)" not in deny:
    print("permissions.deny must contain Read(.env)")
for rule in ("Bash(git push *)", "PowerShell(git push *)", "Bash(dangerouslyDisableSandbox:true)"):
    if rule not in ask + deny:
        print(f"permissions.ask or permissions.deny must contain {rule}")
if (settings.get("sandbox") or {}).get("enabled") is not True:
    print("sandbox.enabled must be true")
PY
}

check_shell_syntax() {
  local f
  for f in "${files[@]}"; do
    [[ $f == *.sh ]] || continue
    bash -n "$root/$f" 2>&1 | sed "s|^$root/||"
  done
  return 0
}

check_secret_files() {
  local f
  for f in "${files[@]}"; do
    [[ $f =~ (^|/)\.env\.example$ ]] && continue
    if [[ $f =~ (^|/)\.env(\..+)?$ || $f =~ \.(pem|key)$ || $f =~ (^|/)\.claude/settings\.local\.json$ || $f =~ (^|/)CLAUDE\.local\.md$ ]]; then
      echo "$f must not be committed"
    fi
  done
  return 0
}

secret_names=('private key block' 'AWS access key id' 'GitHub token' 'Anthropic API key')
secret_patterns=('-----BEGIN [A-Z ]*PRIVATE KEY-----' '\bAKIA[0-9A-Z]{16}\b' '\bgh[pousr]_[A-Za-z0-9]{36,}\b' '\bsk-ant-[A-Za-z0-9_-]{20,}')
check_secret_content() {
  local f i line
  for f in "${files[@]}"; do
    [ "$(wc -c <"$root/$f")" -le 1048576 ] || continue
    for i in "${!secret_patterns[@]}"; do
      # Keep only the line number, so the matched text is never printed.
      grep -nIE -e "${secret_patterns[$i]}" -- "$root/$f" | cut -d: -f1 | while IFS= read -r line; do
        echo "$f:$line: possible ${secret_names[$i]}"
      done
    done
  done
  return 0
}

check_diff_whitespace() {
  # Keep the "file:line: problem" lines and drop the echoed file content.
  { git -C "$root" diff --check; git -C "$root" diff --cached --check; } | grep -v '^[+-]'
  return 0
}

check_self_tests() {
  local out
  [ -f "$root/tests/verify_test.sh" ] || { echo "tests/verify_test.sh is missing"; return; }
  out="$(bash "$root/tests/verify_test.sh" 2>&1)" || printf '%s\n' "$out"
}

check 'Claude Code guardrails (.claude/settings.json)' check_settings
check 'Shell scripts parse (bash -n)' check_shell_syntax
check 'No secret or personal files in the commit set' check_secret_files
check 'No secret-looking content' check_secret_content
if [ "$in_repo" -eq 1 ]; then
  check 'No whitespace errors or conflict markers in uncommitted changes' check_diff_whitespace
fi

# Stack checks (format, lint, type check, tests, build) go here once the repository has code, e.g.
#   check_unit_tests() { npm test >/dev/null 2>&1 || echo "npm test failed; run it for details"; }
#   check 'Unit tests' check_unit_tests

if [ "$full" -eq 1 ]; then
  check 'Verifier self-tests (tests/verify_test.sh)' check_self_tests
fi

if [ "$failed" -gt 0 ]; then
  printf '\n%s check(s) failed.\n' "$failed"
  exit 1
fi
printf '\nAll checks passed.\n'
exit 0
