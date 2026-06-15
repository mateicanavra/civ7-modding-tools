import { Context, Data, Effect, Layer } from "effect";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { HabitatCommandResult } from "./habitat-process.js";
import { repoRoot } from "./paths.js";

export type AdapterProofClass =
  | "native-sample"
  | "current-tree-wrapper"
  | "raw-acquisition"
  | "injected-violation"
  | "dry-run"
  | "applied-diff"
  | "rollback"
  | "biome-handoff"
  | "nx-scheduling"
  | "adapter-smoke";

export interface AdapterProofArtifact {
  schemaVersion: 1;
  proofId: string;
  artifactPath: string;
  sourceTree: HabitatCommandResult["gitState"];
  commandResult: HabitatCommandResult;
  normalizedSummary: Record<string, unknown>;
  rawOutput: {
    stdoutSha256: string;
    stderrSha256: string;
    stdoutBytes: number;
    stderrBytes: number;
    stdoutTruncated: boolean;
    stderrTruncated: boolean;
  };
  redaction: {
    redactedEnvKeys: string[];
    sensitiveValuesPersisted: false;
  };
  retention: "committed" | "ephemeral-scratch" | "downstream-copy";
  proofClass: AdapterProofClass;
  nonClaims: readonly string[];
  downstreamLinks: readonly string[];
}

export interface WriteAdapterProofArtifactInput {
  proofId: string;
  commandResult: HabitatCommandResult;
  normalizedSummary?: Record<string, unknown>;
  retention?: AdapterProofArtifact["retention"];
  proofClass: AdapterProofClass;
  nonClaims?: readonly string[];
  downstreamLinks?: readonly string[];
  repoRootOverride?: string;
}

export interface ProofArtifactWriterService {
  write: (
    input: WriteAdapterProofArtifactInput
  ) => Effect.Effect<AdapterProofArtifact, ProofArtifactWriteFailure>;
}

export class ProofArtifactWriter extends Context.Tag(
  "@internal/habitat-harness/ProofArtifactWriter"
)<ProofArtifactWriter, ProofArtifactWriterService>() {}

export class ProofArtifactWriteFailure extends Data.TaggedError("ProofArtifactWriteFailure")<{
  readonly proofId: string;
  readonly path: string;
  readonly cause: string;
}> {}

export const ProofArtifactWriterLive = Layer.succeed(ProofArtifactWriter, {
  write: (input) =>
    Effect.try({
      try: () => writeAdapterProofArtifact(input),
      catch: (cause) =>
        new ProofArtifactWriteFailure({
          proofId: input.proofId,
          path: adapterProofArtifactPath(input.proofId, input.repoRootOverride),
          cause: String(cause),
        }),
    }),
});

export function writeAdapterProofArtifact(
  input: WriteAdapterProofArtifactInput
): AdapterProofArtifact {
  const artifact = buildAdapterProofArtifact(input);
  mkdirSync(path.dirname(artifact.artifactPath), { recursive: true });
  writeFileSync(artifact.artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
  return artifact;
}

export function buildAdapterProofArtifact(
  input: WriteAdapterProofArtifactInput
): AdapterProofArtifact {
  const artifactPath = adapterProofArtifactPath(input.proofId, input.repoRootOverride);
  const redactedEnvKeys = Object.entries(input.commandResult.envDelta)
    .filter(([, value]) => value.redacted)
    .map(([key]) => key)
    .sort();
  return {
    schemaVersion: 1,
    proofId: input.proofId,
    artifactPath,
    sourceTree: input.commandResult.gitState,
    commandResult: input.commandResult,
    normalizedSummary: input.normalizedSummary ?? {},
    rawOutput: {
      stdoutSha256: input.commandResult.stdout.sha256,
      stderrSha256: input.commandResult.stderr.sha256,
      stdoutBytes: input.commandResult.stdout.bytes,
      stderrBytes: input.commandResult.stderr.bytes,
      stdoutTruncated: input.commandResult.stdout.truncated,
      stderrTruncated: input.commandResult.stderr.truncated,
    },
    redaction: {
      redactedEnvKeys,
      sensitiveValuesPersisted: false,
    },
    retention: input.retention ?? "committed",
    proofClass: input.proofClass,
    nonClaims: [...new Set([...(input.commandResult.nonClaims ?? []), ...(input.nonClaims ?? [])])],
    downstreamLinks: input.downstreamLinks ?? [],
  };
}

export function adapterProofArtifactPath(proofId: string, root = repoRoot): string {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(proofId)) {
    throw new Error(`invalid proof id: ${proofId}`);
  }
  return path.join(
    root,
    "openspec",
    "changes",
    "habitat-effect-grit-adapter",
    "workstream",
    "proofs",
    `${proofId}.json`
  );
}
