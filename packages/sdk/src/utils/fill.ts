/** Applies only payload keys already owned by the target, preserving its declared property surface. */
export function fill<T>(this: any, payload: Partial<T> = {}) {
  for (const [key, value] of Object.entries(payload)) {
    if (this.hasOwnProperty(key)) {
      this[key] = value;
    }
  }
  return this;
}
