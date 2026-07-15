// Ambient module declarations for the Storybook preview's side-effect CSS
// imports (fonts + the package compile entry). Vite owns these at runtime;
// this file only satisfies `tsc -p tsconfig.tools.json`, which typechecks
// .storybook/ under noUncheckedSideEffectImports. Package `src/` stays free of
// CSS imports by design.
declare module "*.css";
