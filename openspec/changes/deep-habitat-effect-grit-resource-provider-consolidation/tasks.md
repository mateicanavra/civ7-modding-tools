## Tasks

- [x] Move Grit source from `src/adapters/grit/**` to
      `src/substrate/providers/grit/**`.
- [x] Flatten `provider/**` into the Grit provider root and remove the nested
      provider directory.
- [x] Rewrite runtime, service, and behavior-test imports to the substrate
      provider path.
- [x] Replace the internal Habitat adapter Nx project and `habitat:adapter`
      boundary row with provider topology, and remove the `./adapters/*`
      package export.
- [x] Rename the Habitat GritQL rule from adapter-domain-paths to
      provider-domain-paths and point it at the Grit provider root.
- [x] Remove the provider-local Promise/runtime bridge and keep Grit execution
      as Effect programs provisioned by service/runtime layers.
- [x] Move the provider-domain invariant out of toolkit-local source-check
      scripts and into the Habitat-authored GritQL rule lane.
- [x] Run package build/checks plus Habitat/Nx/GritQL/Biome validation.
