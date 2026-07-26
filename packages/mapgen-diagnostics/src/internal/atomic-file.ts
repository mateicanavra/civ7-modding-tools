import { closeSync, openSync, renameSync, unlinkSync, writeFileSync } from "node:fs";

let atomicWriteSequence = 0;

type AtomicFileOperations = Readonly<{
  open: (path: string) => number;
  write: (descriptor: number, data: string | Uint8Array) => void;
  close: (descriptor: number) => void;
  rename: (source: string, destination: string) => void;
  unlink: (path: string) => void;
}>;

const nodeAtomicFileOperations: AtomicFileOperations = {
  open: (path) => openSync(path, "wx"),
  write: (descriptor, data) => writeFileSync(descriptor, data),
  close: closeSync,
  rename: renameSync,
  unlink: unlinkSync,
};

/** Replaces one admitted file through an adjacent exclusive temporary file. */
export function writeFileAtomically(
  path: string,
  data: string | Uint8Array,
  operations: AtomicFileOperations = nodeAtomicFileOperations
): void {
  atomicWriteSequence += 1;
  const temporaryPath = `${path}.tmp-${process.pid}-${atomicWriteSequence}`;
  let temporaryDescriptor: number | undefined;
  let ownsTemporaryFile = false;
  try {
    temporaryDescriptor = operations.open(temporaryPath);
    ownsTemporaryFile = true;
    operations.write(temporaryDescriptor, data);
    const descriptor = temporaryDescriptor;
    temporaryDescriptor = undefined;
    operations.close(descriptor);
    operations.rename(temporaryPath, path);
    ownsTemporaryFile = false;
  } catch (error) {
    if (temporaryDescriptor !== undefined) {
      const descriptor = temporaryDescriptor;
      temporaryDescriptor = undefined;
      try {
        operations.close(descriptor);
      } catch {
        // Preserve the original publication failure.
      }
    }
    if (ownsTemporaryFile) {
      try {
        operations.unlink(temporaryPath);
      } catch {
        // Preserve the original publication failure.
      }
    }
    throw error;
  }
}
