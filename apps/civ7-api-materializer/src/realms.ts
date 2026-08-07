import { readFile } from "node:fs/promises";
import { join, posix } from "node:path";
import type { DeclarationEdge } from "./declaration-emit.js";
import { type ModuleCatalog, virtualIdForCompiledPath } from "./module-catalog.js";
import { compareUtf8, listBaseFiles } from "./source-maps.js";

const BASE_STANDARD_CONFIG_PATH = "Base/modules/base-standard/config/config.xml";
const EXPECTED_BASE_MAP_ROOT_COUNT = 12;

type DeclarationRealm = "shell" | "game" | "map";
type RealmRootStatus = "declaration" | "compiled-only" | "unresolved";

interface ModInfoRealmRoot {
  readonly evidenceKind: "modinfo";
  readonly realm: "shell" | "game";
  readonly virtualId: string;
  readonly status: RealmRootStatus;
  readonly evidencePath: string;
  readonly actionGroupId: string;
  readonly actionKind: "UIScripts" | "ImportFiles";
  readonly item: string;
}

interface MapConfigRealmRoot {
  readonly evidenceKind: "base-standard-config";
  readonly realm: "map";
  readonly virtualId: string;
  readonly status: RealmRootStatus;
  readonly evidencePath: typeof BASE_STANDARD_CONFIG_PATH;
  readonly rowIndex: number;
  readonly file: string;
}

type RealmRoot = ModInfoRealmRoot | MapConfigRealmRoot;

export interface RealmClosure {
  readonly realm: DeclarationRealm;
  readonly roots: readonly RealmRoot[];
  readonly declarationRootIds: readonly string[];
  readonly moduleIds: readonly string[];
  readonly nonDeclarationRoots: readonly RealmRoot[];
}

export interface RealmProjection {
  readonly rootEvidence: readonly RealmRoot[];
  readonly shell: RealmClosure;
  readonly game: RealmClosure;
  readonly map: RealmClosure;
}

interface XmlElement {
  readonly name: string;
  readonly attributes: Readonly<Record<string, string>>;
  readonly children: XmlElement[];
  readonly textParts: string[];
}

function decodeXml(value: string, path: string): string {
  return value.replaceAll(/&(#x[\da-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g, (entity, name: string) => {
    switch (name) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return '"';
      case "apos":
        return "'";
      default: {
        const codePoint = name.startsWith("#x")
          ? Number.parseInt(name.slice(2), 16)
          : Number.parseInt(name.slice(1), 10);
        if (!Number.isSafeInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
          throw new Error(`Invalid XML character entity in ${path}: &${name};`);
        }
        return String.fromCodePoint(codePoint);
      }
    }
  });
}

function findTagEnd(xml: string, start: number, path: string): number {
  let quote: '"' | "'" | undefined;
  for (let index = start; index < xml.length; index += 1) {
    const character = xml[index];
    if (quote !== undefined) {
      if (character === quote) quote = undefined;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === ">") {
      return index;
    }
  }
  throw new Error(`Unterminated XML tag in ${path}`);
}

function parseStartTag(
  content: string,
  path: string
): { readonly name: string; readonly attributes: Readonly<Record<string, string>> } {
  let index = 0;
  const skipWhitespace = (): void => {
    while (/\s/.test(content[index] ?? "")) index += 1;
  };
  skipWhitespace();
  const nameMatch = content.slice(index).match(/^[A-Za-z_][\w:.-]*/);
  if (nameMatch === null) throw new Error(`Invalid XML start tag in ${path}: <${content}>`);
  const name = nameMatch[0];
  index += name.length;
  const attributes: Record<string, string> = {};

  while (index < content.length) {
    skipWhitespace();
    if (index >= content.length) break;
    const attributeMatch = content.slice(index).match(/^[A-Za-z_][\w:.-]*/);
    if (attributeMatch === null) {
      throw new Error(`Invalid XML attribute in ${path}: <${content}>`);
    }
    const attributeName = attributeMatch[0];
    if (attributes[attributeName] !== undefined) {
      throw new Error(`Duplicate XML attribute ${attributeName} in ${path}`);
    }
    index += attributeName.length;
    skipWhitespace();
    if (content[index] !== "=") {
      throw new Error(`XML attribute ${attributeName} has no value in ${path}`);
    }
    index += 1;
    skipWhitespace();
    const quote = content[index];
    if (quote !== '"' && quote !== "'") {
      throw new Error(`XML attribute ${attributeName} is not quoted in ${path}`);
    }
    index += 1;
    const valueEnd = content.indexOf(quote, index);
    if (valueEnd === -1) {
      throw new Error(`Unterminated XML attribute ${attributeName} in ${path}`);
    }
    attributes[attributeName] = decodeXml(content.slice(index, valueEnd), path);
    index = valueEnd + 1;
  }
  return { name, attributes };
}

