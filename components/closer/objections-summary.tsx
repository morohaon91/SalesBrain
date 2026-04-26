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

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
};

export function ObjectionsSummary({ objectionsRaised, objectionsHandled }: Props) {
  if (objectionsRaised.length === 0) {
    return (
      <div className="rounded-xl p-4" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
        <p className="text-sm font-medium" style={{ color: '#4ade80' }}>
          ✅ No objections raised - smooth conversation!
        </p>
      </div>
    );
  }

  const handled = objectionsRaised.filter((obj) => objectionsHandled[obj]?.handled);

  return (
    <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: C.fg }}>Objections Raised</h3>
        <span className="text-xs font-medium" style={{ color: C.muted }}>
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
              className="rounded-xl p-3 transition-colors"
              style={{
                background: isHandled ? 'rgba(74,222,128,0.06)' : 'rgba(249,115,22,0.06)',
                border: `1px solid ${isHandled ? 'rgba(74,222,128,0.15)' : 'rgba(249,115,22,0.15)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm capitalize" style={{ color: C.fg }}>
                  {objection.replace(/_/g, " ")}
                </span>
                {isHandled ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>
                    ✓ Handled
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c' }}>
                    ⚠️ Unresolved
                  </span>
                )}
              </div>

              {objData?.howHandled && (
                <p className="text-sm" style={{ color: C.muted }}>{objData.howHandled}</p>
              )}

              {!isHandled && (
                <p className="text-xs mt-2 font-medium" style={{ color: '#fb923c' }}>
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
