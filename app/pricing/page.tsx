import type { Metadata } from "next";
import PricingPage from "./PricingPage";

export const metadata: Metadata = {
  title: "Pricing — Ledger",
  description:
    "Simple, transparent pricing for accounting practices. Tasks, documents, clients, and UK tax calendar — one place. 14-day free trial.",
};

export default function PricingRoute() {
  return <PricingPage />;
}
