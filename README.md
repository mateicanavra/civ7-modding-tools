# Civ7 Modding Tools and Resources

A comprehensive monorepo workspace for Civilization VII modding, providing tools, documentation, and an SDK for creating mods programmatically.

This repository began from [izica/civ7-modding-tools](https://github.com/izica/civ7-modding-tools) and has since diverged; it is maintained independently and extended with:
- 📦 **[@civ7/sdk](packages/sdk)** - TypeScript SDK for programmatic mod generation
- 🛠️ **[@civ7/cli](packages/cli)** - Command-line tools for managing game resources
- 📚 **[Documentation](apps/docs)** - Comprehensive modding guides and references
- 🎮 **[Playground](apps/playground)** - Examples and experimentation space
- 🔌 **[Plugin libraries](packages/plugins)** - Reusable file and graph logic consumed by the CLI

## Quick Links

**Documentation:**
- [Product Overview](docs/PRODUCT.md) — What this is and why
- [System Architecture](docs/SYSTEM.md) — Technical overview
- [How We Work](docs/PROCESS.md) — Contributing and workflows
- [Roadmap](docs/ROADMAP.md) — Direction and milestones

**Getting Started:**
- [Installation](#installation-and-setup)
- [Using the CLI](#using-the-cli)
- [SDK Documentation](packages/sdk/README.md)
- [Configuration Utilities](packages/config/README.md)

**External Resources:**
- [Community Guides](apps/docs/site/community/)
- [Official Modding Docs](apps/docs/site/civ7-official/modding/)

## Workspace Structure

```
civ7-modding-tools/
├── docs/                 # Project documentation (see docs/DOCS.md for architecture)
├── packages/
│   ├── sdk/              # TypeScript SDK for mod generation
│   ├── cli/              # Command-line tools (oclif)
│   ├── config/           # Shared config/path resolution (lib + JSON schema)
│   └── plugins/
│       ├── plugin-files/ # Programmatic zip/unzip library (consumed by CLI/docs)
│       └── plugin-graph/ # Graph crawl/render library (consumed by CLI)
├── apps/
│   ├── docs/             # Documentation site (Mintlify)
│   └── playground/       # Example mods and experiments
├── mods/
│   └── <mod-name>/       # Colocated mod workspaces that consume the SDK
└── civ.config.jsonc      # CLI configuration
```

## Installation and Setup

Setting up this project is a two-step process. First, you install the project dependencies and the CLI. Second, you use the newly installed CLI to pull in the game data.

### Prerequisites
- Node 22.22.0 (see `.nvmrc`)
- Bun (see `.bun-version`)

### Step 1: Install Dependencies and Link the CLI

This command will install all necessary dependencies, build the CLI, and create a global link to the `civ7` executable, making it available everywhere in your terminal.

```bash
bun install --frozen-lockfile
bun run link:cli
```
You only need to run this command once for the initial setup, or whenever you pull changes that affect dependencies or the CLI source code.

**Note:** After running this command, you may need to open a new terminal session or source your shell's profile file (e.g., `source ~/.zshrc`) for the `civ7` command to become available.

### Step 2: Refresh Game Data

After the `civ7` command is available, you can use it to populate the repository with the official game data from your local Civilization VII installation. This script runs `civ7 zip` and then `civ7 unzip`, placing the outputs in the `.civ7/outputs` directory at the project root.

```bash
bun run refresh:data
```

This command only needs to be run once. The `docs` and `playground` apps will automatically sync the resources they need from this central location when you run their `dev` commands. The docs app uses a fast unzip via `@civ7/plugin-files`.

## Using the CLI

Once set up, you can use the `civ7` command directly to manage game resource archives. Its behavior is configured by the `civ.config.jsonc` file located in the project root.

The configuration uses a modular structure:
- **`inputs`**: Defines where to find source files, like the game's installation directory.
- **`outputs`**: Sets the default destination for generated files (zips, extracted resources, graphs). By default, everything is placed in a `.civ7/outputs` directory to keep your project clean.
- **`profiles`**: Contains named groups of settings for specific tasks. A profile can override the default output paths, which is useful for integrating with other tools, like the docs site.

You can customize the default profiles or add your own.

### Unzipping Resources
```
```
