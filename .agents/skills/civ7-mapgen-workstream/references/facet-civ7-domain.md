# Facet 3 — Civ7 Domain (data modalities · research · design intent)

> Open when a map-gen request needs **Civ7 game facts**: which terrains/biomes/features/resources are legal, where the game wants starts, what the official scripts actually do, or whether a physically-realistic plan is also *placeable* per Civ7 rules. This facet is the **research/intent dimension** of the loop — it supplies the Civ7 truth that grounds design (loop steps 3–5) and that the verification facet later proves in-game (step 7).

This facet is **partially owned elsewhere — reference, do not restate**:

- **`civ7-product-authority`** owns *what the repo promises* and the **evidence hierarchy** (the numbered authority ladder + evidence classes in `references/source-map.md`). It governs which sources may support a claim; it does **not** itself parse game XML. Inherit its tiering wholesale.
- **`civ7-operational-debugging`** owns the **live runtime** discipline (FireTuner port 4318, `Scripting.log`, `@civ7/direct-control` probes, in-game proof boundaries — `references/firetuner-runtime.md`). Use it for any *live* read; this facet only adds *where to point the probe* and *how to read the answer for map-gen intent*.

What is **net-new here** (author/carry in this facet): integrating the four data modalities into one reasoning surface, the web/forum research posture, design-intent reasoning, and the **earthlike-expectations ∩ Civ7-legality bridge**. The facet's contribution is *integration and judgment*, not pioneering data access from scratch — most of the official corpus is already encoded in the mod.

---

## The four data-access modalities

A map-gen request touching terrain/feature/resource/start legality needs Civ7 facts. There are exactly four ways to get them; pick by *what kind of truth* you need. Evidence tiers below are from `civ7-product-authority/references/source-map.md` (official resources = tier 8, live source = tier 9, in-game = tier 11, community = tier 13).

### 1. Offline XML — `data:crawl` / `data:explore` (tier 8, authoritative-static)

The official game data is a git submodule at `.civ7/outputs/resources/` (`mateicanavra/civ7-official-resources.git`, **snapshot 2026-01-24**). Sync it:

```bash
bun run resources:init      # init/update the submodule
bun run refresh:data        # resources:init + plugin-files build + data:unzip (NO data:zip)
```

`refresh:data` works **without the Steam install** (`inputs.installDir` is commented out in `civ.config.jsonc`; `data:zip` would need the game and is intentionally not chained). Extracted XML lands at `.civ7/outputs/resources/Base/modules/base-standard/data/`:

| File | What it grounds |
|---|---|
| `resources.xml`, `resources-v2.xml` | resource class/weight/hemisphere, `AdjacentToLand`, `LakeEligible` |
| `terrain.xml` | terrain / biome / feature vocabulary |
| `leaders.xml` | `StartBias*` rows (per-leader start preferences) |
| `maps.xml` | continent counts, map-size definitions |
| `discovery-stories.xml`, `narrative-sifting.xml` | discovery / narrative placement rules |

Official **JS map scripts** sit alongside at `.../base-standard/maps/`: `resource-generator.js`, `assign-starting-plots.js`, `discovery-generator.js`, `natural-wonder-generator.js` — these are the **reference implementations of official placement logic** (read them to learn *what the game actually does*, not just what the tables say).

Graph-traversal CLI for exploring the relationship web (BFS from a seed identifier → graph.json / dot / SVG):

```bash
civ7 data crawl <SEED_IDENTIFIER> ...     # BFS the data graph from a seed row
civ7 data explore ...                     # interactive exploration
civ7 data render ... / civ7 data slice ...# emit graph artifacts
```

Use this modality **first** for any legality/vocabulary/weight question — it is deterministic, version-pinned, and citeable at tier 8.

### 2. Static policy package — `@civ7/map-policy` (tier 8, pre-distilled)

`packages/civ7-map-policy/src/civ7-tables.gen.ts` is the **generated** authoritative static snapshot (also dated **2026-01-24**) — terrain/biome/feature indices, resource weights, hemisphere minimums, start biases, `MapResourceMinimumAmountModifier` rows. Exported as two table bundles:

```ts
import { CIV7_BROWSER_TABLES_V0, CIV7_POLICY_TABLES_V1 } from "@civ7/map-policy";
```

