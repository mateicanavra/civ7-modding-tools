# Team Review Lanes

Use this reference when a systematic workstream needs agent evidence or review.

## Team Shape

Use agents when the work is broad enough to justify coordination cost:

- independent evidence angles can run in parallel;
- specialized review catches different failure modes;
- the corpus or expectation research exceeds one context window;
- runtime proof and closure records need adversarial checking.

The workstream owner remains accountable for synthesis, file edits, proof
claims, branch state, and closure.

## Prompt Frame

Every agent prompt should include:

- objective;
- hard core;
- scope and allowed paths;
- exterior and non-goals;
- falsifier;
- output contract;
- write permissions;
- note that other agents may be active and unrelated changes must not be
  reverted.

## Evidence Wave Examples

For a domain workstream, the standing evidence lanes are:

- Corpus researcher: enumerates official/local entities, action surfaces, and
  uncertainty.
- Physical expectation researcher: proposes ranges and evidence strength.
- Architecture mapper: assigns owners, forbidden owners, artifacts, and
  operation contracts.
- Stats/proof designer: identifies deterministic gates and runtime telemetry.
- Future-use stress tester: checks that the method applies beyond the seed
  domain.

(One-off bootstrap lane, used only when authoring or revising this skill itself:
a session-method extractor that derives workflow primitives from a prior
transcript and durable records. Not a standing lane for domain workstreams.)

## Review Lanes

Run the lanes that fit the phase:

- authority review: source refs, product claims, architecture owners;
- spec review: OpenSpec shape, tasks, stop conditions, shortcut language;
- implementation review: diff, tests, generated-output boundaries;
- evidence review: stats/logs/payloads support the exact claim;
- information-design review: skill/spec is navigable and not a wall of text;
- closure review: tasks, ledgers, next packet, Graphite state, and proof labels.

Accepted P1/P2 findings block dependent implementation or closure until
repaired, rejected with source evidence, or explicitly moved outside the closure
claim. P3 findings may close with residual risk recorded.

## Review Disposition Row

Use this format:

```text
| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| <specific issue> | P1/P2/P3 | accepted/rejected/deferred/cleared | <file, command, or reason> |
```
