function hexToRgb(hex: string): [number, number, number] {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b))
      .toString(16)
      .slice(1)
  );
}

// Convert sRGB component (0-255) to linear (0-1)
function sRGBToLinear(c: number): number {
  const normalized = c / 255;
  if (normalized <= 0.04045) {
    return normalized / 12.92;
  }
  return Math.pow((normalized + 0.055) / 1.055, 2.4);
}

// Convert linear component (0-1) to sRGB (0-255)
function linearToSRGB(c: number): number {
  if (c <= 0.0031308) {
    return c * 12.92 * 255;
  }
  return (1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255;
}

export function lerpColor(a: string, b: string, amount: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);

  // Convert to linear space
  const arLinear = sRGBToLinear(ar);
  const agLinear = sRGBToLinear(ag);
  const abLinear = sRGBToLinear(ab);
  const brLinear = sRGBToLinear(br);
  const bgLinear = sRGBToLinear(bg);
  const bbLinear = sRGBToLinear(bb);

  // Interpolate in linear space
  const rrLinear = arLinear + amount * (brLinear - arLinear);
  const rgLinear = agLinear + amount * (bgLinear - agLinear);
  const rbLinear = abLinear + amount * (bbLinear - abLinear);

  // Convert back to sRGB space
  const rr = linearToSRGB(rrLinear);
  const rg = linearToSRGB(rgLinear);
  const rb = linearToSRGB(rbLinear);

  return rgbToHex(rr, rg, rb);
}
