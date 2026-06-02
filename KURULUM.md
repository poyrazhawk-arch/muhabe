# Muhasebe SaaS — Kurulum Rehberi

## 1. Gereksinimler
- Node.js 18+
- Git

## 2. Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` aç.

## 3. .env.local Ayarları

`.env.local` dosyasında şu değerleri doldur:

### SUPABASE_SERVICE_ROLE_KEY
1. https://supabase.com/dashboard adresine git
2. Proje: **muhasebe-saas**
3. Settings → API → **service_role** (gizli tut, asla frontend'e koyma)

### CRON_SECRET
Rastgele bir string belirle (örn: terminalde `openssl rand -hex 16` çalıştır).

## 4. Vercel Deploy

```bash
# Vercel CLI yükle
npm install -g vercel

# Deploy et
vercel

# Environment değişkenlerini ekle
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add CRON_SECRET
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add NEXT_PUBLIC_APP_URL  # https://senin-domain.vercel.app
```

### Production deploy
```bash
vercel --prod
```

## 5. Resend Domain Doğrulaması

1. https://resend.com/domains → Add Domain → `nixtagency.com`
2. DNS kayıtlarını (SPF, DKIM) domain sağlayıcına ekle
3. "Verify" butonuna tık

Domain doğrulanmadan e-postalar gitmez.

## 6. Proje Yapısı

```
app/
  auth/giris/        → Giriş sayfası (magic link)
  auth/callback/     → Auth callback
  dashboard/
    page.tsx         → Ana dashboard (RAG + istatistikler)
    musteriler/      → Müşteri listesi + detay
    belgeler/        → Belge yönetimi
    gorevler/        → Görev takibi
    raporlar/        → PDF raporlar
  yukle/             → Müşteri belge yükleme sayfası (token ile)
  api/
    musteriler/      → Müşteri CRUD
    upload/          → Belge yükleme (token ile)
    upload-tokens/   → Token oluşturma
    gorevler/        → Görev CRUD + durum güncelleme
    belgeler/[id]/   → Belge onay
    belgeler/indir/  → Güvenli indirme (signed URL)
    cron/            → Hatırlatma cron job (saatlik)
lib/
  supabase/          → Client + Server + Service client
  utils/
    storage.ts       → Supabase Storage
    email.ts         → Resend e-posta fonksiyonları
    rag.ts           → RAG durum hesaplama
```

## 7. Temel Akışlar

### Belge Toplama
1. Dashboard → Müşteriler → Müşteri seç
2. "Belge İste" butonuna tıkla
3. Belge türlerini seç → Bağlantı oluştur
4. Linki müşteriye WhatsApp/e-posta ile ilet
5. Müşteri `yukle?token=...` sayfasında yükler
6. Bildirim e-postası `info@nixtagency.com`'a gelir

### Görev Oluşturma
1. Dashboard → Görevler → Yeni Görev
2. Başlık, son tarih, müşteri seç
3. Hatırlatmalar otomatik (7, 3, 1 gün önce)

### Rapor / PDF
1. Dashboard → Raporlar → Müşteri seç
2. "Aylık Özet" veya "Dönem Kapanış"
3. Sayfada "PDF Olarak Yazdır" → Tarayıcı print → PDF kaydet

## 8. Cron Job (Hatırlatmalar)

Vercel deploy sonrası `vercel.json`'daki cron otomatik aktif olur.
Her saat `GET /api/cron/hatirlatmalar` çağrılır, gönderilmemiş hatırlatmalar e-postalanır.

Lokal test:
```bash
curl -H "Authorization: Bearer CRON_SECRET_DEGERINIZ" \
  http://localhost:3000/api/cron/hatirlatmalar
```
