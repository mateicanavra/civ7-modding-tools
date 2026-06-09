// Shape of the preset-error dialog state. Extracted verbatim from `App.tsx`
// during the app-decomposition slice.
export type PresetErrorState = Readonly<{
  title: string;
  message: string;
  details?: ReadonlyArray<string>;
}>;
