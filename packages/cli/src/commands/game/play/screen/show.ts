import { Command, Flags } from '@oclif/core';
import {
  CIV7_CINEMATIC_CLOSE_BUTTON_SELECTOR,
  CIV7_CINEMATIC_MOMENT_SELECTOR,
  CIV7_CINEMATIC_TITLE_SELECTOR,
  executeCiv7AppUiCommand,
} from '@civ7/direct-control';

// Native primitive provenance (same as `game play screen dismiss`): map-reveal /
// wonder-discovery cinematic moments are DisplayQueueManager screens in the App UI
// scripting state. One mounts at a time. Official handler:
// .civ7/outputs/resources/Base/modules/base-standard/ui/cinematic/cinematic-manager.chunk.js
// — DisplayQueueManager.close(...) (~line 198). This command is the read-only sibling:
// one App UI exec that lists the active cinematic/display screens (selector count +
// titles) using the selector constants exported by @civ7/direct-control, without
// dispatching any close events.

type ScreenShowPayload = Readonly<{
  selectorCount: number;
  screens: ReadonlyArray<{ title: string | null; closeButtonPresent: boolean }>;
}>;

export default class GamePlayScreenShow extends Command {
  static id = 'game play screen show';
  static summary = 'Show active Civ7 cinematic/display screens (read-only)';
  static description =
    'Lists mounted cinematic-moment screens (App UI DisplayQueueManager) in one read-only App UI ' +
    'exec: selector match count plus the title and close-button presence of any mounted screen. ' +
    'Uses the same live-verified selectors as `game play screen dismiss` and performs no dismissal.';

  static examples = [
    '<%= config.bin %> game play screen show',
    '<%= config.bin %> game play screen show --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
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
    const { flags } = await this.parse(GamePlayScreenShow);
    const result = await executeCiv7AppUiCommand({
      host: flags.host,
      port: flags.port,
      timeoutMs: flags['timeout-ms'],
      command: buildScreenShowCommand(),
    });

    const payload = parseScreenShowPayload(result.output);

    if (flags.json) {
      this.log(
        JSON.stringify({
          ok: true,
          result: {
            host: result.host,
            port: result.port,
            state: result.state,
            ...payload,
          },
        }),
      );
      return;
    }

    this.log(`cinematic-moment DOM nodes: ${payload.selectorCount}`);
    if (payload.screens.length === 0) {
      this.log('screens: none mounted');
      return;
    }
    for (const screen of payload.screens) {
      this.log(
        `screen: ${screen.title ?? '<untitled cinematic>'} (close button ${screen.closeButtonPresent ? 'present' : 'missing'})`,
      );
    }
  }
}

export function buildScreenShowCommand(): string {
  // Read-only probe: same selectors as the dismissal primitive, no synthetic events.
  return `(() => {
    const readScreenShow = () => {
      const selectorCount = document.querySelectorAll(${JSON.stringify(CIV7_CINEMATIC_MOMENT_SELECTOR)}).length;
      const closeButton = document.querySelector(${JSON.stringify(CIV7_CINEMATIC_CLOSE_BUTTON_SELECTOR)});
      const title = document.querySelector(${JSON.stringify(CIV7_CINEMATIC_TITLE_SELECTOR)})?.textContent ?? null;
      const screens = closeButton || title !== null
        ? [{ title, closeButtonPresent: Boolean(closeButton) }]
        : [];
      return { selectorCount, screens };
    };
    return JSON.stringify(readScreenShow());
  })()`;
}

function parseScreenShowPayload(output: ReadonlyArray<string>): ScreenShowPayload {
  const raw = output[0] ?? '{}';
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`game play screen show returned invalid JSON: ${output.join('\n') || '<empty>'}`, {
      cause: err,
    });
  }
  const payload = parsed as { selectorCount?: unknown; screens?: unknown };
  const selectorCount = typeof payload.selectorCount === 'number' ? payload.selectorCount : 0;
  const screens = Array.isArray(payload.screens)
    ? payload.screens.map((screen: { title?: unknown; closeButtonPresent?: unknown }) => ({
        title: typeof screen.title === 'string' ? screen.title : null,
        closeButtonPresent: screen.closeButtonPresent === true,
      }))
    : [];
  return { selectorCount, screens };
}
