import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM = process.env.RESEND_FROM_EMAIL ?? "poyraz@nixtagency.com";
const UNSUB_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://muhasebe-poyraz.vercel.app";

export interface Lead {
  business_name: string;
  email: string;
  phone?: string;
  city?: string;
  rating?: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { leads, subject, template }: { leads: Lead[]; subject: string; template: string } = body;

  if (!leads?.length) return NextResponse.json({ error: "Lead listesi boş" }, { status: 400 });
  if (!subject)       return NextResponse.json({ error: "Konu satırı zorunlu" }, { status: 400 });

  const validLeads = leads.filter(l => l.email && l.email.includes("@"));

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // Resend batch max 100 per call — 50'lik gruplarda gönder
  for (let i = 0; i < validLeads.length; i += 50) {
    const batch = validLeads.slice(i, i + 50).map(lead => ({
      from: `Muhasebe SaaS <${FROM}>`,
      to:   [lead.email],
      subject,
      html: buildColdEmailHtml(lead, template),
      headers: {
        "List-Unsubscribe": `<${UNSUB_BASE}/unsubscribe?email=${encodeURIComponent(lead.email)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }));

    try {
      await resend.batch.send(batch);
      sent += batch.length;
    } catch (e: any) {
      failed += batch.length;
      errors.push(e?.message ?? "Bilinmeyen hata");
    }

    // Rate limit koruması — her batch arasında 300ms bekle
    if (i + 50 < validLeads.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  return NextResponse.json({ sent, failed, total: validLeads.length, errors });
}

function buildColdEmailHtml(lead: Lead, template: string): string {
  const name = lead.business_name ?? "Değerli Muhasebeci";
  const city = lead.city ? `, ${lead.city}` : "";
  const unsubUrl = `${UNSUB_BASE}/unsubscribe?email=${encodeURIComponent(lead.email)}`;

  const templates: Record<string, { body: string }> = {
    tanitim: {
      body: `
        <p>Merhaba,</p>
        <p><strong>${name}</strong>${city} ofisine ulaşıyorum.</p>
        <p>
          Türk muhasebeciler için geliştirdiğimiz <strong>Muhasebe SaaS</strong> platformunu kısaca tanıtmak istedim.
          Tek platformda şunları yönetebiliyorsunuz:
        </p>
        <ul style="padding-left:20px;line-height:2">
          <li>KDV, muhtasar, SGK beyanname hatırlatmaları (otomatik)</li>
          <li>Müşteri belge toplama ve onay akışı</li>
          <li>Hizmet bedeli ve tahsilat takibi</li>
          <li>Toplu müşteri e-posta bildirimleri</li>
        </ul>
        <p>
          Aylık <strong>299 TL</strong>'den başlayan planlarla — 14 gün ücretsiz deneyebilirsiniz.
        </p>
        <p>
          Demo görmek ister misiniz? Bu maili yanıtlamanız yeterli.
        </p>
      `,
    },
    takip: {
      body: `
        <p>Merhaba,</p>
        <p>Geçen hafta <strong>${name}</strong>${city} için gönderdiğim maili takip ediyorum.</p>
        <p>
          Kısa bir demo için 15 dakikanızı ayırabilir misiniz?
          Vergi takvimi otomasyonu ve tahsilat takibini canlı göstereyim.
        </p>
        <p>Yanıtınızı bekliyorum.</p>
      `,
    },
    son_seans: {
      body: `
        <p>Merhaba,</p>
        <p>
          <strong>${name}</strong>${city} için son kez ulaşıyorum — yanıt almadıysam şu an doğru zaman olmayabilir, anlıyorum.
        </p>
        <p>
          İleride Türk vergi takvimi otomasyonu veya müşteri takip sistemi araştırırsanız,
          <a href="${UNSUB_BASE}" style="color:#2563eb">muhasebe-poyraz.vercel.app</a> adresini not edin.
        </p>
        <p>İyi çalışmalar.</p>
      `,
    },
  };

  const { body } = templates[template] ?? templates.tanitim;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f1f4f9;margin:0;padding:32px 16px">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e7ef;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.07)">

    <!-- Header -->
    <div style="background:#0d1421;padding:20px 32px;display:flex;align-items:center;gap:10px">
      <div style="width:28px;height:28px;background:linear-gradient(135deg,#3b82f6,#2563eb);border-radius:8px;display:inline-flex;align-items:center;justify-content:center">
        <span style="color:#fff;font-size:14px;font-weight:700">M</span>
      </div>
      <span style="color:#fff;font-size:14px;font-weight:600;letter-spacing:-0.02em">Muhasebe SaaS</span>
    </div>

    <!-- Body -->
    <div style="padding:32px;color:#374151;font-size:14px;line-height:1.75">
      ${body}
      <p style="margin-top:24px">
        Saygılarımla,<br>
        <strong style="color:#0d1117">Poyraz</strong><br>
        <span style="color:#9ca3af;font-size:12px">Muhasebe SaaS · Kurucu</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;background:#f8f9fc;border-top:1px solid #e2e7ef">
      <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6">
        Bu e-posta ticari amaçlı gönderilmiştir.
        <a href="${unsubUrl}" style="color:#9ca3af">Abonelikten çık</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
