import { createHash } from "node:crypto";
import {
  freezeSnapshot,
  type RunInGameSourceSnapshotEvidence,
  snapshotConfigSourceProvenance,
} from "@civ7/studio-contract";

export function buildRunInGameSourceSnapshotEvidence(
  args: Readonly<{
    requestId: string;
    sourceSnapshot: unknown;
    canonicalConfigDigest: string;
    launchEnvelopeDigest: string;
  }>
): RunInGameSourceSnapshotEvidence | undefined {
  if (!isRecord(args.sourceSnapshot)) return undefined;
  const source = snapshotConfigSourceProvenance(args.sourceSnapshot.source);
  if (source === undefined) return undefined;
  if (
    typeof args.sourceSnapshot.canonicalConfigDigest !== "string" ||
    typeof args.sourceSnapshot.launchEnvelopeDigest !== "string"
  ) {
    return undefined;
  }
  return freezeSnapshot({
    requestId: args.requestId,
    source,
    canonicalConfigDigest: args.canonicalConfigDigest,
    launchEnvelopeDigest: args.launchEnvelopeDigest,
  });
}

export function hashRunInGameEvidenceValue(value: unknown): string {
  return hashIdentityValue(value);
}

function hashIdentityValue(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)) ?? "undefined")
    .digest("hex");
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const item = (value as Record<string, unknown>)[key];
      if (item !== undefined) out[key] = canonicalize(item);
    }
    return out;
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
