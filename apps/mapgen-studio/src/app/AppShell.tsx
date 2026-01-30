import { forwardRef, type ReactNode } from "react";
import { Layout } from "./Layout";

export type AppMode = "browser" | "dump";

export type AppShellProps = {
  mode: AppMode;
  onModeChange(next: AppMode): void;
  header: ReactNode;
  main: ReactNode;
  overlays: ReactNode[];
  error: string | null;
};

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(props, ref) {
  const { mode, header, main, overlays, error } = props;

  return <Layout mode={mode} header={header} main={main} overlays={overlays} error={error} mainRef={ref} />;
});
