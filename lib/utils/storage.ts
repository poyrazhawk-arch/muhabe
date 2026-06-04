import { createClient } from "@supabase/supabase-js";

const BUCKET = "belgeler";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Dosyayı Supabase Storage'a yükler ve path döner.
 * Dönüş değeri: storage path (örn: "client-id/timestamp-random.pdf")
 */
export async function uploadFile(
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const { error } = await getSupabase().storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: false });

  if (error) throw new Error(`Yükleme hatası: ${error.message}`);

  // Path'i döndür; indirme için getSignedUrl kullanılır
  return path;
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await getSupabase().storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) throw new Error(`URL hatası: ${error.message}`);
  if (!data?.signedUrl) throw new Error("Signed URL alınamadı");

  return data.signedUrl;
}
  