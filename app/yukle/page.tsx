import { createServiceClient } from "@/lib/supabase/server";
import UploadForm from "./UploadForm";

export default async function YuklePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <HataEkrani mesaj="Geçersiz bağlantı. Muhasebecinizdeki bağlantıyı kullanın." />;
  }

  const supabase = await createServiceClient();
  const { data: uploadToken } = await supabase
    .from("upload_tokens")
    .select("*, clients(full_name, company_name), accountants(full_name, office_name)")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (!uploadToken) {
    return <HataEkrani mesaj="Bu bağlantı geçersiz veya kullanılmış." />;
  }

  if (new Date(uploadToken.expires_at) < new Date()) {
    return <HataEkrani mesaj="Bu bağlantının süresi dolmuş. Muhasebecinizdeki yeni bir bağlantı isteyin." />;
  }

  const client = uploadToken.clients as any;
  const accountant = uploadToken.accountants as any;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-900">Belge Yükleme</h1>
          <p className="text-slate-500 text-sm mt-1">
            {accountant?.office_name ?? accountant?.full_name ?? "Muhasebeci"} için
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="mb-5 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Sayın</p>
            <p className="font-semibold text-slate-900">{client?.full_name}</p>
            {client?.company_name && (
              <p className="text-sm text-slate-500">{client.company_name}</p>
            )}
          </div>

          <UploadForm
            token={token}
            documentTypes={uploadToken.document_types}
            message={uploadToken.message}
          />
        </div>
      </div>
    </div>
  );
}

function HataEkrani({ mesaj }: { mesaj: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-sm text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-xl">!</span>
        </div>
        <h2 className="font-semibold text-slate-900 mb-2">Bağlantı Hatası</h2>
        <p className="text-slate-500 text-sm">{mesaj}</p>
      </div>
    </div>
  );
}
