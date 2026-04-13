/** Primary subtag, lowercase (e.g. he-IL -> he). */
export function localeBase(lang: string | undefined): string {
  if (!lang) return "en";
  const lower = lang.toLowerCase();
  return lower.split("-")[0] || "en";
}

export function isHebrewLocale(lang: string | undefined): boolean {
  return localeBase(lang) === "he";
}
