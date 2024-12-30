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

const ROUND_CONSTANTS = [
  BigInt("0x00000000"), // Lowest color value
  BigInt("0xffffffff"), // Highest color value
  BigInt("0x55555555"), // 1/3
  BigInt("0xaaaaaaaa"), // 2/3
];

// just using 4 rounds seems to produce a good enough distribution to appear
// random
const ROUNDS_USED = 4;

export function indexToColor(index) {
  if (typeof index !== "bigint") {
    index = BigInt(index);
  }
  if (index < 0n) {
    throw new Error("Index must be non-negative");
  }

  // Total possible colors is 256^4
  const maxColors = 256n ** 4n;
  if (index >= maxColors) {
    throw new Error("Index out of range");
  }

  // Calculate each color channel
  const blue = index % 256n; // 0-255
  const green = (index / 256n) % 256n; // 0-255
  const red = (index / (256n ** 2n)) % 256n; // 0-255
  const alpha = (index / (256n ** 3n)) % 256n; // 0-255

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

  // Reverse the bijection formula
  return ((alpha - 1n) * (256n ** 3n)) +
    (red * (256n ** 2n)) +
    (green * 256n) +
    blue;
}

console.log(indexToColor(10n));
console.log(colorToIndex("#00000a00"))