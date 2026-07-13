import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendDeadlineDigest } from "@/lib/utils/email";
import { generateTaxCalendar, getUpcomingDeadlines } from "@/lib/utils/taxCalendar";
import { format } from "date-fns";
import { enUS, tr as trLocale } from "date-fns/locale";

/**
 * Cron: Her Pazartesi 08:00 — muhasebeciye 14 günlük son-tarih özeti.
 * TR muhasebeci: GİB beyanname takvimi + kendi açık görevleri (Türkçe)
 * EN muhasebeci: yalnızca kendi açık görevleri (İngilizce) — Türk vergi
 * takvimi yabancı muhasebeciye anlamsız olduğundan gönderilmez.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createServiceClient();
  const { data: accountants } = await supabase
    .from("accountants").select("id, email, full_name, locale");

  if (!accountants?.length) return NextResponse.json({ sent: 0 });

  const today = new Date();
  const year  = today.getFullYear();
  const in14  = new Date(today.getTime() + 14 * 86400000).toISOString().split("T")[0];
  const daysLeft = (dateStr: string) =>
    Math.max(0, Math.ceil((new Date(dateStr).getTime() - today.getTime()) / 86400000));

  // GİB takvimi yalnızca TR muhasebeciler için (bir kez üret)
  const gibUpcoming = getUpcomingDeadlines(generateTaxCalendar(year, "tr"), 14);

  let sent = 0;

  for (const acc of accountants) {
    if (!acc.email) continue;
    const locale: "tr" | "en" = acc.locale === "en" ? "en" : "tr";
    const dfLocale = locale === "tr" ? trLocale : enUS;

    // Muhasebecinin kendi açık görevleri (14 gün içinde)
    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, due_date, clients(full_name)")
      .eq("accountant_id", acc.id)
      .in("status", ["pending", "in_progress"])
      .lte("due_date", in14)
      .order("due_date")
      .limit(20);

    const taskDeadlines = (tasks ?? []).map(t => ({
      title:    (t.clients as any)?.full_name ? `${t.title} — ${(t.clients as any).full_name}` : t.title,
      dueDate:  format(new Date(t.due_date), "d MMMM yyyy", { locale: dfLocale }),
      daysLeft: daysLeft(t.due_date),
    }));

    const gibDeadlines = locale === "tr"
      ? gibUpcoming.map(item => ({
          title:    item.beyanname_turu,
          dueDate:  format(new Date(item.due_date), "d MMMM yyyy", { locale: dfLocale }),
          daysLeft: daysLeft(item.due_date),
        }))
      : [];

    const deadlines = [...gibDeadlines, ...taskDeadlines]
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 25);

    if (!deadlines.length) continue;

    try {
      await sendDeadlineDigest({
        to:             acc.email,
        accountantName: acc.full_name ?? (locale === "tr" ? "Muhasebeci" : "Accountant"),
        locale,
        deadlines,
      });
      sent++;
    } catch { /* continue */ }
  }

  return NextResponse.json({ sent });
}
