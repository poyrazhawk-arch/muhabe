"use client";

import { WhatsappLogo } from "@phosphor-icons/react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { waLink } from "@/lib/utils/whatsapp";

/**
 * WhatsApp hatırlatma linki — yalnızca TR locale'de görünür.
 * (Türkiye'ye özel özellik: tahsilat/evrak takibi WhatsApp'tan yürür.)
 */
export default function WhatsAppLink({
  phone, message, label = "WhatsApp",
}: { phone: string | null | undefined; message: string; label?: string }) {
  const locale = useLocale();
  if (locale !== "tr" || !phone) return null;

  const href = waLink(phone, message);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-80"
      style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
    >
      <WhatsappLogo size={13} weight="fill" />
      {label}
    </a>
  );
}
