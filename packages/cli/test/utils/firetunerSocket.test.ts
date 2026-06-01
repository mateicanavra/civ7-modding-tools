import { once } from 'node:events';
import { type AddressInfo, createServer } from 'node:net';
import { describe, expect, test } from 'vitest';
import { FIRETUNER_RESTART_COMMAND } from '../../src/utils/firetunerBridge';
import { runFireTunerSocketCommand } from '../../src/utils/firetunerSocket';

describe('FireTuner socket helpers', () => {
  test('queries states and sends commands using the FireTuner frame protocol', async () => {
    const received: string[] = [];
    const server = createServer((socket) => {
      let buffer = Buffer.alloc(0);
      socket.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
        for (;;) {
          const frame = parseRequest(buffer);
          if (!frame) return;
          buffer = buffer.subarray(frame.bytesRead);
          received.push(frame.message);
          if (frame.message === 'LSQ:') {
            socket.write(encodeResponse(frame.listenerId, ['65535', 'App UI', '1', 'Tuner']));
          } else if (frame.message === `CMD:65535:${FIRETUNER_RESTART_COMMAND}`) {
            socket.write(encodeResponse(frame.listenerId, ['true']));
          } else {
            socket.write(encodeResponse(frame.listenerId, ['false']));
          }
        }
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

    try {
      const { port } = server.address() as AddressInfo;
      const result = await runFireTunerSocketCommand({
        host: '127.0.0.1',
        port,
        command: FIRETUNER_RESTART_COMMAND,
        timeoutMs: 1_000,
      });

      expect(result).toMatchObject({
        host: '127.0.0.1',
        port,
        state: { id: '65535', name: 'App UI' },
        output: ['true'],
      });
      expect(received).toEqual(['LSQ:', `CMD:65535:${FIRETUNER_RESTART_COMMAND}`]);
    } finally {
      server.close();
      await once(server, 'close');
    }
  });
});

function parseRequest(buffer: Buffer):
  | {
      listenerId: number;
      message: string;
      bytesRead: number;
    }
  | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString('utf8').replace(/\0$/, ''),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, parts: string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join('\0')}\0`, 'utf8');
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
