export function shouldIgnoreGlobalShortcutsInEditableTarget(args: {
  isEditableTarget: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
}): boolean {
  if (!args.isEditableTarget) return false;
  const isMod = args.metaKey || args.ctrlKey;
  return !isMod && !args.altKey;
}

