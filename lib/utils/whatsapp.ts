/** WhatsApp wa.me derin-linkleri — Türkiye'de e-posta açılma oranı düşük,
 *  tahsilat ve evrak takibi WhatsApp'tan çok daha hızlı sonuç verir. */

/** Türk telefonunu wa.me formatına çevirir: 0532... → 90532..., +90 → 90 */
export function normalizePhoneTR(phone: string): string | null {
  const d = (phone ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("90") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 11) return "9" + d;
  if (d.length === 10 && d.startsWith("5")) return "90" + d;
  return d.length >= 10 ? d : null; // yabancı numaralar olduğu gibi
}

export function waLink(phone: string, message: string): string | null {
  const p = normalizePhoneTR(phone);
  if (!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}
