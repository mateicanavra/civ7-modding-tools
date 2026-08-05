# Civ7 Capability Realization Ground Receipt

**Status:** Refused at shared kind construction; target source stationary
**Date:** 2026-08-02
**Container:** [WORKSTREAM.md](./WORKSTREAM.md#container-0-ground)
**Frame:** [FRAME.md](./FRAME.md)

## Decision

Ground received and proved the published Habitat CLI handoff. The CLI package,
consumer initializer, and release provenance are real. The matching shared
blueprint pack is empty, so the release cannot construct the package, resource,
provider, service, API, CLI-topic, and app kinds selected by this initiative.

This is the smallest decisive refusal in the Ground contract. Civ7 does not
copy, reconstruct, or approximate those kinds locally. No product source, root
dependency, vendor patch, lockfile, or current Habitat owner moved.

## Published Handoff

| Artifact | Exact identity | Provenance | Ground result |
| --- | --- | --- | --- |
| Habitat CLI | `@habitat-ai/cli@0.2.3`; tag `habitat-cli-v0.2.3`; source `bc9d4448c8db17164678675ad47a9d47fd4d66fb`; source tree `35077a4be9cfd49ed5d55d6df6e27ad284a2741d` | npm integrity `sha512-hr+1K7xlV77QoSep53W7ydzbjJAtr3ZrcDwpkXmH+fFYKvizaDWboPNYggQ5qQHMTfTXJWHAM5vG4eAGlPdkiw==`; tarball SHA-256 `a15eae3d4c4a305587a35830e2fe717b1de12733fc6ef7ccf43f7c42b3eb1789`; SLSA workflow run `30732949165` | Accepted as a mechanically installable CLI and initializer |
| Blueprint pack | `@habitat-ai/blueprints@0.2.1`; tag `habitat-blueprints-v0.2.1`; source `2064a431032ac0600e805ddafba6fd17a6b7deb4` | npm integrity `sha512-5+ff/8pUopQqxmWWnwYB3L+Y7Cg/2d4FBn54yNKgTn5HfYDNZEMsOZz6r9rbE+ks6ilYrUU25/91KEcgY/9ITw==`; tarball SHA-256 `a61745bc06ce5a964114ddf660cbe231f5d09923ade26d9e569361da637ddee3`; SLSA workflow run `30730880516` | Refused: `habitat-pack.json` contains `"blueprints": []` and the tarball contains no blueprint tree |

The CLI advertises Bun `>=1.3.14`, Node `^20.19 || >=22.9`, Nx `23.1.0`,
Oclif `^4.11.4`, and an exact peer on the empty blueprint pack. Its published
Nx surface exposes only `init` and `remove-hook`. Grit evaluates already
resolved policy; it does not materialize a missing kind. No template renderer
or generic project-kind generator is present.

The later source-only JSON flush repair and proposed `0.2.4` line are not
published authority. Ground records them without substituting an unpublished
branch for the accepted registry artifact.

## Consumer Proof

A fresh Nx `23.1.0` consumer was generated outside the repository and installed
the exact published CLI. The machine-wide Bun minimum-release-age policy first
refused the newly published package; a disposable consumer-local override was
used only to evaluate the pinned artifact and was not introduced here.

| Proof class | Evidence | Result and non-claim |
| --- | --- | --- |
| Apply safety proof | First initializer application produced `nx.json` SHA-256 `29da71df7e678d8f0cb440ed9db4055bf42af73d759193c319f8c5e742b54642`, `package.json` SHA-256 `c53b0be4498baac012a04c2969263285d863d323e2f9c63b459a4b10b0965eb5`, and `.codex/hooks.json` SHA-256 `c0bdf3facce0b6d709dd3ac0b121037cf96a816d0c242a0a1f9f525ffe365a27`. A second application left all three hashes unchanged. | Passed for initializer write scope and idempotence. It does not prove kind construction. |
| Habitat wrapper behavior | `habitat resolve` returned no instances or applications and reported the pack's exact empty blueprint set. | Passed as truthful empty-catalog behavior. It does not supply the absent policy. |
| Unsupported-kind zero-write proof | `nx generate @habitat-ai/cli:project demo --kind=package --dry-run --no-interactive` refused because no `project` generator exists; the three consumer hashes remained unchanged. | Passed as refusal behavior. It is also the decisive construction failure. |
| Injected violation and clean sample proof | No accepted kind exists against which either fixture can run. | Not runnable. Ground does not manufacture a local fixture authority. |

## Vendor Transition

The current coupled vendor state remains frozen at the Ground source snapshot:

| Current artifact | SHA-256 | Disposition |
| --- | --- | --- |
| `package.json` | `9e69359a089ad63b8a7dddcafcf41847813467eb51af14040f427030120e9682` | Unchanged |
| `bun.lock` | `7bb7cc0350e5a8394eccf41027be7470969a13d9f727474c62cd17d10dca5253` | Unchanged |
| `tools/habitat/package.json` | `99cbadb804a790131930ea0b9218963e143d2b59bc4528a32beb2f83b861d88a` | Unchanged |
| `patches/effect-orpc@0.5.0.patch` | `a97f620e1f39b3b40e3fe084a11673497f7e0143f44e24de981192f72846ccfc` | Unchanged |

The accepted target still replaces the workspace-local Habitat package, oRPC 1
line, patched `effect-orpc`, and coupled TypeBox catalog entry together in the
Interactive slice. Ground did not receive an exact executable transition
manifest backed by constructible shared kinds, so it does not perform a
dependency-only cutover.

## Frozen Estate

Product source and proof are frozen against parent commit
`b89db91f40604905ce502a20fd0ea95ff5c2676f`, repository tree
`88e7bec0358300bd691a9534ed09c66cef180bd3`.

- The source census is the exact path/disposition authority in `CORPUS.md` at
  Git blob `9ab0b15be096d98a4ca39ee6e93e1e6169ca578e`, evaluated against that tree.
- The corrected proof census contains 461 tracked proof/support files. Its
  sorted path manifest SHA-256 is
  `1e08fa783ab27596d01b46a9723acaf55963fe64dcf6cc1f7f9275da589f2fca`.
- The corresponding sorted Git mode/type/blob/path manifest SHA-256 is
  `c546d9cf434879e1208c52626f69e93f6e30f157366e152a09f5cc3e8142a847`.
- The pre-receipt proof authority is Git blob
  `d5d5ec1ec59c8fbfb4bbb70fbc6c921dc7898112`; this receipt corrects its
  Swooper arithmetic from 187 to 188 and the total from 460 to 461 without
  changing a product file or terminal disposition.

Both manifest digests are over bytewise-sorted UTF-8 rows with exactly one
trailing line feed. The path rows are the 461 exact relative paths. The object
rows are the unmodified `git ls-tree -r <snapshot> -- <path-manifest>` output,
whose row grammar is `<mode> <type> <blob>\t<path>`.

## Re-entry Trigger

Resume Ground only after the upstream owner provides a direct, versioned
consumer handoff with all of the following:

1. a non-empty accepted blueprint pack containing the selected generic package,
   resource, provider, service, API, CLI-topic, and app kinds;
2. shared construction and initializer mechanics that generate each supported
   kind and refuse each unsupported kind without writes;
3. exact package source, digest, SLSA provenance, supported runtime surface,
   and vendor-transition manifest;
4. blueprint-owned instance anchors, clean samples, injected violations,
   Habitat-wrapper proof, and full apply-safety/idempotence proof.

The next product container remains Core Platform 1.1 only after this receipt is
superseded by a passing Ground exit receipt.
