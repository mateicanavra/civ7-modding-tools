import { useCallback, useState } from "react";
import type { VizManifestV0 } from "../viz/model";
import { formatErrorForUi } from "../../shared/errorFormat";
import { buildDumpFileIndexFromDirectoryFiles, buildDumpFileIndexFromFileList } from "./fileIndex";
import { loadDumpManifest } from "./manifest";
import { openDumpDirectoryPicker, filesFromDirectoryHandle } from "./pickers";
import { createDumpReader, type DumpReader } from "./reader";

export type DumpLoadState =
  | { status: "idle" }
  | { status: "loading"; source: "directoryPicker" | "fileInput" }
  | { status: "loaded"; manifest: VizManifestV0; reader: DumpReader; warnings: string[] }
  | { status: "error"; message: string };

export type UseDumpLoaderResult = {
  state: DumpLoadState;
  actions: {
    openViaDirectoryPicker(): Promise<void>;
    loadFromFileList(files: FileList): Promise<void>;
    reset(): void;
  };
};

export function useDumpLoader(): UseDumpLoaderResult {
  const [state, setState] = useState<DumpLoadState>({ status: "idle" });

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const openViaDirectoryPicker = useCallback(async () => {
    setState({ status: "loading", source: "directoryPicker" });
    try {
      const handle = await openDumpDirectoryPicker();
      const files = await filesFromDirectoryHandle(handle);
      const index = buildDumpFileIndexFromDirectoryFiles(files);
      const manifest = await loadDumpManifest(index);
      const reader = createDumpReader(index);
      setState({ status: "loaded", manifest, reader, warnings: [] });
    } catch (error) {
      setState({ status: "error", message: formatErrorForUi(error) });
    }
  }, []);

  const loadFromFileList = useCallback(async (files: FileList) => {
    setState({ status: "loading", source: "fileInput" });
    try {
      const index = buildDumpFileIndexFromFileList(files);
      const manifest = await loadDumpManifest(index);
      const reader = createDumpReader(index);
      setState({ status: "loaded", manifest, reader, warnings: [] });
    } catch (error) {
      setState({ status: "error", message: formatErrorForUi(error) });
    }
  }, []);

  return {
    state,
    actions: {
      openViaDirectoryPicker,
      loadFromFileList,
      reset,
    },
  };
}
