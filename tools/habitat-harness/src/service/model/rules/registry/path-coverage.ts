export function pathCoveragePatternMatches(pattern: string, pathInRepo: string): boolean {
  const normalized = pattern.replaceAll("\\", "/");
  if (!normalized.includes("*")) {
    return pathInRepo === normalized || pathInRepo.startsWith(`${normalized}/`);
  }
  return globToRegExp(normalized).test(pathInRepo);
}

function globToRegExp(pattern: string): RegExp {
  let source = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];
    if (char === "*" && next === "*") {
      if (pattern[index + 2] === "/") {
        source += "(?:.*/)?";
        index += 2;
        continue;
      }
      source += ".*";
      index += 1;
      continue;
    }
    if (char === "*") {
      source += "[^/]*";
      continue;
    }
    if (char === "?") {
      source += "[^/]";
      continue;
    }
    source += escapeRegExp(char);
  }
  source += "$";
  return new RegExp(source);
}

function escapeRegExp(char: string) {
  return /[\\^$+?.()|[\]{}]/.test(char) ? `\\${char}` : char;
}
