import { Value } from "typebox/value";
import {
  type ApplyAdmission,
  type DiagnosticAdmission,
  type PatternState,
  PatternStateSchema,
} from "../dto/pattern-management.schema.js";

export function diagnosticAdmittedState(admission: DiagnosticAdmission): PatternState {
  return admittedState("diagnostic-admitted", admission);
}

export function applyAdmittedState(admission: ApplyAdmission): PatternState {
  return admittedState("apply-admitted", admission);
}

function admittedState(kind: "diagnostic-admitted", admission: DiagnosticAdmission): PatternState;
function admittedState(kind: "apply-admitted", admission: ApplyAdmission): PatternState;
function admittedState(
  kind: "diagnostic-admitted" | "apply-admitted",
  admission: DiagnosticAdmission | ApplyAdmission
): PatternState {
  return Value.Parse(PatternStateSchema, { kind, admission });
}
