import KampanyaGonderici from "./KampanyaGonderici";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

export default async function KampanyaPage() {
  const locale = await getLocale();
  const t = getDict(locale).kampanya;

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>
          {t.pageTitle}
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
          {t.pageSub}
        </p>
      </div>
      <KampanyaGonderici />
    </div>
  );
}
