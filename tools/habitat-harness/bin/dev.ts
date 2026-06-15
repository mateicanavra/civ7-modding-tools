#!/usr/bin/env -S bun run

import { execute } from "@oclif/core";

await execute({ development: true, dir: import.meta.url });
