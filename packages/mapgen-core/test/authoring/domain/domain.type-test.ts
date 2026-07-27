import * as MapGenAuthoring from "@mapgen/authoring/index.js";
import {
  collectOperations,
  createDomain,
  createDomainRouter,
  createDomainSubdomainRouter,
  createOp,
  createStrategy,
  defineDomain,
  defineDomainSubdomain,
  defineOp,
  defineStrategy,
  Type,
} from "@mapgen/authoring/index.js";
import type { IsEqual } from "type-fest";

type Expect<T extends true> = T;

const contract = defineOp({
  kind: "compute",
  id: "type-test/domain/measure",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.String(),
  strategies: [
    defineStrategy({ id: "measured", config: Type.Object({}, { additionalProperties: false }) }),
  ],
});
const strategy = createStrategy(contract, contract.strategies.measured, { run: () => "measured" });
const operation = createOp(contract, {
  strategies: [strategy],
});
const subdomain = defineDomainSubdomain({
  id: "measurement",
  ops: { measure: contract },
});
const aggregateContract = defineDomain("sample", { measurement: subdomain });
const subdomainRouter = createDomainSubdomainRouter(subdomain, { measure: operation });
const aggregateRouter = createDomainRouter(aggregateContract, {
  measurement: subdomainRouter,
});
const flatContract = defineDomain({
  id: "legacy",
  ops: { measure: contract },
});
const flatDomain = createDomain(flatContract, { measure: operation });
const unrelatedContract = defineOp({
  kind: "compute",
  id: "type-test/domain/unrelated",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.String(),
  strategies: [
    defineStrategy({ id: "measured", config: Type.Object({}, { additionalProperties: false }) }),
  ],
});

export type DomainRootKindIsCategorical = Expect<
  IsEqual<(typeof aggregateContract)["kind"], "domain">
>;
export type SubdomainKindIsCategorical = Expect<IsEqual<(typeof subdomain)["kind"], "subdomain">>;

// @ts-expect-error A root domain contract cannot be implemented as a subdomain.
createDomainSubdomainRouter(flatContract, { measure: operation });

// @ts-expect-error A subdomain contract cannot be implemented as a flat root domain.
createDomain(subdomain, { measure: operation });

// @ts-expect-error Aggregate branches must be subdomain contracts.
defineDomain("invalid", { legacy: flatContract });

// @ts-expect-error A flat domain contract cannot be composed as an aggregate router.
createDomainRouter(flatContract, { measurement: subdomainRouter });

// @ts-expect-error Structural copies lose root authority and cannot enter recipe compilation.
collectOperations({ ...aggregateRouter });

// @ts-expect-error Structural copies lose root authority and cannot enter recipe compilation.
collectOperations({ ...flatDomain });

// @ts-expect-error Structural copies lose strategy authority and cannot implement an operation.
createOp(contract, { strategies: [{ ...strategy }] });

// @ts-expect-error A subdomain router can bind only contracts implemented by that subdomain.
subdomainRouter.ops.bind({ unrelated: unrelatedContract });

// @ts-expect-error Low-level operation binding is internal to the compiler and domain router.
MapGenAuthoring.bindOperations;
