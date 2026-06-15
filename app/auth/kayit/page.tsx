"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EnvelopeSimple, Lock, Eye, EyeSlash, User, ArrowRight, Buildings } from "@phosphor-icons/react";

export default function KayitPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", officeName: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { setError("Şifre en az 8 karakter olmalı."); return; }
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      setError(signUpError.message === "User already registered"
        ? "Bu e-posta zaten kayıtlı. Giriş yapın."
        : "Kayıt başarısız. Lütfen tekrar deneyin.");
      setLoading(false);
      return;
    }

    if (data.user) {
      const res = await fetch("/api/auth/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data.user.id,
          full_name: form.fullName,
          email: form.email,
          office_name: form.officeName || null,
        }),
      });

      if (!res.ok) {
        setError("Hesap oluşturulamadı. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "10px 14px", paddingLeft: "34px",
    borderRadius: "8px", fontSize: "13px", outline: "none", transition: "all 0.15s",
    background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-1)",
  };

  const iconStyle: React.CSSProperties = {
    color: "var(--text-3)", position: "absolute", left: "12px",
    top: "50%", transform: "translateY(-50%)",
  };

  return (
    <div className="min-h-[100dvh] flex">
      {/* Sol panel */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden"
        style={{ background: "var(--sidebar)" }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 0%, #3b82f6 40%, #6366f1 70%, transparent 100%)" }}/>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 20% -10%, rgba(59,130,246,0.12) 0%, transparent 60%)" }}/>
        <div className="relative flex flex-col flex-1 px-12 py-10">
          <div className="flex items-center gap-2.5 mb-auto">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="text-[14px] font-bold text-white tracking-tight">Ledger</span>
          </div>
          <div className="py-16">
            <h1 className="text-[30px] font-bold leading-tight tracking-tight mb-4" style={{ color: "#e8edf5" }}>
              Dakikalar içinde<br/>başlayın.
            </h1>
            <p className="text-[14px] leading-relaxed" style={{ color: "#6b8db5" }}>
              Ücretsiz hesap oluşturun. Kredi kartı gerekmez.
            </p>
          </div>
          <div className="mt-auto pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] tracking-wide" style={{ color: "rgba(75,128,184,0.5)" }}>
              KVKK UYUMLU · AB SUNUCULARI
            </p>
          </div>
        </div>
      </div>

      {/* Sağ panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[360px] animate-fade-up">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="text-[14px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Ledger</span>
          </div>

          <h2 className="text-[22px] font-semibold tracking-tight mb-1" style={{ color: "var(--text-1)" }}>
            Hesap oluştur
          </h2>
          <p className="text-[13px] mb-7" style={{ color: "var(--text-3)" }}>
            Zaten hesabın var mı?{" "}
            <a href="/auth/giris" className="font-medium" style={{ color: "var(--accent)" }}>Giriş yap</a>
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Ad soyad */}
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Ad Soyad</label>
              <div className="relative">
                <User size={14} style={iconStyle} />
                <input type="text" required value={form.fullName} onChange={set("fullName")}
                  placeholder="Ahmet Yılmaz" style={inputBase}
                  onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                  onBlur={e  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}/>
              </div>
            </div>

            {/* Ofis adı */}
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Ofis / Büro Adı <span style={{ color: "var(--text-3)" }}>(opsiyonel)</span>
              </label>
              <div className="relative">
                <Buildings size={14} style={iconStyle} />
                <input type="text" value={form.officeName} onChange={set("officeName")}
                  placeholder="Yılmaz Mali Müşavirlik" style={inputBase}
                  onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                  onBlur={e  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}/>
              </div>
            </div>

            {/* E-posta */}
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>E-posta</label>
              <div className="relative">
                <EnvelopeSimple size={14} style={iconStyle} />
                <input type="email" required autoComplete="email" value={form.email} onChange={set("email")}
                  placeholder="ornek@firma.com" style={inputBase}
                  onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                  onBlur={e  => { e.target.style.borderColor = "var(--border)";  e.target.style.background = "var(--surface-2)"; e.target.style.boxShadow = "none"; }}/>
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Şifre</label>
              <div className="relative">
                <Lock size={14} style={iconStyle} />
                <input type={showPw ? "text" : "password"} required minLength={8}
                  autoComplete="new-password" value={form.password} onChange={set("password")}
                  placeholder="En az 8 karakter"
                  style={{ ...inputBase, paddingRight: "40px" }}
                  onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                  onBlur={e  => { e.target.style.borderColor = "var(--border)";  e.target.style.background = "var(--surface-2)"; e.target.style.boxShadow = "none"; }}/>
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}>
                  {showPw ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3.5 py-2.5 rounded-lg text-[12px]"
                style={{ background: "var(--red-bg)", border: "1px solid var(--red-lt)", color: "var(--red)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "var(--accent)", boxShadow: "0 1px 3px rgba(37,99,235,0.3), 0 2px 10px rgba(37,99,235,0.15)" }}>
              {loading ? "Hesap oluşturuluyor..." : (<>Hesap oluştur <ArrowRight size={14} weight="bold" /></>)}
            </button>
          </form>

          <p className="text-[11px] mt-5 text-center leading-relaxed" style={{ color: "var(--text-3)" }}>
            Kayıt olarak{" "}
            <span className="underline underline-offset-2 cursor-pointer">kullanım koşullarını</span>{" "}
            kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
}
