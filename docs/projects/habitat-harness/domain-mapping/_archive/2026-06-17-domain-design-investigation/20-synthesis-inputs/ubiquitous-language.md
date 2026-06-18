# Habitat Ubiquitous Language

This glossary captures language the domain packet uses consistently. Terms are
derived from scenarios, reference docs, and current code behavior; they are not
derived from folder names alone.

## Core Terms

| Term | Meaning | Primary Authority | Evidence |
| --- | --- | --- | --- |
| Habitat Toolkit | Repo-local structural toolkit that helps humans and agents orient, enforce, prove, and safely modify repository structure. | Habitat product/domain frame | E01, E16 |
| Structural substrate | Current supported layer: classify, check, verify, graph integration, hooks, guarded apply, baselines, limited generators. | Habitat domain frame | S01-S09 |
| Authoring topology | Desired future layer for generating and wiring product/domain structures such as MapGen domains, ops, stages, steps, contracts, defaults, schemas, and registries. | Future Authoring topology | S10, A11 |
| Orientation | Answering "what owns this path and what must I run?" before an edit. | Orientation and routing | S01, A01 |
| Routing | Mapping paths, diffs, selectors, patterns, or topology requests to the correct owner and proof path. | Orientation and routing | S01, S02 |
| Target truth | The set of project/workspace targets that actually exist and should be run for a path. | Nx metadata plus Orientation and routing | S01, A01 |
| Structural enforcement | Running Habitat rules and returning normalized diagnostics. | Structural enforcement | S03, A02 |
| Rule registry | The catalog of Habitat rules, owners, tools, lanes, scopes, and remediation metadata. | Structural enforcement | S03, A02 |
| Baseline | Explicit contract file that records known debt for a rule or confirms no debt. | Baseline authority | S03, A03 |
| Ratchet | Shrink-only baseline policy that rejects unexplained growth. | Baseline authority | S03, A03 |
| Proof contract | Structured statement of what a command proves, what it observed, and what it does not claim. | Proof contract authority | S04, A12 |
| Non-claim | Explicit boundary preventing a proof from being overread. | Proof contract authority | S04, A12 |
| Diagnostic pattern catalog | Grit-backed catalog that acquires and projects structural findings. | Diagnostic pattern catalog | S03, A05 |
| Pattern governance | Admission system for candidates and registered structural patterns. | Pattern governance | S08, S09, A10 |
| Transformation transaction | Guarded mutation workflow with dry-run, approved paths, rollback, and formatter/gate handoff. | Transformation transaction | S05, A06 |
| Local feedback | Hook-time ergonomics that catch issues early while preserving CI as authority. | Local feedback | S06, A07 |
| Generated/protected zone | A path whose direct edits are blocked or checked because regeneration owns the content. | Generated/protected zone authority | S06, A08 |
| Scaffolding | Limited generation of uniform project shells. | Scaffolding | S07, A09 |
| Refusal | A deliberate product result when Habitat lacks authority or proof to do requested work. | Owning context | S07, S10, S11 |

## Language Findings

- "Check" and "verify" are not synonyms. Check returns structural diagnostics;
  verify assembles proof and non-claims around check plus affected graph work.
- "Pattern" is ambiguous unless qualified. A candidate pattern is not an
  enforced rule; a registered pattern has authority, proof, baseline, and hook
  decisions.
- "Generator" is ambiguous unless qualified. Current project and pattern
  generators do not imply MapGen authoring topology support.
- "Hook passed" must not be written as "CI proved"; hook language is local
  feedback language.
- "Current code owns" is not domain language. The packet uses "current apparent
  owner" for code and "authority" for domain responsibility.
