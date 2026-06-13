import { Command, Flags } from "@oclif/core";
import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";

// Closes display requests through the official DisplayQueueManager.closeMatching
// path, which runs each category handler's real teardown (e.g. the Cinematic
// handler pops its dynamic camera, fog override, and VFX group). Synthetic DOM
// clicks were live-proven to skip those handlers and orphan engine state — the
// queue, not the DOM, is the truth source for "dismissed".
// Consumed through the typed control-oRPC display.queue.close procedure.
export default class GamePlayScreenDismiss extends Command {
  static id = "game play screen dismiss";
  static summary = "Close queued Civ7 display requests via the official queue";
  static description =
    "Closes active, pending, and suspended display requests (cinematics, unlock/triumph popups, " +
    "narrative events, ...) through the App UI DisplayQueueManager, running each handler's real " +
    "close path. Closes everything queued by default; restrict with --category.";

  static examples = [
    "<%= config.bin %> game play screen dismiss",
    "<%= config.bin %> game play screen dismiss --category Cinematic",
    "<%= config.bin %> game play screen dismiss --category Cinematic --category UnlockPopup --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    category: Flags.string({
      description: "Display category to close (repeatable); omit to close everything queued",
      multiple: true,
    }),
    "timeout-ms": Flags.integer({
      description: "Socket timeout",
      default: 45_000,
    }),
    json: Flags.boolean({
      description: "Emit machine-readable JSON",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayScreenDismiss);
    const client = createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: {
        host: flags.host,
        port: flags.port,
        timeoutMs: flags["timeout-ms"],
      },
    });
    const result = await client.display.queue.close(
      flags.category && flags.category.length > 0 ? { categories: flags.category } : {}
    );

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    if (result.closed.length === 0) {
      this.log("closed: nothing was queued");
    }
    for (const row of result.closed) {
      this.log(`closed: ${row.category} x${row.closed}`);
    }
    const remaining = result.remainingActive.length + result.remainingSuspended.length;
    this.log(remaining === 0 ? "queue: empty" : `queue: ${remaining} request(s) remain`);
  }
}
