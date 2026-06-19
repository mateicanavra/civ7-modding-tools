import { Value } from "typebox/value";
import {
  type ApplyAdmissionProjection,
  type DiagnosticAdmissionProjection,
  type LocalFeedbackAdmissionProjection,
  type PatternAuthorityState,
  PatternAuthorityStateSchema,
} from "./schema.js";

export function diagnosticAdmittedState(
  admission: DiagnosticAdmissionProjection
): PatternAuthorityState {
  return admittedState("diagnostic-admitted", admission);
}

export function localFeedbackAdmittedState(
  admission: LocalFeedbackAdmissionProjection
): PatternAuthorityState {
  return admittedState("local-feedback-admitted", admission);
}

export function applyAdmittedState(admission: ApplyAdmissionProjection): PatternAuthorityState {
  return admittedState("apply-admitted", admission);
}

function admittedState(
  kind: "diagnostic-admitted",
  admission: DiagnosticAdmissionProjection
): PatternAuthorityState;
function admittedState(
  kind: "local-feedback-admitted",
  admission: LocalFeedbackAdmissionProjection
): PatternAuthorityState;
function admittedState(
  kind: "apply-admitted",
  admission: ApplyAdmissionProjection
): PatternAuthorityState;
function admittedState(
  kind: "diagnostic-admitted" | "local-feedback-admitted" | "apply-admitted",
  admission: DiagnosticAdmissionProjection | LocalFeedbackAdmissionProjection | ApplyAdmissionProjection
): PatternAuthorityState {
  return Value.Parse(PatternAuthorityStateSchema, { kind, admission });
}
