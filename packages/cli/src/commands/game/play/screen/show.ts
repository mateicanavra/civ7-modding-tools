import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { Command, Flags } from "@oclif/core";

// Truth source: the official DisplayQueueManager in the App UI scripting state
// (core/ui/context-manager/display-queue-manager.js, reached through the shared
// module registry). Every popup-like screen — wonder-discovery cinematics,
// unlock/triumph popups, narrative events, diplomacy dialogs — is a request in
// that queue, so this command reads queue state instead of probing DOM
// selectors (DOM emptiness was live-proven to be a false truth source).
// Consumed through the typed control-oRPC display.queue.current procedure.
export default class GamePlayScreenShow extends Command {
  static id = "game play screen show";
  static summary = "Show queued Civ7 display requests (read-only)";
  static description =
    "Reads the official App UI DisplayQueueManager: active display requests (the screen currently " +
    "mounted), suspended requests, and the registered handler categories. Read-only.";

  static examples = [
    "<%= config.bin %> game play screen show",
    "<%= config.bin %> game play screen show --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
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
    const { flags } = await this.parse(GamePlayScreenShow);
    const client = createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: {
        host: flags.host,
        port: flags.port,
        timeoutMs: flags["timeout-ms"],
      },
    });
    const result = await client.display.queue.current({});

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    if (result.active.length === 0 && result.suspended.length === 0) {
      this.log("display queue: empty");
    }
    for (const request of result.active) {
      this.log(`active: ${request.category}${request.id === null ? "" : ` (id ${request.id})`}`);
    }
    for (const request of result.suspended) {
      this.log(`suspended: ${request.category}${request.id === null ? "" : ` (id ${request.id})`}`);
    }
    if (result.isSuspended) {
      this.log("queue is SUSPENDED (new requests park without displaying)");
    }
  }
}
