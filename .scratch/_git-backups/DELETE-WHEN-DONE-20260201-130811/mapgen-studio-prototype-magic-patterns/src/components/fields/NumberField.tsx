import React from 'react';
// ============================================================================
// NUMBER FIELD
// ============================================================================
// Numeric input field with label.
// ============================================================================
import { Input } from '../ui';
import { FieldRow } from './FieldRow';
import { getInputStyles } from './styles';
export interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  lightMode: boolean;
  step?: number;
}
export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  lightMode,
  step
}) => {
  const styles = getInputStyles(lightMode);
  const computedStep = step ?? (value % 1 !== 0 ? 0.01 : 1);
  return (
    <FieldRow>
      <span className={styles.label}>{label}</span>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={computedStep}
        lightMode={lightMode}
        className="w-20 text-right" />

    </FieldRow>);

};