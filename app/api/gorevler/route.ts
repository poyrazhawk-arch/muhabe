import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addDays, format } from "date-fns";

const GorevSchema = z.object({
  title: z.string().min(2, "Başlık en az 2 karakter"),
  description: z.string().optional(),
  client_id: z.string().uuid().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD formatında girin"),
  priority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
  reminders: z.array(z.number()).default([7, 3, 1]), // kaç gün önce hatırlatma
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id, email").eq("user_id", user.id).single();

  const body = await request.json();
  const result = GorevSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ hata: "Geçersiz veri", detaylar: result.error.flatten() }, { status: 400 });

  const { reminders: reminderDays, ...taskData } = result.data;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({ ...taskData, accountant_id: accountant!.id, client_id: taskData.client_id ?? null })
    .select().single();

  if (error) return NextResponse.json({ hata: "Görev oluşturulamadı" }, { status: 500 });

  // Hatırlatmaları oluştur
  const dueDate = new Date(task.due_date);
  const reminderInserts = reminderDays
    .map(days => {
      const triggerAt = addDays(dueDate, -days);
      if (triggerAt <= new Date()) return null;
      return {
        task_id: task.id,
        accountant_id: accountant!.id,
        trigger_at: triggerAt.toISOString(),
        channel: "email" as const,
      };
    })
    .filter(Boolean);

  if (reminderInserts.length > 0) {
    await supabase.from("reminders").insert(reminderInserts);
  }

  return NextResponse.json(task, { status: 201 });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();

  const status = request.nextUrl.searchParams.get("status");
  let query = supabase
    .from("tasks")
    .select("*, clients(full_name)")
    .eq("accountant_id", accountant!.id)
    .order("due_date");

  if (status) query = query.eq("status", status);
  else query = query.neq("status", "completed").neq("status", "cancelled");

  const { data } = await query;
  return NextResponse.json(data ?? []);
}
