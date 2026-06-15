export type Civ7MutationRequestStatus =
  | "not-sent"
  | "sent-confirmed"
  | "sent-guarded"
  | "sent-unverified";

export type Civ7MutationProofConfidence = "confirmed" | "pending-runtime-proof" | "unverified";

export type Civ7MutationPostconditionState = Readonly<{
  confidence: Civ7MutationProofConfidence;
  noRepeatAfterUnverified: boolean;
}>;

export type Civ7MutationProofPostcondition<
  Classification extends string,
  Outcome extends string,
> = Civ7MutationPostconditionState &
  Readonly<{
    classification: Classification;
    reason: string;
    outcome: Outcome;
  }>;

export type Civ7MutationPostconditionSummary<
  Classification extends string,
  Outcome extends string,
> = Civ7MutationProofPostcondition<Classification, Outcome> &
  Readonly<{
    confirmed: boolean;
  }>;

export type Civ7MutationNextStep<Source extends string, InspectKind extends string> = Readonly<{
  kind: "do-not-repeat" | "refresh-attention" | InspectKind;
  source: Source;
  label: string;
}>;

export type Civ7MutationProjection<
  Classification extends string,
  Outcome extends string,
  Source extends string,
  InspectKind extends string,
> = Readonly<{
  postcondition: Civ7MutationPostconditionSummary<Classification, Outcome>;
  status: Exclude<Civ7MutationRequestStatus, "sent-guarded">;
  nextSteps: Array<Civ7MutationNextStep<Source, InspectKind>>;
}>;

export function civ7MutationRequestStatus(
  input: Readonly<{
    sent: boolean;
    postcondition: Civ7MutationPostconditionState;
  }>
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
  }>
): Exclude<Civ7MutationRequestStatus, "sent-guarded"> {
  const status = civ7MutationRequestStatus(input);
  return status === "sent-guarded" ? "sent-unverified" : status;
}

export function civ7MutationPostconditionSummary<
  Classification extends string,
  Outcome extends string,
  MissingClassification extends string,
  MissingOutcome extends string,
>(
  input: Readonly<{
    postcondition: Civ7MutationProofPostcondition<Classification, Outcome> | null | undefined;
    missing: Readonly<{
      classification: MissingClassification;
      reason: string;
      outcome: MissingOutcome;
    }>;
  }>
): Civ7MutationPostconditionSummary<
  Classification | MissingClassification,
  Outcome | MissingOutcome
> {
  if (input.postcondition == null) {
    return {
      classification: input.missing.classification,
      reason: input.missing.reason,
      outcome: input.missing.outcome,
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }

  return {
    classification: input.postcondition.classification,
    reason: input.postcondition.reason,
    outcome: input.postcondition.outcome,
    confidence: input.postcondition.confidence,
    confirmed:
      input.postcondition.confidence === "confirmed" &&
      !input.postcondition.noRepeatAfterUnverified,
    noRepeatAfterUnverified: input.postcondition.noRepeatAfterUnverified,
  };
}

export function civ7MutationNextSteps<Source extends string, InspectKind extends string>(
  input: Readonly<{
    status: Civ7MutationRequestStatus;
    postcondition: Pick<Civ7MutationPostconditionState, "noRepeatAfterUnverified">;
    source: Source;
    inspectKind: InspectKind;
    inspectLabel: string;
    doNotRepeatLabel: string;
    refreshLabel?: string;
  }>
): Array<Civ7MutationNextStep<Source, InspectKind>> {
  if (input.status === "not-sent") {
    return [
      {
        kind: input.inspectKind,
        source: input.source,
        label: input.inspectLabel,
      },
    ];
  }
  if (input.postcondition.noRepeatAfterUnverified) {
    return [
      {
        kind: "do-not-repeat",
        source: input.source,
        label: input.doNotRepeatLabel,
      },
    ];
  }
  return [
    {
      kind: "refresh-attention",
      source: input.source,
      label:
        input.refreshLabel ?? "Refresh current attention before choosing the next player action.",
    },
  ];
}

export function civ7CloseoutMutationProjection<
  Classification extends string,
  Outcome extends string,
  MissingClassification extends string,
  MissingOutcome extends string,
  Source extends string,
  InspectKind extends string,
>(
  input: Readonly<{
    sent: boolean;
    postcondition: Civ7MutationProofPostcondition<Classification, Outcome> | null | undefined;
    missing: Readonly<{
      classification: MissingClassification;
      reason: string;
      outcome: MissingOutcome;
    }>;
    source: Source;
    inspectKind: InspectKind;
    inspectLabel: string;
    doNotRepeatLabel: string;
    refreshLabel?: string;
  }>
): Civ7MutationProjection<
  Classification | MissingClassification,
  Outcome | MissingOutcome,
  Source,
  InspectKind
> {
  const postcondition = civ7MutationPostconditionSummary({
    postcondition: input.postcondition,
    missing: input.missing,
  });
  const status = civ7MutationRequestStatusWithoutGuarded({
    sent: input.sent,
    postcondition,
  });

  return {
    postcondition,
    status,
    nextSteps: civ7MutationNextSteps({
      status,
      postcondition,
      source: input.source,
      inspectKind: input.inspectKind,
      inspectLabel: input.inspectLabel,
      doNotRepeatLabel: input.doNotRepeatLabel,
      ...(input.refreshLabel === undefined ? {} : { refreshLabel: input.refreshLabel }),
    }),
  };
}
