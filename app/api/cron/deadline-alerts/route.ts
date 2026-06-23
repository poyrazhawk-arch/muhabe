import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendDeadlineDigest } from "@/lib/utils/email";
import { generateTaxCalendar, getUpcomingDeadlines } from "@/lib/utils/taxCalendar";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createServiceClient();
  const { data: accountants } = await supabase
    .from("accountants").select("id, email, full_name");

  if (!accountants?.length) return NextResponse.json({ sent: 0 });

  const year      = new Date().getFullYear();
  const allItems  = generateTaxCalendar(year);
  const upcoming  = getUpcomingDeadlines(allItems, 14);

  if (!upcoming.length) return NextResponse.json({ sent: 0, message: "No deadlines in next 14 days" });

  const today = new Date();
  const deadlines = upcoming.map(item => {
    const due = new Date(item.due_date);
    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
    return {
      title:    item.beyanname_turu,
      dueDate:  format(due, "d MMMM yyyy", { locale: enUS }),
      daysLeft: Math.max(0, daysLeft),
    };
  });

  let sent = 0;
  for (const acc of accountants) {
    if (!acc.email) continue;
    try {
      await sendDeadlineDigest({
        to:             acc.email,
        accountantName: acc.full_name ?? "Accountant",
        deadlines,
      });
      sent++;
    } catch { /* continue */ }
  }

  return NextResponse.json({ sent, deadlines: deadlines.length });
}
