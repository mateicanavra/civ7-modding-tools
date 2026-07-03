import type { RJSFSchema, WidgetProps } from "@rjsf/utils";
import {
  type BrowserConfigFormContext,
  type ConfigCollapseContext,
  FieldRow,
  Input,
} from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * Shared rjsf mock support for the Stage-1 config-override stories.
 *
 * The widgets + templates accept large `@rjsf/utils` prop types but read only a
 * small subset at render; the design-sync previews exploited that with loose
 * esbuild-only mocks. Co-located stories ARE typechecked, so this module
 * constructs exactly the fields each component reads and casts to the full rjsf
 * type — honest about the mock surface, type-safe at the call site.
 */

export const noop = () => {};

type ConfigWidgetProps = WidgetProps<unknown, RJSFSchema, BrowserConfigFormContext>;

/**
 * A `WidgetProps` for the seven config widgets. Pass `value` plus whichever of
 * `options.{emptyValue,enumOptions}` / `disabled` / `placeholder` the story
 * exercises; the rest defaults to an inert, error-free control.
 */
export function widgetProps(overrides: Partial<ConfigWidgetProps> = {}): ConfigWidgetProps {
  return {
    id: "cfg_field",
    name: "field",
    onChange: noop,
    options: { emptyValue: "" },
    rawErrors: [],
    ...overrides,
  } as ConfigWidgetProps;
}

/**
 * Collapse context reporting every pointer as expanded (`has() => true`) — the
 * form's "all open" state — without enumerating pointer strings. The templates
 * only call `.has()` on the set, so the cast is to exactly what they read.
 */
export const alwaysExpandedCollapse: ConfigCollapseContext = {
  expandedPointers: { has: () => true } as unknown as ReadonlySet<string>,
  toggle: noop,
};

/** Nothing transparent — object sections render their disclosure chrome. */
export const noTransparentPaths: ReadonlySet<string> = new Set<string>();

/**
 * A rendered scalar field row mirroring the real field-template output, used as
 * a template story's pre-rendered `content` / item `children` (the object and
 * array templates receive already-rendered controls, never schema).
 */
export function mockFieldContent(label: string, value: string): ReactNode {
  return (
    <FieldRow>
      <label className="text-data min-w-[96px] text-muted-foreground">
        <span className="font-medium">{label}</span>
      </label>
      <div className="flex-1 min-w-[120px]">
        <Input className="w-28 font-mono" defaultValue={value} aria-label={label} />
      </div>
    </FieldRow>
  );
}

/** A nested object/array child rendered flush as its own group-eyebrow row. */
export function mockSectionContent(title: string): ReactNode {
  return (
    <div className="px-2.5 py-2 text-label font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </div>
  );
}
