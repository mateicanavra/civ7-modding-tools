import type { OpContractAny } from "../operation/contract.js";
import type { OwnDataRecord } from "../snapshot/own-data.js";

type OperationContracts = OwnDataRecord<OpContractAny>;

/** Private provenance retained for each admitted flat, branched, or aggregate domain contract. */
export type DomainContractAuthority =
  | Readonly<{ kind: "flat" | "subdomain"; id: string; operations: OperationContracts }>
  | Readonly<{ kind: "aggregate"; id: string; branches: OwnDataRecord<object> }>;

const domainContractAuthority = new WeakMap<object, DomainContractAuthority>();

/** @internal Registers the private authority retained by one pure domain contract. */
export function registerDomainContractAuthority(
  contract: object,
  authority: DomainContractAuthority
): void {
  domainContractAuthority.set(contract, authority);
}

/** @internal Refuses structural domain-contract lookalikes and returns their factory authority. */
export function readDomainContractAuthority(contract: unknown): DomainContractAuthority {
  const authority =
    contract !== null && typeof contract === "object"
      ? domainContractAuthority.get(contract)
      : undefined;
  if (!authority) throw new Error("domain contract must be created by defineDomain");
  return authority;
}
