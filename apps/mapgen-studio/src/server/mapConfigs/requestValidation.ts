import { type MapConfigEnvelope, snapshotMapConfigEnvelope } from "@civ7/studio-contract";

export type MapConfigSaveRequestInput = Readonly<{
  requestId?: unknown;
  canonicalConfig?: unknown;
  restart?: unknown;
  verifyRestart?: unknown;
}>;

export type ParsedMapConfigSaveRequest = Readonly<{
  requestId?: string;
  canonicalConfig: MapConfigEnvelope;
}>;

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]+$/;
const RUN_IDENTITY_FIELDS = [
  "launchEnvelopeDigest",
  "launchSourceDigest",
  "runArtifactId",
  "runCorrelation",
  "generationManifestDigest",
] as const;

export function parseMapConfigSaveRequest(
  body: MapConfigSaveRequestInput
): ParsedMapConfigSaveRequest {
  if (body.restart === true || body.verifyRestart === true) {
    throw new Error(
      "Map config save/deploy does not restart Civ; use Run in Game for Civ lifecycle control."
    );
  }
  const runIdentityField = RUN_IDENTITY_FIELDS.find((field) => Object.hasOwn(body, field));
  if (runIdentityField) {
    throw new Error(
      `Map config save/deploy does not accept Run in Game identity: ${runIdentityField}`
    );
  }
  if (Object.hasOwn(body, "sourcePath")) {
    throw new Error("Map config save/deploy does not accept sourcePath");
  }
  if (
    body.requestId !== undefined &&
    (typeof body.requestId !== "string" || !REQUEST_ID_PATTERN.test(body.requestId))
  ) {
    throw new Error("Map config save/deploy requestId is malformed");
  }
  const canonicalConfig = snapshotMapConfigEnvelope(body.canonicalConfig);
  if (canonicalConfig === undefined) {
    throw new Error("Map config canonicalConfig must be a complete config envelope");
  }
  return {
    ...(typeof body.requestId === "string" ? { requestId: body.requestId } : {}),
    canonicalConfig,
  };
}
