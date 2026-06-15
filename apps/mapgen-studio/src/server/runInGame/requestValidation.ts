export function assertNoRawControlFields(value: unknown): void {
  if (!value || typeof value !== "object") return;
  const stack: unknown[] = [value];
  while (stack.length) {
    const next = stack.pop();
    if (!next || typeof next !== "object") continue;
    const entries = Array.isArray(next)
      ? next.map((child, index) => [String(index), child] as const)
      : Object.entries(next);
    for (const [key, child] of entries) {
      if (
        /^(?:args|command|context|operationType|script|javascript|rawJs|rawCommand|session|stateName)$/i.test(
          key
        )
      ) {
        throw new Error("Run in Game request must not include raw control commands");
      }
      if (child && typeof child === "object") stack.push(child);
    }
  }
}
