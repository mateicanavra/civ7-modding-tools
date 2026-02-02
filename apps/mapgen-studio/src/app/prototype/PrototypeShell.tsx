import type { ReactNode } from "react";

export type PrototypeShellProps = {
  isNarrow: boolean;
  header?: ReactNode;
  leftPanel?: ReactNode;
  rightPanel?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function PrototypeShell(props: PrototypeShellProps) {
  const { isNarrow, header, leftPanel, rightPanel, footer, children } = props;

  const panelBase: React.CSSProperties = {
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    background: "rgba(10, 18, 36, 0.92)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
    backdropFilter: "blur(6px)",
    overflow: "hidden",
  };

  const panelTitle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#cbd5f5",
  };

  const panelHeader: React.CSSProperties = {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const panelBody: React.CSSProperties = {
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minHeight: 0,
    overflow: "auto",
  };

  const panelTop = 12;
  const panelBottom = footer ? 64 : 12;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {children}

      {header ? (
        <div style={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 12 }}>{header}</div>
      ) : null}

      {leftPanel ? (
        <div
          style={{
            position: "absolute",
            top: panelTop,
            left: 12,
            bottom: panelBottom,
            width: isNarrow ? "calc(100% - 24px)" : 360,
            maxWidth: isNarrow ? "calc(100% - 24px)" : 420,
            zIndex: 11,
            display: "flex",
            flexDirection: "column",
            ...panelBase,
          }}
        >
          <div style={panelHeader}>
            <div style={panelTitle}>Recipe</div>
          </div>
          <div style={panelBody}>{leftPanel}</div>
        </div>
      ) : null}

      {rightPanel && !isNarrow ? (
        <div
          style={{
            position: "absolute",
            top: panelTop,
            right: 12,
            bottom: panelBottom,
            width: 320,
            maxWidth: 360,
            zIndex: 11,
            display: "flex",
            flexDirection: "column",
            ...panelBase,
          }}
        >
          <div style={panelHeader}>
            <div style={panelTitle}>Explore</div>
          </div>
          <div style={panelBody}>{rightPanel}</div>
        </div>
      ) : null}

      {footer ? (
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, zIndex: 12 }}>{footer}</div>
      ) : null}
    </div>
  );
}

