type ThenMethod = (onFulfilled: undefined, onRejected: () => undefined) => unknown;

/** @internal Captured classification used by exact synchronous boundaries. */
export type ThenableClassification =
  | Readonly<{ kind: "none" }>
  | Readonly<{ kind: "callable"; receiver: object; then: ThenMethod }>
  | Readonly<{ kind: "ambiguous" }>;

const NOT_THENABLE: ThenableClassification = Object.freeze({ kind: "none" });
const AMBIGUOUS_THENABLE: ThenableClassification = Object.freeze({ kind: "ambiguous" });

/**
 * Classifies a possible thenable with one guarded ECMAScript `Get` after descriptor preflight.
 *
 * Known accessors, cyclic prototypes, and descriptor-opaque candidates remain ambiguous without
 * invoking a getter. Otherwise one `Reflect.get` captures the exact method later used for rejection
 * containment, including when a Proxy's descriptor view differs from its property-access behavior.
 */
export function classifyThenable(value: unknown): ThenableClassification {
  if ((typeof value !== "object" && typeof value !== "function") || value === null) {
    return NOT_THENABLE;
  }

  try {
    const visited = new Set<object>();
    let current: object | null = value;
    while (current !== null) {
      if (visited.has(current)) return AMBIGUOUS_THENABLE;
      visited.add(current);

      const descriptor = Reflect.getOwnPropertyDescriptor(current, "then");
      if (descriptor !== undefined) {
        if (!("value" in descriptor)) return AMBIGUOUS_THENABLE;
        break;
      }
      current = Reflect.getPrototypeOf(current);
    }
  } catch {
    return AMBIGUOUS_THENABLE;
  }

  try {
    const then = Reflect.get(value, "then", value);
    return typeof then === "function"
      ? Object.freeze({
          kind: "callable",
          receiver: value,
          then: then as ThenMethod,
        })
      : NOT_THENABLE;
  } catch {
    return AMBIGUOUS_THENABLE;
  }
}

/** @internal Contains rejection from a callable thenable without awaiting or retrying it. */
export function containThenable(classification: ThenableClassification): void {
  if (classification.kind !== "callable") return;
  try {
    Reflect.apply(classification.then, classification.receiver, [undefined, () => undefined]);
  } catch {
    // The synchronous contract is already violated; rejection containment is best-effort.
  }
}
