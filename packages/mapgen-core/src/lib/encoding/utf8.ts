/**
 * Encodes a JavaScript string as UTF-8 without relying on a host `TextEncoder`.
 * Core hashing uses this pure helper so embedded-runtime compatibility never
 * requires Core to mutate global state.
 */
export function encodeUtf8(input: string): Uint8Array {
  const bytes: number[] = [];

  for (let index = 0; index < input.length; index++) {
    let codePoint = input.codePointAt(index);
    if (codePoint === undefined) continue;
    if (codePoint >= 0xd800 && codePoint <= 0xdfff) codePoint = 0xfffd;
    if (codePoint > 0xffff) index++;

    if (codePoint <= 0x7f) {
      bytes.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint <= 0xffff) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    }
  }

  return new Uint8Array(bytes);
}
