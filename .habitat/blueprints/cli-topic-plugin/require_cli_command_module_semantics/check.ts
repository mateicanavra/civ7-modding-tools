#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

type Finding = Readonly<{
  file: string;
  line: number;
  code: string;
  detail: string;
}>;

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const topicsRoot = path.join(repoRoot, "plugins/cli/topics");
const findings: Finding[] = [];

function isWithin(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..");
}

function walkTypeScriptFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .flatMap((entry) => {
      const absolute = path.join(root, entry.name);
      if (entry.isDirectory()) return walkTypeScriptFiles(absolute);
      return entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")
        ? [absolute]
        : [];
    })
    .sort((left, right) => left.localeCompare(right));
}

function addFinding(source: ts.SourceFile, node: ts.Node, code: string, detail: string): void {
  const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  findings.push({
    file: path.relative(repoRoot, source.fileName),
    line,
    code,
    detail,
  });
}

function defaultClassDeclaration(
  source: ts.SourceFile,
  checker: ts.TypeChecker
): ts.ClassDeclaration | undefined {
  const moduleSymbol = checker.getSymbolAtLocation(source);
  const defaultSymbol = moduleSymbol
    ? checker.getExportsOfModule(moduleSymbol).find((symbol) => symbol.name === "default")
    : undefined;
  if (!defaultSymbol) return undefined;
  const target =
    defaultSymbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(defaultSymbol)
      : defaultSymbol;
  return target.declarations?.find(ts.isClassDeclaration);
}

function defaultExportCount(source: ts.SourceFile): number {
  return source.statements.filter(
    (statement) =>
      ts.isExportAssignment(statement) ||
      (ts.canHaveModifiers(statement) &&
        ts
          .getModifiers(statement)
          ?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword))
  ).length;
}

function additionalValueExport(source: ts.SourceFile): ts.Statement | undefined {
  return source.statements.find((statement) => {
    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly) return false;
      return (
        !statement.exportClause ||
        !ts.isNamedExports(statement.exportClause) ||
        statement.exportClause.elements.some((element) => !element.isTypeOnly)
      );
    }
    if (!ts.canHaveModifiers(statement)) return false;
    const modifiers = ts.getModifiers(statement);
    const exported = modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    const defaulted = modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
    if (!exported || defaulted) return false;
    return !ts.isInterfaceDeclaration(statement) && !ts.isTypeAliasDeclaration(statement);
  });
}

function staticMemberName(member: ts.ClassElement, checker: ts.TypeChecker): string | undefined {
  if (!member.name) return undefined;
  if (
    ts.isIdentifier(member.name) ||
    ts.isStringLiteral(member.name) ||
    ts.isNoSubstitutionTemplateLiteral(member.name)
  ) {
    return member.name.text;
  }
  if (
    ts.isComputedPropertyName(member.name) &&
    (ts.isStringLiteral(member.name.expression) ||
      ts.isNoSubstitutionTemplateLiteral(member.name.expression))
  ) {
    return member.name.expression.text;
  }
  if (ts.isComputedPropertyName(member.name)) {
    const nameType = checker.getTypeAtLocation(member.name.expression);
    if (nameType.isStringLiteral()) return nameType.value;
  }
  return undefined;
}

function authoredStaticIdMember(
  defaultClass: ts.ClassDeclaration,
  checker: ts.TypeChecker
): ts.ClassElement | undefined {
  return defaultClass.members.find(
    (member) =>
      ts.canHaveModifiers(member) &&
      ts.getModifiers(member)?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) &&
      staticMemberName(member, checker) === "id"
  );
}

function oclifCommandType(
  containingFile: string,
  options: ts.CompilerOptions,
  program: ts.Program,
  checker: ts.TypeChecker
): ts.Type | undefined {
  const resolved = ts.resolveModuleName(
    "@oclif/core",
    containingFile,
    options,
    ts.sys
  ).resolvedModule;
  const source = resolved ? program.getSourceFile(resolved.resolvedFileName) : undefined;
  const moduleSymbol = source ? checker.getSymbolAtLocation(source) : undefined;
  const commandExport = moduleSymbol
    ? checker.getExportsOfModule(moduleSymbol).find((symbol) => symbol.name === "Command")
    : undefined;
  if (!commandExport) return undefined;
  const commandSymbol =
    commandExport.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(commandExport)
      : commandExport;
  return checker.getDeclaredTypeOfSymbol(commandSymbol);
}

