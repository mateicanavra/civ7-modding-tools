import React from 'react';
// ============================================================================
// SELECT FIELD
// ============================================================================
// Dropdown select field with label.
// ============================================================================
import { Select } from '../ui';
import { FieldRow } from './FieldRow';
import { getInputStyles } from './styles';
export interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  lightMode: boolean;
}
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  lightMode
}) => {
  const styles = getInputStyles(lightMode);
  return (
    <FieldRow>
      <span className={styles.label}>{label}</span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options.map((opt) => ({
          value: opt,
          label: opt
        }))}
        lightMode={lightMode} />

    </FieldRow>);

};