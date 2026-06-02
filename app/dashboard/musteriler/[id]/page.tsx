import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import BelgeIsteButton from "./BelgeIsteButton";
import { calculateRAG, RAG_LABELS, RAG_COLORS } from "@/lib/utils/rag";

const DOC_DURUM: Record<string, string> = { pending: "Bekliyor", received: "Alındı", approved: "Onaylandı", rejected: "Reddedildi" };
const DOC_COLOR: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", received: "bg-blue-100 text-blue-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

export default async function MusteriDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const { data: client } = await supabase
    .from("clients").select("*").eq("id", id).eq("accountant_id", accountant!.id).single();
  if (!client) notFound();

  const [{ data: documents }, { data: tasks }, { data: tokens }] = await Promise.all([
    supabase.from("documents").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").eq("client_id", id).neq("status", "completed").order("due_date"),
    supabase.from("upload_tokens").select("*").eq("client_id", id).eq("is_active", true).order("created_at", { ascending: false }).limit(3),
  ]);

  const pendingDocs = documents?.filter(d => d.status === "pending").length ?? 0;
  const overdueTasks = tasks?.filter(t => new Date(t.due_date) < new Date()).length ?? 0;
  const rag = calculateRAG(overdueTasks, pendingDocs, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Başlık */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{client.full_name}</h1>
          {client.company_name && <p className="text-slate-500 mt-0.5">{client.company_name}</p>}
        </div>
        <span className={`text-sm px-3 py-1 rounded-full border font-medium ${RAG_COLORS[rag]}`}>
          {RAG_LABELS[rag]}
        </span>
      </div>

      {/* Bilgi kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {client.email && <InfoCard label="E-posta" value={client.email} />}
        {client.phone && <InfoCard label="Telefon" value={client.phone} />}
        {client.tax_number && <InfoCard label="Vergi No" value={client.tax_number} />}
        <InfoCard label="Durum" value={client.status === "active" ? "Aktif" : "Pasif"} />
      </div>

      {/* Belge İste */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Belge Talebi</h2>
          <BelgeIsteButton clientId={id} clientName={client.full_name} />
        </div>
        {tokens && tokens.length > 0 ? (
          <div className="space-y-2">
            {tokens.map((t: any) => {
              const expired = new Date(t.expires_at) < new Date();
              const url = `${process.env.NEXT_PUBLIC_APP_URL}/yukle?token=${t.token}`;
              return (
                <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg border text-sm ${expired ? "bg-slate-50 border-slate-200 opacity-60" : "bg-blue-50 border-blue-200"}`}>
                  <div>
                    <p className="font-medium text-slate-700">{t.document_types.join(", ")}</p>
                    <p className="text-xs text-slate-400">
                      {expired ? "Süresi doldu" : `${format(new Date(t.expires_at), "d MMM HH:mm", { locale: tr })}'e kadar geçerli`}
                      {" · "}{t.used_count}/{t.max_uses} kullanım
                    </p>
                  </div>
                  {!expired && (
                    <button
                      onClick={() => navigator.clipboard.writeText(url)}
                      className="text-xs text-blue-600 hover:underline ml-3 shrink-0"
                    >
                      Kopyala
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Henüz belge talebi oluşturulmamış</p>
        )}
      </div>

      {/* Belgeler */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Belgeler ({documents?.length ?? 0})</h2>
        </div>
        {!documents || documents.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-400 text-sm">Belge yok</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{doc.file_name}</p>
                  <p className="text-xs text-slate-400">{doc.document_type} · {format(new Date(doc.created_at), "d MMM yyyy", { locale: tr })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${DOC_COLOR[doc.status]}`}>
                    {DOC_DURUM[doc.status]}
                  </span>
                  <a href={`/api/belgeler/indir/${doc.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">İndir</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Görevler */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Aktif Görevler ({tasks?.length ?? 0})</h2>
        </div>
        {!tasks || tasks.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-400 text-sm">Aktif görev yok</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const overdue = new Date(task.due_date) < new Date();
              return (
                <div key={task.id} className="px-5 py-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  <span className={`text-xs font-medium ${overdue ? "text-red-600" : "text-slate-500"}`}>
                    {format(new Date(task.due_date), "d MMM yyyy", { locale: tr })}
                    {overdue && " (Gecikti)"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900 mt-0.5 truncate">{value}</p>
    </div>
  );
}
