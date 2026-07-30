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

/**
 * Captures the rendered Storybook selection and its resolved design-token values.
 * A successful observation proves the requested story finished rendering into the sole preview root.
 *
 * @param {import("playwright").Page} page Storybook preview page to inspect.
 * @param {{ expectedStoryId: string, expectedTokens: readonly string[] }} expectation Requested story and token names.
 * @returns {Promise<Record<string, unknown>>} Admitted Storybook marker, root class, and token sample.
 */
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

/**
 * Captures one generated design-sync export and its resolved design-token values.
 * The explicit export marker prevents a default-card render from masquerading as the requested cell.
 *
 * @param {import("playwright").Page} page Design-sync preview page to inspect.
 * @param {{ expectedExport: string, expectedTokens: readonly string[] }} expectation Requested export and token names.
 * @returns {Promise<Record<string, unknown>>} Admitted export marker and token sample.
 */
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

/**
 * Compares complete Storybook and design-sync observations for the same selected surfaces.
 * Malformed or partial observations fail before drift comparison so equal missing values cannot pass.
 *
 * @param {unknown} result Collected observations keyed by expected pick name.
 * @param {object} options Expected selections, token names, normalization, and acquisition failures.
 * @returns {{ result: unknown, failures: string[], aggregateDrift: string[] }} Evaluation evidence for finalization.
 */
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

/**
 * Finalizes a light-canary run after closing every acquired runtime resource.
 * Invalid evidence or cleanup failure marks the process unsuccessful; persistence occurs only after both pass.
 *
 * @param {{ failures: string[], aggregateDrift: string[] }} outcome Evaluated canary evidence.
 * @param {() => Promise<void>} cleanup Runtime cleanup transaction.
 * @param {object} services Injectable process, reporting, and persistence services.
 * @returns {Promise<void>} Completion after cleanup and optional persistence.
 */
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

/**
 * Replaces a light-canary result through a private sibling temporary directory.
 * The final rename prevents readers from observing a partially written result.
 *
 * @param {string} path Final result path.
 * @param {unknown} result JSON-serializable canary evidence.
 * @param {object} filesystem Injectable filesystem operations used by focused tests.
 * @returns {void}
 */
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
