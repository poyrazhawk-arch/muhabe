import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@/lib/utils/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();

  const { data: doc } = await supabase
    .from("documents")
    .select("file_url")
    .eq("id", id)
    .eq("accountant_id", accountant!.id)
    .single();

  if (!doc) return NextResponse.json({ hata: "Belge bulunamadı" }, { status: 404 });

  try {
    const url = await getSignedUrl(doc.file_url, 3600);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ hata: "İndirme bağlantısı oluşturulamadı" }, { status: 500 });
  }
}