This is what the mod actually consumes (see the bridge below). It is the distilled form of modality 1; prefer it when you need *indices/weights the recipe already speaks*, and fall back to raw XML when you need a field the package didn't capture. Refresh after a game patch: `bun run refresh:data` then `nx run @civ7/map-policy:verify -- --write` (regenerates the `.gen.ts` snapshot).

> **Staleness caveat (load-bearing).** Both modality 1 and 2 are pinned to the **2026-01-24** snapshot. If the live game has patched resource/terrain data since, the static tables may diverge from runtime behavior (tracked as refactor-plan D4). When a live game is available, **cross-check legality claims against `game:gameinfo`** (modality 3) before asserting them as current. Treat static tables as *authoritative-for-planning*, live probes as *authoritative-for-this-build*.

### 3. Live game info — `game:gameinfo` (tier 11, runtime truth)

With Civ7 running and the tuner up (`EnableTuner 1`, `127.0.0.1:4318` — see `civ7-operational-debugging/references/firetuner-runtime.md`), read live `GameInfo.*` rows:

```bash
civ7 game gameinfo Resources --limit 50 --json
civ7 game gameinfo Units --lookup UNIT_SETTLER --json
```

This is the **only modality that reflects the exact patched game you are about to verify in**. Use it to resolve the staleness caveat above and to confirm that a planned placement is legal *in the live runtime*, not just in the snapshot. It is heavier (needs a running game) — reserve it for cross-checks and live-legality questions, not bulk exploration.

### 4. Forensic local data — `game:play` / `local-data:inspect` (tier 9–11, installed-state forensics)

Inventory the installed game's SQLite catalogs, saves, and logs (the `game play` topic carries the `sqlite` / `local-data` / `catalog` / `authority` aliases):

```bash
civ7 game play <topic> ...   # SQLite / saves / logs forensics on the installed game
```

Use when you need *what the installed game actually has on disk* — DLC-conditional rows, modifier stacks, or to diagnose a divergence between the submodule snapshot and the user's installed version.

**Modality discipline:** exhaust 1→2 (offline, deterministic, citeable) before reaching for 3→4 (live, heavier, build-specific). A claim grounded in modality 1/2 is reproducible; a claim grounded in 3/4 is true only for the exact game state checked — label it accordingly per the product-authority evidence classes.

---

## How official data flows into the mod (where the facts already live)

Most of the official corpus is **already integrated** — Facet 3's job is usually to *read the integration*, not re-derive it. Two channels:

- **Static** — `@civ7/map-policy` tables (`CIV7_BROWSER_TABLES_V0` / `CIV7_POLICY_TABLES_V1`) are consumed directly: `mods/mod-swooper-maps/src/domain/resources/policy/resource-legality.ts` reads `CIV7_BROWSER_TABLES_V0.resourceValidPlacementRows` / `.resourcePlacementFlags` to build per-resource eligibility masks. `mods/mod-swooper-maps/src/domain/resources/lib/corpus/official-base-standard.ts` fully encodes the official resource rows.
- **Runtime** — `GameInfo.*` reaches the recipe only via the **adapter** at map entrypoints / projection (`map-*`) and placement stages; truth stages have zero Civ7 knowledge (see `references/pipeline-map.md` for the truth-vs-projection boundary).

So before researching a Civ7 fact from scratch, **check whether the mod already encodes it** (`domain/resources/lib/corpus/`, `domain/resources/policy/`). Re-deriving an already-encoded table is wasted motion and a drift risk.

---

## Web / forum research posture

Official sources first; community sources are **lower-tier discovery, not authority**. Order:

1. **Official XML + `@civ7/map-policy`** (modality 1/2, tier 8) — exhaust these.
2. **`data:crawl` / `data:explore`** to chase relationships the flat tables don't expose.
3. **Web/forum** only for genuine gaps — tools `mcp__web-search__firecrawl_*`; skills `search:web-search`, `search:deep-search`.

