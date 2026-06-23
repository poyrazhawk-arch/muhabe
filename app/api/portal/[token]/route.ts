import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase  = await createServiceClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, company_name, status, accountants(full_name, email)")
    .eq("portal_token", token)
    .eq("status", "active")
    .single();

  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [{ data: documents }, { data: tasks }] = await Promise.all([
    supabase.from("documents")
      .select("id, file_name, document_type, status, created_at, approved_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase.from("tasks")
      .select("id, title, due_date, status, priority")
      .eq("client_id", client.id)
      .neq("status", "completed")
      .neq("status", "cancelled")
      .order("due_date"),
  ]);

  return NextResponse.json({ client, documents, tasks });
}
