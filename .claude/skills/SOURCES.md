# Third-party skills

The plugins from the claude.ai directory are copied here too, as project skills, commands
(`.claude/commands/`), agents (`.claude/agents/`), and MCP servers (`.mcp.json`), so every session
loads them: the desktop app on WSL, the CLI, and cloud sessions.

Copied from upstream at the commits below. Each folder keeps its upstream license. To update one,
copy the folder again from a newer commit, read the diff, and update this table.

| Skills | Source | Commit | License |
| :- | :- | :- | :- |
| taste-skill, redesign-skill, minimalist-skill, soft-skill, brutalist-skill | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | `f624f37a8c650b9cc550253104925efe4c8de246` | MIT |
| impeccable | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (`.claude/skills/impeccable`) | `b49177d32788f2dc585c42831d845dacf1ebed2c` (4.10.0) | Apache-2.0 |
| emil-design-eng, animate, review-animations, improve-animations, animation-performance, animation-vocabulary, find-animation-opportunities, apple-design, break-ui, mobile-native, pick-ui-library, choreograph, gestures, remove-animations | [emilkowalski/skills](https://github.com/emilkowalski/skills) | `64eb3deb9a5fbfa041faf783e0bc3fd635872e9c` | MIT |
| web-design-guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `5a37a6329fbad3666c3207392a6a7c0110e92efb` | MIT |
| frontend-design | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) plugin `frontend-design` | as synced 2026-10-15 | Apache-2.0 |
| accessibility-review, design-critique, design-handoff, design-system, research-synthesis, user-research, ux-copy | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) plugin `design` 1.2.0 | as synced 2026-10-15 | Apache-2.0 |
| e2e-test-generator (+ `/e2e-map`, `/e2e-write`), perf-profiler (+ `/perf-audit`, `/perf-compare`) | [petrovicistefan/claude-code-plugins](https://github.com/petrovicistefan/claude-code-plugins) 1.0.0 | as synced 2026-10-15 | MIT |
| ai-visibility, broken-links, content-brief, content-strategy, content-translation, internal-linking, keyword-clustering, on-page-seo, schema-markup, seo-audit, technical-seo (+ 6 commands in `.claude/commands/`, 3 agents in `.claude/agents/`) | [searchfit/searchfit-seo](https://github.com/searchfit/searchfit-seo) 1.0.0 | as synced 2026-10-15 | MIT |
| higgsfield-generate, higgsfield-brandkit, higgsfield-faceless-video, higgsfield-marketplace-cards, higgsfield-product-photoshoot, higgsfield-soul-id, higgsfield-video-explainer, higgsfield-websites, higgsfield-youtube-thumbnail | [higgsfield-ai/skills](https://github.com/higgsfield-ai/skills) | `27000402070db19d958789d05b3b52b6f4718d7c` | MIT |
| gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-plugins, gsap-utils, gsap-performance, gsap-react, gsap-frameworks | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT |
| extract-design-md | [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) (`plugins/stitch-design/skills/extract-design-md`) | `9f4e828e77634e230978be45fec5501554dbe4b2` | Apache-2.0 |
| webapp-testing, skill-creator | [anthropics/skills](https://github.com/anthropics/skills) | `e4bb5d960d87126ff3b3a8af1a104b7db67560ba` | Apache-2.0 (`LICENSE.txt` in each folder) |
| differential-review (+ `/diff-review` in `.claude/commands/`, agent `adversarial-modeler` in `.claude/agents/`) | [trailofbits/skills](https://github.com/trailofbits/skills) plugin `differential-review` | `149d7b21f4067765b82e67029730b42d228ef4b4` | CC BY-SA 4.0 |
| semgrep, sharp-edges (+ agent `sharp-edges-analyzer` in `.claude/agents/`), supply-chain-risk-auditor, agentic-actions-auditor | [trailofbits/skills](https://github.com/trailofbits/skills) plugins `static-analysis`, `sharp-edges`, `supply-chain-risk-auditor`, `agentic-actions-auditor` | `149d7b21f4067765b82e67029730b42d228ef4b4` | CC BY-SA 4.0 |
| supabase, supabase-postgres-best-practices | [supabase/agent-skills](https://github.com/supabase/agent-skills) | `c9be0e931b7930f7d02126d04774d904c381e7d7` | MIT |
| cloudflare, wrangler, workers-best-practices, frameworks-on-cloudflare, web-perf, turnstile-spin | [cloudflare/skills](https://github.com/cloudflare/skills) | `ff191de7d903788eceaf516a514ae7d3b56b924a` | Apache-2.0 |
| prisma-orm-setup, prisma-client-api, prisma-cli, prisma-postgres-setup | [prisma/skills](https://github.com/prisma/skills) | `a6f192959cf43b08aa330fe1ffca090267215812` | MIT |
| stripe-best-practices, stripe-docs, stripe-implementation-planner | [stripe/ai](https://github.com/stripe/ai) (`skills/`) | `f10dc33c434e1daf5e001ec1c50594a6cde1bdbb` | MIT |
| deploy-to-vercel, react-best-practices, composition-patterns, react-view-transitions | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `5a37a6329fbad3666c3207392a6a7c0110e92efb` | MIT |

Local changes to upstream files, kept on each update:

- `extract-design-md/SKILL.md`: `name` is `extract-design-md` (upstream: `stitch::extract-design-md`, a
  plugin-namespaced name that a project skill cannot use).
- `differential-review/SKILL.md`: refers to the agent as `adversarial-modeler`, the name it is
  registered under here, instead of the plugin name `differential-review:adversarial-modeler`.

Checked and not taken (2026-11-24):

- taste-skill 2.5.x (upstream `6c0b5c78f5d31776e2210305abaa210cdc0030bf`) is a rebuild of about 40 MB
  (1,631 files, mostly photographs) that adds a `Stop` hook running `scripts/gate.mjs` after every
  turn, and drops the redesign, minimalist, soft, brutalist and output variants. The 2.1 copy above stays.
- Removed: `pro-design` (no license stated) and `output-skill` (`full-output-enforcement`), both
  covered by taste-skill and impeccable.
- better-auth/skills (`20c9e88a5c007461a703f1c213572b073196113e`) states no license, so it is not copied.
  Install it per user with `npx skills add better-auth/skills` if wanted.
- semgrep/skills (`68177b8830f96cd9d10dacbb14dde2566360503d`) is under the Semgrep Rules License,
  which does not clearly allow republishing in a public repository. Trail of Bits' `semgrep` skill
  covers the scan. `/static-analysis:semgrep-scan`, which that skill mentions, is a plugin workflow
  that is not vendored; follow the skill's own five steps instead.
- Some vendored skills point to sibling skills that are not copied (Cloudflare's
  `nextjs-on-cloudflare`, `gateway-workers`, `workers-profiling`; Prisma's upgrade skills). Copy
  them from the same commit if a task needs them.
- awesome-design-md at `fcc70284932276d085f01ef9f83edde90b1258cb` has the same DESIGN.md files as the
  copy below; it only adds a README per folder.

Remote MCP servers in `.mcp.json` from the vendors themselves, each signed in with OAuth on first
use: Hugging Face (`https://huggingface.co/mcp?login`, free account; image generation runs on
Gradio Spaces such as FLUX.1-schnell within the account's free GPU quota), Supabase, Stripe,
Vercel, and Cloudflare's documentation server (no sign-in). `pollinations` (`@pollinations/mcp@2.5.0`,
MIT) generates images, video and audio with a key from enter.pollinations.ai read from the
`POLLINATIONS_API_KEY` environment variable; it uploads results unlisted to media.pollinations.ai,
so do not send private material. Both are free-tier alternatives to the `higgsfield-*` skills.

MCP servers in `.mcp.json` are pinned: `@playwright/mcp@0.0.86` (Apache-2.0),
`chrome-devtools-mcp@1.13.0` (Apache-2.0, run with `--isolated` so it uses a temporary profile) and
`@upstash/context7-mcp@4.7.3` (MIT). Newer releases of the last two came out the day of the update
and were skipped until they have been out for a while.

`docs/design-library/` holds the DESIGN.md files from
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) at
`3b605329240ce735b510037cca322f1831fdd7f8` (MIT).

Network use: `web-design-guidelines` now reads a bundled, hash-pinned copy of its rules
(`references/command.md`) and no longer fetches them.
`impeccable` downloads its engine binary from the project's GitHub releases on first run and checks
it against the sha256 in its own `scripts/engine-checksums.txt`. `taste-skill/scripts/assets.mjs` searches public-domain image
archives (Openverse, Wikimedia, the Met, Art Institute of Chicago, Internet Archive, NASA).
The `higgsfield-*` skills call the `higgsfield` CLI (`npm i -g @higgsfield/cli`), which needs
`higgsfield auth login` and Higgsfield credits; `higgsfield-faceless-video` scripts download the generated clips with `curl`.
`context7` sends library names and queries to context7.com. `skill-creator`'s eval viewer loads
Google Fonts and SheetJS from a CDN.
