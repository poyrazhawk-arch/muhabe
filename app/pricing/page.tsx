import type { Metadata } from "next";
import PricingPage from "./PricingPage";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDict(locale).pricing;
  return {
    title: t.pageTitleMeta as string,
    description:
      locale === "tr"
        ? "Muhasebe büroları için basit, şeffaf fiyatlandırma. Görevler, belgeler, müşteriler ve vergi takvimi — tek yerde. 14 gün ücretsiz deneme."
        : "Simple, transparent pricing for accounting practices. Tasks, documents, clients, and UK tax calendar — one place. 14-day free trial.",
  };
}

export default function PricingRoute() {
  return <PricingPage />;
}
