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

function Ring({ value, size = 72, stroke = 6 }: { value: number; size?: number; stroke?: number }) {
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
        <span className="af-mono" style={{ fontSize: size * 0.26, fontWeight: 600, color: "var(--fg)" }}>
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

function WaitlistForm() {
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
        display: "inline-flex", gap: 10, alignItems: "center",
        padding: 16, border: "1px solid var(--border)", borderRadius: 10,
      }}>
        <span style={{ color: "oklch(0.72 0.15 135)" }}><CheckIcon size={18} /></span>
        <span style={{ fontSize: 14 }}>You&apos;re on the list. Next cohort opens May 15.</span>
      </div>
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
        <button
          type="submit"
          disabled={status === "loading"}
          className="af-btn af-btn-primary"
          style={{ padding: "14px 22px", fontSize: 15 }}
        >
          {status === "loading" ? "Joining…" : <><span>Join waitlist</span><ChevronRight size={14} /></>}
        </button>
      </div>
      {errorMsg && <p style={{ marginTop: 8, fontSize: 13, color: "oklch(0.64 0.19 27)" }}>{errorMsg}</p>}
    </form>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)" }}>

        {/* Nav */}
        <nav style={{
          padding: "20px 56px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: "var(--fg)",
              color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BoltIcon size={15} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>AmakaFlow</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href="#how" className="af-btn af-btn-ghost" style={{ fontSize: 13, padding: "6px 12px" }}>How it works</a>
            <a href="#pricing" className="af-btn af-btn-ghost" style={{ fontSize: 13, padding: "6px 12px" }}>Pricing</a>
            <a href="#waitlist" className="af-btn af-btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
              Join waitlist
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section style={{
          padding: "72px 56px 56px",
          display: "grid", gridTemplateColumns: "1.15fr 1fr",
          gap: 56, alignItems: "center",
          maxWidth: 1280, margin: "0 auto",
        }}>
          <div>
            <div className="af-chip af-chip-outline" style={{ marginBottom: 20 }}>
              <span className="af-dot af-dot-high" />
              NOW IN BETA · 1,482 ATHLETES
            </div>
            <h1 style={{
              fontSize: 68, fontWeight: 600, letterSpacing: "-0.025em",
              lineHeight: 1.02, margin: 0, color: "var(--fg)",
            }}>
              Train on the<br />right day.
            </h1>
            <p style={{
              fontSize: 17, lineHeight: 1.55, marginTop: 24,
              maxWidth: 520, color: "var(--fg-muted)",
            }}>
              An AI coach for hybrid athletes. Every morning, your plan adapts to HRV, sleep, and yesterday&apos;s training load — so you push when you&apos;re ready and recover when you&apos;re not.
            </p>

            <div id="waitlist" style={{ marginTop: 32 }}>
              <WaitlistForm />
            </div>
            <p className="af-mono" style={{ fontSize: 11, marginTop: 14, color: "var(--fg-muted)" }}>
              FREE TRIAL · CANCEL ANYTIME · GARMIN + APPLE WATCH
            </p>
          </div>

          {/* Product preview */}
          <div style={{
            background: "var(--bg-subtle)", padding: 36, borderRadius: 20,
            border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <Ring value={84} size={72} stroke={6} />
              <div>
                <div className="af-label">READINESS · THU · 6:14 AM</div>
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.005em", marginTop: 4 }}>
                  Ready
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 3 }}>
                  HRV +8 · Sleep 7h 42m
                </div>
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
              {[true, true, true, false, false, false, false].map((done, i) => (
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
        </section>

        {/* How it works */}
        <section id="how" style={{
          padding: "40px 56px",
          borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="af-label" style={{ marginBottom: 20 }}>HOW IT WORKS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48 }}>
              {[
                ["01", "Wear your watch", "Sync Garmin or Apple Watch. We read HRV, resting HR, sleep, and training load every morning."],
                ["02", "Answer 5 questions", "Goal, hours per week, modalities, experience, injuries. Under two minutes."],
                ["03", "Train on the right day", "At 6am, your plan reshapes. Push when fresh, swap when tired, always progress safely."],
              ].map(([n, t, d]) => (
                <div key={n}>
                  <div className="af-mono" style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 10 }}>{n}</div>
                  <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.005em" }}>{t}</div>
                  <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 8, lineHeight: 1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{
          padding: "56px 56px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="af-label" style={{ marginBottom: 20 }}>PRICING</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, maxWidth: 600 }}>
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
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{label}</span>
                    {badge && (
                      <span style={{
                        background: "var(--fg)", color: "var(--bg)",
                        fontSize: 9, fontWeight: 600, padding: "2px 6px",
                        borderRadius: 9999, fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
                      }}>{badge}</span>
                    )}
                  </div>
                  <div className="af-mono" style={{ fontSize: 24, fontWeight: 600 }}>{price}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: "24px 56px",
          display: "flex", justifyContent: "space-between",
          color: "var(--fg-muted)", fontSize: 11, fontFamily: "var(--font-mono)",
        }}>
          <span>© 2026 AMAKAFLOW</span>
          <span>PRIVACY · TERMS · SUPPORT</span>
        </footer>
      </div>
    </Suspense>
  );
}
