const STEP_STAGE_IDENTITY_ALIASES = ["phase", "stageId"] as const;

/** Rejects step-owned aliases for stage identity, which belongs exclusively to recipe composition. */
export function assertNoStepStageIdentityAliases(value: unknown, boundary: string): void {
  for (const alias of STEP_STAGE_IDENTITY_ALIASES) {
    if (Object.prototype.hasOwnProperty.call(value, alias)) {
      throw new TypeError(
        `${boundary} cannot declare ${alias}; recipe composition owns stage identity`
      );
    }
  }
}
