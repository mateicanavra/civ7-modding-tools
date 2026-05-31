import { Socket, createConnection } from 'node:net';

export const DEFAULT_FIRETUNER_SOCKET_HOST = '127.0.0.1';
export const DEFAULT_FIRETUNER_SOCKET_PORT = 4318;
export const DEFAULT_FIRETUNER_SOCKET_TIMEOUT_MS = 10_000;
export const FIRETUNER_APP_UI_STATE_NAME = 'App UI';

export type FireTunerSocketState = Readonly<{
  id: string;
  name: string;
}>;

export type FireTunerSocketCommandResult = Readonly<{
  host: string;
  port: number;
  state: FireTunerSocketState;
  output: ReadonlyArray<string>;
}>;

type FireTunerSocketFrame = Readonly<{
  listenerId: number;
  parts: ReadonlyArray<string>;
}>;

let nextListenerId = Math.trunc(Date.now() % 1_000_000);

export async function runFireTunerSocketCommand(options: {
  command: string;
  host?: string;
  port?: number;
  stateName?: string;
  timeoutMs?: number;
}): Promise<FireTunerSocketCommandResult> {
  const host = options.host ?? process.env.CIV7_FIRETUNER_HOST ?? DEFAULT_FIRETUNER_SOCKET_HOST;
  const port = options.port ?? fireTunerSocketPortFromEnv() ?? DEFAULT_FIRETUNER_SOCKET_PORT;
  const timeoutMs = options.timeoutMs ?? DEFAULT_FIRETUNER_SOCKET_TIMEOUT_MS;
  const socket = await openFireTunerSocket({ host, port, timeoutMs });
  try {
    const states = await queryFireTunerSocketStates({ socket, timeoutMs });
    const stateName = options.stateName ?? FIRETUNER_APP_UI_STATE_NAME;
    const state = states.find((candidate) => candidate.name === stateName);
    if (!state) {
      throw new Error(
        `FireTuner state "${stateName}" was not available; states: ${states.map((s) => s.name).join(', ')}`
      );
    }
    const output = await sendFireTunerSocketMessage({
      socket,
      message: `CMD:${state.id}:${options.command}`,
      timeoutMs,
    });
    return {
      host,
      port,
      state,
      output: output.parts,
    };
  } finally {
    socket.destroy();
  }
}

export async function queryFireTunerSocketStates(options?: {
  host?: string;
  port?: number;
  timeoutMs?: number;
  socket?: Socket;
}): Promise<ReadonlyArray<FireTunerSocketState>> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_FIRETUNER_SOCKET_TIMEOUT_MS;
  const host = options?.host ?? process.env.CIV7_FIRETUNER_HOST ?? DEFAULT_FIRETUNER_SOCKET_HOST;
  const port = options?.port ?? fireTunerSocketPortFromEnv() ?? DEFAULT_FIRETUNER_SOCKET_PORT;
  const socket = options?.socket ?? (await openFireTunerSocket({ host, port, timeoutMs }));
  try {
    const response = await sendFireTunerSocketMessage({ socket, message: 'LSQ:', timeoutMs });
    const states: FireTunerSocketState[] = [];
    for (let i = 0; i + 1 < response.parts.length; i += 2) {
      states.push({ id: response.parts[i], name: response.parts[i + 1] });
    }
    return states;
  } finally {
    if (!options?.socket) socket.destroy();
  }
}

async function openFireTunerSocket(options: {
  host: string;
  port: number;
  timeoutMs: number;
}): Promise<Socket> {
  return await new Promise<Socket>((resolve, reject) => {
    const socket = createConnection({ host: options.host, port: options.port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Timed out connecting to FireTuner socket ${options.host}:${options.port}`));
    }, options.timeoutMs);
    socket.once('connect', () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function sendFireTunerSocketMessage(options: {
  socket: Socket;
  message: string;
  timeoutMs: number;
}): Promise<FireTunerSocketFrame> {
  const listenerId = allocateListenerId();
  return await new Promise<FireTunerSocketFrame>((resolve, reject) => {
    let buffer = Buffer.alloc(0);
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for FireTuner socket response to ${options.message}`));
    }, options.timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      options.socket.off('data', onData);
      options.socket.off('error', onError);
      options.socket.off('close', onClose);
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const onClose = () => {
      cleanup();
      reject(new Error(`FireTuner socket closed while waiting for ${options.message}`));
    };
    const onData = (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const parsed = parseFireTunerSocketFrame(buffer);
        if (!parsed) return;
        buffer = buffer.subarray(parsed.bytesRead);
        if (parsed.frame.listenerId === listenerId) {
          cleanup();
          resolve(parsed.frame);
          return;
        }
      }
    };
    options.socket.on('data', onData);
    options.socket.once('error', onError);
    options.socket.once('close', onClose);
    options.socket.write(encodeFireTunerSocketRequest(listenerId, options.message));
  });
}

function encodeFireTunerSocketRequest(listenerId: number, message: string): Buffer {
  const messageBytes = Buffer.from(`${message}\0`, 'utf8');
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}

function parseFireTunerSocketFrame(
  buffer: Buffer
): { frame: FireTunerSocketFrame; bytesRead: number } | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  const listenerId = buffer.readUInt32LE(4);
  const message = buffer.subarray(8, bytesRead).toString('utf8').replace(/\0$/, '');
  return {
    bytesRead,
    frame: {
      listenerId,
      parts: message.length > 0 ? message.split('\0') : [],
    },
  };
}

function allocateListenerId(): number {
  nextListenerId = (nextListenerId + 1) % 0xffff_ffff;
  if (nextListenerId <= 0) nextListenerId = 1;
  return nextListenerId;
}

function fireTunerSocketPortFromEnv(): number | undefined {
  if (!process.env.CIV7_FIRETUNER_PORT) return undefined;
  const port = Number(process.env.CIV7_FIRETUNER_PORT);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error(`Invalid CIV7_FIRETUNER_PORT: ${process.env.CIV7_FIRETUNER_PORT}`);
  }
  return port;
}
