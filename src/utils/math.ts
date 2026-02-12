export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Maps a set of numbers to another set (same length arrays)
// Eg: map_range(value, [0, 10, 20], [0, 100, 1000])
export function map_range(
  value: number,
  inputRange: number[],
  outputRange: number[],
) {
  if (inputRange.length !== outputRange.length) {
    throw new Error("Input and output ranges must have the same length");
  }
  if (inputRange.length < 2) {
    throw new Error("Input and output ranges must have at least two values");
  }

  // Find the segment that contains the value
  let i = 0;
  while (i < inputRange.length - 1 && value > inputRange[i + 1]) {
    i++;
  }

  // If the value is outside the input range, clamp it to the nearest segment
  if (i === inputRange.length - 1) {
    return outputRange[outputRange.length - 1];
  }
  if (i === 0 && value < inputRange[0]) {
    return outputRange[0];
  }

  // Map the value within the segment
  const inMin = inputRange[i];
  const inMax = inputRange[i + 1];
  const outMin = outputRange[i];
  const outMax = outputRange[i + 1];

  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}
