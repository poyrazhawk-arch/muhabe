import type { RAGStatus } from "@/types";

/**
 * Müşteri RAG durumunu hesaplar.
 * Kırmızı: geciken görev veya 3+ bekleyen belge
 * Sarı: yaklaşan son tarih (3 gün) veya 1-2 bekleyen belge
 * Yeşil: her şey yolunda
 */
export function calculateRAG(
  overdueTaskCount: number,
  pendingDocumentCount: number,
  tasksDueSoon: number // 3 gün içinde
): RAGStatus {
  if (overdueTaskCount > 0 || pendingDocumentCount >= 3) return "red";
  if (tasksDueSoon > 0 || pendingDocumentCount >= 1) return "amber";
  return "green";
}

export const RAG_LABELS: Record<RAGStatus, string> = {
  red: "Kritik",
  amber: "Dikkat",
  green: "İyi",
};

export const RAG_COLORS: Record<RAGStatus, string> = {
  red: "bg-red-100 text-red-700 border-red-200",
  amber: "bg-yellow-100 text-yellow-700 border-yellow-200",
  green: "bg-green-100 text-green-700 border-green-200",
};
