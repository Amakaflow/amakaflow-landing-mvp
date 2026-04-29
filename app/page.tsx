"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function BoltIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M9 2L4 9h5l-2 5 7-7H9l2-5z" fill="currentColor" />
    </svg>
  );
}

function ChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Ring({ value, size = 56, stroke = 5 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (value / 100);
  const cx = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="oklch(0.72 0.15 135)" strokeWidth={stroke}
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <span className="af-mono" style={{ fontSize: size * 0.28, fontWeight: 600, color: "var(--fg)" }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function trackConversion(ref: string | null) {
  if (typeof window !== "undefined" && typeof (window as unknown as { plausible?: (e: string, o?: object) => void }).plausible === "function") {
    (window as unknown as { plausible: (e: string, o?: object) => void }).plausible("WaitlistSignup", { props: { referral_source: ref ?? "direct" } });
  }
}

function WaitlistForm({ layout }: { layout: "mobile" | "desktop" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    const ref = searchParams.get("r") || null;
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}/api/waitlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, referral_source: ref }),
        });
        if (!res.ok) throw new Error(await res.text());
      }
      trackConversion(ref);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div style={{
        display: "flex", gap: 10, alignItems: "flex-start",
        padding: 14, border: "1px solid var(--border)", borderRadius: 10,
      }}>
        <span style={{ color: "oklch(0.72 0.15 135)", flexShrink: 0 }}><CheckIcon size={18} /></span>
        <span style={{ fontSize: 13 }}>You&apos;re on the list. We&apos;ll email when your spot opens.</span>
      </div>
    );
  }

  if (layout === "mobile") {
    return (
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="af-input"
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={status === "loading"} className="af-btn af-btn-primary"
            style={{ padding: "10px 16px", fontSize: 13, flexShrink: 0 }}>
            {status === "loading" ? "…" : <><span>Join</span><ChevronRight size={12} /></>}
          </button>
        </div>
        {errorMsg && <p style={{ marginTop: 8, fontSize: 12, color: "oklch(0.64 0.19 27)" }}>{errorMsg}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: 10, maxWidth: 480 }}>
        <input
          className="af-input"
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ flex: 1, padding: "14px 16px", fontSize: 14 }}
        />
        <button type="submit" disabled={status === "loading"} className="af-btn af-btn-primary"
          style={{ padding: "14px 22px", fontSize: 15, flexShrink: 0 }}>
          {status === "loading" ? "Joining…" : <><span>Join waitlist</span><ChevronRight size={14} /></>}
        </button>
      </div>
      {errorMsg && <p style={{ marginTop: 8, fontSize: 13, color: "oklch(0.64 0.19 27)" }}>{errorMsg}</p>}
    </form>
  );
}

const HOW_IT_WORKS = [
  ["01", "Wear your watch", "Sync Garmin or Apple Watch. We read HRV, resting HR, sleep, and training load every morning."],
  ["02", "Answer 5 questions", "Goal, hours per week, modalities, experience, injuries. Under two minutes."],
  ["03", "Train on the right day", "At 6am, your plan reshapes. Push when fresh, swap when tired, always progress safely."],
] as const;

const WEEK_DAYS = [true, true, true, false, false, false, false];

