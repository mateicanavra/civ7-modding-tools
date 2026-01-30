import { Fragment, type ReactNode } from "react";
import { ErrorBanner } from "./ErrorBanner";
import type { AppMode } from "./AppShell";

export type LayoutProps = {
  header: ReactNode;
  main: ReactNode;
  overlays: ReactNode[];
  error: string | null;
  mode: AppMode;
  mainRef?: React.Ref<HTMLDivElement>;
};

export function Layout(props: LayoutProps) {
  const { header, main, overlays, error, mode, mainRef } = props;

  return (
    <div
      data-mode={mode}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0b1020",
        color: "#e5e7eb",
      }}
    >
      {header}
      <ErrorBanner error={error} />
      <div ref={mainRef} style={{ flex: 1, position: "relative" }}>
        {main}
        {overlays.map((overlay, index) => (
          <Fragment key={index}>{overlay}</Fragment>
        ))}
      </div>
    </div>
  );
}
