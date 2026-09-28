import ts from "typescript";
import {
  type CompiledBarrelModule,
  type CompiledImportBarrelModule,
  type DeclarationModule,
  type ModuleCatalog,
  type RetainedModuleResolution,
  resolveRetainedModuleSpecifier,
  resolveRuntimeStylesheetPath,
} from "./module-catalog.js";
import { compareUtf8 } from "./source-maps.js";

const DECLARATION_TYPESCRIPT_VERSION = "6.0.3" as const;

interface DeclarationDiagnostic {
  readonly code: number;
  readonly category: "warning" | "error" | "suggestion" | "message";
  readonly message: string;
  readonly start?: number;
  readonly length?: number;
  readonly line?: number;
  readonly character?: number;
}

type DeclarationEdgeStatus = "declaration" | "compiled-only" | "unresolved" | "external";

export interface DeclarationEdge {
  readonly fromVirtualId: string;
  readonly originalSpecifier: string;
  readonly rewrittenSpecifier: string;
  readonly targetVirtualId?: string;
  readonly status: DeclarationEdgeStatus;
}

/**
 * Bare SCSS imports extracted by the official bundler are not declaration edges. Receipt
 * schema 4 retains their source-map and compiled CSS paths; the source snapshot digest pins
 * both files' bytes. No stylesheet module or declaration stub is synthesized.
 */
interface RuntimeStylesheetImport {
  readonly fromVirtualId: string;
  readonly originalSpecifier: string;
  readonly sourcePath: string;
  readonly mapPath: string;
  readonly stylesheetPath: string;
}

interface DeclarationShard {
  readonly virtualId: string;
  readonly outputFileName: string;
  readonly evidenceKind: DeclarationModule["evidenceKind"];
  readonly sourcePath: string;
  readonly text: string;
  readonly diagnostics: readonly DeclarationDiagnostic[];
  readonly edges: readonly DeclarationEdge[];
  readonly runtimeStylesheetImports: readonly RuntimeStylesheetImport[];
  readonly anyKeywordCount: number;
  readonly globalAugmentationCount: number;
}

interface UnresolvedTargetProvenance {
  readonly targetVirtualId: string;
  readonly edges: readonly DeclarationEdge[];
}

export interface DeclarationEmission {
  readonly compiler: {
    readonly name: "typescript";
    readonly version: typeof DECLARATION_TYPESCRIPT_VERSION;
  };
  readonly shards: readonly DeclarationShard[];
  readonly diagnostics: readonly DeclarationDiagnostic[];
  readonly edges: readonly DeclarationEdge[];
  readonly runtimeStylesheetImports: readonly RuntimeStylesheetImport[];
  readonly unresolvedTargets: readonly UnresolvedTargetProvenance[];
  readonly anyKeywordCount: number;
  readonly globalAugmentationCount: number;
}

const DECLARATION_COMPILER_OPTIONS: ts.CompilerOptions = {
  declaration: true,
  emitDeclarationOnly: true,
  isolatedDeclarations: true,
  jsx: ts.JsxEmit.Preserve,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  stripInternal: false,
  target: ts.ScriptTarget.ESNext,
};

function parseDiagnostics(sourceFile: ts.SourceFile): readonly ts.DiagnosticWithLocation[] {
  return (
    (
      sourceFile as ts.SourceFile & {
        readonly parseDiagnostics?: readonly ts.DiagnosticWithLocation[];
      }
    ).parseDiagnostics ?? []
  );
}

function diagnosticCategory(category: ts.DiagnosticCategory): DeclarationDiagnostic["category"] {
  switch (category) {
    case ts.DiagnosticCategory.Warning:
      return "warning";
    case ts.DiagnosticCategory.Error:
      return "error";
    case ts.DiagnosticCategory.Suggestion:
      return "suggestion";
    case ts.DiagnosticCategory.Message:
      return "message";
  }
}

