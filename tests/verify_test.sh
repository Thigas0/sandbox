#!/usr/bin/env bash
# Tests for scripts/verify.sh. Each case builds a temporary fixture holding a copy of the real
# .claude/settings.json, runs the verifier against it, and checks the exit code.
# Exits 1 if any case fails.
set -uo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
verify="$repo/scripts/verify.sh"
failed=0

# Assembled at run time so this file does not trip the scanner it is testing.
fake_aws_key="AKIA""ABCDEFGHIJKLMNOP"

# edit_settings DIR PYTHON: run the Python statement with the fixture's settings bound to `s`, then save.
edit_settings() {
  python3 -I - "$1/.claude/settings.json" "$2" <<'PY'
import json, sys

path, change = sys.argv[1], sys.argv[2]
with open(path, encoding="utf-8") as f:
    s = json.load(f)
exec(change, {"s": s})
with open(path, "w", encoding="utf-8") as f:
    json.dump(s, f, indent=2)
PY
}

# run_case NAME EXPECTED_EXIT ARRANGE [MUST_NOT_PRINT]
# ARRANGE is a command string evaluated with $d set to the fixture directory.
run_case() {
  local name="$1" expected="$2" arrange="$3" secret="${4:-}" d out status problem=""
  d="$(mktemp -d)"
  mkdir -p "$d/.claude"
  cp "$repo/.claude/settings.json" "$d/.claude/"
  if ! eval "$arrange"; then
    problem="arrange step failed"
  else
    out="$(bash "$verify" --root "$d" 2>&1)"
    status=$?
    if [ "$status" -ne "$expected" ]; then
      problem="exit code $status, expected $expected"
    elif [ -n "$secret" ] && [[ $out == *"$secret"* ]]; then
      problem="output echoed the secret value"
    fi
  fi
  if [ -n "$problem" ]; then
    printf 'FAIL  %s (%s)\n%s\n' "$name" "$problem" "${out:-}"
    failed=$((failed + 1))
  else
    echo "PASS  $name"
  fi
  rm -rf "$d"
}

run_case 'clean fixture passes' 0 ':'
run_case '.env.example is allowed' 0 'echo "API_KEY=changeme" >"$d/.env.example"'
run_case 'missing settings fails' 1 'rm "$d/.claude/settings.json"'
run_case 'invalid settings JSON fails' 1 'echo "{ not json" >"$d/.claude/settings.json"'
run_case 'removing the bypass-mode lock fails' 1 \
  'edit_settings "$d" "del s[\"permissions\"][\"disableBypassPermissionsMode\"]"'
run_case 'removing the read block outside the workspace fails' 1 \
  'edit_settings "$d" "del s[\"permissions\"][\"blockReadsOutsideWorkingDirectories\"]"'
run_case 'allowing all Bash commands fails' 1 \
  'edit_settings "$d" "s[\"permissions\"][\"allow\"].append(\"Bash(*)\")"'
run_case 'allowing all PowerShell commands fails' 1 \
  'edit_settings "$d" "s[\"permissions\"][\"allow\"].append(\"PowerShell\")"'
run_case 'dropping the PowerShell git push prompt fails' 1 \
  'edit_settings "$d" "s[\"permissions\"][\"ask\"].remove(\"PowerShell(git push *)\")"'
run_case 'dropping the unsandboxed-retry prompt fails' 1 \
  'edit_settings "$d" "s[\"permissions\"][\"ask\"].remove(\"Bash(dangerouslyDisableSandbox:true)\")"'
run_case 'dropping the .env read deny fails' 1 \
  'edit_settings "$d" "s[\"permissions\"][\"deny\"].remove(\"Read(.env)\")"'
run_case 'turning the sandbox off fails' 1 \
  'edit_settings "$d" "s[\"sandbox\"][\"enabled\"] = False"'
run_case 'shell syntax error fails' 1 'printf "if then\n" >"$d/broken.sh"'
run_case '.env file fails' 1 'echo "PLACEHOLDER=1" >"$d/.env"'
run_case 'personal settings file fails' 1 'echo "{}" >"$d/.claude/settings.local.json"'
run_case 'secret-looking content fails without being echoed' 1 \
  'echo "aws_access_key_id = $fake_aws_key" >"$d/notes.txt"' "$fake_aws_key"
run_case 'ignored .env in a Git work tree passes' 0 \
  'git -C "$d" init -q && echo ".env" >"$d/.gitignore" && echo "PLACEHOLDER=1" >"$d/.env"'
run_case 'whitespace error in an uncommitted change fails' 1 \
  'git -C "$d" init -q && echo "ok" >"$d/a.txt" && git -C "$d" add a.txt && echo "trailing " >"$d/a.txt"'

# Build output (dist/) checks. Fake values are assembled at run time, like the AWS key above.
fake_groq_key="gsk_""abcdefghijklmnopqrstuvwxyz0123456789ABCD"
fake_canvas_token="1234~""$(printf 'a%.0s' {1..64})"
# make_dist DIR: a small, clean build output.
make_dist() {
  mkdir -p "$1/dist/assets" &&
    printf '<!doctype html><link rel="stylesheet" href="/assets/a.css"><script type="module" src="/assets/a.js"></script><a href="https://example.com">link</a>\n' >"$1/dist/index.html" &&
    echo 'body{font-family:x;src:url(/fonts/a.woff2)}' >"$1/dist/assets/a.css" &&
    echo 'console.log(1)' >"$1/dist/assets/a.js"
}
run_case 'clean dist/ passes' 0 'make_dist "$d"'
run_case 'Groq key in dist/ fails without being echoed' 1 \
  'make_dist "$d" && echo "const k=\"$fake_groq_key\"" >>"$d/dist/assets/a.js"' "$fake_groq_key"
run_case 'Canvas token in dist/ fails without being echoed' 1 \
  'make_dist "$d" && echo "t=\"$fake_canvas_token\"" >>"$d/dist/assets/a.js"' "$fake_canvas_token"
run_case 'external script in dist/ fails' 1 \
  'make_dist "$d" && echo "<script src=\"https://cdn.example.com/x.js\"></script>" >>"$d/dist/index.html"'
run_case 'protocol-relative stylesheet in dist/ fails' 1 \
  'make_dist "$d" && echo "<link rel=\"stylesheet\" href=\"//cdn.example.com/x.css\">" >>"$d/dist/index.html"'
run_case 'external font in dist/ CSS fails' 1 \
  'make_dist "$d" && echo "@font-face{src:url(\"https://fonts.example.com/f.woff2\")}" >>"$d/dist/assets/a.css"'
run_case 'JS over the size budget fails' 1 \
  'make_dist "$d" && head -c 40000 /dev/urandom | base64 >"$d/dist/assets/big.js"'

if [ "$failed" -gt 0 ]; then
  printf '\n%s test(s) failed.\n' "$failed"
  exit 1
fi
printf '\nAll tests passed.\n'
exit 0
