"use client";

interface ObjectionData {
  raised: boolean;
  handled?: boolean;
  howHandled?: string;
}

interface Props {
  objectionsRaised: string[];
  objectionsHandled: Record<string, ObjectionData>;
}

export function ObjectionsSummary({ objectionsRaised, objectionsHandled }: Props) {
  if (objectionsRaised.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm font-medium text-green-800">
          ✅ No objections raised - smooth conversation!
        </p>
      </div>
    );
  }

  const handled = objectionsRaised.filter((obj) => objectionsHandled[obj]?.handled);
  const unresolved = objectionsRaised.filter((obj) => !objectionsHandled[obj]?.handled);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Objections Raised</h3>
        <span className="text-xs font-medium text-gray-600">
          {handled.length}/{objectionsRaised.length} handled
        </span>
      </div>

      <div className="space-y-3">
        {objectionsRaised.map((objection) => {
          const objData = objectionsHandled[objection];
          const isHandled = objData?.handled;

          return (
            <div
              key={objection}
              className={`
              border rounded-lg p-3 transition-colors
              ${
                isHandled
                  ? "border-green-200 bg-green-50/50"
                  : "border-orange-200 bg-orange-50/50"
              }
            `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm capitalize text-gray-900">
                  {objection.replace(/_/g, " ")}
                </span>
                {isHandled ? (
                  <span className="text-xs font-semibold text-green-700 bg-green-200/60 px-2 py-1 rounded-full">
                    ✓ Handled
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-orange-700 bg-orange-200/60 px-2 py-1 rounded-full">
                    ⚠️ Unresolved
                  </span>
                )}
              </div>

              {objData?.howHandled && (
                <p className="text-sm text-gray-700">{objData.howHandled}</p>
              )}

              {!isHandled && (
                <p className="text-xs text-orange-700 mt-2 font-medium">
                  💡 Follow up on this during your call
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
