// for demonstration purposes only
export function intToUUID(n) {
  if (typeof n !== "bigint") {
    n = BigInt(n);
  }
  if (n < 0n || n >= 2n ** 32n) {
    throw new Error("Number must be in the range [0, 2^32 - 1]");
  }

  // Extract each color channel
  const a = (n >> 24n) & 0xffn; // 8 bits for alpha
  const r = (n >> 16n) & 0xffn;   // 8 bits for red
  const g = (n >> 8n) & 0xffn;  // 8 bits for green
  const b = n & 0xffn;           // 8 bits for blue

  const alpha = a.toString(16).padStart(2, "0");
  const red = r.toString(16).padStart(2, "0");
  const green = g.toString(16).padStart(2, "0");
  const blue = b.toString(16).padStart(2, "0");

  return `#${red}${green}${blue}${alpha}`;
}

export function indexToColor(index) {
  if (index < 0) {
    console.error("Index must be non-negative");
    return null;
  }

  if (typeof index !== "bigint") {
    index = BigInt(index);
  }

  // Total possible colors is 256^4
  const maxColors = 256n ** 4n;
  if (index >= maxColors) {
    console.error("Index out of range");
    return null;
  }

  // Calculate each color channel
  const red = index >> 24n & 0xFFn; // 0-255
  const green = index >> 16n & 0xFFn; // 0-255
  const blue = index >> 8n & 0xFFn; // 0-255
  const alpha = index & 0xFFn; // 0-255

  // console.log(index, "->", red, green, blue, alpha);

  // Convert to 2-character hex strings
  const blueHex = blue.toString(16).padStart(2, "0");
  const greenHex = green.toString(16).padStart(2, "0");
  const redHex = red.toString(16).padStart(2, "0");
  const alphaHex = alpha.toString(16).padStart(2, "0");

  // Combine into an RGBA hex string
  return `#${redHex}${greenHex}${blueHex}${alphaHex}`;
}

export function colorToIndex(color) {
  // Validate the color format
  if (!color.match(/^#[0-9a-fA-F]{8}$/)) {
    return null;
  }

  // Extract each channel as integers
  const red = BigInt(parseInt(color.slice(1, 3), 16));   // First 2 chars after #
  const green = BigInt(parseInt(color.slice(3, 5), 16)); // Next 2 chars
  const blue = BigInt(parseInt(color.slice(5, 7), 16));  // Next 2 chars
  const alpha = BigInt(parseInt(color.slice(7, 9), 16)); // Last 2 chars

  const r = red & 0xFFn;
  const g = green & 0xFFn;
  const b = blue & 0xFFn;
  const a = alpha & 0xFFn;

  return (r << 24n) + (g << 16n) + (b << 8n) + (a);
}

console.log(indexToColor(10n));
console.log(colorToIndex("#00000000"))