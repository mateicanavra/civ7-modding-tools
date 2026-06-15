import { createHash } from "node:crypto";

import type { StudioInputs } from "../context.js";
import type { RunInGameSourceSnapshotProof } from "../contract/runInGame.js";

export function buildRunInGameSourceSnapshotProof(
  args: Readonly<{
    requestId: string;
    sourceSnapshot: unknown;
    configHash?: string;
    envelopeHash?: string;
  }>
): RunInGameSourceSnapshotProof | undefined {
  if (!isRecord(args.sourceSnapshot)) return undefined;
  const configHash = args.configHash ?? hashProofValue(args.sourceSnapshot.config ?? null);
  const envelopeHash = args.envelopeHash ?? hashProofValue(args.sourceSnapshot.envelope ?? null);
  return {
    identityHash: hashProofValue({
      sourceSnapshot: args.sourceSnapshot,
      configHash,
      envelopeHash,
    }),
    requestId: args.requestId,
    ...(args.sourceSnapshot.recipeSettings === undefined
      ? {}
      : { recipeSettings: args.sourceSnapshot.recipeSettings }),
    ...(args.sourceSnapshot.worldSettings === undefined
      ? {}
      : { worldSettings: args.sourceSnapshot.worldSettings }),
    ...(args.sourceSnapshot.pipelineConfig === undefined
      ? {}
      : { pipelineConfig: args.sourceSnapshot.pipelineConfig }),
    ...(args.sourceSnapshot.setupConfig === undefined
      ? {}
      : { setupConfig: args.sourceSnapshot.setupConfig }),
    ...(typeof args.sourceSnapshot.materializationMode === "string"
      ? { materializationMode: args.sourceSnapshot.materializationMode }
      : {}),
    ...(args.sourceSnapshot.selectedConfig === undefined
      ? {}
      : { selectedConfig: args.sourceSnapshot.selectedConfig }),
    configHash,
    envelopeHash,
  };
}

export function buildStandardRunInGameSourceSnapshotProof(
  args: Readonly<{
    requestId: string;
    input: StudioInputs["runInGame"]["start"];
  }>
): RunInGameSourceSnapshotProof | undefined {
  const configHash = hashProofValue(args.input.config);
  const envelopeHash = hashProofValue({
    id: standardRunInGameMapConfigId(args.input),
    recipe: "standard",
    latitudeBounds: selectedConfigRecord(args.input.selectedConfig)?.latitudeBounds ?? null,
    configHash,
  });
  return buildRunInGameSourceSnapshotProof({
    requestId: args.requestId,
    sourceSnapshot: args.input.sourceSnapshot,
    configHash,
    envelopeHash,
  });
}

export function hashRunInGameProofValue(value: unknown): string {
  return hashProofValue(value);
}

function hashProofValue(value: unknown): string {
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

function standardRunInGameMapConfigId(input: StudioInputs["runInGame"]["start"]): string {
  if (input.materialization?.mode !== "durable") return "studio-current";
  const selected = selectedConfigRecord(input.selectedConfig);
  return typeof selected?.id === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(selected.id)
    ? selected.id
    : "studio-current";
}

function selectedConfigRecord(
  selectedConfig: StudioInputs["runInGame"]["start"]["selectedConfig"]
): Record<string, unknown> | undefined {
  return isRecord(selectedConfig) ? selectedConfig : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
