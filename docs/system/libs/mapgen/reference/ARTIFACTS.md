<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract (write-once, read-only)"/>
  <item id="buffers" title="Buffers exception"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Artifacts

## Purpose

Define artifact contracts: publish/read behavior, mutability, and the buffer exception.

## Contract (write-once, read-only)

- Producers publish artifacts once.
- Consumers read as immutable; if they need mutation, they must copy first.
- Republishing is an error.

## Buffers exception

Buffers are a current performance exception:

- published once,
- then mutated in-place across steps,
- and must not be republished.

Docs must keep this exception narrow and explicitly labeled as such.

## Ground truth anchors

- Artifact runtime (write-once enforcement, read-only reads): `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Artifact types and DeepReadonly: `packages/mapgen-core/src/authoring/artifact/contract.ts`
- Buffer exception and ArtifactStore notes: `packages/mapgen-core/src/core/types.ts`
- Policy: artifact mutation: `docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md`

