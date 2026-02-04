export const browserConfigFormCss = `
.browserConfigForm {
  color: var(--config-text);
  font-size: 12px;
}
.browserConfigForm * {
  box-sizing: border-box;
}

.browserConfigForm .bc-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.browserConfigForm .bc-transparent {
  display: contents;
}

.browserConfigForm .bc-stage {
  border: 1px solid var(--config-border);
  border-radius: var(--radius-xl);
  background: var(--config-card-bg);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.browserConfigForm .bc-stageHeader {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.browserConfigForm .bc-stageTitle {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--config-text);
  text-wrap: balance;
}
.browserConfigForm .bc-stageMeta {
  font-size: 11px;
  color: var(--config-muted);
}

.browserConfigForm .bc-group {
  border-left: 2px solid var(--config-border-strong);
  padding-left: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}
.browserConfigForm .bc-subgroup {
  border-left: 1px solid var(--config-border);
  padding-left: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}
.browserConfigForm .bc-groupHeader {
  margin-bottom: 6px;
}
.browserConfigForm .bc-groupTitle {
  font-size: 12px;
  font-weight: 650;
  color: var(--config-text);
  text-wrap: balance;
}
.browserConfigForm .bc-groupTitle.bc-depth2 {
  font-size: 12px;
}
.browserConfigForm .bc-groupTitle.bc-depth3 {
  font-size: 11px;
  color: var(--config-text);
}
.browserConfigForm .bc-groupBody {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.browserConfigForm .bc-groupBodyCompact {
  gap: 6px;
}
.browserConfigForm .bc-groupDesc {
  margin-bottom: 6px;
}

.browserConfigForm .bc-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.browserConfigForm .bc-fieldRow {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}
.browserConfigForm .bc-fieldMeta {
  flex: 1;
  min-width: 0;
}
.browserConfigForm .bc-fieldControl {
  flex: 0 0 auto;
}
.browserConfigForm .bc-label {
  display: flex;
  gap: 6px;
  align-items: baseline;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--config-text);
  word-break: break-word;
}
.browserConfigForm .bc-required {
  color: var(--config-accent);
  font-weight: 700;
}
.browserConfigForm .bc-desc {
  font-size: 11px;
  line-height: 1.35;
  color: var(--config-muted);
  word-break: break-word;
}
.browserConfigForm .bc-errors,
.browserConfigForm .error-detail,
.browserConfigForm .errors {
  font-size: 11px;
  line-height: 1.35;
  color: var(--config-accent);
}
.browserConfigForm .bc-errors ul,
.browserConfigForm .errors ul {
  margin: 6px 0 0;
  padding-left: 18px;
}

.browserConfigForm .bc-textarea {
  width: 100%;
  min-height: 72px;
  border-radius: var(--radius-lg);
  padding: 8px 10px;
  font-size: 12px;
  color: var(--config-text);
  background: var(--config-field-bg);
  border: 1px solid var(--config-border);
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.browserConfigForm .bc-textarea:focus-visible {
  outline: none;
  border-color: var(--config-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--config-accent) 35%, transparent);
}

.browserConfigForm .bc-array {
  border: 1px solid var(--config-border);
  border-radius: var(--radius-lg);
  background: var(--config-panel-bg);
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.browserConfigForm .bc-arrayHeader {
  display: flex;
  align-items: center;
  gap: 8px;
}
.browserConfigForm .bc-arrayTitle {
  font-size: 12px;
  font-weight: 650;
  color: var(--config-text);
}
.browserConfigForm .bc-arrayItems {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.browserConfigForm .bc-arrayItem {
  border: 1px solid var(--config-border);
  border-radius: var(--radius-lg);
  background: var(--config-card-bg);
  padding: var(--spacing-sm);
}

.browserConfigForm .bc-button {
  appearance: none;
  border-radius: var(--radius-md);
  border: 1px solid var(--config-border-strong);
  background: var(--config-field-bg);
  color: var(--config-text);
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 120ms ease, background-color 120ms ease, color 120ms ease;
}
.browserConfigForm .bc-button:hover {
  border-color: var(--config-accent);
}
.browserConfigForm .bc-button:focus-visible {
  outline: 2px solid var(--config-accent);
  outline-offset: 2px;
}
.browserConfigForm .bc-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.browserConfigForm .bc-tagList {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.browserConfigForm .bc-tag {
  border-radius: 999px;
  border: 1px solid var(--config-border);
  background: var(--config-field-bg);
  padding: 4px 10px;
  font-size: 11px;
  color: var(--config-text);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 120ms ease, background-color 120ms ease, color 120ms ease;
}
.browserConfigForm .bc-tag:hover {
  border-color: var(--config-accent);
}
.browserConfigForm .bc-tagActive {
  border-color: var(--config-accent);
  background: var(--config-card-bg);
}
.browserConfigForm .bc-tag:focus-visible {
  outline: 2px solid var(--config-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .browserConfigForm .bc-button,
  .browserConfigForm .bc-tag,
  .browserConfigForm .bc-textarea {
    transition: none;
  }
}
`;
