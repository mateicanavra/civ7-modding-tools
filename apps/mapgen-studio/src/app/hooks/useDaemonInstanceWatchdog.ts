import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import { orpc } from "../../lib/orpc";

/**
 * Daemon-restart watchdog: the studio tab is only coherent against the daemon
 * instance it booted with — run-in-game/save-deploy operation registries live
 * in daemon process memory, so after a daemon restart the tab's resumed
 * request ids, query caches, and live-runtime state are stale in ways no
 * in-place invalidation can fully cover. When `serverInstanceId` changes under
 * a live tab, reload the document for a clean boot instead of letting the
 * session silently rot (the user should never need a manual hard refresh).
 */
export function useDaemonInstanceWatchdog(): void {
  const serverInfoQuery = useQuery({
    ...orpc.studio.serverInfo.queryOptions({ input: {} }),
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });
  const bootInstanceIdRef = useRef<string | null>(null);
  const serverInstanceId = serverInfoQuery.data?.ok ? serverInfoQuery.data.serverInstanceId : null;

  useEffect(() => {
    if (!serverInstanceId) return;
    if (bootInstanceIdRef.current === null) {
      bootInstanceIdRef.current = serverInstanceId;
      return;
    }
    if (bootInstanceIdRef.current !== serverInstanceId) {
      window.location.reload();
    }
  }, [serverInstanceId]);
}