function isGlobalRequire(
  node: ts.Identifier,
  source: ts.SourceFile,
  checker: ts.TypeChecker
): boolean {
  const symbol = checker.getSymbolAtLocation(node);
  return !symbol?.declarations?.some((declaration) => declaration.getSourceFile() === source);
}

function checkResolvedEdge(
  source: ts.SourceFile,
  node: ts.Node,
  specifier: string,
  topicRoot: string,
  commandsRoot: string,
  adaptersRoot: string,
  options: ts.CompilerOptions
): void {
  const relativeSpecifier = specifier.startsWith(".");
  const resolved = ts.resolveModuleName(specifier, source.fileName, options, ts.sys).resolvedModule;
  if (!resolved) {
    if (relativeSpecifier) {
      addFinding(
        source,
        node,
        "unresolved-relative-edge",
        `cannot resolve ${JSON.stringify(specifier)}`
      );
    }
    return;
  }
  const destination = path.normalize(resolved.resolvedFileName);
  if (!isWithin(topicRoot, destination)) return;
  const relativeDestination = path.relative(topicRoot, destination);
  if (isWithin(commandsRoot, destination)) {
    addFinding(
      source,
      node,
      "command-to-command-edge",
      `${JSON.stringify(specifier)} resolves to ${relativeDestination}`
    );
    return;
  }
  if (!isWithin(adaptersRoot, destination)) {
    addFinding(
      source,
      node,
      "non-adapter-local-edge",
      `${JSON.stringify(specifier)} resolves to ${relativeDestination}`
    );
  }
}

function literalModuleSpecifier(expression: ts.Expression): string | undefined {
  return ts.isStringLiteralLike(expression) ? expression.text : undefined;
}

function commandId(commandsRoot: string, commandFile: string): string {
  const relative = path.relative(commandsRoot, commandFile).replace(/\.ts$/u, "");
  const segments = relative.split(path.sep);
  if (segments.at(-1) === "index") segments.pop();
  return segments.join(":");
}

