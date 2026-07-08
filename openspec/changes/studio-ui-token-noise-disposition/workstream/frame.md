# Frame — design-sync token noise is an ownership-routing problem, not a classifier bug we can patch

**Object:** problem (reframe). **Audience:** repo owner deciding what to execute. **Durability:** standalone — this frame travels into the proposal and outlives this session.

## Commander's intent (WHAT + WHY, not HOW)

Every `check_design_system` run against the MapGen Studio design-system project
(claude.ai/design project `531d158d…`) reports two recurring findings over the
compiled Tailwind CSS v4 output: "~80 of 202 tokens unclassified" and "33 custom
properties under component-style selectors." Three separate handoff documents
exist because design sessions keep re-diagnosing the same noise. The intent is
to end that attention tax permanently — with the repo owning the *true* token
signal, every future design/sync session inheriting the disposition instead of
re-deriving it, and the actual defect routed to the only party that can fix it.

## Diagnostic of the prior frame (why a reframe, not a plan against the handoff)

The handoff packet (`scraps/design_handoff_ds_sync_token_noise/README.md`, plus
the two alternate messages) frames this as: *scope the `/design-sync` token
extractor (Option A) or annotate tokens with `/* @kind */` comments (Option B);
acceptance = 0 unclassified + 0 selector-scoped findings after re-sync.* Two
load-bearing assumptions were falsified by direct evidence:

1. **There is no repo- or skill-side token extractor.** The token scan and the
   token→kind map live in the claude.ai/design app's self-check, which
   "regenerates the adherence config and ds_manifest"
   (`packages/mapgen-studio-ui/.ds-sync/package-build.mjs` header). The
   repo-staged converter emits no token classification; the app-generated
   `_adherence.oxlintrc.json` carries the flawed map under its `x-omelette`
   key (fetched live 2026-07-08: `--background: "other"`,
   `--tw-translate-y: "color"`, …).
2. **`/* @kind */` annotations are an unsupported affordance.** The string
   `@kind` appears nowhere in the Claude Code binary (v2.1.197: design-sync
   skill + both shape sub-skills + all bundled converter scripts) and nowhere
   in the repo sync tooling. Option B annotates for a parser that does not
   exist.

Consequence: the handoff's acceptance criterion ("0/0 after re-sync") is not
reachable by any legitimate repo-side change. Chasing it would produce either
prohibited hand-edits to synced artifacts or fidelity-risking mutations of
compiled CSS.

**Named reframe move:** boundary redraw + ontological shift — from "defect in
our sync tooling" to "correct-by-construction output being misread by an
upstream heuristic we don't own." The unit of analysis shifts from *the
classifier* (not ours) to *the signal economy of design sessions* (ours).

## Hard core (commitments that define the frame)

1. The flagged properties are Tailwind v4 engine plumbing — 78
   `@property`-registered `--tw-*` composition vars (verified: exactly 78
   `@property` rules in `packages/mapgen-studio-ui/dist/styles.css`) plus ~12
   `@theme` framework defaults. They are load-bearing for rendering and are
   *supposed* to be selector-scoped; hoisting or stripping them breaks
   utilities and violates the visual-fidelity gate.
2. The classifier and `check_design_system` are app-side (claude.ai/design).
   No repo change can alter what they report about compiled Tailwind output.
3. The repo's legitimate levers are exactly: what it uploads (guidelines,
   docs), what it verifies itself (its own token truth), and what it feeds
   upstream (a precise defect report).
4. The reachable objective is: **no future session spends attention on these
   findings, and real token drift is caught by a repo-owned guard that is
   stricter and more correct than the noisy upstream check.**

## Selection / salience / exterior

- **In:** the two findings; ownership evidence; the authored token inventory
  (~46 names incl. 25 HSL-triplet semantic colors); repo-owned sync surfaces
  (`guidelinesGlob`, `.design-sync/NOTES.md`, package tests); the upstream
  feedback channel; the acceptance-criterion rewrite.
- **Foregrounded:** the ownership boundary (app vs repo); the falsified
  affordances; "design normally" as the real goal.
- **Exterior (constructed, not absent):** component/story code; compiled CSS
  content; `lib/emit.mjs`/`lib/bundle.mjs` (app contract surface);
  `conventions.md` (validated, deliberately untouched); hand-edits to any
  synced project artifact; patching the claude.ai app itself.

## Falsifier / degeneration trigger

If evidence emerges that the app-side check honors any uploaded classification
metadata (a documented token-metadata input, or a future design-sync skill
version that parses annotations or ships a repo-side classifier config), the
hard core collapses and the right move becomes *emitting that metadata from the
converter path* — reframe required. Check on Claude Code version bumps
(binary-grep for `@kind` / token-classification surfaces is cheap).

## Structural alternatives considered and rejected

- **"Make the compiled CSS classifier-clean."** Cannot reach 0 findings (the 78
  `@property` vars are required by used utilities); risks render drift against
  the fidelity oracle; treats a third-party heuristic as authority over build
  output.
- **"Do nothing — it's cosmetic."** The tax is real (three handoffs, repeated
  re-diagnosis) and the mis-map actively misleads: semantic colors tagged
  `"other"` invite a design agent to "fix" tokens by hoisting `--tw-*` vars to
  `:root`, which would break space/divide/transform/gradient/ring utilities.
