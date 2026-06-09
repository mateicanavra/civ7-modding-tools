export function createCiv7ControlRequestId(prefix = "civ7-control"): string {
  return `${prefix}-${Date.now().toString(36)}-${process.pid.toString(36)}`;
}
