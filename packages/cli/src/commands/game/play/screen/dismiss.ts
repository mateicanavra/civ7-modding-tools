import { Command, Flags } from '@oclif/core';
import {
  DEFAULT_CIV7_CINEMATIC_MAX_DISMISSALS,
  DEFAULT_CIV7_CINEMATIC_SETTLE_MS,
  dismissCiv7CinematicMoments,
} from '@civ7/direct-control';

export default class GamePlayScreenDismiss extends Command {
  static id = 'game play screen dismiss';
  static summary = 'Dismiss queued Civ7 cinematic-moment screens';
  static description =
    'Drains map-reveal / wonder-discovery cinematic moments (App UI DisplayQueueManager screens) ' +
    'through @civ7/direct-control. One screen mounts at a time; each is closed via its official ' +
    'close button and the next mounts after a settle beat. Finishes with a DOM-clear verification ' +
    'and an optional Camera.lookAtPlot restore.';

  static examples = [
    '<%= config.bin %> game play screen dismiss',
    '<%= config.bin %> game play screen dismiss --max 5 --settle-ms 2500',
    '<%= config.bin %> game play screen dismiss --look-at 31,7 --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    max: Flags.integer({
      description: 'Maximum number of cinematic moments to dismiss',
      default: DEFAULT_CIV7_CINEMATIC_MAX_DISMISSALS,
    }),
    'settle-ms': Flags.integer({
      description: 'Wait between dismissals so the next queued cinematic can mount',
      default: DEFAULT_CIV7_CINEMATIC_SETTLE_MS,
    }),
    'look-at': Flags.string({
      description: 'Optional camera restore plot as x,y (Camera.lookAtPlot after draining)',
    }),
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 45_000,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayScreenDismiss);
    const restoreCameraPlot = flags['look-at'] === undefined
      ? undefined
      : this.parseLookAt(flags['look-at']);

    const result = await dismissCiv7CinematicMoments(
      {
        maxDismissals: flags.max,
        settleMs: flags['settle-ms'],
        ...(restoreCameraPlot ? { restoreCameraPlot } : {}),
      },
      {
        host: flags.host,
        port: flags.port,
        timeoutMs: flags['timeout-ms'],
      },
    );

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    for (const row of result.dismissals) {
      this.log(`dismissed[${row.iteration}]: ${row.title ?? '<untitled cinematic>'}`);
    }
    if (result.dismissals.length === 0) {
      this.log('no cinematic moments were mounted');
    }
    this.log(
      result.drained
        ? `drained: yes (0 cinematic-moment DOM nodes after ${result.iterations} probe${result.iterations === 1 ? '' : 's'})`
        : `drained: no (${result.domClearCount} cinematic-moment DOM nodes remain after ${result.iterations} probe${result.iterations === 1 ? '' : 's'})`,
    );
    if (result.cameraRestore) {
      const { plot, lookAt } = result.cameraRestore;
      this.log(
        lookAt.ok
          ? `camera: restored via Camera.lookAtPlot(${plot.x}, ${plot.y})`
          : `camera: Camera.lookAtPlot(${plot.x}, ${plot.y}) failed: ${lookAt.error}`,
      );
    }
  }

  private parseLookAt(value: string): { x: number; y: number } {
    const match = /^\s*(\d+)\s*,\s*(\d+)\s*$/.exec(value);
    if (!match) {
      this.error(`--look-at must be x,y (got "${value}")`);
    }
    return { x: Number(match[1]), y: Number(match[2]) };
  }
}
