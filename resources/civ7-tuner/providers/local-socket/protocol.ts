import { Civ7TunerFailure, type Civ7TunerState, type Civ7TunerStateSelection } from "@civ7/tuner";

const APP_UI_STATE_NAME = "App UI";
const TUNER_STATE_NAME = "Tuner";

/** One fully decoded response frame correlated to its outstanding listener. */
export type Civ7TunerFrame = Readonly<{
  listenerId: number;
  parts: readonly string[];
}>;

let nextListenerId = Math.trunc(Date.now() % 1_000_000);

/** Allocates a nonzero listener identity for multiplexing requests on one socket. */
export function allocateListenerId(): number {
  nextListenerId = (nextListenerId + 1) % 0xffff_ffff;
  if (nextListenerId <= 0) nextListenerId = 1;
  return nextListenerId;
}

/** Encodes one listener-correlated request in Civ7 Tuner's length-prefixed wire format. */
export function encodeCiv7TunerRequest(listenerId: number, message: string): Buffer {
  const messageBytes = Buffer.from(`${message}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}

/** Decodes one complete frame while retaining an incomplete suffix for the next read. */
export function parseCiv7TunerFrame(
  buffer: Buffer
): { frame: Civ7TunerFrame; bytesRead: number } | undefined {
  if (buffer.length < 8) return undefined;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return undefined;
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

/** Projects a Tuner state-list response into stable provider-neutral state records. */
export function statesFromFrame(parts: readonly string[]): Civ7TunerState[] {
  const states: Civ7TunerState[] = [];
  for (let index = 0; index + 1 < parts.length; index += 2) {
    states.push({ id: parts[index] ?? "", name: parts[index + 1] ?? "" });
  }
  return states;
}

/** Resolves a caller's semantic or exact selection against the currently advertised states. */
export function selectState(
  states: readonly Civ7TunerState[],
  selection: Civ7TunerStateSelection = { role: "app-ui" }
): Civ7TunerState {
  const requested = normalizeSelection(selection);
  const state = states.find((candidate) => {
    if (requested.id && candidate.id === requested.id) return true;
    if (requested.name && candidate.name === requested.name) return true;
    return false;
  });
  if (state) return state;

  throw new Civ7TunerFailure({
    operation: "execute",
    reason: "state-not-found",
    message: `Civ7 Tuner state "${requested.name ?? requested.id ?? "unknown"}" was not available.`,
    dispatchStatus: "not-dispatched",
    details: { requested, states },
  });
}

function normalizeSelection(selection: Civ7TunerStateSelection): {
  readonly id?: string;
  readonly name?: string;
} {
  if (typeof selection === "string") {
    return selection === APP_UI_STATE_NAME || selection === TUNER_STATE_NAME
      ? { name: selection }
      : { id: selection, name: selection };
  }
  if (selection.role === "app-ui") return { name: APP_UI_STATE_NAME };
  if (selection.role === "tuner") return { name: TUNER_STATE_NAME };
  return { id: selection.id, name: selection.name };
}
