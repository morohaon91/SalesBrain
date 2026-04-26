import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex" style={{ background: "hsl(228, 42%, 5%)" }}>

      {/* ── Left Panel — Brand ── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: "hsl(228, 42%, 5%)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(200,136,26,0.09) 0%, transparent 65%)" }}
        />
        {/* Bottom-right blob */}
        <div
          className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(80,100,255,0.05) 0%, transparent 65%)", transform: "translate(30%, 30%)" }}
        />

        <div className="relative max-w-xs w-full space-y-10">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, hsl(38,84%,61%), hsl(38,78%,46%))",
                color: "#060300",
                fontFamily: "'Cormorant', Georgia, serif",
                fontWeight: 700,
                fontSize: "20px",
              }}
            >
              ✦
            </div>
            <span
              style={{
                color: "hsl(38, 25%, 90%)",
                letterSpacing: "0.06em",
                fontFamily: "'Cormorant', Georgia, serif",
                fontWeight: 600,
                fontSize: "22px",
              }}
            >
              Concierge
            </span>
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <p
              style={{
                color: "hsl(38, 25%, 90%)",
                fontFamily: "'Cormorant', Georgia, serif",
                fontWeight: 500,
                fontSize: "clamp(28px,3vw,36px)",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              Your AI sales rep.
              <br />
              <em style={{ color: "hsl(38, 84%, 61%)", fontStyle: "italic" }}>Always on.</em>
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(228, 12%, 47%)" }}>
              Concierge qualifies leads, warms them up, and hands off hot
              opportunities — around the clock, in your voice.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3.5">
            {[
              "Learns your exact communication style",
              "Qualifies leads with AI-powered conversations",
              "Hands off hot leads the moment they're ready",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(200,136,26,0.12)", border: "1px solid rgba(200,136,26,0.25)" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "hsl(38, 84%, 61%)" }}
                  />
                </div>
                <span className="text-sm" style={{ color: "hsl(228, 12%, 65%)" }}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* Divider + tagline */}
          <div
            className="pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(228, 12%, 35%)" }}>
              Secure · AI-powered · Always On
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div
        className="w-full lg:w-[54%] flex items-center justify-center px-6 py-12"
        style={{ background: "hsl(228, 38%, 6%)" }}
      >
        <div className="w-full max-w-md">
          {/* Mobile wordmark */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex justify-center items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, hsl(38,84%,61%), hsl(38,78%,46%))",
                  color: "#060300",
                  fontFamily: "'Cormorant', Georgia, serif",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                ✦
              </div>
              <span
                style={{
                  color: "hsl(38, 25%, 90%)",
                  letterSpacing: "0.06em",
                  fontFamily: "'Cormorant', Georgia, serif",
                  fontWeight: 600,
                  fontSize: "20px",
                }}
              >
                Concierge
              </span>
            </div>
            <p className="text-sm" style={{ color: "hsl(228, 12%, 47%)" }}>
              Your AI sales rep, always on
            </p>
          </div>

          {/* Form content */}
          <div className="space-y-5">{children}</div>

          <div
            className="mt-8 pt-5 text-center text-xs"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              color: "hsl(228, 12%, 35%)",
            }}
          >
            Secure, AI-powered lead warm-up for your business
          </div>
        </div>
      </div>
    </div>
  );
}
