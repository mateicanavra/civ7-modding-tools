import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import {
  collectOperations,
  createDomain,
  createDomainRouter,
  createDomainSubdomainRouter,
  createOp,
  createRecipe,
  createStage,
  createStep,
  createStrategy,
  defineDomain,
  defineDomainSubdomain,
  defineOp,
  defineStep,
  defineStrategy,
  Type,
} from "@mapgen/authoring/index.js";
import { createMapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";

function operation(id: string, value: string) {
  const contract = defineOp({
    kind: "compute",
    id,
    input: Type.Object({}, { additionalProperties: false }),
    output: Type.String(),
    strategies: [
      defineStrategy({ id: "measured", config: Type.Object({}, { additionalProperties: false }) }),
    ],
  });
  const implementation = createOp(contract, {
    strategies: [createStrategy(contract, contract.strategies.measured, { run: () => value })],
  });
  return { contract, implementation } as const;
}

describe("domain composition", () => {
  it("composes direct semantic branches behind one root binding surface", () => {
    const oceanMeasurement = operation("hydrology/ocean/measure", "ocean");
    const climateMeasurement = operation("hydrology/climate/measure", "climate");
    const ocean = defineDomainSubdomain({
      id: "ocean",
      ops: { measure: oceanMeasurement.contract },
    });
    const climate = defineDomainSubdomain({
      id: "climate",
      ops: { measure: climateMeasurement.contract },
    });
    const contract = defineDomain("hydrology", { ocean, climate });
    const router = createDomainRouter(contract, {
      ocean: createDomainSubdomainRouter(ocean, {
        measure: oceanMeasurement.implementation,
      }),
      climate: createDomainSubdomainRouter(climate, {
        measure: climateMeasurement.implementation,
      }),
    });

    expect(contract.ocean).toBe(ocean);
    expect(contract.climate).toBe(climate);
    expect(router.ocean.ops.measure).toBe(oceanMeasurement.implementation);
    expect(router.climate.ops.measure).toBe(climateMeasurement.implementation);
    expect("contract" in router).toBe(false);

    const bound = router.bind({
      ocean: contract.ocean.ops.measure,
      climate: contract.climate.ops.measure,
    });
    expect(bound.ocean).toBe(oceanMeasurement.implementation.run);
    expect(bound.climate).toBe(climateMeasurement.implementation.run);
    expect(bound.ocean({}, oceanMeasurement.implementation.defaultConfig)).toBe("ocean");
    expect(bound.climate({}, climateMeasurement.implementation.defaultConfig)).toBe("climate");
    expect(Object.isFrozen(bound)).toBe(true);

    const operations = collectOperations(router);
    expect(operations[oceanMeasurement.contract.id]).toBe(oceanMeasurement.implementation);
    expect(operations[climateMeasurement.contract.id]).toBe(climateMeasurement.implementation);
    expect(Object.isFrozen(operations)).toBe(true);
    expect(() => collectOperations(router.ocean as never)).toThrow(
      "collectOperations requires a root"
    );
    expect(() => collectOperations(router.ocean.ops as never)).toThrow(
      "collectOperations requires a root"
    );
    expect(() => collectOperations({ ...router } as never)).toThrow(
      "collectOperations requires a root"
    );
  });

  it("refuses duplicate operation ids within and across subdomains", () => {
    const first = operation("test/duplicate", "first");
    const second = operation("test/duplicate", "second");

    expect(() =>
      defineDomainSubdomain({
        id: "ocean",
        ops: { first: first.contract, second: second.contract },
      })
    ).toThrow('duplicate operation id "test/duplicate"');

    const ocean = defineDomainSubdomain({
      id: "ocean",
      ops: { first: first.contract },
    });
    const climate = defineDomainSubdomain({
      id: "climate",
      ops: { second: second.contract },
    });
    expect(() => defineDomain("hydrology", { ocean, climate })).toThrow(
      'duplicate operation id "test/duplicate"'
    );
  });

  it("refuses branch identity mismatches", () => {
    const measured = operation("hydrology/ocean/measure", "ocean");
    const ocean = defineDomainSubdomain({
      id: "ocean",
      ops: { measure: measured.contract },
    });

    expect(() => defineDomain("hydrology", { climate: ocean } as never)).toThrow(
      'branch "climate" cannot contain subdomain "ocean"'
    );
    expect(() => defineDomain("hydrology", { bind: ocean } as never)).toThrow(
      'branch key "bind" is reserved'
    );
  });

  it("refuses missing, extra, and id-mismatched subdomain implementations", () => {
    const measured = operation("hydrology/ocean/measure", "ocean");
    const sampled = operation("hydrology/ocean/sample", "sample");
    const wrong = operation("hydrology/ocean/wrong", "wrong");
    const ocean = defineDomainSubdomain({
      id: "ocean",
      ops: { measure: measured.contract, sample: sampled.contract },
    });

    expect(() =>
      createDomainSubdomainRouter(ocean, {
        measure: measured.implementation,
      } as never)
    ).toThrow('is missing "sample"');
    expect(() =>
      createDomainSubdomainRouter(ocean, {
        measure: measured.implementation,
        sample: sampled.implementation,
        extra: wrong.implementation,
      } as never)
    ).toThrow('has unknown "extra"');
    expect(() =>
      createDomainSubdomainRouter(ocean, {
        measure: wrong.implementation,
        sample: sampled.implementation,
      } as never)
    ).toThrow('implementations "measure" must implement its exact operation contract');
  });

  it("refuses missing, extra, and contract-mismatched root routers", () => {
    const measured = operation("hydrology/ocean/measure", "ocean");
    const sampled = operation("hydrology/climate/sample", "climate");
    const ocean = defineDomainSubdomain({
      id: "ocean",
      ops: { measure: measured.contract },
    });
    const climate = defineDomainSubdomain({
      id: "climate",
      ops: { sample: sampled.contract },
    });
    const contract = defineDomain("hydrology", { ocean, climate });
    const oceanRouter = createDomainSubdomainRouter(ocean, {
      measure: measured.implementation,
    });
    const climateRouter = createDomainSubdomainRouter(climate, {
      sample: sampled.implementation,
    });

    expect(() => createDomainRouter(contract, { ocean: oceanRouter } as never)).toThrow(
      'is missing "climate"'
    );
    expect(() =>
      createDomainRouter(contract, {
        ocean: oceanRouter,
        climate: climateRouter,
        weather: climateRouter,
      } as never)
    ).toThrow('has unknown "weather"');

    const alternateOcean = defineDomainSubdomain({
      id: "ocean",
      ops: { measure: measured.contract },
    });
    const alternateRouter = createDomainSubdomainRouter(alternateOcean, {
      measure: measured.implementation,
    });
    expect(() =>
      createDomainRouter(contract, {
        ocean: alternateRouter,
        climate: climateRouter,
      } as never)
    ).toThrow('router "ocean" must implement its exact branch');
  });

  it("refuses duplicate operation ids across root domain routers", () => {
    const first = operation("shared/measure", "first");
    const second = operation("shared/measure", "second");
    const firstBranch = defineDomainSubdomain({
      id: "first",
      ops: { measure: first.contract },
    });
    const secondBranch = defineDomainSubdomain({
      id: "second",
      ops: { measure: second.contract },
    });
    const firstRouter = createDomainRouter(defineDomain("alpha", { first: firstBranch }), {
      first: createDomainSubdomainRouter(firstBranch, { measure: first.implementation }),
    });
    const secondRouter = createDomainRouter(defineDomain("beta", { second: secondBranch }), {
      second: createDomainSubdomainRouter(secondBranch, { measure: second.implementation }),
    });

    expect(() => collectOperations(firstRouter, secondRouter)).toThrow(
      'duplicate operation id "shared/measure" across domains'
    );
  });

  it("refuses distinct root authorities that claim the same domain id", () => {
    const first = operation("alpha/measure", "first");
    const second = operation("alpha/sample", "second");
    const firstBranch = defineDomainSubdomain({
      id: "measurement",
      ops: { measure: first.contract },
    });
    const secondBranch = defineDomainSubdomain({
      id: "sampling",
      ops: { sample: second.contract },
    });
    const firstAggregate = createDomainRouter(defineDomain("alpha", { measurement: firstBranch }), {
      measurement: createDomainSubdomainRouter(firstBranch, {
        measure: first.implementation,
      }),
    });
    const secondAggregate = createDomainRouter(defineDomain("alpha", { sampling: secondBranch }), {
      sampling: createDomainSubdomainRouter(secondBranch, {
        sample: second.implementation,
      }),
    });
    expect(() => collectOperations(firstAggregate, secondAggregate)).toThrow(
      'duplicate domain id "alpha" across domain roots'
    );

    const flatContract = defineDomain({
      id: "alpha",
      ops: { sample: second.contract },
    });
    const flat = createDomain(flatContract, { sample: second.implementation });
    expect(() => collectOperations(firstAggregate, flat)).toThrow(
      'duplicate domain id "alpha" across domain roots'
    );
  });

  it("retains aggregate operation authority through recipe compilation and execution", () => {
    const contract = defineOp({
      kind: "compute",
      id: "hydrology/ocean/scale",
      input: Type.Object({ value: Type.Integer() }, { additionalProperties: false }),
      output: Type.Integer(),
      defaultStrategy: "measured",
      strategies: [
        defineStrategy({
          id: "measured",
          config: Type.Object(
            { factor: Type.Integer({ default: 2 }) },
            { additionalProperties: false }
          ),
        }),
        defineStrategy({
          id: "accelerated",
          config: Type.Object(
            { factor: Type.Integer({ default: 3 }) },
            { additionalProperties: false }
          ),
        }),
      ],
    });
    const implementation = createOp(contract, {
      strategies: [
        createStrategy(contract, contract.strategies.measured, {
          run: (input, config) => input.value * config.factor,
        }),
        createStrategy(contract, contract.strategies.accelerated, {
          run: (input, config) => input.value * config.factor,
        }),
      ],
    });
    const ocean = defineDomainSubdomain({ id: "ocean", ops: { scale: contract } });
    const hydrology = defineDomain("hydrology", { ocean });
    const router = createDomainRouter(hydrology, {
      ocean: createDomainSubdomainRouter(ocean, { scale: implementation }),
    });
    const observed: number[] = [];
    const stepContract = defineStep({
      id: "scale-ocean",
      requires: [],
      provides: [],
      ops: {
        scale: hydrology.ocean.ops.scale,
      },
    });
    const step = createStep(stepContract, {
      run: (_context, config, ops) => {
        observed.push(ops.scale({ value: 4 }, config.scale));
      },
    });
    const stage = createStage({ id: "hydrology", steps: [step] });
    const recipe = createRecipe({
      id: "aggregate-authority",
      namespace: "test",
      stages: [stage],
      operations: collectOperations(router),
    });
    const setup = admitMapSetup({
      mapSeed: 1,
      dimensions: { width: 8, height: 6 },
      latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
    });
    const config = {
      hydrology: {
        "scale-ocean": {
          scale: { strategy: "accelerated" as const, config: { factor: 3 } },
        },
      },
    };
    recipe.run(
      createMapContext({
        setup,
        adapter: createMockAdapter({ width: 8, height: 6, mapSizeId: 1 }),
      }),
      config
    );

    expect(contract.defaultStrategy).toBe("measured");
    expect(stepContract.ops?.scale).toBe(contract);
    expect(observed).toEqual([12]);
  });

  it("retains the temporary flat domain API without exposing registries", () => {
    const measured = operation("legacy/measure", "legacy");
    const contract = defineDomain({
      id: "legacy",
      ops: { measure: measured.contract },
    });
    const domain = createDomain(contract, { measure: measured.implementation });

    expect(domain.contract).toBe(contract);
    expect(domain.ops.measure).toBe(measured.implementation);
    expect(collectOperations(domain)[measured.contract.id]).toBe(measured.implementation);
  });

  it("refuses forged and same-id implementations from a different operation contract", () => {
    const admitted = operation("hydrology/ocean/measure", "admitted");
    const alternate = operation("hydrology/ocean/measure", "alternate");
    const ocean = defineDomainSubdomain({
      id: "ocean",
      ops: { measure: admitted.contract },
    });

    expect(() =>
      createDomainSubdomainRouter(ocean, {
        measure: alternate.implementation,
      })
    ).toThrow("must implement its exact operation contract");
    expect(() =>
      createDomainSubdomainRouter(ocean, {
        measure: { ...admitted.implementation },
      } as never)
    ).toThrow("must be created by createOp");
  });

  it("refuses empty operation and branch containers", () => {
    expect(() => defineDomainSubdomain({ id: "ocean", ops: {} } as never)).toThrow(
      "must not be empty"
    );
    expect(() => defineDomain("hydrology", {} as never)).toThrow("must not be empty");
  });

  it("retains canonical operation identities after domain admission", () => {
    const measured = operation("hydrology/ocean/measure", "ocean");
    const ocean = defineDomainSubdomain({
      id: "ocean",
      ops: { measure: measured.contract },
    });
    const router = createDomainSubdomainRouter(ocean, {
      measure: measured.implementation,
    });

    expect(Object.isFrozen(measured.contract)).toBe(true);
    expect(Object.isFrozen(measured.contract.strategies)).toBe(true);
    expect(Object.isFrozen(measured.implementation)).toBe(true);
    expect(Object.isFrozen(measured.implementation.strategies)).toBe(true);
    expect(() =>
      Object.defineProperty(measured.contract, "id", { value: "hydrology/ocean/drifted" })
    ).toThrow();
    expect(() =>
      Object.defineProperty(measured.implementation, "id", {
        value: "hydrology/ocean/drifted",
      })
    ).toThrow();
    expect(router.ops.measure.id).toBe("hydrology/ocean/measure");
  });
});
