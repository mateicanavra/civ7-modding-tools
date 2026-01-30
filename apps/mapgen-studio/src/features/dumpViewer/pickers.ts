export async function openDumpDirectoryPicker(): Promise<FileSystemDirectoryHandle> {
  const anyWindow = window as any;
  if (typeof anyWindow.showDirectoryPicker !== "function") {
    throw new Error("Your browser does not support folder picking. Use a Chromium-based browser, or enable directory picking.");
  }
  return await anyWindow.showDirectoryPicker();
}

export async function filesFromDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<Map<string, File>> {
  const files = new Map<string, File>();

  const walk = async (dirHandle: FileSystemDirectoryHandle, prefix: string) => {
    const entries = (dirHandle as any).entries?.() ?? (dirHandle as any).values?.();
    if (!entries) return;
    for await (const [name, entry] of entries) {
      const path = prefix ? `${prefix}/${name}` : name;
      if (entry.kind === "directory") {
        await walk(entry, path);
      } else if (entry.kind === "file") {
        const file = await entry.getFile();
        files.set(path, file);
      }
    }
  };

  await walk(handle, "");
  return files;
}
