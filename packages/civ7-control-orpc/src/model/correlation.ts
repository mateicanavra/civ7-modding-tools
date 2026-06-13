import { Civ7DirectControlError } from "@civ7/direct-control";
import { Type, type Static } from "typebox";

export const Civ7ControlOrpcCorrelationIdSchema = Type.String({
  pattern: "^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$",
});
export type Civ7ControlOrpcCorrelationId = Static<typeof Civ7ControlOrpcCorrelationIdSchema>;

export type Civ7ControlOrpcCorrelationContext = Readonly<{
  correlationId?: Civ7ControlOrpcCorrelationId;
}>;

export function isCiv7ControlOrpcCorrelationId(
  correlationId: unknown
): correlationId is Civ7ControlOrpcCorrelationId {
  return (
    typeof correlationId === "string" && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(correlationId)
  );
}

export function civ7ControlOrpcErrorCorrelationData(
  context: Readonly<{ correlation?: Civ7ControlOrpcCorrelationContext }>
): Readonly<{ correlationId?: Civ7ControlOrpcCorrelationId }> {
  const correlationId = context.correlation?.correlationId;
  return isCiv7ControlOrpcCorrelationId(correlationId) ? { correlationId } : {};
}

/**
 * Bounded failure detail for a defined-error `detail` field. NEVER the raw
 * cause message: tuner failure messages embed raw commands and endpoint
 * details, and error data is a wire contract (pinned by the "without raw
 * details" leak tests). Civ7DirectControlError causes surface their bounded
 * code ("direct-control/response-timeout"); anything else surfaces only its
 * constructor name.
 */
export function civ7ControlOrpcFailureDetail(cause: unknown): string {
  if (cause instanceof Civ7DirectControlError) {
    return `direct-control/${cause.code}`;
  }
  if (cause instanceof Error) return cause.name;
  return typeof cause;
}
