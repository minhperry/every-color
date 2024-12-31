export function indexToColor(n) {
  if (n < 0n || n >= 2n ** 32n) {
    throw new Error("Number must be between 0 and 2^32-1");
  }

  // Constants
  const PRIME1 = 2654435761n;
  const PRIME2 = 2246822519n;
  const PRIME3 = 3266489917n;
  const PRIME4 = 668265263n;
  const MASK = (1n << 32n) - 1n;

  function rotateLeft(x, r) {
    return ((x << r) | (x >> (32n - r))) & MASK;
  }

  let x = BigInt(n);
  x = x ^ PRIME1;
  x = rotateLeft(x, 13n);
  x = (x * PRIME2) & MASK;
  x = rotateLeft(x, 17n);
  x = x ^ PRIME3;
  x = rotateLeft(x, 5n);
  x = (x * PRIME4) & MASK;

  return `#${x.toString(16).padStart(8, '0')}`;
}

export function colorToIndex(color) {
  if (!color.match(/^#[0-9a-f]{8}$/)) {
    return null;
  }

  const PRIME1 = 2654435761n;
  const PRIME2 = 2246822519n;
  const PRIME3 = 3266489917n;
  const PRIME4 = 668265263n;
  const MASK = (1n << 32n) - 1n;

  function rotateRight(x, r) {
    return ((x >> r) | (x << (32n - r))) & MASK;
  }

  function modInverse(a, m) {
    let [old_r, r] = [a, m];
    let [old_s, s] = [1n, 0n];

    while (r !== 0n) {
      const quotient = old_r / r;
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
    }
    return (old_s + m) % m;
  }

  let x = BigInt(`0x${color.slice(1)}`);

  x = (x * modInverse(PRIME4, 1n << 32n)) & MASK;
  x = rotateRight(x, 5n);
  x = x ^ PRIME3;
  x = rotateRight(x, 17n);
  x = (x * modInverse(PRIME2, 1n << 32n)) & MASK;
  x = rotateRight(x, 13n);
  x = x ^ PRIME1;

  return x;
}

export function colorToRGBA(color) {
  // Validate the color format
  if (!color.match(/^#[0-9a-f]{8}$/)) {
    return null;
  }

  // Extract each channel as integers
  const red = parseInt(color.slice(1, 3), 16).toString().padStart(3, '0');
  const green = parseInt(color.slice(3, 5), 16).toString().padStart(3, '0');
  const blue = parseInt(color.slice(5, 7), 16).toString().padStart(3, '0');
  const alpha = parseInt(color.slice(7, 9), 16); // Last 2 chars

  return `rgb(${red} ${green} ${blue} / ${(alpha / 255).toFixed(4)})`;
}