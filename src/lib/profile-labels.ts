const profileLabelAliases = new Map<string, string>([
  ["Mature prostitutes in Barcelona", "Mature companion in Barcelona"],
]);

const legacyCurrencyPattern = new RegExp(String.fromCharCode(0x20ac), "g");
const roseCurrencySymbol = "🌹";

export const normalizeProfileLabel = (value: string) =>
  (profileLabelAliases.get(value.trim()) ?? value.trim()).replace(
    legacyCurrencyPattern,
    roseCurrencySymbol
  );
