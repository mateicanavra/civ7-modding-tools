/**
 * Engine-safe warn logging for placement steps.
 *
 * The Civ7 live scripting runtime exposes `console.log` but NOT
 * `console.warn` (discovered during the Milestone A live evidence:
 * `place-resources` failed the whole generation with
 * "console.warn is not a function"). Loud fallback/shortfall reporting must
 * stay visible on live runs, so it routes through `console.warn` where it
 * exists (tests, browser studio, node) and falls back to `console.log` in
 * the engine.
 */
export function warnLog(message: string): void {
  const sink = console as unknown as {
    warn?: (msg: string) => void;
    log: (msg: string) => void;
  };
  if (typeof sink.warn === "function") {
    sink.warn(message);
    return;
  }
  sink.log(`[warn] ${message}`);
}
