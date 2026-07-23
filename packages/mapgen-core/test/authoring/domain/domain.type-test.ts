import * as MapGenAuthoring from "@mapgen/authoring/index.js";
import {
  collectCompileOps,
  createDomain,
  createDomainRouter,
  createDomainSubdomainRouter,
  createOp,
  createStrategy,
  defineDomain,
  defineDomainSubdomain,
  defineOp,
  Type,
} from "@mapgen/authoring/index.js";
import type { IsEqual } from "type-fest";

type Expect<T extends true> = T;

const contract = defineOp({
  kind: "compute",
  id: "type-test/domain/measure",
  input: Type.Object({}, { additionalProperties: false }),
  output: Type.String(),
  strategies: {
    measured: Type.Object({}, { additionalProperties: false }),
  },
});
const strategy = createStrategy(contract, "measured", { run: () => "measured" });
const operation = createOp(contract, {
  strategies: { measured: strategy },
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
collectCompileOps({ ...aggregateRouter });

// @ts-expect-error Structural copies lose root authority and cannot enter recipe compilation.
collectCompileOps({ ...flatDomain });

// @ts-expect-error Structural copies lose strategy authority and cannot implement an operation.
createOp(contract, { strategies: { measured: { ...strategy } } });

// @ts-expect-error Low-level compile binding is internal to the compiler and domain router.
MapGenAuthoring.bindCompileOps;

// @ts-expect-error Low-level runtime binding is internal to recipe construction and domain routers.
MapGenAuthoring.bindRuntimeOps;
