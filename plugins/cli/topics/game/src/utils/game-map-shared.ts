import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";

// Shared service-call helper for the `game map` noun topic. The topic index
// (`game map` flag multiplex) and the focused subcommands (`game map
// summary|plot|grid`) all delegate to readCiv7World so the control-oRPC
// world.* service calls stay identical regardless of which surface invoked
// them (D2 in docs/projects/cli-command-taxonomy/workstream-record.md).

type Civ7WorldClient = ReturnType<typeof createCiv7ControlOrpcServerClient>;

type Civ7WorldGridInput = Parameters<Civ7WorldClient["world"]["grid"]>[0];

/** Plot projection field accepted by the control-oRPC world grid contract. */
export type Civ7WorldPlotField = NonNullable<Civ7WorldGridInput["fields"]>[number];

/** Endpoint overrides shared by every `game map` command surface. */
export type Civ7WorldReadEndpointOptions = Readonly<{
  host?: string;
  port?: number;
  timeoutMs?: number;
}>;

/**
 * Discriminated request for the summary, single-plot, or bounded-grid world read owned by control-oRPC.
 * Keeping the union here makes the topic index and focused subcommands dispatch identical service calls.
 */
export type Civ7WorldReadRequest =
  | Readonly<{ mode: "summary" }>
  | Readonly<{
      mode: "plot";
      location: { x: number; y: number };
      fields: ReadonlyArray<Civ7WorldPlotField>;
      playerId?: number;
      includeHidden: boolean;
    }>
  | Readonly<{
      mode: "grid";
      bounds: { x: number; y: number; width: number; height: number };
      fields: ReadonlyArray<Civ7WorldPlotField>;
      playerId?: number;
      includeHidden: boolean;
      maxPlots?: number;
    }>;

/**
 * Routes a `game map` read through the canonical live control-oRPC facade.
 *
 * @param request - Selects the world endpoint and its projection or visibility inputs.
 * @param endpointOptions - Host, port, and timeout overrides forwarded to the control client.
 * @returns The unmodified payload from the selected world service endpoint.
 */
export async function readCiv7World(
  request: Civ7WorldReadRequest,
  endpointOptions: Civ7WorldReadEndpointOptions
): Promise<unknown> {
  const client = createCiv7ControlOrpcServerClient({
    directControl: liveCiv7ControlOrpcDirectControlFacade,
    endpointDefaults: endpointOptions,
  });
  if (request.mode === "grid") {
    return client.world.grid({
      bounds: request.bounds,
      fields: [...request.fields],
      playerId: request.playerId,
      includeHidden: request.includeHidden,
      maxPlots: request.maxPlots,
    });
  }
  if (request.mode === "plot") {
    return client.world.plot({
      location: request.location,
      fields: [...request.fields],
      playerId: request.playerId,
      includeHidden: request.includeHidden,
    });
  }
  return client.world.current({});
}

const DEFAULT_CIV7_WORLD_PLOT_FIELDS: ReadonlyArray<Civ7WorldPlotField> = [
  "terrain",
  "biome",
  "feature",
  "resource",
  "owner",
  "visibility",
  "areaRegion",
];

/**
 * Parses a comma-separated plot projection, using the CLI's standard map fields only when omitted.
 * Field validity remains owned by the control-oRPC contract; an explicitly empty string yields no fields.
 */
export function parseWorldPlotFields(value: string | undefined): ReadonlyArray<Civ7WorldPlotField> {
  return (
    (value
      ?.split(",")
      .map((field) => field.trim())
      .filter(Boolean) as Civ7WorldPlotField[] | undefined) ?? DEFAULT_CIV7_WORLD_PLOT_FIELDS
  );
}

/**
 * Parses the `x,y` syntax used by plot arguments.
 *
 * @throws When either coordinate is not an integer.
 */
export function parseWorldLocation(value: string): { x: number; y: number } {
  const [x, y] = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isInteger(x) || !Number.isInteger(y)) throw new Error(`Invalid location: ${value}`);
  return { x, y };
}

/**
 * Parses the `x,y,width,height` syntax used by grid arguments.
 * This validates integer shape only; world-range and positive-size policy belongs to the service.
 *
 * @throws When any bound component is not an integer.
 */
export function parseWorldBounds(value: string): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const [x, y, width, height] = value.split(",").map((part) => Number(part.trim()));
  if (![x, y, width, height].every(Number.isInteger)) throw new Error(`Invalid bounds: ${value}`);
  return { x, y, width, height };
}
