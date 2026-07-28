#!/usr/bin/env bun

const path = require("path");

require("@oclif/core")
  .execute({ dir: path.join(__dirname, "..") })
  .catch(require("@oclif/core").handle);
