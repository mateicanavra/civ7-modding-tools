import { Command, Flags } from '@oclif/core';
import {
  FIRETUNER_RESTART_COMMAND,
  appendFireTunerBridgeRequest,
  defaultFireTunerBridgeLog,
  formatFireTunerBridgeRequest,
  waitForFireTunerBridgeResponse,
} from '../../utils/firetunerBridge';

export default class GameRestart extends Command {
  static id = 'game restart';
  static summary = 'Request a Civ7 restart through the FireTuner bridge';
  static description =
    'Appends a Network.restartGame() request to the FireTuner bridge log. The Windows-side bridge remains the executor and audit authority.';

  static examples = [
    '<%= config.bin %> game restart --agent Codex',
    '<%= config.bin %> game restart --agent DRA-map-config-generation --wait',
    '<%= config.bin %> game restart --bridge-log ~/Parallels\\ Tunnel/.../civ7-firetuner-bridge.append-only.log',
  ];

  static flags = {
    agent: Flags.string({
      char: 'a',
      description: 'Agent name written to the bridge request audit fields',
    }),
    'request-id': Flags.string({
      description: 'Explicit bridge request id. Defaults to civ7-restart-<time>-<pid>.',
    }),
    'bridge-log': Flags.string({
      description: 'Override the FireTuner bridge append-only log path',
      default: defaultFireTunerBridgeLog(),
    }),
    wait: Flags.boolean({
      description: 'Wait for the Windows bridge to append RESULT or BLOCKED for this request',
      default: false,
    }),
    'timeout-ms': Flags.integer({
      description: 'How long --wait should wait for RESULT or BLOCKED',
      default: 45_000,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
    'dry-run': Flags.boolean({
      description: 'Print the request that would be appended without writing to the bridge log',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GameRestart);
    const agent = flags.agent ?? process.env.CIV7_FIRETUNER_AGENT ?? 'Codex';
    const requestId = flags['request-id'];
    const logPath = flags['bridge-log'];

    const request = flags['dry-run']
      ? {
          requestId: requestId ?? 'civ7-restart-dry-run',
          agent,
          command: FIRETUNER_RESTART_COMMAND,
          logPath,
          line: formatFireTunerBridgeRequest({
            requestId: requestId ?? 'civ7-restart-dry-run',
            agent,
            command: FIRETUNER_RESTART_COMMAND,
          }),
        }
      : await appendFireTunerBridgeRequest({
          logPath,
          requestId,
          agent,
          command: FIRETUNER_RESTART_COMMAND,
        });

    const response =
      flags.wait && !flags['dry-run']
        ? await waitForFireTunerBridgeResponse({
            logPath: request.logPath,
            requestId: request.requestId,
            timeoutMs: flags['timeout-ms'],
          })
        : undefined;

    if (flags.json) {
      this.log(
        JSON.stringify({
          ok: response?.status === 'blocked' || response === null ? false : true,
          request,
          response,
          timedOut: flags.wait && response === null,
        })
      );
      return;
    }

    if (flags['dry-run']) {
      this.log(request.line);
      return;
    }

    this.log(`Requested Civ7 restart: ${request.requestId}`);
    this.log(`Bridge log: ${request.logPath}`);
    if (response?.status === 'submitted') {
      this.log(`Windows bridge submitted: ${response.command ?? request.command}`);
    } else if (response?.status === 'blocked') {
      this.error(`Windows bridge blocked request: ${response.reason ?? 'unknown reason'}`);
    } else if (response === null) {
      this.error(`Timed out waiting for FireTuner bridge response after ${flags['timeout-ms']}ms`);
    }
  }
}
