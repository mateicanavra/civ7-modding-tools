import React from 'react';
// ============================================================================
// STRING FIELD
// ============================================================================
// Text input field with label.
// ============================================================================
import { Input } from '../ui';
import { FieldRow } from './FieldRow';
import { getInputStyles } from './styles';
export interface StringFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  lightMode: boolean;
  placeholder?: string;
}
export const StringField: React.FC<StringFieldProps> = ({
  label,
  value,
  onChange,
  lightMode,
  placeholder
}) => {
  const styles = getInputStyles(lightMode);
  return (
    <FieldRow>
      <span className={styles.label}>{label}</span>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        lightMode={lightMode}
        className="flex-1 max-w-[120px]" />

    </FieldRow>);

};