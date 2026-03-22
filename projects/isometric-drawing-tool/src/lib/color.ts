export function withOpacity(color: string, opacity: number) {
  const normalized = color.trim();
  if (!normalized.startsWith("#")) {
    return color;
  }

  const hex = normalized.slice(1);
  const expanded = hex.length === 3 ? hex.split("").map((char) => `${char}${char}`).join("") : hex;

  if (expanded.length !== 6) {
    return color;
  }

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}