function retainDiagnostics(
  diagnostics: readonly ts.Diagnostic[] | undefined
): DeclarationDiagnostic[] {
  return (diagnostics ?? []).map((diagnostic) => {
    const location =
      diagnostic.file !== undefined && diagnostic.start !== undefined
        ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
        : undefined;
    return {
      code: diagnostic.code,
      category: diagnosticCategory(diagnostic.category),
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      ...(diagnostic.start === undefined ? {} : { start: diagnostic.start }),
      ...(diagnostic.length === undefined ? {} : { length: diagnostic.length }),
      ...(location === undefined
        ? {}
        : { line: location.line + 1, character: location.character + 1 }),
    };
  });
}

function moduleSpecifierLiteral(node: ts.StringLiteralLike): boolean {
  const parent = node.parent;
  if (
    (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) &&
    parent.moduleSpecifier === node
  ) {
    return true;
  }
  if (ts.isExternalModuleReference(parent) && parent.expression === node) return true;
  if (
    ts.isLiteralTypeNode(parent) &&
    ts.isImportTypeNode(parent.parent) &&
    parent.parent.argument === parent
  ) {
    return true;
  }
  return (
    ts.isCallExpression(parent) &&
    parent.arguments.includes(node as ts.Expression) &&
    parent.expression.kind === ts.SyntaxKind.ImportKeyword
  );
}

function isGlobalAugmentation(statement: ts.Statement): statement is ts.ModuleDeclaration {
  return (
    ts.isModuleDeclaration(statement) &&
    (statement.flags & ts.NodeFlags.GlobalAugmentation) !== 0 &&
    ts.isIdentifier(statement.name) &&
    statement.name.text === "global"
  );
}

interface TransformResult {
  readonly sourceFile: ts.SourceFile;
  readonly edges: readonly DeclarationEdge[];
  readonly runtimeStylesheetImports: readonly RuntimeStylesheetImport[];
}

function transformDeclarationSource(
  catalog: ModuleCatalog,
  module: DeclarationModule,
  sourceFile: ts.SourceFile
): TransformResult {
  const fromVirtualId = module.virtualId;
  const edges: DeclarationEdge[] = [];
  const runtimeStylesheetImports: RuntimeStylesheetImport[] = [];
  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visitor: ts.Visitor = (node) => {
      // The shipped bundler extracts bare SCSS imports to CSS, not a declaration module.
      if (
        module.evidenceKind === "embedded-typescript" &&
        ts.isImportDeclaration(node) &&
        node.parent === sourceFile &&
        node.importClause === undefined &&
        node.attributes === undefined &&
        ts.isStringLiteralLike(node.moduleSpecifier) &&
        node.moduleSpecifier.text.endsWith(".scss")
      ) {
        runtimeStylesheetImports.push({
          fromVirtualId,
          originalSpecifier: node.moduleSpecifier.text,
          sourcePath: module.source.sourcePath,
          mapPath: module.source.mapPath,
          stylesheetPath: resolveRuntimeStylesheetPath(
            catalog,
            fromVirtualId,
            node.moduleSpecifier.text
          ),
        });
        return undefined;
      }
      if (ts.isStringLiteralLike(node) && moduleSpecifierLiteral(node)) {
        const resolution = resolveRetainedModuleSpecifier(catalog, fromVirtualId, node.text);
        if (resolution.status === "unretained") {
          throw new Error(
            `Unsupported retained declaration module specifier in ${fromVirtualId}: ${node.text}`
          );
        }
        edges.push(edgeFromResolution(fromVirtualId, resolution));
        if (resolution.rewrittenSpecifier !== node.text) {
          return ts.factory.createStringLiteral(resolution.rewrittenSpecifier);
        }
        return node;
      }
      return ts.visitEachChild(node, visitor, context);
    };
    return (root) => ts.visitNode(root, visitor) as ts.SourceFile;
  };

  const transformed = ts.transform(sourceFile, [transformer]);
  try {
    const transformedSourceFile = transformed.transformed[0];
    if (transformedSourceFile === undefined) {
      throw new Error(`TypeScript produced no transformed declaration for ${fromVirtualId}`);
    }
    return {
      sourceFile: transformedSourceFile,
      edges,
      runtimeStylesheetImports,
    };
  } finally {
    transformed.dispose();
  }
}

