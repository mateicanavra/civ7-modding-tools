import React from "react";
// ============================================================================
// FIELD ROW
// ============================================================================
// Layout wrapper for form field label + input pairs.
// ============================================================================
export interface FieldRowProps {
  children: React.ReactNode;
}

/** Aligns a compact field label and control across the shared config-form row geometry. */
export const FieldRow: React.FC<FieldRowProps> = ({ children }) => (
  <div className="flex items-center justify-between gap-3 py-1">{children}</div>
);
