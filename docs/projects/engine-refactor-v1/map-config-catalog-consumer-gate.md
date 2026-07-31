# Swooper Map Catalog Consumer Gate

## Contract

- **Name:** `mountain-rivers-patch`
- **Surface:** shipped map configuration and generated Civ7 map entrypoint
- **Target owner:** Swooper Physics map catalog
- **Disposition:** retired
- **Last updated:** 2026-07-31

## Consumers

- **Known consumers:** the Swooper catalog, generated mod metadata and map
  scripts, Studio map selection, deployment-path proof, product metrics, and
  historical river-acceptance records.
- **Unknown-consumer risk:** low. The entrypoint was distributed inside the
  local Swooper mod, but no distinct behavior, external package contract, or
  live proof distinguishes it from `mountain-patch`.
- **Migration path:** select `mountain-patch` for the retained map identity.
  Retained mountain configurations are compared by the mountain-drama metric
  study rather than by a duplicate catalog entry.

## Evidence

- The catalog membership test requires eight exact retained identities and
  rejects `mountain-rivers-patch`.
- Generated config, TypeScript entrypoint, mod metadata, text, and XML
  registrations no longer publish the retired identity.
- Deployment-path tests use the retained `mountain-patch` script.
- Historical acceptance records remain dated evidence and explicitly state
  that they do not define current catalog membership.
- Current product evidence is local and generated; no new in-game retirement
  proof is claimed.

## Gate

- **Required evidence before retirement:** exact catalog membership, generated
  output currentness, retained deployment-path proof, and an explicit
  disposition for historical comparison rows.
- **Deletion trigger:** the duplicate has no unique authored configuration,
  product behavior, consumer contract, or live proof.
- **Allowed claim:** `mountain-rivers-patch` is retired from the current
  Swooper catalog and `mountain-patch` is its supported replacement.
- **Forbidden claim:** this retirement has been newly verified inside a live
  Civ7 process.
