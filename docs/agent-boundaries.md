# Agent boundaries: what is enforced and what is not

Written against the Claude Code documentation as of October 2026 (Claude Code 2.1.x). Sources are
linked at the end. The intended setup is the desktop app or CLI running inside WSL 2.

## The layers

| Layer | What it does | Enforced by | Status here |
| :- | :- | :- | :- |
| Permission rules in `.claude/settings.json` | Deny, prompt for, or pre-approve specific tool calls | Claude Code, before each tool call | Active everywhere |
| Permission mode (`defaultMode`) | Decides which actions need your approval | Claude Code | Sessions start in Accept edits |
| OS sandbox (`sandbox` block) | Limits the files and hosts shell commands and their child processes can reach | The operating system (bubblewrap in WSL 2) | Active in WSL 2 once `bubblewrap` and `socat` are installed. **Not available on native Windows** |
| `CLAUDE.md` | Tells Claude how to work | Nothing. It is guidance | Loaded as instructions |
| Git worktree | Keeps one task's changes apart from another's | Nothing. It is not a security sandbox | Optional |
| Dev container | Reproducible environment. Its security depends on mounts, privileges, credentials, and networking | The container runtime | Not configured |

`CLAUDE.md` does not restrict file or network access. Permission rules are enforced, but they match
the command text and are not an OS boundary. The sandbox is the OS boundary, and it covers shell
commands only: Claude's file tools, hooks, MCP servers, and other helper processes run outside it.

## What the settings do

- **Sandbox:** shell commands can write only to the workspace and a per-user temp directory. Their
  network goes through a proxy whose domain allowlist is empty, so the first connection to any host
  prompts you (in auto mode, the classifier decides instead). Sandboxed commands run without a
  prompt (`autoAllowBashIfSandboxed`); deny rules and the ask rules below still apply.
- **Read block** (`blockReadsOutsideWorkingDirectories`): Claude's file tools refuse to read outside
  the workspace, and sandboxed commands lose read access to your home directory and `/mnt`, which is
  where WSL mounts your Windows drives. Git keeps your global config; `~/.git-credentials` stays
  blocked. To give Claude another directory, use `/add-dir`.
- **deny:** Claude cannot read, edit, or create `.env` files (except `.env.example`), `*.pem`,
  `*.key`, anything under a `secrets/` folder, or the usual credential locations in your home
  directory (`~/.ssh`, `~/.aws`, `~/.azure`, `~/.kube`, `~/.gnupg`, `~/.config/gh`, and similar).
- **ask:** these always prompt a person, in every permission mode including auto: `git push`, `pull`,
  `merge`, `rebase`, `commit`, `reset`, `clean`, `restore`, `checkout --`, `stash drop`,
  `stash clear`, `branch -D`; any `gh` command; `curl`, `wget`, `ssh`, `scp` (and the PowerShell
  equivalents); and any attempt to rerun a command outside the sandbox.
- **allow:** only `./scripts/verify.sh` and `./scripts/verify.sh --full`.
- **Bypass-permissions mode is disabled.** Auto mode stays selectable. To remove it too, add
  `"disableAutoMode": "disable"` under `permissions`.
- **Attribution is off**, so Claude Code adds no `Co-Authored-By` trailer or PR footer.

## Known gaps

- Shell rules match the command text. `git push` prompts, but `git -C . push` does not match the
  rule. In WSL 2 the sandbox still confines what that command can reach, and the push still needs
  a network host that you approve (in auto mode, the classifier decides).
- File deny rules cover Claude's file tools and the file commands Claude Code recognizes (`cat`,
  `head`, and redirections). On Linux and WSL 2, `claude doctor` warns that the glob rules
  `Read(.env.*)`, `Read(*.pem)`, and `Read(*.key)` are not passed to the sandbox, so a script that
  opens such a file itself is not stopped. Exact paths such as `.env` and `~/.ssh` are. Keep real
  secrets out of the workspace.
- Pre-approving `./scripts/verify.sh` approves whatever that script runs, including tests Claude
  just edited. In WSL 2 that runs inside the sandbox; on native Windows it does not.
- The public JSON schema for settings does not list `blockReadsOutsideWorkingDirectories` yet, so
  an editor may underline it. The key is documented, `claude doctor` accepts it, and a probe in a
  session confirmed it blocks reads.

## Native Windows (for example, a college computer)

Without WSL 2, shell commands run unsandboxed with your full user access, and only the permission
rules apply. Every ask rule is written for both the Bash and the PowerShell tool for that case.
The verifier needs bash and python3, so it does not run in plain PowerShell. Treat that machine as:
Claude can do what you can do, and the rules decide when you get asked.

## Precedence and trust

- Highest to lowest: managed settings, command-line flags (`--settings`),
  `.claude/settings.local.json`, `.claude/settings.json`, `~/.claude/settings.json`. Lists such as
  `permissions.allow` merge across files.
- Rules are checked deny first, then ask, then allow, across all files. An allow rule cannot carve
  an exception out of a deny or an ask.
- A `Read` deny rule also blocks creating that file. The `Read(!.env.example)` negation keeps
  `.env.example` usable.
- Allow rules in `.claude/settings.json` take effect only after you accept the workspace trust
  dialog for the folder. In WSL, trust is per distribution and folder. Deny and ask rules apply
  immediately.
- A project file cannot start sessions in `auto` or `bypassPermissions` mode. The desktop app
  remembers the mode you last picked per folder, and that choice overrides `defaultMode`. The VS
  Code extension ignores a project's `defaultMode`.
- Edits to settings files apply to the running session, so you can probe a rule right after
  changing it.
- `.claude/settings.local.json` is personal and ignored by Git. It can add rules, but it cannot
  undo this file's deny or ask rules.
- Cloud sessions read `.claude/settings.json` from the clone, but not your user or local settings.
  Their isolation is the cloud container. In a test there, the OS sandbox did not engage even with
  bubblewrap installed (a probe could write to the home directory), so check the sandbox in WSL 2
  with the probes in CONTRIBUTING.md rather than assuming it.

## Optional personal hardening

To make Claude Code refuse to start in this folder when the sandbox cannot run (for example,
`bubblewrap` missing), add this to `.claude/settings.local.json` in your WSL clone:

```json
{ "sandbox": { "failIfUnavailable": true } }
```

It is not in the shared file because cloud sessions have no bubblewrap and would fail to start.

## What needs you or an administrator

- **You:** install WSL 2 (needs administrator rights and virtualization), `bubblewrap`, and `socat`;
  set your Git identity; accept the trust dialog; keep production credentials out of WSL. Nothing in
  this repository changes user-level settings.
- **Administrator:** policy that cannot be overridden belongs in managed settings, for example
  `sandbox.failIfUnavailable`, `sandbox.allowUnsandboxedCommands: false`, or
  `allowManagedPermissionRulesOnly`.

## Sources

- [Settings files and precedence](https://code.claude.com/docs/en/settings)
- [All settings](https://code.claude.com/docs/en/settings-reference)
- [Configure permissions](https://code.claude.com/docs/en/permissions)
- [Choose a permission mode](https://code.claude.com/docs/en/permission-modes)
- [Configure the sandboxed Bash tool](https://code.claude.com/docs/en/sandboxing)
- [Claude Code Desktop in WSL](https://code.claude.com/docs/en/desktop-wsl)
- [Debug your configuration](https://code.claude.com/docs/en/debug-your-config)