function parseXmlDocument(xml: string, path: string): XmlElement {
  const document: XmlElement = { name: "#document", attributes: {}, children: [], textParts: [] };
  const stack: XmlElement[] = [document];
  let index = 0;
  while (index < xml.length) {
    const tagStart = xml.indexOf("<", index);
    if (tagStart === -1) {
      stack.at(-1)?.textParts.push(decodeXml(xml.slice(index), path));
      break;
    }
    if (tagStart > index) {
      stack.at(-1)?.textParts.push(decodeXml(xml.slice(index, tagStart), path));
    }
    if (xml.startsWith("<!--", tagStart)) {
      const commentEnd = xml.indexOf("-->", tagStart + 4);
      if (commentEnd === -1) throw new Error(`Unterminated XML comment in ${path}`);
      index = commentEnd + 3;
      continue;
    }
    if (xml.startsWith("<?", tagStart)) {
      const instructionEnd = xml.indexOf("?>", tagStart + 2);
      if (instructionEnd === -1) throw new Error(`Unterminated XML instruction in ${path}`);
      index = instructionEnd + 2;
      continue;
    }
    if (xml.startsWith("<![CDATA[", tagStart)) {
      const cdataEnd = xml.indexOf("]]>", tagStart + 9);
      if (cdataEnd === -1) throw new Error(`Unterminated XML CDATA in ${path}`);
      stack.at(-1)?.textParts.push(xml.slice(tagStart + 9, cdataEnd));
      index = cdataEnd + 3;
      continue;
    }
    if (xml.startsWith("<!", tagStart)) {
      throw new Error(`Unsupported XML declaration in ${path}`);
    }

    const tagEnd = findTagEnd(xml, tagStart + 1, path);
    let content = xml.slice(tagStart + 1, tagEnd).trim();
    if (content.startsWith("/")) {
      const endName = content.slice(1).trim();
      if (!/^[A-Za-z_][\w:.-]*$/.test(endName)) {
        throw new Error(`Invalid XML end tag in ${path}: </${endName}>`);
      }
      const current = stack.pop();
      if (current === undefined || current === document || current.name !== endName) {
        throw new Error(`Mismatched XML end tag in ${path}: </${endName}>`);
      }
    } else {
      const selfClosing = content.endsWith("/");
      if (selfClosing) content = content.slice(0, -1).trimEnd();
      const parsed = parseStartTag(content, path);
      const element: XmlElement = {
        name: parsed.name,
        attributes: parsed.attributes,
        children: [],
        textParts: [],
      };
      const parent = stack.at(-1);
      if (parent === undefined) throw new Error(`XML parser lost its document root in ${path}`);
      parent.children.push(element);
      if (!selfClosing) stack.push(element);
    }
    index = tagEnd + 1;
  }
  if (stack.length !== 1) {
    throw new Error(`Unclosed XML element <${stack.at(-1)?.name ?? "unknown"}> in ${path}`);
  }
  if (document.children.length !== 1) {
    throw new Error(`XML evidence must contain exactly one document element in ${path}`);
  }
  const root = document.children[0];
  if (root === undefined) throw new Error(`XML evidence has no document element in ${path}`);
  return root;
}

