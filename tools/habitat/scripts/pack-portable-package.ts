import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import {
  archivePath,
  artifactRoot,
  checksumDocument,
  checksumPath,
  packArchive,
  sha256File,
} from "./portable-package-artifact.js";

rmSync(artifactRoot, { recursive: true, force: true });
mkdirSync(artifactRoot, { recursive: true });
packArchive(artifactRoot);

const digest = sha256File(archivePath);
writeFileSync(checksumPath, checksumDocument(digest));
process.stdout.write(`${archivePath}\n${checksumPath}\nsha256 ${digest}\n`);
