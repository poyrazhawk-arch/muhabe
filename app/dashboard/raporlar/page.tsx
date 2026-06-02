import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function RaporlarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, company_name")
    .eq("accountant_id", accountant!.id)
    .eq("status", "active")
    .order("full_name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Raporlar</h1>
        <p className="text-slate-500 text-sm mt-1">Müşteri bazlı aktivite özetleri ve dönem kapanış listeleri</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clients?.map((client) => (
          <div key={client.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">{client.full_name}</p>
              {client.company_name && <p className="text-sm text-slate-500">{client.company_name}</p>}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/raporlar/musteri/${client.id}?tip=aylik`}
                className="text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Aylık Özet
              </Link>
              <Link
                href={`/dashboard/raporlar/musteri/${client.id}?tip=kapanis`}
                className="text-sm text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Dönem Kapanış
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
