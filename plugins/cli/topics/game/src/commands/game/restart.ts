import {
  CIV7_RESTART_COMMAND,
  createCiv7ControlRequestId,
  resolveCiv7DirectControlConfig,
  restartCiv7Game,
  restartCiv7GameAndBegin,
  waitForCiv7DirectControl,
} from "@civ7/direct-control";
import { Command, Flags } from "@oclif/core";

export default class GameRestart extends Command {
  static id = "game restart";
  static summary = "Request a Civ7 restart through the direct tuner socket";
  static description =
    "Runs Network.restartGame() against the Civ7 tuner socket through @civ7/direct-control.";

  static examples = [
    "<%= config.bin %> game restart --agent Codex",
    "<%= config.bin %> game restart --host 127.0.0.1 --wait",
    "<%= config.bin %> game restart --begin --wait-tuner --json",
  ];

  static flags = {
    agent: Flags.string({
      char: "a",
      description: "Agent name written to restart request metadata",
    }),
    "request-id": Flags.string({
      description: "Explicit request id. Defaults to civ7-restart-<time>-<pid>.",
    }),
    host: Flags.string({
      description: "Civ7 tuner socket host for direct transport",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port for direct transport",
    }),
    state: Flags.string({
      description: "Civ7 tuner scripting state name or id for direct transport",
    }),
    wait: Flags.boolean({
      description: "Wait for direct-control readiness after the restart command",
      default: false,
    }),
    begin: Flags.boolean({
      description:
        "Follow restart by calling the native Begin Game action when App UI reaches WaitingForUIReady",
      default: false,
    }),
    "wait-tuner": Flags.boolean({
      description: "After --begin, wait until the Tuner state can execute gameplay API probes",
      default: false,
    }),
    "timeout-ms": Flags.integer({
      description: "Socket timeout, and how long --wait should wait",
      default: 45_000,
    }),
    json: Flags.boolean({
      description: "Emit machine-readable JSON",
      default: false,
    }),
    "dry-run": Flags.boolean({
      description: "Print the request that would be sent without sending it",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GameRestart);
    const agent = flags.agent ?? process.env.CIV7_TUNER_AGENT ?? "Codex";
    const requestId = flags["request-id"];

    const directConfig = resolveCiv7DirectControlConfig({
      host: flags.host,
      port: flags.port,
      timeoutMs: flags["timeout-ms"],
    });
    const directRequest = {
      requestId: requestId ?? createCiv7ControlRequestId("civ7-restart"),
      agent,
      command: CIV7_RESTART_COMMAND,
      hosts: directConfig.hosts,
      port: directConfig.port,
      state: flags.state ?? "App UI",
    };

    if (flags["dry-run"]) {
      const line = `DIRECT ${directRequest.requestId} AGENT=${agent} HOSTS=${directRequest.hosts.join(",")} PORT=${directRequest.port} STATE=${directRequest.state} RUN ${directRequest.command}`;
      if (flags.json) {
        this.log(JSON.stringify({ ok: true, request: directRequest, dryRun: true, line }));
      } else {
        this.log(line);
      }
      return;
    }

    const shouldBegin = flags.begin || flags["wait-tuner"];
    const flowResponse = shouldBegin
      ? await restartCiv7GameAndBegin({
          host: flags.host,
          port: flags.port,
          waitForTuner: flags["wait-tuner"],
          timeoutMs: flags["timeout-ms"],
          waitTimeoutMs: flags["timeout-ms"],
        })
      : undefined;
    const restartResponse = flowResponse
      ? flowResponse.restart
      : await restartCiv7Game({
          host: flags.host,
          port: flags.port,
          state: flags.state ? { id: flags.state, name: flags.state } : { role: "app-ui" },
          timeoutMs: flags["timeout-ms"],
        });
    const responseHost = restartResponse.host;
    const responsePort = restartResponse.port;
    const health =
      flags.wait && !shouldBegin
        ? await waitForCiv7DirectControl({
            host: responseHost,
            port: responsePort,
            state: flags.state ? { id: flags.state, name: flags.state } : { role: "app-ui" },
            timeoutMs: flags["timeout-ms"],
            waitTimeoutMs: flags["timeout-ms"],
          })
        : undefined;

    if (flags.json) {
      this.log(
        JSON.stringify({
          ok: true,
          request: directRequest,
          response: flowResponse ?? restartResponse,
          health,
        })
      );
      return;
    }

    this.log(`Requested Civ7 restart: ${directRequest.requestId}`);
    this.log(`Direct tuner socket: ${responseHost}:${responsePort}`);
    this.log(`Scripting state: ${restartResponse.state.name} (${restartResponse.state.id})`);
    this.log(`Civ7 restart returned: ${restartResponse.output.join("\n") || "<empty>"}`);
    if (flowResponse) {
      this.log(
        `Begin Game action: ${flowResponse.begin ? flowResponse.begin.output.join("\n") || "<empty>" : "<not needed>"}`
      );
      this.log(
        `Final App UI loading state: ${flowResponse.finalAppUi.snapshot.ui.loadingStateName ?? "<unknown>"}`
      );
      if (flowResponse.tunerHealth) {
        this.log(`Tuner ready: ${flowResponse.tunerHealth.ready ? "yes" : "no"}`);
      }
    }
    if (health) {
      this.log(`Civ7 tuner readiness: ${health.status}`);
    }
  }
}