Authoritative community sources are **tier 13 discovery material** (`civ7-product-authority/references/source-map.md`, line 35: "External examples, community knowledge … as discovery material only"). Known community references: CivFanatics forums (incl. WildW's "Scripting Runtime Information"), `ghost-ng/Civ7-Developer-Docs`, Chrispresso's Debug Console.

**Treat community as hypothesis, not authority.** A forum claim is a lead to verify against modality 1–4 — never a citeable fact on its own. Label every community finding as *discovery* unless corroborated by official XML, live source, or an in-game probe. Methodology precedent for a disciplined public-corpus pass: `docs/projects/civ7-direct-control/workstream/discovery/public-corpus-report.md`.

---

## Game-design-intent reasoning

Legality says *what is allowed*; intent says *what the game wants*. A Civ-appropriate map needs both. Where to read intent:

- **`leaders.xml`** — `StartBias*` rows: which terrains/features/resources each leader is steered toward (the game's notion of "a good start").
- **`resources.xml` / `resources-v2.xml`** — class, weight, hemisphere assignment, `AdjacentToLand`, `LakeEligible`: the game's distribution priors.
- **`terrain.xml`** — the biome/terrain/feature vocabulary the projection must speak.
- **`maps.xml`** — continent/map-size shape expectations.
- **Official JS scripts** (`resource-generator.js`, `assign-starting-plots.js`, `discovery-generator.js`, `natural-wonder-generator.js`) — the *actual algorithms*. When you need "what does the game do at mapgen time," these are ground truth over any prose.

Best single research orientation for mapgen touchpoints: `docs/system/libs/mapgen/research/SPIKE-gameplay-mapgen-touchpoints.md` — **research/discovery, not a contract**; treat as a map of where to look, verify specifics against the XML/JS above. (Note: like all SPIKE docs, it is philosophy-only / non-canonical — do not cite it as authoritative behavior.)

Design-intent reasoning feeds **loop step 5 (Civ-appropriateness judgment)**: a change that is physically realistic and legal can still be *un-Civ-like* (e.g. starts the game never biases toward, resource densities that break playability). Hold aesthetics and playability alongside physics — the map serves the player.

---

## The bridge: earthlike-expectations ∩ Civ7-legality

This is the facet's load-bearing seam, and where it couples to **Facet 1 (physics)**. A map-gen plan must be **both** physically plausible **and** legal/placeable per Civ7 rules. Neither alone is sufficient:

- A physically-realistic resource distribution that violates `resourceValidPlacementRows` will be **rejected by the engine** (and surface as `FinalSurfaceParityProof.unresolvedLinks` — see `references/facet-verification.md`).
- A legal-but-physically-arbitrary distribution produces a placeable-but-unrealistic map (fails the Earth-like benchmark).

The bridge is encoded in `mods/mod-swooper-maps/src/domain/resources/lib/earthlike-expectations/official-earthlike.ts`: per-resource `range: [min, target, max]` count expectations **grounded in physical geography**, carrying `habitatEvidence`, `proxyRequirements`, and `caveats`. This is **the file where game-design intent meets physics reasoning** — the "habitat lane" = physics fields (Facet 1) ∩ official legality mask (`domain/resources/policy/resource-legality.ts`, this facet).

**Working rule for any placement/resource change:** before declaring an Earth-like expectation (the pre-declared ledger gate, loop step 5 — `assets/earthlike-expectation-ledger.md`), confirm the target is **legal** for the candidate tiles. The physics plan proposes; the legality mask disposes. Pre-declare expectations *inside* the legal envelope, then use the resource/feature-delta-feasibility Swooper modes for run-specific live deltas (`assets/live-verification-runbook.md`). The retired milestone probes remain historical characterization, not a reusable current-tree gate.

---

## Quick routing

| Need | Modality / source | Tier |
|---|---|---|
| Is terrain/feature/resource X legal here? | `@civ7/map-policy` → `resource-legality.ts`; cross-check `game:gameinfo` if live | 8 / 11 |
| Resource weight / hemisphere / class | `resources*.xml`, `CIV7_BROWSER_TABLES_V0` | 8 |
| Where does the game want starts? | `leaders.xml` `StartBias*`, `assign-starting-plots.js` | 8 |
| What does the official algorithm actually do? | `.../base-standard/maps/*.js` | 8 |
| Exact patched-game runtime fact | `civ7 game gameinfo --json` (Civ7 running) | 11 |
| Installed-game forensics (DLC rows, saves) | `civ7 game play <topic>` | 9–11 |
| Community lead (forum/wiki) | firecrawl / `search:*` — **discovery only** | 13 |
| Realistic *and* placeable count range | `official-earthlike.ts` ∩ `resource-legality.ts` | 8 |

When the request is bounded → hand legality/intent findings to design (step 4–5). When it needs corpus coverage (all resources, all biomes) → that is a `habitat:systematic-workstream` handoff at closure (`references/orchestration.md`).
