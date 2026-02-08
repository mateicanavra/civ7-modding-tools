# Phase 3 Hardening: Workflow + Formatting Constraints

This doc captures the hardening workflow requirements we must follow while authoring `M2-ecology-architecture-alignment.md`.

## Backbone Workflow (dev-harden-milestone)

Source: `/Users/mateicanavra/.codex-rawr/prompts/dev-harden-milestone.md`

Key invariants:
- Work in an isolated git worktree.
- Do not modify archived docs unless explicitly asked.
- Harden what’s already intended (in this case: our Spike/Feasibility target), making implicit assumptions explicit.
- Prefer surfacing open questions / prework prompts over guessing, except where the user’s locked directives resolve ambiguity.

## Required Per-Issue Structure (must exist for every issue/sub-issue)

For each issue in M2, include:
1. **Acceptance Criteria (verifiable)**
2. **Scope Boundaries** (in scope / out of scope / borders)
3. **Verification Methods** (as executable commands, not prose)
4. **Implementation Guidance**
   - Complexity × parallelism estimate
   - YAML `files:` list (paths + notes)
   - Patterns to follow / avoid
   - Edge cases
5. **Paper Trail References** (spike/feasibility/spec pointers; avoid ADRs)
6. **Prework Prompts** (only for genuine unknowns; include purpose + expected output + sources)
7. **Open Questions** (explicit; options + tradeoffs; default recommendation)

## Presentation Discipline

- Separate **Layer 1 (narrative)** from **Layer 2 (precision)**.
- Use YAML for lists (`issues:`, `files:`, `steps:`), not for prose.
- Define path roots once in each doc (e.g., `$MOD`, `$CORE`, `$PROJECT`), then use them.

## Repo-Specific Constraints (from project directives)

### Locked directives (resolve ambiguity; do not treat as open questions)
- Atomic per-feature ops (no multi-feature mega-ops).
- Compute substrate model (compute ops produce reusable layers; plan ops consume).
- Maximal modularity (don’t pre-optimize performance).
- Ops import `rules/**` for behavior policy; steps do not import rules.
- Prefer shared core MapGen SDK helpers for generic utilities.
- Do not reindex Narsil MCP (fallback to native tools when needed).
- Avoid ADRs as primary sources (older than ~10 days treated as non-authoritative).

### Git/Graphite hygiene
- Keep the primary checkout untouched.
- Keep the Phase 3 worktree clean (commit all changes; no lingering dirty state).
- No global restacks; if syncing is needed, use `gt sync --no-restack`.

## Phase 3 Output Requirements (definition of done)

The hardened M2 doc must include:
- Clear objective + scope boundaries.
- Acceptance criteria tiers.
- Explicit gates (baseline + parity + import-ban type checks).
- A complete issue inventory with hardened details.
- Slice sequencing (Prepare → Cutover → Cleanup) with per-slice gates.
- Explicit prework prompts for remaining unknowns.
- An upstream-compatibility section grounded to a branch+SHA.
