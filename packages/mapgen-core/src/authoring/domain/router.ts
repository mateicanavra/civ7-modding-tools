import type {
  DomainOpAny,
  DomainOperationRoot,
  DomainOpsRouter,
  DomainOpsSurface,
} from "../operation/bindings.js";
import {
  composeDomainOpsRouter,
  createDomainOpsSurfaceFromEntries,
  createFlatDomainRoot,
} from "../operation/bindings.js";
import { readCanonicalDomainOpContract } from "../operation/create.js";
import {
  alignOwnDataRecords,
  captureOwnDataRecord,
  type OwnDataRecord,
} from "../snapshot/own-data.js";
import { readDomainContractAuthority } from "./authority.js";
import type {
  DomainAggregateContractAny,
  DomainContractAny,
  DomainSubdomainContractAny,
} from "./contract.js";

type NoExtraKeys<Expected, Actual> =
  Exclude<keyof Actual, keyof Expected> extends never ? unknown : never;

/** Executable operations required by each key in one pure operation-contract map. */
export type DomainOpImplementationsForContracts<
  TContracts extends Record<string, { id: string; kind: DomainOpAny["kind"] }>,
> = Readonly<{
  [K in keyof TContracts]: DomainOpAny &
    Readonly<{ id: TContracts[K]["id"]; kind: TContracts[K]["kind"] }>;
}>;

/** Temporary flat domain module retained while existing domains adopt semantic branches. */
export type DomainModule<
  C extends DomainContractAny,
  Implementations extends Readonly<Record<string, DomainOpAny>>,
> = Readonly<{
  contract: C;
  ops: DomainOpsSurface<Implementations>;
}> &
  DomainOperationRoot;

/** One implemented semantic subdomain with its operation surface kept under `ops`. */
export type DomainSubdomainRouter<
  Contract extends DomainSubdomainContractAny,
  Implementations extends Readonly<Record<string, DomainOpAny>>,
> = Readonly<{
  id: Contract["id"];
  ops: DomainOpsSurface<Implementations>;
}>;

type DomainSubdomainRouterAny = Readonly<{ id: string; ops: object }>;
type DomainContractBranches<Contract extends DomainAggregateContractAny> = Omit<
  Contract,
  "id" | "kind"
>;
type DomainRoutersForContract<Contract extends DomainAggregateContractAny> = Readonly<{
  [Key in keyof DomainContractBranches<Contract>]: DomainContractBranches<Contract>[Key] extends DomainSubdomainContractAny
    ? DomainSubdomainRouter<
        DomainContractBranches<Contract>[Key],
        DomainOpImplementationsForContracts<DomainContractBranches<Contract>[Key]["ops"]>
      >
    : never;
}>;
type OperationOfRouter<Router> =
  Router extends Readonly<{ ops: DomainOpsRouter<infer Op extends DomainOpAny> }> ? Op : never;

/** A root implementation router with direct subdomain branches and one aggregate bind. */
export type DomainRouter<Routers extends Readonly<Record<string, DomainSubdomainRouterAny>>> =
  Readonly<Routers & DomainOpsRouter<OperationOfRouter<Routers[keyof Routers]>>> &
    DomainOperationRoot;

const contractBySubdomainRouter = new WeakMap<object, DomainSubdomainContractAny>();

function alignImplementations(
  authority: OwnDataRecord,
  implementations: unknown,
  label: string
): OwnDataRecord<DomainOpAny> {
  const aligned = alignOwnDataRecords(
    authority,
    captureOwnDataRecord<DomainOpAny>(implementations, label),
    label
  );
  return Object.freeze(
    aligned.map(({ key, authority: contract, candidate }) => {
      if (readCanonicalDomainOpContract(candidate) !== contract) {
        throw new Error(`${label} "${key}" must implement its exact operation contract`);
      }
      return Object.freeze({ key, value: candidate });
    })
  );
}

/** Creates one temporary flat domain module and registers it as an operation root. */
export function createDomain<
  C extends DomainContractAny,
  const Implementations extends DomainOpImplementationsForContracts<C["ops"]>,
>(
  contract: C,
  implementations: Implementations &
    NoExtraKeys<DomainOpImplementationsForContracts<C["ops"]>, Implementations>
): DomainModule<C, Implementations> {
  const authority = readDomainContractAuthority(contract);
  if (authority.kind !== "flat") throw new Error("createDomain requires a flat domain contract");
  const entries = alignImplementations(
    authority.operations,
    implementations,
    `domain "${authority.id}" implementations`
  );
  const ops = createDomainOpsSurfaceFromEntries<Implementations>(entries);
  return createFlatDomainRoot<C, DomainOpsSurface<Implementations>>(
    authority.id,
    contract,
    ops
  ) as DomainModule<C, Implementations>;
}

/** Binds one subdomain's exact implementation contracts beneath its operation surface. */
export function createDomainSubdomainRouter<
  Contract extends DomainSubdomainContractAny,
  const Implementations extends DomainOpImplementationsForContracts<Contract["ops"]>,
>(
  contract: Contract,
  implementations: Implementations &
    NoExtraKeys<DomainOpImplementationsForContracts<Contract["ops"]>, Implementations>
): DomainSubdomainRouter<Contract, Implementations> {
  const authority = readDomainContractAuthority(contract);
  if (authority.kind !== "subdomain") {
    throw new Error("createDomainSubdomainRouter requires a subdomain contract");
  }
  const entries = alignImplementations(
    authority.operations,
    implementations,
    `subdomain "${authority.id}" implementations`
  );
  const router = Object.freeze({
    id: authority.id,
    ops: createDomainOpsSurfaceFromEntries<Implementations>(entries),
  }) as DomainSubdomainRouter<Contract, Implementations>;
  contractBySubdomainRouter.set(router, contract);
  return router;
}

/** Composes exact subdomain routers beneath their aggregate root contract. */
export function createDomainRouter<
  Contract extends DomainAggregateContractAny,
  const Routers extends DomainRoutersForContract<Contract>,
>(
  contract: Contract,
  routers: Routers & NoExtraKeys<DomainRoutersForContract<Contract>, Routers>
): DomainRouter<Routers> {
  const authority = readDomainContractAuthority(contract);
  if (authority.kind !== "aggregate") {
    throw new Error("createDomainRouter requires an aggregate domain contract");
  }
  const aligned = alignOwnDataRecords(
    authority.branches,
    captureOwnDataRecord<DomainSubdomainRouterAny>(routers, `domain "${authority.id}" routers`),
    `domain "${authority.id}" routers`
  );
  const branches = Object.freeze(
    aligned.map(({ key, authority: branch, candidate }) => {
      if (contractBySubdomainRouter.get(candidate) !== branch) {
        throw new Error(`domain "${authority.id}" router "${key}" must implement its exact branch`);
      }
      return Object.freeze({ key, value: candidate });
    })
  );
  return composeDomainOpsRouter<Routers>(authority.id, branches) as DomainRouter<Routers>;
}
