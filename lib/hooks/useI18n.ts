import { useTranslation } from "react-i18next";
import { localeBase } from "@/lib/i18n/locale";

export function useI18n(namespace?: string | string[]) {
  const { t, i18n } = useTranslation(namespace);

  const language = i18n.language || "en";
  const base = localeBase(i18n.resolvedLanguage ?? i18n.language);
  const dir = base === "he" ? "rtl" : "ltr";

  return {
    t,
    i18n,
    language,
    dir,
    isHebrew: base === "he",
    isEnglish: base === "en",
  };
}
