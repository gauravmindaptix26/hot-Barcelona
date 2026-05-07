const profileLabelAliases = new Map<string, string>([
  ["Mature prostitutes in Barcelona", "Mature companion in Barcelona"],
]);

export const normalizeProfileLabel = (value: string) =>
  profileLabelAliases.get(value.trim()) ?? value.trim();
