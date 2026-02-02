// ============================================================================
// FIELD STYLES
// ============================================================================
// Shared input styling utilities for form fields.
// ============================================================================

export interface InputStyles {
  base: string;
  select: string;
  label: string;
}

export function getInputStyles(lightMode: boolean): InputStyles {
  return {
    base: `h-7 text-[11px] rounded px-2.5 border transition-colors focus:outline-none ${
    lightMode ?
    'bg-white text-[#1f2937] border-gray-200 focus:border-gray-300' :
    'bg-[#0f0f12] text-[#e8e8ed] border-[#2a2a32] focus:border-[#3a3a44]'}`,

    select: `h-7 text-[11px] rounded pl-2.5 pr-6 border transition-colors focus:outline-none appearance-none cursor-pointer ${
    lightMode ?
    'bg-white text-[#1f2937] border-gray-200 focus:border-gray-300' :
    'bg-[#0f0f12] text-[#e8e8ed] border-[#2a2a32] focus:border-[#3a3a44]'}`,

    label: `text-[11px] shrink-0 ${lightMode ? 'text-[#6b7280]' : 'text-[#8a8a96]'}`
  };
}