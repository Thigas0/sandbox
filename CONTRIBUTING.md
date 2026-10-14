# Contributing

Every change follows the same loop:

**define acceptance criteria → inspect → implement a small change → test → review the diff → commit**

[CLAUDE.md](CLAUDE.md) holds the instructions Claude follows.
[docs/agent-boundaries.md](docs/agent-boundaries.md) explains what is actually enforced, what is
only an instruction, and the known gaps. Read it once before relying on the guardrails.

## One-time setup (Windows + WSL 2)

The OS sandbox for Claude's shell commands runs on Linux, macOS, and WSL 2, not on native Windows.
On Windows, work inside WSL 2.

1. In PowerShell as administrator: `wsl --install -d Ubuntu`, then restart. `wsl -l -v` must show
   `VERSION 2`. Virtualization has to be enabled in the firmware.
2. In the Ubuntu terminal, install the tools and the sandbox dependencies:

   ```bash
   sudo apt-get update && sudo apt-get install -y git python3 bubblewrap socat
   ```

3. On Ubuntu 24.04 or later, run `sysctl kernel.apparmor_restrict_unprivileged_userns`. If it prints
   `1`, add the AppArmor profile for `bwrap` described in
   [Set up Linux and WSL2](https://code.claude.com/docs/en/sandboxing#set-up-linux-and-wsl2).
4. Set your Git identity: `git config --global user.name "Your Name"` and
   `git config --global user.email "you@example.com"`.
5. Clone into the Linux file system, not under `/mnt/c`:
   `git clone https://github.com/Thigas0/sandbox.git ~/sandbox`

## Start a session

- **Desktop app (main path):** in the Code tab, start a new session, open the environment picker,
  pick your distribution under **WSL**, and choose `~/sandbox`. A WSL session has no integrated
  terminal, plugins, or `@` file suggestions yet; use the Ubuntu terminal for Git.
- **CLI (alternative):** install Claude Code inside WSL and run `claude` from `~/sandbox`.

The first session shows the workspace trust dialog, listing the two allow rules this repository
grants. Review them before accepting. Deny and ask rules apply even before you accept.

Sessions start in **Accept edits** (`defaultMode` in `.claude/settings.json`): Claude edits files
here without asking, and sandboxed shell commands run without a prompt. Bypass-permissions mode is
disabled. Auto mode stays available; the ask rules still prompt you in it.

The desktop app remembers the mode you last picked for a folder, and that choice overrides
`defaultMode`. Change it with the mode selector next to the send button (`Ctrl+Shift+M`), or
`Shift+Tab` in the CLI.

## Check the effective configuration

| Question | How to check |
| :- | :- |
| Which settings files loaded? Which Claude Code version? | `/status` |
| Did `CLAUDE.md` load? | `/context` or `/memory` |
| Which rules are in effect, and from which file? | `/permissions` (CLI only) |
| Is the sandbox on, with its dependencies? | `/sandbox` (CLI only) |
| Is a settings file invalid? | `claude doctor`, from the Ubuntu terminal |

The desktop app answers dialog commands such as `/permissions` with "isn't available in this
environment". Use the CLI for those, or ask Claude to do these harmless probes:

| Ask Claude to | Expected |
| :- | :- |
| Read `.env`, or create one | Refused by a deny rule |
| Run `./scripts/verify.sh` | Runs without a prompt once the folder is trusted |
| Run `touch ~/sandbox-probe` | Fails with `Read-only file system`. If it succeeds, the sandbox is off: delete the file and check `/sandbox` |
| Run `ls /mnt/c/Users` | Fails, because reads outside the workspace are blocked |
| Run `git push --dry-run` | A permission prompt. Decline it |
| Run `curl --noproxy '*' https://example.com` | A prompt (ask rule). If you approve, it fails with `Could not resolve host` |

If Claude asks to retry a failed command outside the sandbox, decline unless you know why it needs to.

## Daily workflow

1. **Branch.** `git switch -c <topic>`. For risky or parallel work, use a separate worktree (the
   desktop app can create one per session). A worktree keeps changes apart; it is not a security
   boundary.
2. **State acceptance criteria** in your first message: what you will observe when the work is done,
   such as a command's output or a test that passes.
3. **Plan when the task is ambiguous.** `/plan <description>` makes Claude explore and propose a plan
   without editing. Approve the plan to return to implementation, or keep planning.
4. **Implement in small steps.** One focused change per request. Ask Claude to stop and report
   rather than expand scope.
5. **Verify after each meaningful change:** `./scripts/verify.sh`.
6. **Review.** `/review` (an alias of `/code-review`) reviews the current diff. Read `git diff`
   yourself as well. `/security-review` compares your branch with `origin`.
7. **Commit.** Stage explicit files, check what is staged, run the full check, then commit:

   ```bash
   git add path/to/file1 path/to/file2
   git diff --staged
   ./scripts/verify.sh --full
   git commit -m "Describe the one change"
   ```

   Keep each commit to one logical change. Do not stage or revert changes you did not make.

Claude should end each task by reporting the commands it ran and their results, anything that
blocked it, and any check it could not run. Ask for that report if it is missing.

## Longer tasks

Keep a short plan in the conversation or the pull request description, and update it as you go:

```text
Goal:
Acceptance criteria:
- [ ] ...
Progress:
Decisions (and why):
Remaining verification:
```

## CI and branch protection

[.github/workflows/verify.yml](.github/workflows/verify.yml) runs `./scripts/verify.sh --full` on
`ubuntu-latest` for pull requests and pushes to `main`: the same command you run locally.

Recommended protections for `main`, where your GitHub plan supports them:

- Require a pull request before merging.
- Require the `verify` status check to pass, on an up-to-date branch.
- Block force pushes and branch deletion, and apply the rules to administrators too.

**None of these are active.** The GitHub repository has no commits yet, and the workflow has never run.