function child(element: XmlElement, name: string): XmlElement | undefined {
  return element.children.find((candidate) => candidate.name === name);
}

function children(element: XmlElement, name: string): readonly XmlElement[] {
  return element.children.filter((candidate) => candidate.name === name);
}

function elementText(element: XmlElement): string {
  if (element.children.length !== 0) {
    throw new Error(`Expected text-only XML element <${element.name}>`);
  }
  return element.textParts.join("").trim();
}

function rootStatus(catalog: ModuleCatalog, virtualId: string): RealmRootStatus {
  if (catalog.declarationModuleIds.includes(virtualId)) return "declaration";
  if (catalog.compiledModuleIds.includes(virtualId)) return "compiled-only";
  return "unresolved";
}

function moduleItemVirtualId(modInfoPath: string, item: string): string {
  if (
    item.includes("\\") ||
    item.includes("\0") ||
    posix.isAbsolute(item) ||
    item.includes("{") ||
    item.includes("}")
  ) {
    throw new Error(`Invalid JavaScript action item in ${modInfoPath}: ${item}`);
  }
  const moduleDirectory = posix.dirname(modInfoPath);
  const compiledPath = posix.normalize(posix.join(moduleDirectory, item));
  if (!compiledPath.startsWith(`${moduleDirectory}/`)) {
    throw new Error(
      `JavaScript action item escapes its official module in ${modInfoPath}: ${item}`
    );
  }
  return virtualIdForCompiledPath(compiledPath);
}

async function extractModInfoRoots(
  snapshotRoot: string,
  catalog: ModuleCatalog
): Promise<readonly ModInfoRealmRoot[]> {
  const roots: ModInfoRealmRoot[] = [];
  const modInfoPaths = (await listBaseFiles(snapshotRoot)).filter(
    (path) => path.startsWith("Base/modules/") && path.endsWith(".modinfo")
  );
  for (const evidencePath of modInfoPaths) {
    const root = parseXmlDocument(
      await readFile(join(snapshotRoot, evidencePath), "utf8"),
      evidencePath
    );
    if (root.name !== "Mod")
      throw new Error(`Official modinfo root must be <Mod>: ${evidencePath}`);
    const actionGroups = child(root, "ActionGroups");
    if (actionGroups === undefined) continue;
    for (const actionGroup of children(actionGroups, "ActionGroup")) {
      const scope = actionGroup.attributes.scope;
      if (scope !== "shell" && scope !== "game") {
        throw new Error(`Official ActionGroup has unsupported scope in ${evidencePath}: ${scope}`);
      }
      const actionGroupId = actionGroup.attributes.id;
      if (actionGroupId === undefined || actionGroupId.length === 0) {
        throw new Error(`Official ActionGroup has no id in ${evidencePath}`);
      }
      const actions = child(actionGroup, "Actions");
      if (actions === undefined) continue;
      for (const actionKind of ["UIScripts", "ImportFiles"] as const) {
        for (const action of children(actions, actionKind)) {
          for (const itemElement of children(action, "Item")) {
            const item = elementText(itemElement);
            if (!item.endsWith(".js")) continue;
            const virtualId = moduleItemVirtualId(evidencePath, item);
            roots.push({
              evidenceKind: "modinfo",
              realm: scope,
              virtualId,
              status: rootStatus(catalog, virtualId),
              evidencePath,
              actionGroupId,
              actionKind,
              item,
            });
          }
        }
      }
    }
  }
  return roots;
}

function mapFileVirtualId(file: string): string {
  const prefix = "{base-standard}";
  if (!file.startsWith(prefix) || file.includes("\\") || file.includes("\0")) {
    throw new Error(`Official Base map row has an invalid File value: ${file}`);
  }
  const relativePath = file.slice(prefix.length);
  if (
    relativePath.length === 0 ||
    posix.isAbsolute(relativePath) ||
    posix.normalize(relativePath) !== relativePath ||
    !relativePath.endsWith(".js")
  ) {
    throw new Error(`Official Base map row has a non-canonical File value: ${file}`);
  }
  return virtualIdForCompiledPath(`Base/modules/base-standard/${relativePath}`);
}

