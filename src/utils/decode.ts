export function base64ToUtf8(string: string) {
  return new Uint8Array(
    atob(string)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
}

export function utf8ToUtf16(uint8Array: Uint8Array) {
  const decoder = new TextDecoder();
  return decoder.decode(uint8Array);
}

/**
 * Return the JSON for a tokenUri
 */
export function decodeTokenData(tokenUri: string) {
  const data = tokenUri.replace("data:application/json;base64,", "");
  return JSON.parse(utf8ToUtf16(base64ToUtf8(data)));
}

/**
 * If you need the SVG in string form for some reason, call:
 *
 * `decodeGeneratedImage(decodedTokenData(...).image)`
 *
 * But many things accept the base64 encoded version
 */
export function decodeGeneratedImage(uri) {
  const data = uri.replace("data:image/svg+xml;base64,", "");
  return utf8ToUtf16(base64ToUtf8(data));
}
