import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendHatirlatma } from "@/lib/utils/email";
import { format, differenceInDays } from "date-fns";
import { tr } from "date-fns/locale";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 60 * 60 * 1000);

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*, tasks(title, due_date, clients(full_name)), accountants(email)")
    .eq("sent", false)
    .lte("trigger_at", windowEnd.toISOString())
    .eq("channel", "email");

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ gonderilen: 0 });
  }

  let sent = 0;
  for (const reminder of reminders) {
    const task = reminder.tasks as any;
    const accountant = reminder.accountants as any;
    if (!task || !accountant?.email) continue;

    const dueDate = new Date(task.due_date);
    const kalanGun = differenceInDays(dueDate, now);

    try {
      await sendHatirlatma({
        to: accountant.email,
        gorevBasligi: task.title,
        musteriAdi: task.clients?.full_name,
        sonTarih: format(dueDate, "d MMMM yyyy", { locale: tr }),
        kalanGun: Math.max(0, kalanGun),
      });

      await supabase
        .from("reminders")
        .update({ sent: true, sent_at: now.toISOString() })
        .eq("id", reminder.id);

      sent++;
    } catch (err) {
      console.error("Hatirlatma gonderilemedi:", reminder.id, err);
    }
  }

  return NextResponse.json({ gonderilen: sent, toplam: reminders.length });
}
