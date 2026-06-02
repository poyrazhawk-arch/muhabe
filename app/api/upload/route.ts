import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/utils/storage";
import { sendBelgeYuklemeBildirimi } from "@/lib/utils/email";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();
  const token = request.nextUrl.searchParams.get("token");

  if (!token) return NextResponse.json({ hata: "Geçersiz bağlantı" }, { status: 400 });

  const { data: uploadToken } = await supabase
    .from("upload_tokens")
    .select("*, clients(full_name), accountants(email)")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (!uploadToken)
    return NextResponse.json({ hata: "Bağlantı geçersiz veya kullanılmış" }, { status: 403 });

  if (new Date(uploadToken.expires_at) < new Date())
    return NextResponse.json({ hata: "Bağlantının süresi dolmuş" }, { status: 403 });

  if (uploadToken.used_count >= uploadToken.max_uses)
    return NextResponse.json({ hata: "Bağlantı kullanım limiti aşıldı" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const documentType = (formData.get("document_type") as string) || "Genel Belge";

  if (!file) return NextResponse.json({ hata: "Dosya seçilmedi" }, { status: 400 });
  if (file.size > MAX_FILE_SIZE)
    return NextResponse.json({ hata: "Dosya boyutu 10MB'ı geçemez" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ hata: "Desteklenmeyen dosya türü (PDF, Excel veya görsel yükleyin)" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const path = `${uploadToken.client_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let fileUrl: string;
  try {
    fileUrl = await uploadFile(path, buffer, file.type);
  } catch {
    return NextResponse.json({ hata: "Dosya yüklenemedi, tekrar deneyin" }, { status: 500 });
  }

  const { data: document } = await supabase
    .from("documents")
    .insert({
      client_id: uploadToken.client_id,
      accountant_id: uploadToken.accountant_id,
      document_type: documentType,
      file_name: file.name,
      file_url: fileUrl,
      file_size: file.size,
      mime_type: file.type,
      status: "received",
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single();

  await supabase
    .from("upload_tokens")
    .update({ used_count: uploadToken.used_count + 1 })
    .eq("id", uploadToken.id);

  await supabase.from("activity_logs").insert({
    accountant_id: uploadToken.accountant_id,
    client_id: uploadToken.client_id,
    action: "belge_yuklendi",
    entity_type: "document",
    entity_id: document?.id,
  });

  const accountant = uploadToken.accountants as any;
  const client = uploadToken.clients as any;
  if (accountant?.email) {
    await sendBelgeYuklemeBildirimi({
      to: accountant.email,
      musteriAdi: client?.full_name ?? "Müşteri",
      belgeAdi: file.name,
      belgeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/belgeler`,
    });
  }

  return NextResponse.json({ basarili: true, belge_id: document?.id }, { status: 201 });
}
