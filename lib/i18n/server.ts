import { cookies, headers } from "next/headers";
import { getDict, type Locale } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("locale")?.value;
  return value === "tr" ? "tr" : "en";
}

/** Kullanıcının ülkesi (ISO-2, büyük harf). Cookie → geo header → varsayılan TR. */
export async function getCountry(): Promise<string> {
  const store = await cookies();
  const c = store.get("country")?.value;
  if (c) return c.toUpperCase();
  const h = await headers();
  return (h.get("x-vercel-ip-country") || "TR").toUpperCase();
}

/** GİB gibi Türkiye'ye özel özellikler bu kullanıcıda gösterilsin mi? */
export async function isTurkey(): Promise<boolean> {
  return (await getCountry()) === "TR";
}

export async function getServerDict() {
  const locale = await getLocale();
  return { locale, dict: getDict(locale) };
}
