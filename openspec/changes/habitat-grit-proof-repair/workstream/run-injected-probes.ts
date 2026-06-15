import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import {
  injectedProbeRoot,
  readGitState,
  runInjectedGritProbe,
} from "../../../../tools/habitat-harness/src/index.ts";

interface ProbeFile {
  path: string;
  body: string;
}

interface ProbeRow {
  ruleId: string;
  patternIdentity: string;
  rulesJsonScope: string;
  sourcePredicate: string;
  match: ProbeFile;
  control: ProbeFile;
}

interface ProbeRowReport {
  ruleId: string;
  patternIdentity: string;
  scanRoot: string;
  probePath: string;
  controlPath: string;
  ok: boolean;
  diagnostics: number;
  cleanupRestoredStatus?: boolean;
  finalStatusClean?: boolean;
  failureTag?: string;
  message?: string;
}

const proofId = "HGPR-INJECTED-GRIT-ROWS-2026-06-15";
const requireCleanStart = process.argv.includes("--require-clean-start");
const repoRoot = process.cwd();
const corpusPath = new URL("./injected-probes.json", import.meta.url);
const corpusText = readFileSync(corpusPath, "utf8");
const corpus = JSON.parse(corpusText) as ProbeRow[];
const runSlug = `${proofId.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${process.pid}`;
const runRoot = `${injectedProbeRoot}/__habitat_${runSlug}`;

const initialGitState = readGitState();
if (requireCleanStart && initialGitState.dirty) {
  console.log(
    JSON.stringify(
      {
        proofId,
        ok: false,
        failure: "dirty-start",
        initialGitState,
      },
      null,
      2
    )
  );
  process.exit(1);
}

const rows: ProbeRowReport[] = [];
try {
  for (const row of corpus) {
    const scanRoot = `${runRoot}/${row.ruleId}`;
    const absoluteScanRoot = path.join(repoRoot, scanRoot);
    rmSync(absoluteScanRoot, { recursive: true, force: true });
    mkdirSync(absoluteScanRoot, { recursive: true });

    const probePath = `${scanRoot}/${row.match.path}`;
    const controlPath = `${scanRoot}/${row.control.path}`;
    const result = await runInjectedGritProbe({
      ruleId: row.ruleId,
      patternIdentity: row.patternIdentity,
      probePath,
      probeBody: row.match.body,
      controlPath,
      controlBody: row.control.body,
      scope: {
        adapterRoot: scanRoot,
        rulesJsonScope: row.rulesJsonScope,
        sourcePredicate: row.sourcePredicate,
        scanRoots: [scanRoot],
        exclusions: [],
        matchingProbePath: probePath,
        outsideScopeControlPath: controlPath,
      },
      requireCleanFinalStatus: requireCleanStart,
    });

    rows.push(
      result.ok
        ? {
            ruleId: row.ruleId,
            patternIdentity: row.patternIdentity,
            scanRoot,
            probePath: result.probePath,
            controlPath: result.controlPath,
            ok: true,
            diagnostics: result.diagnostics.length,
            cleanupRestoredStatus: result.cleanupRestoredStatus,
            finalStatusClean: result.finalStatusClean,
          }
        : {
            ruleId: row.ruleId,
            patternIdentity: row.patternIdentity,
            scanRoot,
            probePath: result.probePath,
            controlPath: result.controlPath,
            ok: false,
            diagnostics: 0,
            failureTag: result.failureTag,
            message: result.message,
          }
    );

    rmSync(absoluteScanRoot, { recursive: true, force: true });
  }
} finally {
  rmSync(path.join(repoRoot, runRoot), { recursive: true, force: true });
}

const finalGitState = readGitState();
const failedRows = rows.filter((row) => !row.ok);
const report = {
  proofId,
  schemaVersion: 1,
  ok: failedRows.length === 0 && (!requireCleanStart || !finalGitState.dirty),
  corpusSha256: createHash("sha256").update(corpusText).digest("hex"),
  rowCount: rows.length,
  passCount: rows.length - failedRows.length,
  failureCount: failedRows.length,
  requireCleanStart,
  initialGitState,
  finalGitState,
  rows,
  nonClaims: [
    "does-not-prove-raw-direct-grit-acquisition",
    "does-not-prove-baseline-shrink-or-write",
    "does-not-prove-apply-safety",
    "does-not-prove-old-mechanism-parity",
    "does-not-prove-product-runtime",
  ],
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
