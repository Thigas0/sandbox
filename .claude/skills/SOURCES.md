# Third-party skills

Copied from upstream at the commits below. Each folder keeps its upstream license. To update one,
copy the folder again from a newer commit, read the diff, and update this table.

| Skills | Source | Commit | License |
| :- | :- | :- | :- |
| taste-skill, redesign-skill, minimalist-skill, soft-skill, brutalist-skill | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | `f624f37a8c650b9cc550253104925efe4c8de246` | MIT |
| impeccable | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (`.claude/skills/impeccable`) | `8a0e198da34ebc5b936a9d5975fb7a3b1cf353b7` | Apache-2.0 |
| emil-design-eng, animate, review-animations, improve-animations, animation-performance, animation-vocabulary, find-animation-opportunities, apple-design, break-ui, mobile-native | [emilkowalski/skills](https://github.com/emilkowalski/skills) | `2d228630ba1446365f614a108cb8252f1feda202` | MIT |
| web-design-guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee94c3f4df8453406c830b0a7df0f2860278` | MIT |

`docs/design-library/` holds the DESIGN.md files from
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) at
`3b605329240ce735b510037cca322f1831fdd7f8` (MIT).

Network use: `web-design-guidelines` fetches its rules from raw.githubusercontent.com on each run.
`impeccable` downloads its engine binary from the project's GitHub releases on first run and checks
it against the published sha256. `taste-skill/scripts/assets.mjs` searches public-domain image
archives (Openverse, Wikimedia, the Met, Art Institute of Chicago, Internet Archive, NASA).
