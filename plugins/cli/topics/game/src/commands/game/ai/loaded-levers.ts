import { getCiv7GameInfoRows } from "@civ7/direct-control";
import { Command, Flags } from "@oclif/core";

export default class GameAiLoadedLevers extends Command {
  static id = "game ai loaded-levers";
  static summary = "Read loaded Civ7 AI policy levers from runtime GameInfo";
  static description =
    "Samples loaded AI GameInfo rows relevant to RHQ-style static AI/resource comparisons. This is read-only evidence of loaded policy rows, not proof of AI behavior.";

  static examples = [
    "<%= config.bin %> game ai loaded-levers --json",
    "<%= config.bin %> game ai loaded-levers --family operations --limit-per-table 10 --json",
    "<%= config.bin %> game ai loaded-levers --family rhq --include-spotlights",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    family: Flags.string({
      char: "f",
      description: "Lever family to read: all, operations, biases, behavior, strategy, or rhq",
      default: "all",
      options: ["all", "operations", "biases", "behavior", "strategy", "rhq"],
    }),
    "limit-per-table": Flags.integer({
      description: "Maximum rows to read per GameInfo table",
      default: 20,
      min: 1,
      max: 100,
    }),
    "include-spotlights": Flags.boolean({
      description: "Also read RHQ-relevant pseudo-yield bias rows with targeted filters",
      default: true,
      allowNo: true,
    }),
    "timeout-ms": Flags.integer({
      description: "Socket timeout per table read",
      default: 45_000,
    }),
    json: Flags.boolean({
      description: "Emit machine-readable JSON",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GameAiLoadedLevers);
    const family = flags.family as LeverFamily;
    const tables = tablesForFamily(family);
    const reads = [];

    for (const table of tables) {
      reads.push(await readTable(table, flags));
    }

    if (flags["include-spotlights"]) {
      for (const spotlight of SPOTLIGHT_FILTERS) {
        reads.push(await readTable(spotlight, flags));
      }
    }

    const result = {
      schema: "civ7-ai-loaded-levers.v1",
      source: "runtime GameInfo",
      family,
      generatedAt: new Date().toISOString(),
      tables: reads,
      notes: [
        "Read-only evidence: these rows prove what GameInfo exposes in the current runtime, not that native AI has used a row this turn.",
        "Use this before RHQ/static-AI comparisons so autoplay telemetry is tied to the loaded policy substrate.",
        "Do not infer live database mutability from these reads.",
      ],
    };

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    this.log(`AI loaded levers (${family})`);
    this.log("source: runtime GameInfo");
    for (const read of result.tables) {
      this.log(
        `- ${read.label}: GameInfo.${read.table} rows=${read.rowCount}/${formatTotal(read.total)} omitted=${read.omittedUnknown}`
      );
      if (read.filter) this.log(`  filter: ${read.filter.key}=${String(read.filter.equals)}`);
      if (read.rows.length > 0) this.log(`  first: ${JSON.stringify(read.rows[0])}`);
    }
    for (const note of result.notes) this.log(`note: ${note}`);
  }
}

type LeverFamily = "all" | "operations" | "biases" | "behavior" | "strategy" | "rhq";

type TableReadSpec = Readonly<{
  label: string;
  table: string;
  family: Exclude<LeverFamily, "all">;
  why: string;
  filter?: Readonly<{
    key: string;
    equals: string | number | boolean;
  }>;
}>;

type LoadedLeverRead = Readonly<{
  label: string;
  table: string;
  family: TableReadSpec["family"];
  why: string;
  filter: TableReadSpec["filter"] | null;
  rowCount: number;
  total: unknown;
  omittedUnknown: boolean;
  rows: ReadonlyArray<Record<string, unknown>>;
}>;

type LoadedLeverFlags = Readonly<{
  host?: string;
  port?: number;
  family: string;
  "limit-per-table": number;
  "include-spotlights": boolean;
  "timeout-ms": number;
  json: boolean;
}>;

const TABLES: ReadonlyArray<TableReadSpec> = [
  {
    label: "operation definitions",
    table: "AiOperationDefs",
    family: "operations",
    why: "Named AI operations, target constraints, behavior-tree links, priorities, and self-start gates.",
  },
  {
    label: "allowed operations",
    table: "AllowedOperations",
    family: "operations",
    why: "Connects operation lists to operation definitions, which is a core RHQ/naval-operation comparison surface.",
  },
  {
    label: "operation teams",
    table: "AiOperationTeams",
    family: "operations",
    why: "Team sizing, strength advantage, and rally constraints for operation execution.",
  },
  {
    label: "operation team requirements",
    table: "OpTeamRequirements",
    family: "operations",
    why: "Unit/tag requirements for assembling AI operation teams.",
  },
  {
    label: "unit prioritized actions",
    table: "AIUnitPrioritizedActions",
    family: "operations",
    why: "Unit-specific AI command and operation priorities, including air/naval action wiring.",
  },
  {
    label: "AI lists",
    table: "AiLists",
    family: "biases",
    why: "AI systems and list types that own favored-item rows.",
  },
  {
    label: "favored items",
    table: "AiFavoredItems",
    family: "biases",
    why: "Weighted unit, constructible, tag, yield, pseudo-yield, and settlement biases.",
  },
  {
    label: "pseudo-yield defaults",
    table: "PseudoYields",
    family: "biases",
    why: "Base pseudo-yield values such as settlement and repair bonuses.",
  },
  {
    label: "behavior trees",
    table: "BehaviorTrees",
    family: "behavior",
    why: "Named behavior-tree roots referenced by AI operations.",
  },
  {
    label: "behavior tree nodes",
    table: "BehaviorTreeNodes",
    family: "behavior",
    why: "Behavior-tree node order and structure.",
  },
  {
    label: "behavior tree data",
    table: "TreeData",
    family: "behavior",
    why: "Behavior-tree node data such as operation recruitment ranges and time limits.",
  },
  {
    label: "triggered behavior trees",
    table: "TriggeredBehaviorTrees",
    family: "behavior",
    why: "Event-driven behavior-tree hooks.",
  },
  {
    label: "strategy priorities",
    table: "Strategy_Priorities",
    family: "strategy",
    why: "Strategy-to-AI-list priority links.",
  },
  {
    label: "strategy yield priorities",
    table: "Strategy_YieldPriorities",
    family: "strategy",
    why: "Strategy-specific yield priorities and weights.",
  },
  {
    label: "strategy conditions",
    table: "StrategyConditions",
    family: "strategy",
    why: "Activation conditions for age/victory/legacy strategy rows.",
  },
];

const RHQ_TABLES = new Set([
  "AiOperationDefs",
  "AllowedOperations",
  "AIUnitPrioritizedActions",
  "AiFavoredItems",
  "PseudoYields",
  "BehaviorTrees",
  "TreeData",
]);

const SPOTLIGHT_FILTERS: ReadonlyArray<TableReadSpec> = [
  {
    label: "new-city pseudo-yield biases",
    table: "AiFavoredItems",
    family: "rhq",
    why: "Settlement pressure rows that should be inspected before expansion-bias A/B tests.",
    filter: { key: "Item", equals: "PSEUDOYIELD_NEW_CITY" },
  },
  {
    label: "repair pseudo-yield biases",
    table: "AiFavoredItems",
    family: "rhq",
    why: "Repair-bonus rows that should be inspected before repair-behavior A/B tests.",
    filter: { key: "Item", equals: "PSEUDOYIELD_REPAIR_BONUS" },
  },
];

function tablesForFamily(family: LeverFamily): ReadonlyArray<TableReadSpec> {
  if (family === "all") return TABLES;
  if (family === "rhq") return TABLES.filter((table) => RHQ_TABLES.has(table.table));
  return TABLES.filter((table) => table.family === family);
}

async function readTable(spec: TableReadSpec, flags: LoadedLeverFlags): Promise<LoadedLeverRead> {
  const result = await getCiv7GameInfoRows(
    {
      table: spec.table,
      filter: spec.filter,
      limit: flags["limit-per-table"],
      offset: 0,
    },
    {
      host: flags.host,
      port: flags.port,
      timeoutMs: flags["timeout-ms"],
    }
  );

  return {
    label: spec.label,
    table: spec.table,
    family: spec.family,
    why: spec.why,
    filter: spec.filter ?? null,
    rowCount: result.rows.length,
    total: result.total,
    omittedUnknown: result.omittedUnknown,
    rows: result.rows,
  };
}

function formatTotal(total: unknown): string {
  if (total && typeof total === "object" && "ok" in total && "value" in total) {
    const probe = total as { ok: boolean; value?: unknown };
    if (probe.ok) return String(probe.value);
  }
  return "<unknown>";
}
