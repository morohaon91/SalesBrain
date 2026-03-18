import { Loader2 } from "lucide-react";

/**
 * Full-screen loading indicator
 */
export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Loading</h2>
          <p className="text-gray-600 text-sm mt-1">
            Setting up your dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}
