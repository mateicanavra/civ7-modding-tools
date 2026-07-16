#!/usr/bin/env -S bun run

import { handle, run } from "@oclif/core";

const argv = process.argv.slice(2);

(async () => {
  try {
    // Use this module's URL so oclif can resolve the package root (dev from src)
    await run(argv, import.meta.url);
  } catch (error) {
    if (error instanceof Error) {
      await handle(error);
      return;
    }
    throw error;
  }
})();
