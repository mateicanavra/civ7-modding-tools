export type Civ7MutationRequestStatus =
  | "not-sent"
  | "sent-confirmed"
  | "sent-guarded"
  | "sent-unverified";

export type Civ7MutationPostconditionState = Readonly<{
  confidence: "confirmed" | "pending-runtime-proof" | "unverified";
  noRepeatAfterUnverified: boolean;
}>;

export type Civ7MutationNextStep<
  Source extends string,
  InspectKind extends string,
> = Readonly<{
  kind: "do-not-repeat" | "refresh-attention" | InspectKind;
  source: Source;
  label: string;
}>;

export function civ7MutationRequestStatus(
  input: Readonly<{
    sent: boolean;
    postcondition: Civ7MutationPostconditionState;
  }>,
): Civ7MutationRequestStatus {
  if (!input.sent) return "not-sent";
  if (input.postcondition.confidence !== "confirmed") return "sent-unverified";
  if (input.postcondition.noRepeatAfterUnverified) return "sent-guarded";
  return "sent-confirmed";
}

export function civ7MutationRequestStatusWithoutGuarded(
  input: Readonly<{
    sent: boolean;
    postcondition: Civ7MutationPostconditionState;
  }>,
): Exclude<Civ7MutationRequestStatus, "sent-guarded"> {
  const status = civ7MutationRequestStatus(input);
  return status === "sent-guarded" ? "sent-unverified" : status;
}

export function civ7MutationNextSteps<
  Source extends string,
  InspectKind extends string,
>(
  input: Readonly<{
    status: Civ7MutationRequestStatus;
    postcondition: Pick<Civ7MutationPostconditionState, "noRepeatAfterUnverified">;
    source: Source;
    inspectKind: InspectKind;
    inspectLabel: string;
    doNotRepeatLabel: string;
    refreshLabel?: string;
  }>,
): Array<Civ7MutationNextStep<Source, InspectKind>> {
  if (input.status === "not-sent") {
    return [{
      kind: input.inspectKind,
      source: input.source,
      label: input.inspectLabel,
    }];
  }
  if (input.postcondition.noRepeatAfterUnverified) {
    return [{
      kind: "do-not-repeat",
      source: input.source,
      label: input.doNotRepeatLabel,
    }];
  }
  return [{
    kind: "refresh-attention",
    source: input.source,
    label: input.refreshLabel
      ?? "Refresh current attention before choosing the next player action.",
  }];
}
