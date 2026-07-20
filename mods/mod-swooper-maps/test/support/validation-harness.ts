import { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import type { MapContext } from "@swooper/mapgen-core";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core";
import { artifacts as standardArtifacts } from "../../src/recipes/standard/artifacts/index.js";

export type ArtifactFingerprintEntry = {
  status: "present" | "missing";
  fingerprint?: string;
};

export type FingerprintReport = {
  artifacts: Record<string, ArtifactFingerprintEntry>;
  missing: string[];
};

export type InvariantResult = {
  name: string;
  ok: boolean;
  message?: string;
  details?: Record<string, unknown>;
};

export type ValidationInvariantContext = {
  context: MapContext;
  fingerprints: FingerprintReport;
};

export type ValidationInvariant = {
  name: string;
  description?: string;
  check: (input: ValidationInvariantContext) => InvariantResult;
};

export type ValidationHarnessReport = {
  fingerprints: FingerprintReport;
  invariants: InvariantResult[];
  failures: InvariantResult[];
  ok: boolean;
};

export const M1_VALIDATION_SEEDS = [1337, 9001] as const;
export const M1_VALIDATION_DIMENSIONS = [{ width: 32, height: 20 }] as const;
export const M1_TIER1_ARTIFACT_IDS = [
  foundationArtifacts.mantlePotential.id,
  foundationArtifacts.mantleForcing.id,
  foundationArtifacts.plateMotion.id,
  foundationArtifacts.crust.id,
  foundationArtifacts.tectonicHistory.id,
  foundationArtifacts.tectonicProvenance.id,
  standardArtifacts.foundationTectonicHistoryTiles.id,
  standardArtifacts.foundationTectonicProvenanceTiles.id,
] as const;

function hashView(view: ArrayBufferView): {
  type: string;
  length: number;
  byteLength: number;
  sha256: string;
} {
  const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  const sha256 = sha256Hex(Buffer.from(bytes).toString("base64"));
  const length =
    "length" in view && typeof view.length === "number" ? view.length : view.byteLength;
  return {
    type: view.constructor?.name ?? "ArrayBufferView",
    length,
    byteLength: view.byteLength,
    sha256,
  };
}

function normalizeForFingerprint(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "number" && Number.isNaN(value)) return { kind: "NaN" };
  if (ArrayBuffer.isView(value)) return { __typedArray: hashView(value as ArrayBufferView) };
  if (Array.isArray(value)) return value.map((entry) => normalizeForFingerprint(entry));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = normalizeForFingerprint((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

export function fingerprintValue(value: unknown): string {
  const normalized = normalizeForFingerprint(value);
  return sha256Hex(stableStringify(normalized));
}

export function computeArtifactFingerprints(
  context: MapContext,
  artifactIds: readonly string[]
): FingerprintReport {
  const artifacts: Record<string, ArtifactFingerprintEntry> = {};
  const missing: string[] = [];

  for (const artifactId of artifactIds) {
    if (!context.artifacts.has(artifactId)) {
      artifacts[artifactId] = { status: "missing" };
      missing.push(artifactId);
      continue;
    }
    const value = context.artifacts.get(artifactId);
    artifacts[artifactId] = {
      status: "present",
      fingerprint: fingerprintValue(value),
    };
  }

  return { artifacts, missing };
}

export function runValidationHarness(args: {
  context: MapContext;
  artifactIds: readonly string[];
  invariants: readonly ValidationInvariant[];
}): ValidationHarnessReport {
  const fingerprints = computeArtifactFingerprints(args.context, args.artifactIds);
  const invariants: InvariantResult[] = [];

  for (const invariant of args.invariants) {
    try {
      invariants.push(invariant.check({ context: args.context, fingerprints }));
    } catch (error) {
      invariants.push({
        name: invariant.name,
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const failures = invariants.filter((entry) => !entry.ok);
  return {
    fingerprints,
    invariants,
    failures,
    ok: failures.length === 0,
  };
}
