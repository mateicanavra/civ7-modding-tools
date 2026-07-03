# Habitat Dominoes

Status: active sequence surface for Habitat Authority Consolidation dominoes

This directory owns the active domino sequence at the Habitat authority level. Dominoes are higher-level than any single workstream: a domino may advance rule remediation, closed-structure prework, blueprint authority, source cleanup, or runner projection when it moves the authority tree forward.

Each domino lives in one file under `items/`. The complete ordered map lives in [index.md](index.md). The source order, selection rule, reorder gates, and closure contract remain here because they govern the whole sequence rather than one item.

## Source Order

Use this source order when selecting or judging the next domino:

1. Direct user decisions and current repo instructions.
2. `.habitat/.active/frames/DOMINO-FRAME.md`.
3. `.habitat/AUTHORITY-ONTOLOGY.md` for blueprint, instance, capability, and niche concepts.
4. `.habitat/.active/frames/AUTHORITY-SLICE-FRAME.md` for bounded slice work.
5. `.habitat/.active/frames/AUTHORITY-REMAINDER-SLICE-FRAME.md` for contextual remainder slices after parent kinds have moved.
6. `.habitat/.active/frames/AUTHORITY-AUTONOMOUS-DOMINO-LOOP.md` for repeated bounded dominoes whose destinations already exist.
7. `.habitat/.active/frames/*.md` for reusable method frames selected by the current domino.
8. `.habitat/AUTHORITY.md`, `.habitat/AUTHORITY-TREE-SHAPE.md`, `.habitat/AUTHORITY-TOOL-SEPARATION.md`, `.habitat/RULE-OPERATION-KINDS.md`, and `.habitat/SUBJECT-CATEGORIES.md`.
9. Completed slice frames and receipts as precedent and evidence, not as the next active selector.
10. Current `.habitat` tree shape, generic packet role files, Toolkit behavior, and fresh command evidence.
11. Historical branch, PR, and session context as discovery material only.

If sources conflict, preserve the higher source unless fresh disk or command evidence proves it stale.

## Target Regime: Authority Activation

Authority Activation is the current Habitat regime.

In this regime:

- Blueprint authority defines a constructible kind and the facts required to admit instances of that kind.
- Instance facts are declared by the instance, not inferred from runner history or packet path convenience.
- Capabilities attach to admitted instances when the blueprint allows them and the instance facts satisfy their requirements.
- Niches govern admission by accepted facts instead of acting only as folder jurisdictions.
- Execution tools are projections of admitted authority. They are adapters and evidence rails, not ontology sources.
- Transitional `rule.json` routing metadata either serves the migrated slice temporarily or gets pruned when admitted authority makes it redundant.

The destination is a series of bounded state-changing slices that teach the next slice what the current tree could not teach before movement.

## Domino Selection Rule

Choose the largest bounded vertical slice that makes the next largest slice more mechanical.

A good domino does at least one of these:

- admits a concept into the authority model;
- moves a fact from transitional metadata into its owning authority surface;
- deletes, demotes, or fences a misleading bridge;
- creates a narrow projection adapter for admitted authority;
- provides proof that falsifies or validates the next ordering decision.

A scan, ledger, or design note counts when it enables one of those moves inside the same branch or explicitly proves that the branch must stop before implementation.

## Reorder/Falsifier Gates

Reorder the sequence if any of these become true:

- A future bounded pocket cannot place most current evidence under a small set of kind blueprints or one coarse transitional context without inventing a broad replacement taxonomy.
- A bounded slice creates more new capability or niche buckets than blueprint-owned rules.
- A named variant such as `standard recipe` has to be treated as a blueprint for the slice to proceed.
- A slice requires MapGen runtime/product proof before authority movement can be observed.
- The narrow projection adapter cannot be built without a full runner rebuild.
- Two branches in a row add docs or ledgers without moving, admitting, pruning, deleting, demoting, or proving a concrete authority surface.

Stop and reframe when runner labels, packet names, categories, or current folder paths start acting as ontology instead of transition evidence.

## Closure Contract

Every branch in this sequence closes with:

- the before/after authority state named in plain language;
- the exact domino it advances or falsifies;
- proof classes labeled honestly;
- broad `habitat check` excluded from proof unless the branch is the runner rebuild domino;
- stale metadata, compatibility bridges, and deferred cleanups named if they remain in the touched slice;
- Graphite branch and commit state clean.

The branch should make clear what changed in the model, what became easier next, and what remains to be knocked down.