export default function Page() {
  return (
    <Suspense fallback={null}>
      <>
        {/* ── Responsive styles ── */}
        <style>{`
          .af-nav-links { display: flex; }
          .af-hero { display: grid; grid-template-columns: 1.15fr 1fr; gap: 56px; align-items: center; padding: 72px 56px 56px; }
          .af-hero-title { font-size: 68px; }
          .af-preview { display: block; }
          .af-how-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 48px; }
          .af-pricing-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; max-width: 600px; }
          .af-section-pad { padding: 40px 56px; }
          .af-footer { padding: 24px 56px; }
          @media (max-width: 768px) {
            .af-nav-links { display: none; }
            .af-nav-join { padding: 7px 14px !important; font-size: 12px !important; }
            .af-hero { display: block; padding: 40px 24px 14px; }
            .af-hero-title { font-size: 36px; }
            .af-preview { display: none; }
            .af-how-grid { grid-template-columns: 1fr; gap: 0; }
            .af-pricing-grid { grid-template-columns: 1fr; max-width: 100%; }
            .af-section-pad { padding: 28px 24px; }
            .af-footer { padding: 20px 24px; flex-direction: column; gap: 8px; }
          }
        `}</style>

        <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)" }}>

          {/* Nav */}
          <nav style={{
            padding: "18px 24px", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7, background: "var(--fg)",
                color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BoltIcon size={13} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>AmakaFlow</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div className="af-nav-links" style={{ gap: 20, marginRight: 8 }}>
                <a href="#how" className="af-btn af-btn-ghost" style={{ fontSize: 13, padding: "6px 0" }}>How it works</a>
                <a href="#pricing" className="af-btn af-btn-ghost" style={{ fontSize: 13, padding: "6px 0" }}>Pricing</a>
              </div>
              <a href="#waitlist" className="af-btn af-btn-primary af-nav-join" style={{ padding: "8px 18px", fontSize: 13 }}>
                Join waitlist
              </a>
            </div>
          </nav>

          {/* Hero — desktop: 2-col grid, mobile: stacked */}
          <section className="af-hero" style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div>
              <div className="af-chip af-chip-outline" style={{ marginBottom: 16 }}>
                <span className="af-dot af-dot-high" />
                <span>NOW IN BETA · 1,482 ATHLETES</span>
              </div>
              <h1 className="af-hero-title" style={{
                fontWeight: 600, letterSpacing: "-0.025em",
                lineHeight: 1.02, margin: 0, color: "var(--fg)",
              }}>
                Train on the<br />right day.
              </h1>
              <p style={{
                fontSize: 15, lineHeight: 1.55, marginTop: 14,
                color: "var(--fg-muted)", maxWidth: 520,
              }}>
                An AI coach for hybrid athletes. Every morning, your plan adapts to HRV, sleep, and yesterday&apos;s training load — so you push when you&apos;re ready and recover when you&apos;re not.
              </p>

              {/* Mobile preview (between text and form on mobile) */}
              <div className="af-preview" style={{ display: "none", margin: "24px 0" }} id="mobile-preview">
                <MobilePreview />
              </div>
              <style>{`@media(max-width:768px){#mobile-preview{display:block!important}}`}</style>

              <div id="waitlist" style={{ marginTop: 20 }}>
                {/* Show compact form on mobile, full form on desktop */}
                <div className="mobile-form"><WaitlistForm layout="mobile" /></div>
                <div className="desktop-form"><WaitlistForm layout="desktop" /></div>
                <style>{`
                  .mobile-form{display:none}
                  .desktop-form{display:block}
                  @media(max-width:768px){.mobile-form{display:block}.desktop-form{display:none}}
                `}</style>
              </div>
              <p className="af-mono" style={{ fontSize: 10, marginTop: 10, color: "var(--fg-muted)" }}>
                1,482 ATHLETES ON WAITLIST · NEXT COHORT MAY 15
              </p>
            </div>

            {/* Desktop-only preview card */}
            <div className="af-preview">
              <DesktopPreview />
            </div>
          </section>

          {/* How it works */}
          <section id="how" className="af-section-pad" style={{
            borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <div className="af-label" style={{ marginBottom: 16 }}>HOW IT WORKS</div>
              <div className="af-how-grid">
                {HOW_IT_WORKS.map(([n, t, d]) => (
                  <div key={n} style={{ padding: "16px 0", borderTop: "1px solid var(--border)" }}>
                    <div className="af-mono" style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 8 }}>{n}</div>
                    <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.005em" }}>{t}</div>
                    <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 6, lineHeight: 1.6 }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="af-section-pad" style={{ borderBottom: "1px solid var(--border)" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <div className="af-label" style={{ marginBottom: 16 }}>PRICING</div>
              <div className="af-pricing-grid">
                {[
                  { label: "Annual", price: "$89.99", sub: "$7.50/mo", badge: "SAVE 42%" },
                  { label: "Monthly", price: "$12.99", sub: "7-day trial", badge: null },
                ].map(({ label, price, sub, badge }) => (
                  <div key={label} style={{
                    padding: 20, borderRadius: 12,
                    border: "1px solid var(--border-str)",
                    background: "var(--bg-elev)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
                      {badge && (
                        <span style={{
                          background: "var(--fg)", color: "var(--bg)",
                          fontSize: 9, fontWeight: 600, padding: "2px 6px",
                          borderRadius: 9999, fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
                        }}>{badge}</span>
                      )}
                    </div>
                    <div className="af-mono" style={{ fontSize: 22, fontWeight: 600 }}>{price}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "var(--font-mono)", marginTop: 3 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="af-footer" style={{
            display: "flex", justifyContent: "space-between",
            color: "var(--fg-muted)", fontSize: 11, fontFamily: "var(--font-mono)",
          }}>
            <span>© 2026 AMAKAFLOW</span>
            <span>PRIVACY · TERMS · SUPPORT</span>
          </footer>
        </div>
      </>
    </Suspense>
  );
}

function MobilePreview() {
  return (
    <div style={{
      padding: 20, background: "var(--bg-subtle)",
      borderRadius: 14, border: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <Ring value={84} size={56} stroke={5} />
        <div>
          <div className="af-label">READINESS · TODAY</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>Ready</div>
        </div>
      </div>
      <div style={{
        padding: "12px 14px", background: "var(--bg-elev)",
        border: "1px solid var(--border)", borderRadius: 8,
      }}>
        <div className="af-label" style={{ fontSize: 9 }}>THRESHOLD RUN</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }}>4×8 min @ threshold</div>
        <div className="af-mono" style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 4 }}>64m · Z3–4 · TSS 78</div>
      </div>
    </div>
  );
}

function DesktopPreview() {
  return (
    <div style={{
      background: "var(--bg-subtle)", padding: 36, borderRadius: 20,
      border: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <Ring value={84} size={72} stroke={6} />
        <div>
          <div className="af-label">READINESS · THU · 6:14 AM</div>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.005em", marginTop: 4 }}>Ready</div>
          <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 3 }}>HRV +8 · Sleep 7h 42m</div>
        </div>
      </div>
      <div style={{
        padding: "16px 18px", background: "var(--bg-elev)",
        border: "1px solid var(--border)", borderRadius: 10, marginBottom: 10,
      }}>
        <div className="af-label" style={{ fontSize: 10 }}>TODAY · THRESHOLD RUN</div>
        <div style={{ fontSize: 18, fontWeight: 500, marginTop: 5, letterSpacing: "-0.005em" }}>
          4×8 min @ threshold
        </div>
        <div className="af-mono" style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 5 }}>
          64m · Z3–4 · TSS 78 · IF 0.87
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginTop: 14 }}>
        {WEEK_DAYS.map((done, i) => (
          <div key={i} style={{
            aspectRatio: "1", borderRadius: 6,
            background: done ? "var(--accent-bg)" : "transparent",
            border: done ? "none" : "1px dashed var(--border-str)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--fg-muted)",
          }}>
            {done && <CheckIcon size={12} />}
          </div>
        ))}
      </div>
    </div>
  );
}