function checkCommandEdges(
  source: ts.SourceFile,
  checker: ts.TypeChecker,
  topicRoot: string,
  commandsRoot: string,
  adaptersRoot: string,
  options: ts.CompilerOptions
): void {
  const visit = (node: ts.Node): void => {
    if (ts.isImportTypeNode(node)) {
      const argument = node.argument;
      if (ts.isLiteralTypeNode(argument) && ts.isStringLiteralLike(argument.literal)) {
        checkResolvedEdge(
          source,
          argument.literal,
          argument.literal.text,
          topicRoot,
          commandsRoot,
          adaptersRoot,
          options
        );
      } else {
        addFinding(source, argument, "unprovable-module-edge", "computed import type specifier");
      }
    } else if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
        checkResolvedEdge(
          source,
          node.moduleSpecifier,
          node.moduleSpecifier.text,
          topicRoot,
          commandsRoot,
          adaptersRoot,
          options
        );
      }
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression
    ) {
      const expression = node.moduleReference.expression;
      if (ts.isStringLiteralLike(expression)) {
        checkResolvedEdge(
          source,
          expression,
          expression.text,
          topicRoot,
          commandsRoot,
          adaptersRoot,
          options
        );
      } else {
        addFinding(
          source,
          expression,
          "unprovable-module-edge",
          "computed import-equals specifier"
        );
      }
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require" &&
          isGlobalRequire(node.expression, source, checker)))
    ) {
      const argument = node.arguments[0];
      if (!argument) {
        addFinding(source, node, "unprovable-module-edge", "module loader has no specifier");
      } else {
        const specifier = literalModuleSpecifier(argument);
        if (specifier === undefined) {
          addFinding(
            source,
            argument,
            "unprovable-module-edge",
            "computed dynamic import or require specifier"
          );
        } else {
          checkResolvedEdge(
            source,
            argument,
            specifier,
            topicRoot,
            commandsRoot,
            adaptersRoot,
            options
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

function checkTopic(topicRoot: string): void {
  const tsconfigPath = path.join(topicRoot, "tsconfig.json");
  const commandsRoot = path.join(topicRoot, "src/commands");
  const adaptersRoot = path.join(topicRoot, "src/adapters");
  const commandFiles = walkTypeScriptFiles(commandsRoot);
  if (commandFiles.length === 0) return;

  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    const detail = ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n");
    findings.push({
      file: path.relative(repoRoot, tsconfigPath),
      line: 1,
      code: "invalid-topic-tsconfig",
      detail,
    });
    return;
  }
  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    topicRoot,
    {},
    tsconfigPath
  );

  const program = ts.createProgram({
    rootNames: [...new Set([...parsed.fileNames, ...commandFiles])],
    options: parsed.options,
    projectReferences: parsed.projectReferences,
  });
  const checker = program.getTypeChecker();

  const filesByCommandId = Map.groupBy(commandFiles, (commandFile) =>
    commandId(commandsRoot, commandFile)
  );
  for (const [id, files] of filesByCommandId) {
    if (files.length < 2) continue;
    for (const file of files) {
      const source = program.getSourceFile(file);
      if (source) {
        addFinding(
          source,
          source,
          "duplicate-command-id",
          `${JSON.stringify(id)} is also derived from ${files
            .filter((candidate) => candidate !== file)
            .map((candidate) => path.relative(topicRoot, candidate))
            .join(", ")}`
        );
      }
    }
  }

  for (const commandFile of commandFiles) {
    const source = program.getSourceFile(commandFile);
    if (!source) continue;
    if (defaultExportCount(source) !== 1) {
      addFinding(
        source,
        source,
        "non-singular-default-command",
        "command modules must have exactly one default export"
      );
    }
    const valueExport = additionalValueExport(source);
    if (valueExport) {
      addFinding(
        source,
        valueExport,
        "additional-command-value-export",
        "reusable runtime values belong in the topic adapter interior"
      );
    }
    const defaultClass = defaultClassDeclaration(source, checker);
    const commandType = oclifCommandType(commandFile, parsed.options, program, checker);
    const defaultClassSymbol = defaultClass?.name
      ? checker.getSymbolAtLocation(defaultClass.name)
      : undefined;
    if (!defaultClass || !defaultClassSymbol || !commandType) {
      addFinding(
        source,
        source,
        "unresolved-default-command",
        "cannot prove the default export is an oclif Command class"
      );
    } else {
      const defaultType = checker.getDeclaredTypeOfSymbol(defaultClassSymbol);
      if (!checker.isTypeAssignableTo(defaultType, commandType)) {
        addFinding(
          source,
          defaultClass,
          "non-command-default",
          "default class is not assignable to @oclif/core Command"
        );
      }
      const staticId = authoredStaticIdMember(defaultClass, checker);
      if (staticId) {
        addFinding(
          source,
          staticId,
          "authored-static-command-id",
          "oclif command identity must be derived from the command module path"
        );
      }
    }
    checkCommandEdges(source, checker, topicRoot, commandsRoot, adaptersRoot, parsed.options);
  }
}

for (const topic of readdirSync(topicsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .sort((left, right) => left.name.localeCompare(right.name))) {
  checkTopic(path.join(topicsRoot, topic.name));
}

if (findings.length > 0) {
  console.error(
    findings
      .sort((left, right) =>
        `${left.file}:${left.line}:${left.code}`.localeCompare(
          `${right.file}:${right.line}:${right.code}`
        )
      )
      .map((finding) => `${finding.file}:${finding.line} [${finding.code}] ${finding.detail}`)
      .join("\n")
  );
  process.exit(1);
}
