import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { enUS } from "date-fns/locale";
import PrintButton from "./PrintButton";

const DOC_DURUM: Record<string, string> = {
  pending: "Pending", received: "Received", approved: "Approved", rejected: "Rejected"
};

export default async function MusteriRaporPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tip?: string; ay?: string }>;
}) {
  const { id } = await params;
  const { tip = "aylik", ay } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: accountant } = await supabase
    .from("accountants").select("*").eq("user_id", user!.id).single();

  const { data: client } = await supabase
    .from("clients").select("*").eq("id", id).eq("accountant_id", accountant!.id).single();
  if (!client) notFound();

  const referenceDate = ay ? new Date(ay) : subMonths(new Date(), 0);
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const ayAdi = format(referenceDate, "MMMM yyyy", { locale: enUS });

  const [{ data: documents }, { data: tasks }, { data: allTasks }] = await Promise.all([
    supabase.from("documents").select("*")
      .eq("client_id", id)
      .gte("created_at", monthStart.toISOString())
      .lte("created_at", monthEnd.toISOString())
      .order("created_at"),
    supabase.from("tasks").select("*")
      .eq("client_id", id)
      .gte("due_date", format(monthStart, "yyyy-MM-dd"))
      .lte("due_date", format(monthEnd, "yyyy-MM-dd"))
      .order("due_date"),
    supabase.from("tasks").select("*").eq("client_id", id).neq("status", "cancelled"),
  ]);

  const completedTasks = tasks?.filter(t => t.status === "completed") ?? [];
  const pendingTasks = tasks?.filter(t => t.status !== "completed" && t.status !== "cancelled") ?? [];

  // Dönem kapanış kontrol listesi
  const kapanisListesi = [
    { baslik: "VAT Return (KDV)", tamamlandi: allTasks?.some(t => t.title.toLowerCase().includes("kdv") && t.status === "completed") ?? false },
    { baslik: "SGK Contribution Filing", tamamlandi: allTasks?.some(t => t.title.toLowerCase().includes("sgk") && t.status === "completed") ?? false },
    { baslik: "Income / Corporate Tax Return", tamamlandi: allTasks?.some(t => t.title.toLowerCase().includes("vergi") && t.status === "completed") ?? false },
    { baslik: "BA-BS Reporting", tamamlandi: allTasks?.some(t => t.title.toLowerCase().includes("ba-bs") && t.status === "completed") ?? false },
    { baslik: "Bank Statements Received", tamamlandi: documents?.some(d => d.document_type.toLowerCase().includes("banka") && d.status !== "pending") ?? false },
    { baslik: "Invoices Received", tamamlandi: documents?.some(d => (d.document_type.toLowerCase().includes("fatura") || d.document_type.toLowerCase().includes("invoice")) && d.status !== "pending") ?? false },
    { baslik: "Payroll Processed", tamamlandi: allTasks?.some(t => t.title.toLowerCase().includes("bordro") && t.status === "completed") ?? false },
    { baslik: "Trial Balance Extracted", tamamlandi: false },
  ];

  const tamamlananSayisi = kapanisListesi.filter(i => i.tamamlandi).length;

  return (
    <div>
      {/* Yazdır butonu — ekranda görünür, baskıda gizlenir */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {tip === "kapanis" ? "Period Close Checklist" : `Monthly Activity Summary — ${ayAdi}`}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{client.full_name} {client.company_name ? `· ${client.company_name}` : ""}</p>
        </div>
        <PrintButton />
      </div>

      {/* Rapor içeriği — yazdırılabilir */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 print:border-0 print:p-0 print:shadow-none max-w-3xl">
        {/* Başlık */}
        <div className="border-b border-slate-200 pb-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {tip === "kapanis" ? "Period Close Checklist" : "Monthly Activity Summary"}
              </h2>
              <p className="text-slate-500 mt-1">{client.full_name} {client.company_name ? `· ${client.company_name}` : ""}</p>
            </div>
            <div className="text-right text-sm text-slate-400">
              <p>{accountant?.office_name ?? accountant?.full_name}</p>
              <p>{format(new Date(), "d MMMM yyyy", { locale: enUS })}</p>
            </div>
          </div>
          {tip === "aylik" && (
            <div className="mt-3 inline-block bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
              {ayAdi}
            </div>
          )}
        </div>

        {tip === "kapanis" ? (
          /* ─── DÖNEM KAPANIS ─── */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Checklist</h3>
              <span className="text-sm text-slate-500">{tamamlananSayisi}/{kapanisListesi.length} completed</span>
            </div>
            <div className="space-y-2">
              {kapanisListesi.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${item.tamamlandi ? "bg-green-50 border-green-200" : "bg-white border-slate-200"}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${item.tamamlandi ? "bg-green-500" : "border-2 border-slate-300"}`}>
                    {item.tamamlandi && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${item.tamamlandi ? "text-green-800 line-through" : "text-slate-700"}`}>
                    {item.baslik}
                  </span>
                </div>
              ))}
            </div>

            {/* İlerleme */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Overall Progress</span>
                <span>{Math.round((tamamlananSayisi / kapanisListesi.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(tamamlananSayisi / kapanisListesi.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ─── AYLIK ÖZET ─── */
          <div className="space-y-6">
            {/* Özet kartlar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                <p className="text-2xl font-bold text-slate-900">{documents?.length ?? 0}</p>
                <p className="text-xs text-slate-500 mt-1">Documents</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                <p className="text-xs text-slate-500 mt-1">Completed Tasks</p>
              </div>
              <div className={`rounded-lg p-4 text-center border ${pendingTasks.length > 0 ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200"}`}>
                <p className={`text-2xl font-bold ${pendingTasks.length > 0 ? "text-orange-600" : "text-slate-900"}`}>{pendingTasks.length}</p>
                <p className="text-xs text-slate-500 mt-1">Pending Tasks</p>
              </div>
            </div>

            {/* Belgeler */}
            {documents && documents.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">This Month&apos;s Documents</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-slate-500 font-medium">File</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Type</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Date</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="border-b border-slate-100">
                        <td className="py-2 text-slate-700">{doc.file_name}</td>
                        <td className="py-2 text-slate-500">{doc.document_type}</td>
                        <td className="py-2 text-slate-500">{format(new Date(doc.created_at), "d MMM", { locale: enUS })}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === "approved" ? "bg-green-100 text-green-700" : doc.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                            {DOC_DURUM[doc.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Görevler */}
            {tasks && tasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">This Month&apos;s Tasks</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-slate-500 font-medium">Task</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Due Date</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id} className="border-b border-slate-100">
                        <td className="py-2 text-slate-700">{task.title}</td>
                        <td className="py-2 text-slate-500">{format(new Date(task.due_date), "d MMM yyyy", { locale: enUS })}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${task.status === "completed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                            {task.status === "completed" ? "Completed" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-slate-200 pt-4 text-xs text-slate-400 flex justify-between">
              <span>{accountant?.office_name ?? accountant?.full_name}</span>
              <span>Accounting Workflow System</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
