import { mkdir, readFile, appendFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

export const FIRETUNER_RESTART_COMMAND = 'Network.restartGame()';

export type FireTunerBridgeRequest = {
  requestId: string;
  agent: string;
  command: string;
  logPath: string;
  line: string;
};

export type FireTunerBridgeResponse =
  | {
      status: 'submitted';
      requestId: string;
      agent?: string;
      command?: string;
      raw: string;
    }
  | {
      status: 'blocked';
      requestId: string;
      agent?: string;
      reason?: string;
      raw: string;
    };

export function defaultFireTunerBridgeLog(): string {
  return join(
    homedir(),
    'Parallels Tunnel',
    "Sid Meier's Civilization VII Development Tools",
    'Comms',
    'civ7-firetuner-bridge.append-only.log',
  );
}

export function createFireTunerRequestId(prefix = 'civ7-restart'): string {
  return `${prefix}-${Date.now().toString(36)}-${process.pid.toString(36)}`;
}

export function formatFireTunerBridgeRequest(request: {
  requestId: string;
  agent: string;
  command: string;
}): string {
  assertBridgeToken('request id', request.requestId);
  assertBridgeToken('agent', request.agent);
  const command = request.command.trim();
  if (!command) throw new Error('FireTuner command must not be empty');
  return `REQ ${request.requestId} AGENT=${request.agent} RUN ${command}`;
}

export async function appendFireTunerBridgeRequest(options: {
  logPath?: string;
  requestId?: string;
  requestIdPrefix?: string;
  agent: string;
  command?: string;
}): Promise<FireTunerBridgeRequest> {
  const logPath = options.logPath ?? process.env.CIV7_FIRETUNER_BRIDGE_LOG ?? defaultFireTunerBridgeLog();
  const requestId = options.requestId ?? createFireTunerRequestId(options.requestIdPrefix);
  const command = options.command ?? FIRETUNER_RESTART_COMMAND;
  const line = formatFireTunerBridgeRequest({ requestId, agent: options.agent, command });
  await mkdir(dirname(logPath), { recursive: true });
  await appendFile(logPath, `\n${line}\n`);
  return {
    requestId,
    agent: options.agent,
    command,
    logPath,
    line,
  };
}

export async function waitForFireTunerBridgeResponse(options: {
  logPath: string;
  requestId: string;
  timeoutMs: number;
  pollIntervalMs?: number;
}): Promise<FireTunerBridgeResponse | null> {
  const startedAt = Date.now();
  const pollIntervalMs = options.pollIntervalMs ?? 1_000;
  while (Date.now() - startedAt <= options.timeoutMs) {
    const text = await readFile(options.logPath, 'utf8').catch((err: unknown) => {
      if (isNodeError(err) && err.code === 'ENOENT') return '';
      throw err;
    });
    const response = parseFireTunerBridgeResponse(text, options.requestId);
    if (response) return response;
    await sleep(pollIntervalMs);
  }
  return null;
}

export function parseFireTunerBridgeResponse(
  text: string,
  requestId: string,
): FireTunerBridgeResponse | null {
  const escapedId = escapeRegExp(requestId);
  const blockPattern = new RegExp(`(?:^|\\n)(RESULT|BLOCKED)[ \\t]+${escapedId}\\b[\\s\\S]*?(?=\\n(?:REQ|ACK|RESULT|BLOCKED)[ \\t]+|$)`, 'gi');
  let match: RegExpExecArray | null;
  let latest: FireTunerBridgeResponse | null = null;
  while ((match = blockPattern.exec(text))) {
    const raw = match[0].replace(/^\n/, '').trimEnd();
    if (match[1].toUpperCase() === 'RESULT') {
      if (!matchField(raw, 'WINDOWS_SUBMITTED_AT')) continue;
      latest = {
        status: 'submitted',
        requestId,
        agent: matchField(raw, 'AGENT'),
        command: matchField(raw, 'REQUESTED_COMMAND') ?? matchField(raw, 'CONSOLE_LINE'),
        raw,
      };
    } else {
      latest = {
        status: 'blocked',
        requestId,
        agent: matchField(raw, 'AGENT'),
        reason: matchField(raw, 'REASON'),
        raw,
      };
    }
  }
  return latest;
}

function assertBridgeToken(label: string, value: string): void {
  if (!/^[A-Za-z0-9_.-]+$/.test(value)) {
    throw new Error(`FireTuner ${label} may only contain letters, numbers, dot, underscore, or dash`);
  }
}

function matchField(raw: string, field: string): string | undefined {
  const re = new RegExp(`(?:^|\\n)${escapeRegExp(field)}[ \\t]+([^\\r\\n]+)`, 'i');
  return re.exec(raw)?.[1]?.trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err !== null && typeof err === 'object' && 'code' in err;
}
