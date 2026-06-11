import KampanyaGonderici from "./KampanyaGonderici";

export default function KampanyaPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>
          Kampanya Gönder
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
          Apify CSV'sini yapıştırın → template seçin → gönderin
        </p>
      </div>
      <KampanyaGonderici />
    </div>
  );
}
