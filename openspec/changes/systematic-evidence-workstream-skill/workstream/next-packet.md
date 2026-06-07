# Next Packet

Continue from `codex/systematic-evidence-workstream-skill`.

No required continuation remains after the local Graphite commit lands cleanly.
If resuming before that commit exists, run:

1. Re-check `.agents/skills/civ7-systematic-workstream/**`,
   `.agents/skills/README.md`, and this OpenSpec change for stale paths,
   proof overclaims, or incomplete task state.
2. Validate:
   - `bun run openspec -- validate systematic-evidence-workstream-skill --strict`
   - `bun run openspec:validate`
   - `git diff --check`
3. Commit locally via Graphite.
4. Keep external Graphite submission/PR delivery unclaimed until `gt submit` or
   PR evidence exists.
