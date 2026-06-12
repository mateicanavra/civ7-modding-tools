import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';

// Moves the live Civ7 camera to a plot through the engine Camera API and
// reports the VERIFIED outcome: the viewport-center plot is read back and
// compared against the target. The camera stays where it was moved — this is
// navigation, nothing is restored afterwards.
export default class GameViewCamera extends Command {
  static id = 'game view camera';
  static summary = 'Move the live Civ7 camera to a plot (verified by readback)';
  static description =
    'Focuses the in-game camera on a plot via Camera.lookAtPlot, syncs the plot cursor, and reads ' +
    'back which plot actually sits at the viewport center. The result reports centerMatchesTarget ' +
    'so callers know whether the move verified (plots near the map edge may never center exactly).';

  static examples = [
    '<%= config.bin %> game view camera --plot 32,17 --json',
    '<%= config.bin %> game view camera --plot 32,17 --zoom 0.35 --json',
    '<%= config.bin %> game view camera --plot 32,17 --animated --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    plot: Flags.string({
      description: 'Target plot as x,y (e.g. 32,17)',
      required: true,
    }),
    zoom: Flags.string({
      description: 'Normalized engine zoom: 0 (closest) to 1 (fully zoomed out), fractional; ' +
        'omitted keeps the current zoom',
    }),
    animated: Flags.boolean({
      description: 'Pan to the plot instead of jumping instantly',
      default: false,
    }),
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 15_000,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GameViewCamera);
    const target = parsePlotFlag(flags.plot, (message) => this.error(message));
    const zoom = flags.zoom === undefined
      ? undefined
      : parseZoomFlag(flags.zoom, (message) => this.error(message));
    const client = createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: {
        host: flags.host,
        port: flags.port,
        timeoutMs: flags['timeout-ms'],
      },
    });
    const result = await client.view.camera.focus({
      x: target.x,
      y: target.y,
      ...(zoom === undefined ? {} : { zoom }),
      ...(flags.animated ? { instantaneous: false } : {}),
    }).catch((error: unknown) => {
      const detail = (error as { data?: { detail?: string } } | null)?.data?.detail;
      if (typeof detail === 'string' && detail.length > 0 && error instanceof Error) {
        error.message = `${error.message}\n${detail}`;
      }
      throw error;
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    this.log(`target: (${result.target.x},${result.target.y})`);
    const center = result.after.centerPlot;
    this.log(`center: ${center === null ? 'unresolved' : `(${center.x},${center.y})`}`);
    this.log(`zoom: ${result.after.zoomLevel ?? 'unknown'}`);
    this.log(`verified: centerMatchesTarget=${result.centerMatchesTarget}`);
  }
}

export function parsePlotFlag(
  raw: string,
  fail: (message: string) => never,
): { x: number; y: number } {
  const match = /^\s*(\d+)\s*,\s*(\d+)\s*$/.exec(raw);
  if (!match) {
    fail(`--plot must be x,y with non-negative integers (got "${raw}")`);
  }
  return { x: Number(match![1]), y: Number(match![2]) };
}

export function parseZoomFlag(
  raw: string,
  fail: (message: string) => never,
): number {
  const zoom = Number(raw);
  if (!Number.isFinite(zoom) || zoom < 0 || zoom > 1) {
    fail(`--zoom must be a number between 0 (closest) and 1 (fully zoomed out) (got "${raw}")`);
  }
  return zoom;
}
