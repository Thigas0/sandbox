# sandbox

A baseline for disciplined, sandboxed AI-assisted development with Claude Code. There is no
application code yet; the repository holds the guardrails and the workflow that new code will follow.

- [CONTRIBUTING.md](CONTRIBUTING.md): one-time setup (Windows + WSL 2), starting a session, and the daily loop.
- [CLAUDE.md](CLAUDE.md): the instructions Claude follows in this repository.
- [docs/agent-boundaries.md](docs/agent-boundaries.md): what is enforced, what is only guidance, and known gaps.

## Verify

```bash
./scripts/verify.sh          # fast checks, after each meaningful change
./scripts/verify.sh --full   # plus the verifier's own tests; CI runs this
```

Requires bash 4.4+, git, and python3. Exits nonzero when a check fails.
