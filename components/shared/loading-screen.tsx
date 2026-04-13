'use client';

import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/hooks/useI18n";

/**
 * Full-screen loading indicator
 */
export function LoadingScreen() {
  const { t } = useI18n("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t("loadingScreen.title")}</h2>
          <p className="text-gray-600 text-sm mt-1">{t("loadingScreen.subtitle")}</p>
        </div>
      </div>
    </div>
  );
}
