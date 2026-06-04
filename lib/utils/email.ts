import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "info@nixtagency.com";

export async function sendBelgeYuklemeBildirimi({
  to,
  musteriAdi,
  belgeAdi,
  belgeUrl,
}: {
  to: string;
  musteriAdi: string;
  belgeAdi: string;
  belgeUrl: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Yeni belge yüklendi: ${musteriAdi}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1e3a5f;margin-bottom:8px">Yeni Belge Yüklendi</h2>
        <p style="color:#444;margin-bottom:16px">
          <strong>${musteriAdi}</strong> yeni bir belge yükledi.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px">
          <p style="margin:0;color:#64748b;font-size:14px">Belge adı</p>
          <p style="margin:4px 0 0;font-weight:600;color:#1e293b">${belgeAdi}</p>
        </div>
        <a href="${belgeUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">
          Belgeyi İncele
        </a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">
          Muhasebe İş Akışı Sistemi
        </p>
      </div>
    `,
  });
}

export async function sendHatirlatma({
  to,
  gorevBasligi,
  musteriAdi,
  sonTarih,
  kalanGun,
}: {
  to: string;
  gorevBasligi: string;
  musteriAdi?: string;
  sonTarih: string;
  kalanGun: number;
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Hatırlatma: ${gorevBasligi} — ${kalanGun} gün kaldı`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1e3a5f;margin-bottom:8px">Görev Hatırlatması</h2>
        <p style="color:#444">
          <strong>${gorevBasligi}</strong> görevinin son tarihi yaklaşıyor.
        </p>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0">
          ${musteriAdi ? `<p style="margin:0 0 4px;color:#92400e;font-size:14px">Müşteri: <strong>${musteriAdi}</strong></p>` : ""}
          <p style="margin:0;color:#92400e;font-size:14px">Son tarih: <strong>${sonTarih}</strong></p>
          <p style="margin:4px 0 0;color:#92400e;font-size:14px"><strong>${kalanGun} gün</strong> kaldı</p>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">
          Muhasebe İş Akışı Sistemi
        </p>
      </div>
    `,
  });
}