function edgeFromResolution(
  fromVirtualId: string,
  resolution: Exclude<RetainedModuleResolution, { readonly status: "unretained" }>
): DeclarationEdge {
  return {
    fromVirtualId,
    originalSpecifier: resolution.originalSpecifier,
    rewrittenSpecifier: resolution.rewrittenSpecifier,
    status: resolution.status,
    ...(resolution.status === "external" ? {} : { targetVirtualId: resolution.targetVirtualId }),
  };
}

function countAnyKeywords(node: ts.Node): number {
  let count = node.kind === ts.SyntaxKind.AnyKeyword ? 1 : 0;
  ts.forEachChild(node, (child) => {
    count += countAnyKeywords(child);
  });
  return count;
}

function countGlobalAugmentations(node: ts.Node): number {
  let count = ts.isModuleDeclaration(node) && isGlobalAugmentation(node) ? 1 : 0;
  ts.forEachChild(node, (child) => {
    count += countGlobalAugmentations(child);
  });
  return count;
}

function assertReparsed(
  fileName: string,
  text: string
): { readonly anyKeywordCount: number; readonly globalAugmentationCount: number } {
  const reparsed = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const diagnostics = parseDiagnostics(reparsed);
  if (diagnostics.length > 0) {
    const first = diagnostics[0];
    throw new Error(
      `Projected declaration is not parseable at ${fileName}: TS${first.code} ${ts.flattenDiagnosticMessageText(first.messageText, "\n")}`
    );
  }
  return {
    anyKeywordCount: countAnyKeywords(reparsed),
    globalAugmentationCount: countGlobalAugmentations(reparsed),
  };
}

/** Encodes provenance in a flat generated shard filename. */
function flatDeclarationShardFileName(module: DeclarationModule): string {
  const evidencePath =
    module.evidenceKind === "embedded-typescript" ? module.source.sourcePath : module.compiledPath;
  if (evidencePath.split("/").some((segment) => segment.includes("__"))) {
    throw new Error(`Cannot losslessly flatten declaration evidence path: ${evidencePath}`);
  }
  const withoutExtension = evidencePath.replace(/\.(?:tsx?|js)$/, "");
  if (withoutExtension === evidencePath) {
    throw new Error(`Declaration evidence path has no supported extension: ${evidencePath}`);
  }
  return `${withoutExtension.replaceAll("/", "__")}.d.ts`;
}

function sourcePathForModule(module: DeclarationModule): string {
  return module.evidenceKind === "embedded-typescript"
    ? module.source.sourcePath
    : module.compiledPath;
}

function emitDeclarationShard(
  module: DeclarationModule,
  sourceFile: ts.SourceFile,
  diagnostics: readonly DeclarationDiagnostic[],
  edges: readonly DeclarationEdge[],
  runtimeStylesheetImports: readonly RuntimeStylesheetImport[]
): DeclarationShard {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  let text = printer.printFile(sourceFile).replace(/[ \t]+$/gm, "");
  const outputFileName = flatDeclarationShardFileName(module);
  if (runtimeStylesheetImports.length > 0) {
    const reparsed = ts.createSourceFile(outputFileName, text, ts.ScriptTarget.Latest, true);
    // Removing a module's only import must not turn its declarations into ambient globals.
    if (!ts.isExternalModule(reparsed)) text += "export {};\n";
  }
  const counts = assertReparsed(outputFileName, text);
  return {
    virtualId: module.virtualId,
    outputFileName,
    evidenceKind: module.evidenceKind,
    sourcePath: sourcePathForModule(module),
    text,
    diagnostics,
    edges,
    runtimeStylesheetImports,
    ...counts,
  };
}

