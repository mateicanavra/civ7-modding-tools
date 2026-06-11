import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';

// Window-scoped, clean-frame capture of the live Civ7 session. The
// control-oRPC procedure suspends the display queue, purges popups, hides the
// HUD/world overlays through the official ViewManager rules engine, captures
// ONLY the game window via ScreenCaptureKit (never the display — no desktop,
// no overlays), and restores everything afterwards — guaranteed, even on
// failure. Requires a one-time macOS Screen Recording grant for the app
// hosting this process; the failure message carries the exact System
// Settings path when the grant is missing.
export default class GameViewAppshot extends Command {
  static id = 'game view appshot';
  static summary = 'Capture a clean, window-scoped screenshot of the live Civ7 session';
  static description =
    'Captures the Civ7 game window — and only that window — as a PNG with the HUD, world overlays, ' +
    'and popups suppressed for the frame, then restores the UI state. Reports a hashable manifest ' +
    'with window identity and clean-frame readbacks.';

  static examples = [
    '<%= config.bin %> game view appshot --json',
    '<%= config.bin %> game view appshot --output /tmp/civ7-frame.png --hide-units --json',
    '<%= config.bin %> game view appshot --settle-ms 1000 --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    output: Flags.string({
      description: 'PNG output path; defaults under the OS temp dir',
    }),
    'app-name': Flags.string({
      description: 'Substring matched against app name / bundle id / window title',
    }),
    'window-id': Flags.integer({
      description: 'Exact window id to capture (overrides --app-name matching)',
    }),
    'hide-units': Flags.boolean({
      description: 'Also hide 3D unit models for a map-only frame',
      default: false,
    }),
    'settle-ms': Flags.integer({
      description: 'Hold time after hiding the UI before the frame is captured (default 400)',
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
    const { flags } = await this.parse(GameViewAppshot);
    const client = createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: {
        host: flags.host,
        port: flags.port,
        timeoutMs: flags['timeout-ms'],
      },
    });
    const result = await client.view.appshot.capture({
      ...(flags.output === undefined ? {} : { outputPath: flags.output }),
      ...(flags['app-name'] === undefined ? {} : { appName: flags['app-name'] }),
      ...(flags['window-id'] === undefined ? {} : { windowId: flags['window-id'] }),
      ...(flags['hide-units'] ? { hideUnits: true } : {}),
      ...(flags['settle-ms'] === undefined ? {} : { settleMs: flags['settle-ms'] }),
    }).catch((error: unknown) => {
      // Typed appshot errors carry the actionable failure in data.detail
      // (e.g. the exact System Settings path for the TCC grant) — surface it.
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

    this.log(`captured: ${result.file.path}`);
    const dimensions = result.file.dimensions;
    if (dimensions) this.log(`size: ${dimensions.width}x${dimensions.height}`);
    this.log(`window: ${result.window.app} — ${result.window.title}`);
    const suppressed = result.cleanFrame.suppressedDisplays;
    this.log(suppressed.length === 0
      ? 'suppressed: nothing was queued'
      : `suppressed: ${suppressed.map((row: { category: string; closed: number }) => `${row.category} x${row.closed}`).join(', ')}`);
    this.log(`restored: view=${result.cleanFrame.restored.view} queueResumed=${result.cleanFrame.restored.queueResumed}`);
  }
}
