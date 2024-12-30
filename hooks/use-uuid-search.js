import React from "react";
import { colorToIndex, indexToColor } from "../lib/uuidTools";
import { MAX_UUID } from "../lib/constants";
const PADDING_SENTINEL = "X";

function getPatternWithPadding(search, leftPadding) {
  const uuidTemplate = '#00000000';
  for (let pos = 0; pos < search.length; pos++) {
    const patternPos = leftPadding + pos;
    const inputChar = search[pos];
    const templateChar = uuidTemplate[patternPos];

    if (
      (inputChar === "-" && templateChar !== "-") ||
      (templateChar === "-" && inputChar !== "-")
    ) {
      return null;
    }
  }

  const pattern =
    uuidTemplate.slice(0, leftPadding) +
    search +
    uuidTemplate.slice(leftPadding + search.length);

  const sections = pattern.split("");
  if (
    sections.length === 9
  ) {
    return pattern;
  }

  return null;
}

function getAllValidPatterns(search) {
  const patterns = [];
  const uuidTemplate = '#00000000'
  for (
    let leftPadding = 0;
    leftPadding < uuidTemplate.length - search.length + 1;
    leftPadding++
  ) {
    const pattern = getPatternWithPadding(search, leftPadding);
    if (pattern) {
      patterns.push({ pattern, leftPadding });
    }
  }

  return patterns;
}

function generateRandomUUID(pattern) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = pattern
      .replace(
        new RegExp(PADDING_SENTINEL, "g"),
        () => "0123456789abcdef"[Math.floor(Math.random() * 16)]
      );

    // Validate the generated color
    const [r, g, b, a] = [
      parseInt(result.slice(1, 3), 16),
      parseInt(result.slice(3, 5), 16),
      parseInt(result.slice(5, 7), 16),
      parseInt(result.slice(7, 9), 16),
    ];

    // Check RGB values (0–255)
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      continue;
    }

    // Check Alpha (0–255, representing 0.0–1.0 in steps of 1/255)
    if (a < 0 || a > 255) {
      continue;
    }

    return result;
  }

  // If we couldn't generate a valid color after max attempts, return a default valid color
  console.warn("Could not generate valid RGBA color after max attempts");
  return "#000000FF"; // Default: black with full opacity
}

const SEARCH_LOOKBACK = 50;
const SEARCH_LOOKAHEAD = 25;
const RANDOM_SEARCH_ITERATIONS = 100;

