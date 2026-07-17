#!/usr/bin/env bun

import { runStandaloneCheckMain } from "../src/standalone/check/main.js";

runStandaloneCheckMain(process.argv.slice(2));
