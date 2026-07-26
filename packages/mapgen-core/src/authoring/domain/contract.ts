import { assertCanonicalOpContract, type OpContractAny } from "../operation/contract.js";
import {
  captureOwnDataRecord,
  materializeOwnDataRecord,
  type OwnDataRecord,
} from "../snapshot/own-data.js";
import type { StepOpsDecl } from "../step/ops.js";
import { readDomainContractAuthority, registerDomainContractAuthority } from "./authority.js";

type NonEmpty<Input extends object> = keyof Input extends never ? never : unknown;
type DomainDefinition<Id extends string, Ops extends StepOpsDecl> = Readonly<{
  id: Id;
  ops: Ops;
}>;
type DomainDefinitionAny = DomainDefinition<string, StepOpsDecl>;

/** Temporary flat domain contract retained while existing domains migrate to semantic branches. */
export type DomainContract<Id extends string, Ops extends StepOpsDecl> = Readonly<{
  kind: "domain";
  id: Id;
  ops: Ops;
}>;

/** Type-erased flat domain contract used only at generic authoring boundaries. */
export type DomainContractAny = DomainContract<string, StepOpsDecl>;

/** One pure semantic subdomain contract. Runtime implementations are composed separately. */
export type DomainSubdomainContract<Id extends string, Ops extends StepOpsDecl> = Readonly<{
  kind: "subdomain";
  id: Id;
  ops: Ops;
}>;

/** Type-erased semantic subdomain contract used only at generic authoring boundaries. */
export type DomainSubdomainContractAny = DomainSubdomainContract<string, StepOpsDecl>;
type DomainSubdomainBranches = Readonly<Record<string, DomainSubdomainContractAny>>;

/** A pure domain contract composed from direct semantic subdomain branches. */
export type DomainAggregateContract<
  Id extends string,
  Branches extends DomainSubdomainBranches,
> = Readonly<{ kind: "domain"; id: Id }> & Readonly<Branches>;

/** Type-erased root domain contract whose branch shape remains available to generic consumers. */
export type DomainAggregateContractAny = Readonly<{ kind: "domain"; id: string }>;

type BranchesMatchOwnIds<Branches extends DomainSubdomainBranches> = {
  readonly [Key in keyof Branches]: Key extends string
    ? Branches[Key] & Readonly<{ id: Key }>
    : never;
};

const RESERVED_KEYS = new Set([
  "__proto__",
  "bind",
  "constructor",
  "id",
  "kind",
  "ops",
  "prototype",
]);

function readCaptured(entries: OwnDataRecord, key: string): unknown {
  return entries.find((entry) => entry.key === key)?.value;
}

function assertIdentifier(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0 || RESERVED_KEYS.has(value)) {
    throw new Error(`${label} must be a non-empty, non-reserved string`);
  }
}

function captureOperationContracts(input: unknown, label: string): OwnDataRecord<OpContractAny> {
  const operations = captureOwnDataRecord<OpContractAny>(input, label);
  if (operations.length === 0) throw new Error(`${label} must not be empty`);
  const ids = new Set<string>();
  for (const { key, value } of operations) {
    if (RESERVED_KEYS.has(key)) throw new Error(`${label} key "${key}" is reserved`);
    assertCanonicalOpContract(value);
    if (ids.has(value.id)) throw new Error(`duplicate operation id "${value.id}" in ${label}`);
    ids.add(value.id);
  }
  return operations;
}

/** Defines one non-empty semantic subdomain from canonical operation contracts. */
export function defineDomainSubdomain<const Id extends string, const Ops extends StepOpsDecl>(
  def: Readonly<{ id: Id; ops: Ops }> & NonEmpty<Ops>
): DomainSubdomainContract<Id, Ops> {
  const definition = captureOwnDataRecord(def, "subdomain definition");
  const id = readCaptured(definition, "id");
  const ops = readCaptured(definition, "ops");
  assertIdentifier(id, "subdomain id");
  const operations = captureOperationContracts(ops, `subdomain "${id}" operations`);
  const contract = Object.freeze({
    kind: "subdomain",
    id,
    ops: materializeOwnDataRecord(operations),
  }) as DomainSubdomainContract<Id, Ops>;
  registerDomainContractAuthority(contract, { kind: "subdomain", id, operations });
  return contract;
}

/**
 * Defines either a temporary flat domain or a non-empty aggregate over direct semantic branches.
 */
export function defineDomain<const Id extends string, const Ops extends StepOpsDecl>(
  def: DomainDefinition<Id, Ops> & NonEmpty<Ops>
): DomainContract<Id, Ops>;
export function defineDomain<
  const Id extends string,
  const Branches extends DomainSubdomainBranches,
>(
  id: Id,
  branches: Branches & BranchesMatchOwnIds<Branches> & NonEmpty<Branches>
): DomainAggregateContract<Id, Branches>;
export function defineDomain(
  idOrDefinition: string | DomainDefinitionAny,
  branches?: DomainSubdomainBranches
): DomainContractAny | DomainAggregateContractAny {
  if (typeof idOrDefinition !== "string") {
    const definition = captureOwnDataRecord(idOrDefinition, "flat domain definition");
    const id = readCaptured(definition, "id");
    const ops = readCaptured(definition, "ops");
    assertIdentifier(id, "flat domain id");
    const operations = captureOperationContracts(ops, `domain "${id}" operations`);
    const contract = Object.freeze({
      kind: "domain",
      id,
      ops: materializeOwnDataRecord(operations),
    }) as DomainContractAny;
    registerDomainContractAuthority(contract, { kind: "flat", id, operations });
    return contract;
  }

  assertIdentifier(idOrDefinition, "domain id");
  const captured = captureOwnDataRecord<object>(branches, `domain "${idOrDefinition}" branches`);
  if (captured.length === 0) {
    throw new Error(`domain "${idOrDefinition}" branches must not be empty`);
  }
  const operationIds = new Set<string>();
  for (const { key, value: branch } of captured) {
    if (RESERVED_KEYS.has(key)) {
      throw new Error(`domain "${idOrDefinition}" branch key "${key}" is reserved`);
    }
    const authority = readDomainContractAuthority(branch);
    if (authority.kind !== "subdomain") {
      throw new Error(`domain "${idOrDefinition}" branch "${key}" must be a subdomain contract`);
    }
    if (authority.id !== key) {
      throw new Error(
        `domain "${idOrDefinition}" branch "${key}" cannot contain subdomain "${authority.id}"`
      );
    }
    for (const { value: operation } of authority.operations) {
      if (operationIds.has(operation.id)) {
        throw new Error(`duplicate operation id "${operation.id}" in domain "${idOrDefinition}"`);
      }
      operationIds.add(operation.id);
    }
  }
  const contract = materializeOwnDataRecord([
    Object.freeze({ key: "kind", value: "domain" as unknown }),
    Object.freeze({ key: "id", value: idOrDefinition as unknown }),
    ...captured,
  ]);
  registerDomainContractAuthority(contract, {
    kind: "aggregate",
    id: idOrDefinition,
    branches: captured,
  });
  return contract as DomainAggregateContractAny;
}
