// Browser shim for Node's `child_process`.
//
// deck.gl pulls in loaders.gl, which includes a Node-only "child process proxy".
// That codepath should never execute in the browser, but some bundlers warn when
// `child_process` is externalized with no named exports.

export type SpawnOptions = Record<string, unknown>;

export function spawn(_command: string, _args?: string[], _options?: SpawnOptions): never {
  throw new Error("[mapgen-studio] child_process.spawn is not available in browser builds");
}

export type ExecCallback = (error: Error | null, stdout: string, stderr: string) => void;

export function exec(_command: string, cb?: ExecCallback): void {
  // Prefer callback-style failure so any accidental call sites can degrade gracefully.
  cb?.(new Error("[mapgen-studio] child_process.exec is not available in browser builds"), "", "");
}

export default { spawn, exec };
