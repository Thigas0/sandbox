# sandbox

A starting point for building websites with Claude Code: a Vite site (plain HTML, CSS, and
JavaScript) with browser and accessibility tests, plus the guardrails and workflow every change follows.

- [CONTRIBUTING.md](CONTRIBUTING.md): one-time setup (Windows + WSL 2), starting a session, and the daily loop.
- [CLAUDE.md](CLAUDE.md): the instructions Claude follows in this repository.
- [docs/agent-boundaries.md](docs/agent-boundaries.md): what is enforced, what is only guidance, and known gaps.

## Set up (inside WSL 2 or Linux)

```bash
git clone https://github.com/Thigas0/sandbox.git ~/sandbox
cd ~/sandbox && ./scripts/setup-wsl.sh
```

## Develop

```bash
npm run dev        # local server with live reload: http://localhost:5173
npm run build      # production build in dist/
npm run test:e2e   # Playwright tests on desktop and phone, with an axe accessibility check
npm run fotos      # published photos from fotos-originais/ (kept out of Git)
```

## Atualizar o site (eventos e fotos)

Eventos, fotos e dados do fotógrafo ficam em `src/dados/`. O passo a passo, em português, está em
[docs/como-atualizar.md](docs/como-atualizar.md).

## Verify

```bash
./scripts/verify.sh          # fast checks, after each meaningful change
./scripts/verify.sh --full   # plus the verifier's own tests; CI runs this
```

Requires bash 4.4+, git, python3, and Node.js 22+. Exits nonzero when a check fails.