async function extractMapRoots(
  snapshotRoot: string,
  catalog: ModuleCatalog
): Promise<readonly MapConfigRealmRoot[]> {
  const root = parseXmlDocument(
    await readFile(join(snapshotRoot, BASE_STANDARD_CONFIG_PATH), "utf8"),
    BASE_STANDARD_CONFIG_PATH
  );
  if (root.name !== "Database") {
    throw new Error(`Official Base config root must be <Database>: ${BASE_STANDARD_CONFIG_PATH}`);
  }
  const maps = child(root, "Maps");
  if (maps === undefined) {
    throw new Error(`Official Base config has no exact <Maps> table: ${BASE_STANDARD_CONFIG_PATH}`);
  }
  const rows = children(maps, "Row");
  if (rows.length !== EXPECTED_BASE_MAP_ROOT_COUNT) {
    throw new Error(
      `Official Base config must contain exactly ${EXPECTED_BASE_MAP_ROOT_COUNT} map rows; found ${rows.length}`
    );
  }
  return rows.map((row, rowIndex) => {
    const file = row.attributes.File;
    if (file === undefined) {
      throw new Error(`Official Base map row ${rowIndex} has no File attribute`);
    }
    const virtualId = mapFileVirtualId(file);
    return {
      evidenceKind: "base-standard-config",
      realm: "map",
      virtualId,
      status: rootStatus(catalog, virtualId),
      evidencePath: BASE_STANDARD_CONFIG_PATH,
      rowIndex,
      file,
    };
  });
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort(compareUtf8);
}

/** Computes reachability over retained declaration edges only. */
function computeDeclarationEdgeClosure(
  realm: DeclarationRealm,
  roots: readonly RealmRoot[],
  edges: readonly DeclarationEdge[]
): RealmClosure {
  const declarationRootIds = uniqueSorted(
    roots.filter((root) => root.status === "declaration").map((root) => root.virtualId)
  );
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.status !== "declaration" || edge.targetVirtualId === undefined) continue;
    const targets = adjacency.get(edge.fromVirtualId) ?? [];
    targets.push(edge.targetVirtualId);
    adjacency.set(edge.fromVirtualId, targets);
  }
  for (const targets of adjacency.values()) targets.sort(compareUtf8);

  const visited = new Set<string>();
  const pending = [...declarationRootIds];
  while (pending.length > 0) {
    const current = pending.shift();
    if (current === undefined || visited.has(current)) continue;
    visited.add(current);
    for (const target of adjacency.get(current) ?? []) {
      if (!visited.has(target)) pending.push(target);
    }
    pending.sort(compareUtf8);
  }
  return {
    realm,
    roots,
    declarationRootIds,
    moduleIds: [...visited].sort(compareUtf8),
    nonDeclarationRoots: roots.filter((root) => root.status !== "declaration"),
  };
}

/** Extracts official realm roots and closes each realm strictly over declaration edges. */
export async function projectDeclarationRealms(
  snapshotRoot: string,
  catalog: ModuleCatalog,
  edges: readonly DeclarationEdge[]
): Promise<RealmProjection> {
  const [modInfoRoots, mapRoots] = await Promise.all([
    extractModInfoRoots(snapshotRoot, catalog),
    extractMapRoots(snapshotRoot, catalog),
  ]);
  const shellRoots = modInfoRoots.filter((root) => root.realm === "shell");
  const gameRoots = modInfoRoots.filter((root) => root.realm === "game");
  const rootEvidence = [...modInfoRoots, ...mapRoots];
  return {
    rootEvidence,
    shell: computeDeclarationEdgeClosure("shell", shellRoots, edges),
    game: computeDeclarationEdgeClosure("game", gameRoots, edges),
    map: computeDeclarationEdgeClosure("map", mapRoots, edges),
  };
}
