import { mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateSample(sample, expectedTokens, label) {
  if (!isRecord(sample) || Object.keys(sample).length === 0) {
    return [`${label} must be a nonempty token sample`];
  }

  return expectedTokens.flatMap((token) => {
    const value = sample[token];
    return typeof value === "string" && value.trim().length > 0
      ? []
      : [`${label} is missing a nonempty ${token} sample`];
  });
}

async function collectRenderRootProblems(page, selector) {
  const root = page.locator(selector);
  const count = await root.count();
  if (count === 0) return ["is absent"];
  if (count !== 1) return [`matched ${count} elements instead of one root`];

  const [childElementCount, visible, box] = await Promise.all([
    root.evaluate((element) => element.childElementCount),
    root.isVisible(),
    root.boundingBox(),
  ]);
  const problems = [];
  if (childElementCount === 0) problems.push("is empty");
  if (!visible) problems.push("is hidden");
  if (!box || box.width <= 0 || box.height <= 0) {
    problems.push("has zero rendered geometry");
  }
  return problems;
}

export async function collectStorybookObservation(page, { expectedStoryId, expectedTokens }) {
  const observation = await page.evaluate(
    ({ storyId, tokens }) => {
      const preview = window.__STORYBOOK_PREVIEW__;
      const selectedStoryId = preview?.selectionStore?.selection?.storyId ?? null;
      const render = preview?.storyRenders?.find(({ id }) => id === storyId);
      const rendered =
        new URLSearchParams(window.location.search).get("id") === storyId &&
        selectedStoryId === storyId &&
        render?.phase === "finished" &&
        document.body.classList.contains("sb-show-main") &&
        !document.body.classList.contains("sb-show-errordisplay");
      const styles = window.getComputedStyle(document.documentElement);

      return {
        storyMarker: rendered ? storyId : null,
        sbClass: document.documentElement.className,
        tokens: Object.fromEntries(
          tokens.map((token) => [token, styles.getPropertyValue(token).trim()])
        ),
      };
    },
    { storyId: expectedStoryId, tokens: expectedTokens }
  );

  const rootProblems = await collectRenderRootProblems(page, "#storybook-root");
  if (observation.storyMarker !== expectedStoryId) {
    throw new Error(
      `Storybook story "${expectedStoryId}" did not render successfully: ` +
        "the requested runtime selection did not complete"
    );
  }
  if (rootProblems.length > 0) {
    throw new Error(
      `Storybook story "${expectedStoryId}" did not render successfully: ` +
        `render root "#storybook-root" ${rootProblems.join(" and ")}`
    );
  }
  return observation;
}

export async function collectDesignSyncObservation(page, { expectedExport, expectedTokens }) {
  const observation = await page.evaluate(
    ({ exportName, tokens }) => {
      const availableExports = Array.isArray(window.__dsCells) ? window.__dsCells : [];
      const selectedExport = availableExports.find((candidate) => candidate === exportName);
      // The generated preview creates #r0 only in its `?story=` single-export
      // branch. Pair that observable root with the request and emitted export
      // list so a default-card render or a missing-export warning cannot pass.
      const requestedExport = new URLSearchParams(window.location.search).get("story");
      const rendered = requestedExport === exportName && selectedExport === exportName;
      const styles = window.getComputedStyle(document.documentElement);

      return {
        exportMarker: rendered ? selectedExport : null,
        availableExports,
        tokens: Object.fromEntries(
          tokens.map((token) => [token, styles.getPropertyValue(token).trim()])
        ),
      };
    },
    { exportName: expectedExport, tokens: expectedTokens }
  );

  const rootProblems = await collectRenderRootProblems(page, "#r0");
  if (observation.exportMarker !== expectedExport) {
    const available = observation.availableExports.join(", ") || "none";
    throw new Error(
      `design-sync export "${expectedExport}" did not render successfully: ` +
        `the requested runtime selection did not complete (available: ${available})`
    );
  }
  if (rootProblems.length > 0) {
    throw new Error(
      `design-sync export "${expectedExport}" did not render successfully: ` +
        `render root "#r0" ${rootProblems.join(" and ")}`
    );
  }
  return observation;
}

export function evaluateLightCanary(
  result,
  { expectedPicks, expectedTokens, normalize = (value) => value, collectionFailures = [] }
) {
  const failures = [...collectionFailures];
  if (!isRecord(result)) {
    failures.push("result must be an object");
  }
  if (!Array.isArray(expectedPicks) || expectedPicks.length === 0) {
    failures.push("expectedPicks must be a nonempty array");
  } else {
    for (const pick of expectedPicks) {
      if (
        !isRecord(pick) ||
        typeof pick.name !== "string" ||
        typeof pick.storyId !== "string" ||
        typeof pick.exportName !== "string"
      ) {
        failures.push("each expected pick must name its Storybook story and design-sync export");
      }
    }
  }
  if (!Array.isArray(expectedTokens) || expectedTokens.length === 0) {
    failures.push("expectedTokens must be a nonempty array");
  }
  if (failures.length > 0) {
    return { result, failures, aggregateDrift: [] };
  }

  for (const { name, storyId, exportName } of expectedPicks) {
    const value = result[name];
    if (!isRecord(value)) {
      failures.push(`${name} is missing or malformed`);
      continue;
    }

    if (value.storyMarker !== storyId) {
      failures.push(`${name} is missing successful Storybook story marker "${storyId}"`);
    }
    if (value.exportMarker !== exportName) {
      failures.push(`${name} is missing successful design-sync export marker "${exportName}"`);
    }

    const storybookClasses =
      typeof value.sbClass === "string" ? value.sbClass.split(/\s+/).filter(Boolean) : [];
    if (!storybookClasses.includes("light") || storybookClasses.includes("dark")) {
      failures.push(
        `${name} Storybook class mismatch: expected forced light, got "${value.sbClass}"`
      );
    }
    failures.push(...validateSample(value.sbTokens, expectedTokens, `${name} Storybook`));
    failures.push(...validateSample(value.dsTokens, expectedTokens, `${name} design-sync`));
  }

  // Never compare partial or malformed observations: equal missing values are
  // not evidence of zero drift.
  if (failures.length > 0) {
    return { result, failures, aggregateDrift: [] };
  }

  const evaluatedResult = {};
  const aggregateDrift = [];
  for (const { name } of expectedPicks) {
    const value = result[name];
    const drift = expectedTokens.filter(
      (token) => normalize(value.sbTokens[token]) !== normalize(value.dsTokens[token])
    );
    aggregateDrift.push(...drift.map((token) => `${name}:${token}`));
    evaluatedResult[name] = { ...value, drift };
  }

  return { result: evaluatedResult, failures, aggregateDrift };
}

export async function finalizeLightCanary(
  outcome,
  cleanup,
  { stderr = console.error, runtime = process, persist = async () => {} } = {}
) {
  let cleanupFailure;
  try {
    await cleanup();
  } catch (error) {
    cleanupFailure = error;
  }

  if (outcome.failures.length > 0) {
    stderr(`light-canary: invalid observation: ${outcome.failures.join("; ")}`);
  } else if (outcome.aggregateDrift.length > 0) {
    stderr(`light-canary: aggregate token drift: ${outcome.aggregateDrift.join(", ")}`);
  }

  if (cleanupFailure) {
    const detail =
      cleanupFailure instanceof AggregateError
        ? cleanupFailure.errors
            .map((error) => (error instanceof Error ? error.message : String(error)))
            .join("; ")
        : cleanupFailure instanceof Error
          ? cleanupFailure.message
          : String(cleanupFailure);
    stderr(`light-canary: cleanup failed: ${detail}`);
  }

  if (outcome.failures.length > 0 || outcome.aggregateDrift.length > 0 || cleanupFailure) {
    runtime.exitCode = 1;
  }
  if (cleanupFailure) throw cleanupFailure;
  if (outcome.failures.length > 0 || outcome.aggregateDrift.length > 0) return;

  try {
    await persist();
  } catch (error) {
    runtime.exitCode = 1;
    throw error;
  }
}

export function writeLightCanaryResultAtomically(
  path,
  result,
  {
    makeTemporaryDirectory = mkdtempSync,
    write = writeFileSync,
    rename = renameSync,
    remove = rmSync,
  } = {}
) {
  const temporaryDirectory = makeTemporaryDirectory(join(dirname(path), ".light-canary-result-"));
  const temporaryPath = join(temporaryDirectory, "result.json");
  try {
    write(temporaryPath, `${JSON.stringify(result, null, 2)}\n`, { flag: "wx", mode: 0o600 });
    rename(temporaryPath, path);
  } finally {
    remove(temporaryDirectory, { recursive: true, force: true });
  }
}
