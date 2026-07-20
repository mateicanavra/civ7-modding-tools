import { Layer } from "effect";
import { RuleDiagnostics, type RuleDiagnosticsService } from "./resource.js";

export function makeFakeRuleDiagnosticsLayer(service: RuleDiagnosticsService) {
  return Layer.succeed(RuleDiagnostics, service);
}
