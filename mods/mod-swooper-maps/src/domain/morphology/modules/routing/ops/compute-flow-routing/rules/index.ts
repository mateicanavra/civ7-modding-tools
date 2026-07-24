/**
 * Computes flow accumulation with a high-to-low elevation pass.
 */
export function computeFlowAccumulation(
  elevation: Int16Array,
  landMask: Uint8Array,
  flowDir: Int32Array
): Float32Array {
  const size = elevation.length;
  const indices: number[] = [];
  for (let i = 0; i < size; i++) {
    if (landMask[i] === 1) indices.push(i);
  }
  indices.sort((a, b) => elevation[b] - elevation[a]);

  const flowAccum = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    flowAccum[i] = landMask[i] === 1 ? 1 : 0;
  }
  for (const i of indices) {
    const dest = flowDir[i];
    if (dest >= 0 && landMask[dest] === 1) {
      flowAccum[dest] += flowAccum[i];
    }
  }
  return flowAccum;
}
