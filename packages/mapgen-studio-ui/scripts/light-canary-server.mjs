import { closeSync, constants, fstatSync, openSync, readFileSync, realpathSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const MIME = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mjs": "text/javascript",
  ".png": "image/png",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export function serveLightCanaryDirectory(root, { host = "127.0.0.1", port = 0 } = {}) {
  const rootAbsolute = realpathSync(root) + sep;
  const server = createServer((request, response) => {
    let pathname;
    let path;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://light-canary").pathname);
      path = resolve(root, `.${pathname}`);
    } catch {
      response.statusCode = 400;
      response.end();
      return;
    }
    if (pathname === "/") {
      response.setHeader("Content-Type", "text/html");
      response.end("<!doctype html>");
      return;
    }
    if (!path.startsWith(resolve(root) + sep)) {
      response.statusCode = 404;
      response.end();
      return;
    }
    // Generated fixture trees are immutable for the life of this loopback
    // verifier. Resolved containment prevents accidental/static symlink escape;
    // same-user processes racing mutations are outside this tool's trust model.
    let descriptor;
    let realPath;
    try {
      realPath = realpathSync(path);
      if (!realPath.startsWith(rootAbsolute)) throw new Error("target escapes root");
      descriptor = openSync(realPath, constants.O_RDONLY | constants.O_NOFOLLOW);
      if (!fstatSync(descriptor).isFile()) throw new Error("target is not a file");
      response.setHeader("Content-Type", MIME[extname(realPath)] ?? "application/octet-stream");
      response.end(readFileSync(descriptor));
    } catch {
      response.statusCode = 404;
      response.end();
    } finally {
      if (descriptor !== undefined) closeSync(descriptor);
    }
  });

  // Listen failures reject so staged acquisition can still close resources
  // acquired before this server.
  return new Promise((resolveListen, rejectListen) => {
    const onError = (error) => {
      server.off("listening", onListening);
      rejectListen(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolveListen({ server, port: server.address().port });
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
}

function closeServer(server) {
  return new Promise((resolveClose, rejectClose) => {
    server.close((error) => (error ? rejectClose(error) : resolveClose()));
  });
}

export async function cleanupLightCanaryRuntime({ browser, servers }) {
  const cleanup = [];
  if (browser) cleanup.push(browser.close());
  cleanup.push(...servers.filter(Boolean).map(closeServer));
  const results = await Promise.allSettled(cleanup);
  const failures = results.flatMap((result) =>
    result.status === "rejected" ? [result.reason] : []
  );
  if (failures.length > 0) {
    throw new AggregateError(failures, "light-canary cleanup failed");
  }
}
