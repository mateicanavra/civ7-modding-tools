type ErrorBannerProps = {
  error: string | null;
};

export function ErrorBanner(props: ErrorBannerProps) {
  const { error } = props;
  if (!error) return null;

  return (
    <div style={{ padding: 12, background: "#2a0b0b", borderBottom: "1px solid #7f1d1d", color: "#fecaca" }}>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{error}</pre>
    </div>
  );
}
