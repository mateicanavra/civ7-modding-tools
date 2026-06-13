import { CIV7_TUNER_APP_UI_STATE_NAME, CIV7_TUNER_STATE_NAME } from "../session/constants.js";
import { executeCiv7Command } from "../session/execute.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerStateSelection,
} from "../session/types.js";
import {
  DEFAULT_CIV7_APP_UI_API_ROOTS,
  DEFAULT_CIV7_TUNER_API_ROOTS,
} from "./inspection-constants.js";

export type Civ7RuntimeApiRoot = Readonly<{
  name: string;
  type: string;
  exists: boolean;
  ownKeys: ReadonlyArray<string>;
  prototypeKeys: ReadonlyArray<string>;
  enumerableKeys: ReadonlyArray<string>;
  methods: ReadonlyArray<Civ7RuntimeApiMethod>;
  error?: string;
}>;

export type Civ7RuntimeApiMethod = Readonly<{
  name: string;
  owner: "own" | "prototype";
  length: number;
  signature: string;
  error?: string;
}>;

export type Civ7RuntimeApiInspection = Readonly<{
  host: string;
  port: number;
  state: Civ7CommandResult["state"];
  roots: ReadonlyArray<Civ7RuntimeApiRoot>;
}>;

type RuntimeInspectionDependencies = Readonly<{
  appUiStateName: string;
  defaultAppUiApiRoots: ReadonlyArray<string>;
  defaultTunerApiRoots: ReadonlyArray<string>;
  executeCommand: (
    options: Civ7DirectControlOptions &
      Readonly<{ command: string; state?: Civ7TunerStateSelection }>
  ) => Promise<Civ7CommandResult>;
  tunerStateName: string;
}>;

export async function inspectCiv7RuntimeApi(
  options: Civ7DirectControlOptions & {
    state?: Civ7TunerStateSelection;
    roots?: ReadonlyArray<string>;
  } = {},
  dependencies: RuntimeInspectionDependencies = defaultRuntimeInspectionDependencies
): Promise<Civ7RuntimeApiInspection> {
  const selection = options.state ?? { role: "app-ui" };
  const roots = options.roots ?? defaultRootsForSelection(selection, dependencies);
  const result = await dependencies.executeCommand({
    ...options,
    state: selection,
    command: buildRuntimeApiInspectionCommand(roots),
  });
  const parsed = JSON.parse(result.output[0] ?? "[]") as Civ7RuntimeApiRoot[];
  return {
    host: result.host,
    port: result.port,
    state: result.state,
    roots: parsed,
  };
}

const defaultRuntimeInspectionDependencies: RuntimeInspectionDependencies = {
  appUiStateName: CIV7_TUNER_APP_UI_STATE_NAME,
  defaultAppUiApiRoots: DEFAULT_CIV7_APP_UI_API_ROOTS,
  defaultTunerApiRoots: DEFAULT_CIV7_TUNER_API_ROOTS,
  executeCommand: executeCiv7Command,
  tunerStateName: CIV7_TUNER_STATE_NAME,
};

function defaultRootsForSelection(
  selection: Civ7TunerStateSelection,
  dependencies: RuntimeInspectionDependencies
): ReadonlyArray<string> {
  const normalized = normalizeStateSelection(selection, dependencies);
  return normalized.name === dependencies.tunerStateName
    ? dependencies.defaultTunerApiRoots
    : dependencies.defaultAppUiApiRoots;
}

function normalizeStateSelection(
  selection: Civ7TunerStateSelection,
  dependencies: RuntimeInspectionDependencies
): { id?: string; name?: string } {
  if (typeof selection === "string") {
    return selection === dependencies.appUiStateName || selection === dependencies.tunerStateName
      ? { name: selection }
      : { id: selection, name: selection };
  }
  if (selection.role === "app-ui") return { name: dependencies.appUiStateName };
  if (selection.role === "tuner") return { name: dependencies.tunerStateName };
  return { id: selection.id, name: selection.name };
}

function buildRuntimeApiInspectionCommand(roots: ReadonlyArray<string>): string {
  return `(() => {
    const roots = ${JSON.stringify(roots)};
    const methodMeta = (owner, target, key) => {
      try {
        const candidate = target == null ? undefined : target[key];
        if (typeof candidate !== "function") return null;
        return {
          name: key,
          owner,
          length: candidate.length,
          signature: Function.prototype.toString.call(candidate).slice(0, 160),
        };
      } catch (err) {
        return {
          name: key,
          owner,
          length: -1,
          signature: "",
          error: String(err),
        };
      }
    };
    const inspect = (name) => {
      try {
        const value = globalThis[name];
        const proto = value == null ? null : Object.getPrototypeOf(value);
        const ownKeys = value == null ? [] : Object.getOwnPropertyNames(value);
        const prototypeKeys = proto == null ? [] : Object.getOwnPropertyNames(proto);
        const enumerableKeys = [];
        if (value != null) {
          for (const key in value) enumerableKeys.push(key);
        }
        const methods = [
          ...ownKeys.map((key) => methodMeta("own", value, key)),
          ...prototypeKeys.filter((key) => key !== "constructor").map((key) => methodMeta("prototype", proto, key)),
        ].filter(Boolean);
        return {
          name,
          type: typeof value,
          exists: value !== undefined,
          ownKeys,
          prototypeKeys,
          enumerableKeys,
          methods,
        };
      } catch (err) {
        return {
          name,
          type: "unknown",
          exists: false,
          ownKeys: [],
          prototypeKeys: [],
          enumerableKeys: [],
          methods: [],
          error: String(err),
        };
      }
    };
    return JSON.stringify(roots.map(inspect));
  })()`;
}
