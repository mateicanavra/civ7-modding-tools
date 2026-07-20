import type { DependencyTagDefinition, MapGenStep } from "@mapgen/engine/index.js";

declare const registeredStep: MapGenStep;
declare const registeredTag: DependencyTagDefinition;

// @ts-expect-error Registered step identity is immutable to consumers.
registeredStep.id = "replacement";
// @ts-expect-error Registered dependency topology is immutable to consumers.
registeredStep.requires = [];
// @ts-expect-error Registered tag identity is immutable to consumers.
registeredTag.id = "artifact:replacement";
// @ts-expect-error Registered tag kind is immutable to consumers.
registeredTag.kind = "effect";
