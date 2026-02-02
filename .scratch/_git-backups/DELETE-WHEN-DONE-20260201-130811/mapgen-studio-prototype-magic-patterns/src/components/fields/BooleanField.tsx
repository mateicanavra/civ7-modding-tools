import React from 'react';
// ============================================================================
// BOOLEAN FIELD
// ============================================================================
// Checkbox input field with label.
// ============================================================================
import { Checkbox } from '../ui';
import { FieldRow } from './FieldRow';
import { getInputStyles } from './styles';
export interface BooleanFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  lightMode: boolean;
}
export const BooleanField: React.FC<BooleanFieldProps> = ({
  label,
  value,
  onChange,
  lightMode
}) => {
  const styles = getInputStyles(lightMode);
  return (
    <FieldRow>
      <span className={styles.label}>{label}</span>
      <Checkbox
        checked={value}
        onCheckedChange={onChange}
        lightMode={lightMode} />

    </FieldRow>);

};