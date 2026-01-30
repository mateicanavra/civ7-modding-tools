export const browserConfigFormCss = `
.browserConfigForm {
  color: #e5e7eb;
}
.browserConfigForm * {
  box-sizing: border-box;
}

.browserConfigForm .bc-depth2Group + .bc-depth2Group {
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  margin-top: 14px;
  padding-top: 14px;
}
.browserConfigForm .bc-subsection:not(.bc-depth2Group) + .bc-subsection:not(.bc-depth2Group) {
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  margin-top: 12px;
  padding-top: 12px;
}

.browserConfigForm .bc-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 12px 0;
}
.browserConfigForm .bc-label {
  display: flex;
  gap: 6px;
  align-items: baseline;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.01em;
  color: #e5e7eb;
}
.browserConfigForm .bc-required {
  color: #fca5a5;
  font-weight: 700;
}
.browserConfigForm .bc-desc {
  font-size: 12px;
  line-height: 1.35;
  color: #9ca3af;
}
.browserConfigForm .bc-errors,
.browserConfigForm .error-detail,
.browserConfigForm .errors {
  font-size: 12px;
  line-height: 1.35;
  color: #fca5a5;
}
.browserConfigForm .bc-errors ul,
.browserConfigForm .errors ul {
  margin: 6px 0 0;
  padding-left: 18px;
}

.browserConfigForm input,
.browserConfigForm select,
.browserConfigForm textarea {
  width: 100%;
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(17, 24, 39, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #e5e7eb;
  font-size: 13px;
}
.browserConfigForm input[type="checkbox"] {
  width: 16px;
  height: 16px;
  padding: 0;
  border-radius: 4px;
}
.browserConfigForm input:focus,
.browserConfigForm select:focus,
.browserConfigForm textarea:focus {
  outline: none;
  border-color: rgba(96, 165, 250, 0.75);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.22);
}
.browserConfigForm input:disabled,
.browserConfigForm select:disabled,
.browserConfigForm textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.browserConfigForm .bc-section {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: rgba(2, 6, 23, 0.4);
  padding: 10px 10px;
  margin: 0 0 10px 0;
}
.browserConfigForm .bc-stageTitle {
  font-size: 16px;
  font-weight: 750;
  letter-spacing: 0.01em;
  color: #e5e7eb;
}
.browserConfigForm .bc-stageDivider {
  height: 1px;
  background: rgba(148, 163, 184, 0.14);
  margin: 8px 0 12px;
}
.browserConfigForm .bc-section summary {
  cursor: pointer;
  user-select: none;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.browserConfigForm .bc-section summary::after {
  content: "▸";
  color: rgba(148, 163, 184, 0.85);
  font-size: 12px;
  transform: rotate(0deg);
  transition: transform 120ms ease;
}
.browserConfigForm details[open].bc-section summary::after {
  transform: rotate(90deg);
}
.browserConfigForm details.bc-subsection summary::after {
  content: "▸";
  color: rgba(148, 163, 184, 0.85);
  font-size: 12px;
  transform: rotate(0deg);
  transition: transform 120ms ease;
}
.browserConfigForm details[open].bc-subsection summary::after {
  transform: rotate(90deg);
}
.browserConfigForm .bc-section summary::-webkit-details-marker {
  display: none;
}
.browserConfigForm .bc-sectionTitle {
  font-size: 14px;
  font-weight: 700;
  color: #e5e7eb;
}
.browserConfigForm .bc-sectionTitle.bc-depth2 {
  font-size: 14px;
}
.browserConfigForm .bc-sectionTitle.bc-depth3 {
  font-size: 13px;
  color: rgba(229, 231, 235, 0.92);
}
.browserConfigForm .bc-sectionMeta {
  font-size: 11px;
  color: #9ca3af;
}
.browserConfigForm .bc-subsection {
  margin: 0 0 12px 0;
  padding: 0;
  border: 0;
  background: transparent;
}
.browserConfigForm .bc-subsectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 6px 0;
}
.browserConfigForm .bc-subsectionTitle {
  font-size: 13px;
  font-weight: 750;
  color: #e5e7eb;
  letter-spacing: 0.01em;
  text-transform: none;
}

.browserConfigForm .bc-arrayItem {
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.38);
  padding: 10px;
  margin: 0 0 10px 0;
}
.browserConfigForm .bc-actionsRow {
  display: flex;
  gap: 8px;
  align-items: center;
}
.browserConfigForm button {
  appearance: none;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(17, 24, 39, 0.85);
  color: #e5e7eb;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}
.browserConfigForm button:hover {
  border-color: rgba(148, 163, 184, 0.45);
  background: rgba(31, 41, 55, 0.85);
}
.browserConfigForm button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`;
