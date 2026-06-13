import { Command, Flags } from "@oclif/core";
import {
  type Civ7LocalDataInventory,
  type LocalDatabaseEntry,
  type LocalFileEntry,
  inspectCiv7LocalData,
} from "../../../utils/civ7LocalData";

export default class GameLocalDataInspect extends Command {
  static id = "game local-data inspect";
  static summary = "Inspect local Civ7 disk evidence";
  static description =
    "Inventories local Civ7 SQLite, save, and log files for read-only enrichment and forensic use. This does not replace live direct-control reads.";

  static examples = [
    "<%= config.bin %> game local-data inspect --json",
    "<%= config.bin %> game local-data inspect --no-table-counts",
    '<%= config.bin %> game local-data inspect --app-support-dir "/path/to/Civilization VII"',
  ];

  static flags = {
    "app-support-dir": Flags.string({
      description: "Civilization VII application-support directory to inspect",
    }),
    "table-counts": Flags.boolean({
      description: "Run read-only sqlite3 table-count probes for discovered databases",
      default: true,
      allowNo: true,
    }),
    "max-saves": Flags.integer({
      description: "Maximum save files to include",
      default: 20,
    }),
    "max-logs": Flags.integer({
      description: "Maximum log files to include",
      default: 20,
    }),
    json: Flags.boolean({
      description: "Emit machine-readable JSON",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GameLocalDataInspect);
    const inventory = inspectCiv7LocalData({
      appSupportDir: flags["app-support-dir"],
      includeTableCounts: flags["table-counts"],
      maxSaves: flags["max-saves"],
      maxLogs: flags["max-logs"],
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, inventory }));
      return;
    }

    logInventory(this.log.bind(this), inventory);
  }
}

function logInventory(log: (message: string) => void, inventory: Civ7LocalDataInventory): void {
  log(`Civ7 local data: ${inventory.appSupportDir} (${inventory.exists ? "found" : "missing"})`);
  log(`Authority: ${inventory.authority.localData}`);
  log(`Warning: ${inventory.authority.warning}`);

  if (!inventory.exists) return;

  log("");
  log(`Databases (${inventory.databases.length})`);
  for (const database of inventory.databases) log(`- ${formatDatabase(database)}`);

  log("");
  log(`Saves (${inventory.saves.length})`);
  for (const save of inventory.saves) log(`- ${formatFile(save)}`);

  log("");
  log(`Logs (${inventory.logs.length})`);
  for (const item of inventory.logs) log(`- ${formatFile(item)}`);
}

function formatDatabase(database: LocalDatabaseEntry): string {
  const tableCount =
    database.tableCount !== undefined
      ? `; ${database.tableCount} tables`
      : database.tableCountError
        ? `; table count unavailable: ${database.tableCountError}`
        : "";
  return `${database.relativePath} (${formatBytes(database.sizeBytes)}; mtime ${database.mtime}${tableCount})`;
}

function formatFile(file: LocalFileEntry): string {
  return `${file.relativePath} (${formatBytes(file.sizeBytes)}; mtime ${file.mtime})`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}
