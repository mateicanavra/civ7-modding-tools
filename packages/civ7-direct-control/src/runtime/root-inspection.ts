import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerStateSelection,
} from "../session/types.js";
import type { Civ7RuntimeApiInspection } from "./inspection.js";

export type Civ7RootInspectionInput = Readonly<{
  state?: Civ7TunerStateSelection;
  roots: ReadonlyArray<string>;
  maxRoots?: number;
  maxKeys?: number;
  maxMethods?: number;
  includeEnumerableKeys?: boolean;
  includePrototypeKeys?: boolean;
  includeSignatures?: boolean;
}>;

export type Civ7RootInspectionResult = Civ7RuntimeApiInspection & Readonly<{
  limits: Readonly<{
    maxRoots: number;
    maxKeys: number;
    maxMethods: number;
    truncated: boolean;
  }>;
}>;

type RootInspectionDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  commandFailedError: (message: string) => Error;
  executeCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string; state?: Civ7TunerStateSelection }>,
  ) => Promise<Civ7CommandResult>;
  jsonPayloadFromCommandResult: <T extends object>(result: Civ7CommandResult, label: string) => T;
  jsLiteral: (value: unknown) => string;
  rootMaxKeysDefault: number;
  rootMaxMethodsDefault: number;
  validateIdentifier: (value: string, label: string) => string;
}>;

export async function inspectCiv7Root(
  input: Civ7RootInspectionInput,
  options: Civ7DirectControlOptions = {},
  dependencies: RootInspectionDependencies,
): Promise<Civ7RootInspectionResult> {
  const roots = input.roots.map((root) => dependencies.validateIdentifier(root, "runtime root"));
  if (roots.length === 0) {
    throw dependencies.commandFailedError("At least one runtime root is required");
  }
  const result = await dependencies.executeCommand({
    ...options,
    state: input.state ?? { role: "tuner" },
    command: buildBoundedRootInspectionCommand(
      {
        ...input,
        roots,
        maxRoots: dependencies.boundedInteger(input.maxRoots ?? 16, 1, 64, "maxRoots"),
        maxKeys: dependencies.boundedInteger(
          input.maxKeys ?? dependencies.rootMaxKeysDefault,
          1,
          1_000,
          "maxKeys",
        ),
        maxMethods: dependencies.boundedInteger(
          input.maxMethods ?? dependencies.rootMaxMethodsDefault,
          1,
          1_000,
          "maxMethods",
        ),
      },
      dependencies,
    ),
  });
  return dependencies.jsonPayloadFromCommandResult<Civ7RootInspectionResult>(result, "Civ7 root inspection");
}

function buildBoundedRootInspectionCommand(
  input: Civ7RootInspectionInput & {
    roots: ReadonlyArray<string>;
    maxRoots: number;
    maxKeys: number;
    maxMethods: number;
  },
  dependencies: RootInspectionDependencies,
): string {
  return `(() => {
    const input = ${dependencies.jsLiteral(input)};
    const roots = input.roots.slice(0, input.maxRoots);
    let truncated = input.roots.length > roots.length;
    const cap = (items, max) => {
      if (items.length > max) truncated = true;
      return items.slice(0, max);
    };
    const methodMeta = (owner, target, key) => {
      try {
        const candidate = target == null ? undefined : target[key];
        if (typeof candidate !== "function") return null;
        return {
          name: key,
          owner,
          length: candidate.length,
          signature: input.includeSignatures ? Function.prototype.toString.call(candidate).slice(0, 160) : "",
        };
      } catch (err) {
        return { name: key, owner, length: -1, signature: "", error: String(err) };
      }
    };
    const inspect = (name) => {
      try {
        const value = globalThis[name];
        const proto = value == null ? null : Object.getPrototypeOf(value);
        const ownKeys = cap(value == null ? [] : Object.getOwnPropertyNames(value), input.maxKeys);
        const prototypeKeys = input.includePrototypeKeys === false ? [] : cap(proto == null ? [] : Object.getOwnPropertyNames(proto), input.maxKeys);
        const enumerableKeys = input.includeEnumerableKeys === true && value != null
          ? cap(Object.keys(value), input.maxKeys)
          : [];
        const methods = cap([
          ...ownKeys.map((key) => methodMeta("own", value, key)),
          ...prototypeKeys.filter((key) => key !== "constructor").map((key) => methodMeta("prototype", proto, key)),
        ].filter(Boolean), input.maxMethods);
        return { name, type: typeof value, exists: value !== undefined, ownKeys, prototypeKeys, enumerableKeys, methods };
      } catch (err) {
        return { name, type: "unknown", exists: false, ownKeys: [], prototypeKeys: [], enumerableKeys: [], methods: [], error: String(err) };
      }
    };
    return JSON.stringify({
      roots: roots.map(inspect),
      limits: {
        maxRoots: input.maxRoots,
        maxKeys: input.maxKeys,
        maxMethods: input.maxMethods,
        truncated,
      },
    });
  })()`;
}
