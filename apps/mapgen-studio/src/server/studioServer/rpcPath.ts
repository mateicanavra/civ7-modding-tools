export function isStudioServerRpcPath(url: string | undefined): boolean {
  const pathname = new URL(url ?? "/", "http://localhost").pathname;
  return pathname === "/rpc" || pathname.startsWith("/rpc/");
}
