#!/usr/bin/env bun

import { handle, run } from "@oclif/core";

await run(process.argv.slice(2), import.meta.url).catch(handle);
