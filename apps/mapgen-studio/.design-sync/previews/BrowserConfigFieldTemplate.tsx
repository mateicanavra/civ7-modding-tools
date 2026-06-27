import { BrowserConfigFieldTemplate, Input } from "mapgen-studio";

// BrowserConfigFieldTemplate is the per-field row of the config form: a humanized
// label (min-w 96) + control split (via FieldRow), with description / live error
// region / help stacked below. RJSF FieldTemplateProps are runtime-only mocks —
// `children` is the already-rendered control. Framed on a `bg-card` panel.
function Demo({ children }) {
  return (
    <div
      className="bg-card border border-border text-foreground"
      style={{ width: 340, padding: 14, borderRadius: 8 }}
    >
      {children}
    </div>
  );
}

export const ScalarField = () => (
  <Demo>
    <BrowserConfigFieldTemplate
      id="cfg_seaLevel"
      label="seaLevel"
      displayLabel
      required={false}
      description="Fraction of the map surface below sea level."
      schema={{ type: "number" }}
      rawErrors={[]}
      classNames=""
      children={<Input className="w-28 font-mono" defaultValue="0.6" aria-label="seaLevel" />}
    />
  </Demo>
);

export const Invalid = () => (
  <Demo>
    <BrowserConfigFieldTemplate
      id="cfg_mountainDensity"
      label="mountainDensity"
      displayLabel
      required
      schema={{ type: "number" }}
      rawErrors={["must be ≤ 1"]}
      errors={<span>must be ≤ 1</span>}
      classNames=""
      children={
        <Input className="w-28 font-mono" defaultValue="1.4" aria-invalid aria-label="mountainDensity" />
      }
    />
  </Demo>
);
