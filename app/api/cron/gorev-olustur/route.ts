import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateTaxCalendar } from "@/lib/utils/taxCalendar";

/**
 * Cron: Her ayın 1'i saat 08:00'de çalışır.
 * 1. Aktif görev şablonlarından bu ay görevlerini oluşturur.
 * 2. Vergi takvimi görevlerini oluşturur (henüz oluşturulmamışsa).
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET)
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const supabase = await createClient();
  const now = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  let tasksCreated = 0;
  let taxItemsCreated = 0;

  // 1. Aktif görev şablonlarından görev üret
  const { data: templates } = await supabase
    .from("task_templates")
    .select("*, accountants(id)")
    .eq("is_active", true);

  for (const tpl of templates ?? []) {
    if (!shouldRunThisMonth(tpl, month)) continue;

    const dueDate = calcDueDate(tpl, year, month);

    // Bu şablon için bu ay zaten görev var mı?
    const { data: existing } = await supabase
      .from("tasks")
      .select("id")
      .eq("template_id", tpl.id)
      .gte("due_date", `${year}-${String(month).padStart(2, "0")}-01`)
      .lte("due_date", `${year}-${String(month).padStart(2, "0")}-31`)
      .limit(1);

    if (existing && existing.length > 0) continue;

    // Müşteri listesini al ve her müşteri için görev oluştur
    const { data: clients } = await supabase
      .from("clients")
      .select("id")
      .eq("accountant_id", tpl.accountant_id)
      .eq("status", "active");

    for (const client of clients ?? []) {
      await supabase.from("tasks").insert({
        accountant_id: tpl.accountant_id,
        client_id: client.id,
        template_id: tpl.id,
        title: tpl.title,
        description: tpl.description,
        due_date: dueDate,
        status: "pending",
        priority: "normal",
      });
      tasksCreated++;
    }
  }

  // 2. Vergi takvimi — bu yıl için henüz oluşturulmamışsa oluştur
  const { data: accountants } = await supabase.from("accountants").select("id");
  const calendarItems = generateTaxCalendar(year);

  for (const acc of accountants ?? []) {
    const { data: clients } = await supabase
      .from("clients").select("id").eq("accountant_id", acc.id).eq("status", "active");

    for (const client of clients ?? []) {
      // Bu ay içindeki vergi kalemlerini işle
      const thisMonthItems = calendarItems.filter(item => {
        const d = new Date(item.due_date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });

      for (const item of thisMonthItems) {
        // Zaten var mı?
        const { data: existing } = await supabase
          .from("tax_calendar_items")
          .select("id")
          .eq("accountant_id", acc.id)
          .eq("client_id", client.id)
          .eq("beyanname_turu", item.beyanname_turu)
          .eq("period_year", item.period_year)
          .eq("period_month", item.period_month ?? 0)
          .limit(1);

        if (existing && existing.length > 0) continue;

        // Görev oluştur
        const { data: task } = await supabase
          .from("tasks")
          .insert({
            accountant_id: acc.id,
            client_id: client.id,
            title: item.beyanname_turu,
            due_date: item.due_date,
            status: "pending",
            priority: "high",
          })
          .select("id")
          .single();

        // Takvim kaydı oluştur
        await supabase.from("tax_calendar_items").insert({
          accountant_id: acc.id,
          client_id: client.id,
          beyanname_turu: item.beyanname_turu,
          due_date: item.due_date,
          period_year: item.period_year,
          period_month: item.period_month,
          task_id: task?.id,
        });

        taxItemsCreated++;
      }
    }
  }

  return NextResponse.json({ tasksCreated, taxItemsCreated, month, year });
}

function shouldRunThisMonth(tpl: any, month: number): boolean {
  if (tpl.recurrence_type === "monthly") return true;
  if (tpl.recurrence_type === "quarterly") return [1, 4, 7, 10].includes(month);
  if (tpl.recurrence_type === "yearly") return tpl.due_month === month;
  return false;
}

function calcDueDate(tpl: any, year: number, month: number): string {
  const day = tpl.due_day ?? 25;
  const d = new Date(year, month - 1, day);
  return d.toISOString().split("T")[0];
}
