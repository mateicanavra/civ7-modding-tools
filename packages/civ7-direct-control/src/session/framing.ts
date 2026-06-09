export type Civ7TunerFrame = Readonly<{
  listenerId: number;
  parts: ReadonlyArray<string>;
}>;

export function encodeCiv7TunerRequest(listenerId: number, message: string): Buffer {
  const messageBytes = Buffer.from(`${message}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}

export function parseCiv7TunerFrame(
  buffer: Buffer,
): { frame: Civ7TunerFrame; bytesRead: number } | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  const listenerId = buffer.readUInt32LE(4);
  const message = buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, "");
  return {
    bytesRead,
    frame: {
      listenerId,
      parts: message.length > 0 ? message.split("\0") : [],
    },
  };
}
