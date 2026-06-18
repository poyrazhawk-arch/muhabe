"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, CheckCircle, ArrowRight } from "@phosphor-icons/react";

export default function SifremiGuncellePage() {
  const [password,  setPassword]  = useState("");
  const [password2, setPassword2] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");

  const supabase = createClient();
  const router   = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) { setError("Passwords do not match."); return; }
    if (password.length < 8)    { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message === "Auth session missing"
        ? "Session expired. Please request a new password reset link."
        : error.message
      );
    } else {
      setDone(true);
      // 2 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => router.push("/auth/giris"), 2000);
    }
    setLoading(false);
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    transition: "all 0.15s",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-1)",
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-8" style={{ background: "#f8f9fb" }}>
      <div className="w-full max-w-[360px]">
        {done ? (
          <div className="text-center animate-fade-up">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "var(--green-bg)", border: "1px solid var(--green-lt)" }}>
              <CheckCircle size={28} weight="fill" style={{ color: "var(--green)" }} />
            </div>
            <h2 className="text-[18px] font-semibold mb-2" style={{ color: "var(--text-1)" }}>Password updated</h2>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
              You can now sign in with your new password.
            </p>
            <a href="/auth/giris"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white"
              style={{ background: "var(--accent)" }}>
              Sign in <ArrowRight size={13} weight="bold" />
            </a>
          </div>
        ) : (
          <div className="animate-fade-up">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-lt)" }}>
              <Lock size={20} weight="duotone" style={{ color: "var(--accent)" }} />
            </div>
            <h2 className="text-[22px] font-semibold tracking-tight mb-1" style={{ color: "var(--text-1)" }}>
              Set new password
            </h2>
            <p className="text-[13px] mb-7" style={{ color: "var(--text-3)" }}>
              Create a new password for your account.
            </p>

            <div className="rounded-xl p-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                    New password
                  </label>
                  <input type="password" required minLength={8}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="input-base"
                    onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                    Confirm password
                  </label>
                  <input type="password" required
                    value={password2} onChange={e => setPassword2(e.target.value)}
                    placeholder="Repeat your password"
                    className="input-base"
                    onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
                </div>

                {error && (
                  <div className="px-3.5 py-2.5 rounded-lg text-[12px]"
                    style={{ background: "var(--red-bg)", border: "1px solid var(--red-lt)", color: "var(--red)" }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ background: "var(--accent)" }}>
                  {loading ? "Saving…" : "Save password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
