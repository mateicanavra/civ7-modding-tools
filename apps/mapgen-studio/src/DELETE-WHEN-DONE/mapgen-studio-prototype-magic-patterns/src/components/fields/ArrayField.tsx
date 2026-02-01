import React from 'react';
// ============================================================================
// ARRAY FIELD
// ============================================================================
// Read-only display for array values.
// ============================================================================
import { FieldRow } from './FieldRow';
import { getInputStyles } from './styles';
import type { ConfigValue } from '../../types';
export interface ArrayFieldProps {
  label: string;
  value: ConfigValue[];
  lightMode: boolean;
}
export const ArrayField: React.FC<ArrayFieldProps> = ({
  label,
  value,
  lightMode
}) => {
  const styles = getInputStyles(lightMode);
  const formattedValue = value.
  map((v) => typeof v === 'number' ? v : JSON.stringify(v)).
  join(', ');
  return (
    <FieldRow>
      <span className={styles.label}>{label}</span>
      <span
        className={`text-[10px] font-mono ${lightMode ? 'text-[#9ca3af]' : 'text-[#5a5a66]'}`}>

        [{formattedValue}]
      </span>
    </FieldRow>);

};