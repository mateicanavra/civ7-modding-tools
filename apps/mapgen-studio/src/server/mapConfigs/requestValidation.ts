export type MapConfigSaveRequestInput = Readonly<{
  requestId?: unknown;
  id?: unknown;
  sourcePath?: unknown;
  envelope?: unknown;
  restart?: unknown;
  verifyRestart?: unknown;
}>;

export type ParsedMapConfigSaveRequest = Readonly<{
  requestId?: string;
  id: string;
  sourcePath?: string;
  envelope: unknown;
}>;

const MAP_CONFIG_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]+$/;

export function parseMapConfigSaveRequest(
  body: MapConfigSaveRequestInput
): ParsedMapConfigSaveRequest {
  if (body.restart === true || body.verifyRestart === true) {
    throw new Error(
      "Map config save/deploy does not restart Civ; use Run in Game for Civ lifecycle control."
    );
  }
  if (typeof body.id !== "string" || !MAP_CONFIG_ID_PATTERN.test(body.id)) {
    throw new Error("Map config id must be kebab-case");
  }
  if (
    body.requestId !== undefined &&
    (typeof body.requestId !== "string" || !REQUEST_ID_PATTERN.test(body.requestId))
  ) {
    throw new Error("Map config save/deploy requestId is malformed");
  }
  if (body.sourcePath !== undefined && typeof body.sourcePath !== "string") {
    throw new Error("Map config sourcePath must be a string");
  }
  return {
    ...(typeof body.requestId === "string" ? { requestId: body.requestId } : {}),
    id: body.id,
    ...(typeof body.sourcePath === "string" ? { sourcePath: body.sourcePath } : {}),
    envelope: body.envelope,
  };
}