function emitEmbeddedModule(
  catalog: ModuleCatalog,
  module: Extract<DeclarationModule, { readonly evidenceKind: "embedded-typescript" }>
): DeclarationShard {
  const originalSourceFile = ts.createSourceFile(
    module.source.sourcePath,
    module.source.sourceText,
    ts.ScriptTarget.Latest,
    true,
    module.source.sourceKind === "tsx" ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  // Declaration emit erases import attributes; refuse them before their evidence is lost.
  for (const statement of originalSourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      statement.importClause === undefined &&
      statement.attributes !== undefined &&
      ts.isStringLiteralLike(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text.endsWith(".scss")
    ) {
      throw new Error(
        `Unsupported runtime stylesheet import attributes in ${module.virtualId}: ${statement.moduleSpecifier.text}`
      );
    }
  }
  const output = ts.transpileDeclaration(module.source.sourceText, {
    compilerOptions: DECLARATION_COMPILER_OPTIONS,
    fileName: module.source.sourcePath,
    reportDiagnostics: true,
  });
  const diagnostics = retainDiagnostics(output.diagnostics);
  const emittedSourceFile = ts.createSourceFile(
    `${module.virtualId}.d.ts`,
    output.outputText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const transformed = transformDeclarationSource(catalog, module, emittedSourceFile);
  return emitDeclarationShard(
    module,
    transformed.sourceFile,
    diagnostics,
    transformed.edges,
    transformed.runtimeStylesheetImports
  );
}

function emitCompiledBarrel(
  catalog: ModuleCatalog,
  module: CompiledBarrelModule | CompiledImportBarrelModule
): DeclarationShard {
  const statements =
    module.evidenceKind === "compiled-import-barrel" ? module.imports : module.reexports;
  const sourceText = `${statements.map((statement) => statement.statementText).join("\n")}\n`;
  const sourceFile = ts.createSourceFile(
    `${module.virtualId}.d.ts`,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const transformed = transformDeclarationSource(catalog, module, sourceFile);
  return emitDeclarationShard(
    module,
    transformed.sourceFile,
    [],
    transformed.edges,
    transformed.runtimeStylesheetImports
  );
}

function unresolvedTargetProvenance(
  edges: readonly DeclarationEdge[]
): readonly UnresolvedTargetProvenance[] {
  const byTarget = new Map<string, DeclarationEdge[]>();
  for (const edge of edges) {
    if (edge.status !== "unresolved" || edge.targetVirtualId === undefined) continue;
    const incoming = byTarget.get(edge.targetVirtualId) ?? [];
    incoming.push(edge);
    byTarget.set(edge.targetVirtualId, incoming);
  }
  return [...byTarget]
    .sort(([left], [right]) => compareUtf8(left, right))
    .map(([targetVirtualId, incoming]) => ({ targetVirtualId, edges: incoming }));
}

/** Emits direct declaration shards while preserving compiler diagnostics as evidence. */
export function emitBaseDeclarationProjection(catalog: ModuleCatalog): DeclarationEmission {
  if (ts.version !== DECLARATION_TYPESCRIPT_VERSION) {
    throw new Error(
      `Declaration projection requires TypeScript ${DECLARATION_TYPESCRIPT_VERSION}; loaded ${ts.version}`
    );
  }

  const shards: DeclarationShard[] = [];
  for (const module of catalog.declarationModules) {
    if (module.evidenceKind === "embedded-typescript") {
      shards.push(emitEmbeddedModule(catalog, module));
    } else {
      shards.push(emitCompiledBarrel(catalog, module));
    }
  }
  shards.sort((left, right) => compareUtf8(left.virtualId, right.virtualId));
  const outputFileNames = [...shards].sort((left, right) =>
    compareUtf8(left.outputFileName, right.outputFileName)
  );
  for (let index = 1; index < outputFileNames.length; index += 1) {
    const previous = outputFileNames[index - 1];
    const current = outputFileNames[index];
    if (previous?.outputFileName === current?.outputFileName) {
      throw new Error(
        `Flat declaration shard filename collision: ${previous.sourcePath} and ${current.sourcePath}`
      );
    }
  }

  const diagnostics = shards.flatMap((shard) => shard.diagnostics);
  const edges = shards.flatMap((shard) => shard.edges);
  const anyKeywordCount = shards.reduce((count, shard) => count + shard.anyKeywordCount, 0);
  const globalAugmentationCount = shards.reduce(
    (count, shard) => count + shard.globalAugmentationCount,
    0
  );
  return {
    compiler: { name: "typescript", version: DECLARATION_TYPESCRIPT_VERSION },
    shards,
    diagnostics,
    edges,
    runtimeStylesheetImports: shards.flatMap((shard) => shard.runtimeStylesheetImports),
    unresolvedTargets: unresolvedTargetProvenance(edges),
    anyKeywordCount,
    globalAugmentationCount,
  };
}