export function useUUIDSearch({ virtualPosition, displayedUUIDs }) {
  const [search, setSearch] = React.useState(null);
  const [uuid, setUUID] = React.useState(null);
  // Stack of complete states we've seen
  const [nextStates, setNextStates] = React.useState([]);

  const previousUUIDs = React.useMemo(() => {
    let hasComputed = false;
    let value = null;
    const getValue = () => {
      const compute = () => {
        const prev = [];
        for (let i = 1; i <= SEARCH_LOOKBACK; i++) {
          i = BigInt(i);
          let index = BigInt(virtualPosition) - i;
          if (index < 0n) {
            index = MAX_UUID + index;
          }
          const uuid = indexToColor(index);
          prev.push({ index, uuid });
        }
        return prev;
      };
      if (!hasComputed) {
        value = compute();
        hasComputed = true;
      }
      return value;
    };
    return getValue;
  }, [virtualPosition]);

  const nextUUIDs = React.useMemo(() => {
    let hasComputed = false;
    let value = null;
    const getValue = () => {
      const compute = () => {
        const next = [];
        for (let i = 1; i <= SEARCH_LOOKAHEAD; i++) {
          i = BigInt(i);
          let index = virtualPosition + i;
          if (index > MAX_UUID) {
            index = index - MAX_UUID;
          }
          const uuid = indexToColor(index);
          next.push({ index, uuid });
        }
        return next;
      };
      if (!hasComputed) {
        value = compute();
        hasComputed = true;
      }
      return value;
    };
    return getValue;
  }, [virtualPosition]);

  const searchAround = React.useCallback(
    ({ input, wantHigher, canUseCurrentIndex }) => {
      if (wantHigher) {
        const startPosition = canUseCurrentIndex ? 0 : 1;
        for (let i = startPosition; i < displayedUUIDs.length; i++) {
          const uuid = displayedUUIDs[i].uuid;
          if (uuid.includes(input)) {
            return { uuid, index: displayedUUIDs[i].index };
          }
        }
        const next = nextUUIDs();
        for (let i = 0; i < next.length; i++) {
          const uuid = next[i].uuid;
          if (uuid.includes(input)) {
            return { uuid, index: nextUUIDs[i].index };
          }
        }
      } else {
        // canUseCurrentIndex isn't relevant when searching backwards!
        const prev = previousUUIDs();
        for (const { uuid, index } of prev) {
          if (uuid.includes(input)) {
            return { uuid, index };
          }
        }
      }
      return null;
    },
    [displayedUUIDs, previousUUIDs, nextUUIDs]
  );

  const searchRandomly = React.useCallback(
    ({ input, wantHigher }) => {
      const patterns = getAllValidPatterns(input);
      if (patterns.length === 0) return null;
      let best = null;
      let compareIndex = virtualPosition;
      for (let i = 0; i < RANDOM_SEARCH_ITERATIONS; i++) {
        const { pattern, leftPadding } =
          patterns[Math.floor(Math.random() * patterns.length)];
        const uuid = generateRandomUUID(pattern);
        const index = colorToIndex(uuid);
        const satisfiesConstraint = wantHigher
          ? index > compareIndex
          : index < compareIndex;
        const notInHistory = !nextStates.some(
          ({ uuid: nextUUID }) => nextUUID === uuid
        );
        if (satisfiesConstraint && notInHistory) {
          const isBetter =
            best === null
              ? true
              : wantHigher
                ? index < best.index
                : index > best.index;
          if (isBetter) {
            best = { uuid, pattern, leftPadding, index };
          }
        }
      }
      if (best) {
        return best;
      }
      const { pattern: fallbackPattern, leftPadding: fallbackLeftPadding } =
        patterns[Math.floor(Math.random() * patterns.length)];
      return {
        uuid: generateRandomUUID(fallbackPattern),
        pattern: fallbackPattern,
        leftPadding: fallbackLeftPadding,
        index: colorToIndex(uuid),
      };
    },
    [nextStates, uuid, virtualPosition]
  );

  const searchUUID = React.useCallback(
    (input) => {
      const invalid = input.toLowerCase().replace(/[^0-9a-f]/g, "");
      if (invalid !== input) {
        return null;
      }
      const newSearch = input.toLowerCase().replace(/[^0-9a-f]/g, "");
      if (!newSearch) return null;

      // Clear next states stack when search changes
      setNextStates([]);

      const inner = () => {
        const around = searchAround({
          input,
          wantHigher: true,
          canUseCurrentIndex: true,
        });
        if (around) return around;
        return searchRandomly({ input, wantHigher: true });
      };

      const result = inner();
      if (result) {
        setSearch(newSearch);
        setUUID(result.uuid);
        setNextStates((prev) => [...prev, result]);
      }
      return result?.uuid ?? null;
    },
    [searchAround, searchRandomly]
  );

  const nextUUID = React.useCallback(() => {
    if (!uuid || !search) return null;
    const inner = () => {
      const around = searchAround({
        input: search,
        wantHigher: true,
        canUseCurrentIndex: false,
      });
      if (around) return around;
      return searchRandomly({ input: search, wantHigher: true });
    };
    const result = inner();
    if (result) {
      setUUID(result.uuid);
      setNextStates((prev) => [...prev, result]);
      return result.uuid;
    }
    return null;
  }, [uuid, search, searchAround, searchRandomly]);

  const previousUUID = React.useCallback(() => {
    if (!uuid || !search) return null;

    if (nextStates.length > 1) {
      setNextStates((prev) => prev.slice(0, -1));
      const prevState = nextStates[nextStates.length - 2];
      setUUID(prevState.uuid);
      return prevState.uuid;
    }

    const inner = () => {
      const around = searchAround({
        input: search,
        wantHigher: false,
        canUseCurrentIndex: false,
      });
      if (around) return around;
      return searchRandomly({ input: search, wantHigher: false });
    };
    const result = inner();
    if (result) {
      setUUID(result.uuid);
      return result.uuid;
    }
    return null;
  }, [uuid, search, nextStates, searchAround, searchRandomly]);

  return {
    searchUUID,
    nextUUID,
    previousUUID,
    currentUUID: uuid,
  };
}
