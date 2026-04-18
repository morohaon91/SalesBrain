import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Brand ── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ backgroundColor: "hsl(222, 47%, 7%)" }}
      >
        {/* Subtle radial glow behind wordmark */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, hsl(38 92% 50% / 0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-xs w-full space-y-10">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div
                className="absolute inset-0 rounded-sm"
                style={{ backgroundColor: "hsl(38, 92%, 50%)", opacity: 0.2 }}
              />
              <div
                className="absolute inset-[4px] rounded-sm rotate-45"
                style={{ backgroundColor: "hsl(38, 92%, 50%)" }}
              />
            </div>
            <span
              className="text-xl font-semibold tracking-widest"
              style={{ color: "hsl(0, 0%, 96%)", letterSpacing: "0.08em" }}
            >
              CONCIERGE
            </span>
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <p
              className="text-3xl font-bold leading-tight"
              style={{ color: "hsl(0, 0%, 95%)" }}
            >
              Your AI sales rep.
              <br />
              <span style={{ color: "hsl(38, 92%, 60%)" }}>Always on.</span>
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(215, 15%, 55%)" }}>
              Concierge qualifies leads, warms them up, and hands off hot
              opportunities — around the clock, in your voice.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              "Learns your exact communication style",
              "Qualifies leads with AI-powered conversations",
              "Hands off hot leads the moment they're ready",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: "hsl(38, 92%, 50%, 0.15)" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "hsl(38, 92%, 55%)" }}
                  />
                </div>
                <span className="text-sm" style={{ color: "hsl(215, 15%, 65%)" }}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div
        className="w-full lg:w-[54%] flex items-center justify-center px-6 py-12"
        style={{ backgroundColor: "hsl(var(--background))" }}
      >
        <div className="w-full max-w-md">
          {/* Mobile wordmark */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex justify-center items-center gap-2.5 mb-3">
              <div className="relative w-8 h-8 flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-sm"
                  style={{ backgroundColor: "hsl(38, 92%, 50%)", opacity: 0.2 }}
                />
                <div
                  className="absolute inset-[3px] rounded-sm rotate-45"
                  style={{ backgroundColor: "hsl(38, 92%, 50%)" }}
                />
              </div>
              <span
                className="text-xl font-semibold tracking-widest"
                style={{ color: "hsl(var(--foreground))", letterSpacing: "0.08em" }}
              >
                CONCIERGE
              </span>
            </div>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Your AI sales rep, always on
            </p>
          </div>

          {/* Form content */}
          <div className="space-y-6">{children}</div>

          <div
            className="mt-8 pt-6 text-center text-xs"
            style={{
              borderTop: "1px solid hsl(var(--border))",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Secure, AI-powered lead warm-up for your business
          </div>
        </div>
      </div>
    </div>
  );
}
