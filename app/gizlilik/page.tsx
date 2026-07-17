import Link from "next/link";
import { Notebook, CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { getLocale } from "@/lib/i18n/server";

export const metadata = {
  title: "Gizlilik ve KVKK Aydınlatma Metni — Ledger",
  description: "Kişisel verilerin korunması, işlenme amaçları ve haklarınız.",
};

export default async function GizlilikPage() {
  const locale = await getLocale();
  const tr = locale !== "en";

  const updated = "8 Temmuz 2026";

  return (
    <div style={{ background: "#f6f5f2", minHeight: "100dvh", color: "#081120", fontFamily: "var(--font-sans)" }}>
      <nav style={{ borderBottom: "1px solid rgba(8,17,32,0.07)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#081120" }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: "#081120", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Notebook size={14} weight="fill" style={{ color: "#9db8d9" }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Ledger</span>
          </Link>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "#5a6577", textDecoration: "none" }}>
            <CaretLeft size={12} weight="bold" /> {tr ? "Ana sayfa" : "Home"}
          </Link>
        </div>
      </nav>

      <article style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: "0.16em", color: "#8a94a3", marginBottom: 12 }}>
          {tr ? "YASAL" : "LEGAL"}
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.035em", marginBottom: 8 }}>
          {tr ? "Gizlilik ve KVKK Aydınlatma Metni" : "Privacy Policy"}
        </h1>
        <p style={{ fontSize: 13, color: "#8a94a3", marginBottom: 40 }}>{tr ? `Son güncelleme: ${updated}` : `Last updated: ${updated}`}</p>

        <div style={{ fontSize: 15, lineHeight: 1.75, color: "#2f3a4d" }}>
          {tr ? <TR /> : <EN />}
        </div>
      </article>
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", margin: "34px 0 12px", color: "#081120" }}>{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 14px" }}>{children}</p>;
}

function TR() {
  return (
    <>
      <P>
        Ledger ("Platform"), muhasebe bürolarının müşteri, belge, görev ve tahsilat süreçlerini yönetmesi için sunulan bir
        yazılım hizmetidir. 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, işlediğimiz kişisel veriler
        ve haklarınız hakkında sizi bilgilendirmek isteriz.
      </P>

      <H>1. Veri Sorumlusu</H>
      <P>
        Platform üzerinden işlenen veriler bakımından, hesabı oluşturan muhasebe bürosu (üye) çoğu durumda <strong>veri sorumlusu</strong>,
        Ledger ise <strong>veri işleyen</strong> sıfatıyla hareket eder. Üyenin kendi hesabıyla ilgili verilerinde Ledger veri sorumlusudur.
      </P>

      <H>2. İşlenen Kişisel Veriler</H>
      <P>
        <strong>Üye (muhasebeci):</strong> ad-soyad, e-posta, telefon, büro adı, oturum/giriş kayıtları, abonelik ve ödeme durumu.<br />
        <strong>Mükellef (müşteri):</strong> ad-soyad, firma adı, vergi kimlik numarası, iletişim bilgileri ve üye tarafından yüklenen belgeler.
        Bu veriler yalnızca üyenin talimatıyla, hizmetin sunulması amacıyla işlenir.
      </P>

      <H>3. İşleme Amaçları ve Hukuki Sebep</H>
      <P>
        Veriler; hizmetin sunulması, belge toplama ve hatırlatma, beyanname takvimi oluşturma, tahsilat takibi ve yasal
        yükümlülüklerin yerine getirilmesi amaçlarıyla; sözleşmenin ifası (KVKK m.5/2-c) ve meşru menfaat (m.5/2-f) hukuki
        sebeplerine dayanılarak işlenir.
      </P>

      <H>4. Verilerin Saklandığı Yer ve Güvenlik</H>
      <P>
        Veriler, AB (Frankfurt) veri merkezinde barındırılan altyapıda, satır düzeyi erişim denetimi (RLS), aktarımda SSL/TLS
        şifreleme ve yetkilendirilmiş erişim kontrolleriyle korunur. Belgelere yalnızca ilgili üye ve o üyenin yetkilendirdiği
        kişiler erişebilir.
      </P>

      <H>5. Verilerin Aktarımı</H>
      <P>
        Verileriniz, yalnızca hizmetin sunulması için gerekli hizmet sağlayıcılarla (barındırma, e-posta iletimi, ödeme
        altyapısı) sınırlı ölçüde paylaşılır; pazarlama amacıyla üçüncü taraflara satılmaz veya kiralanmaz.
      </P>

      <H>6. Saklama Süresi</H>
      <P>
        Veriler, hesabınız aktif olduğu sürece ve ilgili mevzuatın öngördüğü süreler boyunca saklanır. Hesabınızı kapatmanız
        halinde verileriniz makul bir süre içinde silinir veya anonimleştirilir.
      </P>

      <H>7. Haklarınız (KVKK m.11)</H>
      <P>
        Kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme ve
        aktarıldığı üçüncü kişileri öğrenme haklarına sahipsiniz. Taleplerinizi aşağıdaki e-posta adresine iletebilirsiniz.
      </P>

      <H>8. İletişim</H>
      <P>
        KVKK kapsamındaki talep ve sorularınız için: <a href="mailto:poyrazhawk@gmail.com" style={{ color: "#c85460", fontWeight: 600 }}>poyrazhawk@gmail.com</a>
      </P>
    </>
  );
}

function EN() {
  return (
    <>
      <P>Ledger is a software service that helps accounting firms manage client, document, task and fee workflows. This page explains what personal data we process and your rights.</P>
      <H>1. Data we process</H>
      <P><strong>Members (accountants):</strong> name, email, phone, firm name, login records, subscription status.<br /><strong>Clients:</strong> name, company, tax number, contact details and documents uploaded by the member — processed only on the member's instruction.</P>
      <H>2. Storage & security</H>
      <P>Data is hosted in an EU (Frankfurt) data centre with row-level access control, SSL/TLS encryption in transit, and authorized-only access.</P>
      <H>3. Sharing</H>
      <P>Data is shared only with service providers necessary to deliver the service (hosting, email, payments). It is never sold or rented for marketing.</P>
      <H>4. Your rights</H>
      <P>You may request access, correction or deletion of your data at any time.</P>
      <H>5. Contact</H>
      <P>For any privacy request: <a href="mailto:poyrazhawk@gmail.com" style={{ color: "#c85460", fontWeight: 600 }}>poyrazhawk@gmail.com</a></P>
    </>
  );
}
