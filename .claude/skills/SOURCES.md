# Third-party skills

The plugins from the claude.ai directory are copied here too, as project skills, commands
(`.claude/commands/`), agents (`.claude/agents/`), and MCP servers (`.mcp.json`), so every session
loads them: the desktop app on WSL, the CLI, and cloud sessions.

Copied from upstream at the commits below. Each folder keeps its upstream license. To update one,
copy the folder again from a newer commit, read the diff, and update this table.

| Skills | Source | Commit | License |
| :- | :- | :- | :- |
| taste-skill, redesign-skill, minimalist-skill, soft-skill, brutalist-skill, output-skill | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | `f624f37a8c650b9cc550253104925efe4c8de246` | MIT |
| impeccable | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (`.claude/skills/impeccable`) | `8a0e198da34ebc5b936a9d5975fb7a3b1cf353b7` | Apache-2.0 |
| emil-design-eng, animate, review-animations, improve-animations, animation-performance, animation-vocabulary, find-animation-opportunities, apple-design, break-ui, mobile-native | [emilkowalski/skills](https://github.com/emilkowalski/skills) | `2d228630ba1446365f614a108cb8252f1feda202` | MIT |
| web-design-guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee94c3f4df8453406c830b0a7df0f2860278` | MIT |
| frontend-design | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) plugin `frontend-design` | as synced 2026-10-15 | Apache-2.0 |
| accessibility-review, design-critique, design-handoff, design-system, research-synthesis, user-research, ux-copy | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) plugin `design` 1.2.0 | as synced 2026-10-15 | Apache-2.0 |
| e2e-test-generator (+ `/e2e-map`, `/e2e-write`), perf-profiler (+ `/perf-audit`, `/perf-compare`) | [petrovicistefan/claude-code-plugins](https://github.com/petrovicistefan/claude-code-plugins) 1.0.0 | as synced 2026-10-15 | MIT |
| ai-visibility, broken-links, content-brief, content-strategy, content-translation, internal-linking, keyword-clustering, on-page-seo, schema-markup, seo-audit, technical-seo (+ 6 commands in `.claude/commands/`, 3 agents in `.claude/agents/`) | [searchfit/searchfit-seo](https://github.com/searchfit/searchfit-seo) 1.0.0 | as synced 2026-10-15 | MIT |
| higgsfield-generate, higgsfield-brandkit, higgsfield-marketplace-cards, higgsfield-product-photoshoot, higgsfield-soul-id, higgsfield-video-explainer, higgsfield-websites, higgsfield-youtube-thumbnail | [higgsfield-ai/skills](https://github.com/higgsfield-ai/skills) | `f83af0bc1d937c8119099a11f8ebbf5e6fb99819` | MIT |

`docs/design-library/` holds the DESIGN.md files from
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) at
`3b605329240ce735b510037cca322f1831fdd7f8` (MIT).

Network use: `web-design-guidelines` fetches its rules from raw.githubusercontent.com on each run.
`impeccable` downloads its engine binary from the project's GitHub releases on first run and checks
it against the published sha256. `taste-skill/scripts/assets.mjs` searches public-domain image
archives (Openverse, Wikimedia, the Met, Art Institute of Chicago, Internet Archive, NASA).
The `higgsfield-*` skills call the `higgsfield` CLI (`npm i -g @higgsfield/cli`), which needs
`higgsfield auth login` and Higgsfield credits.
