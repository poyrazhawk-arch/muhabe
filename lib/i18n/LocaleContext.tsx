"use client";

import { createContext, useContext } from "react";
import { getDict, type Locale } from "./dictionaries";

const LocaleContext = createContext<Locale>("en");
const IsTurkeyContext = createContext<boolean>(true);

export function LocaleProvider({
  locale, isTurkey = true, children,
}: { locale: Locale; isTurkey?: boolean; children: React.ReactNode }) {
  return (
    <LocaleContext.Provider value={locale}>
      <IsTurkeyContext.Provider value={isTurkey}>{children}</IsTurkeyContext.Provider>
    </LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Türkiye'ye özel özellikler (GİB vb.) bu kullanıcıda gösterilsin mi? */
export function useIsTurkey(): boolean {
  return useContext(IsTurkeyContext);
}

export function useDict() {
  const locale = useLocale();
  return getDict(locale);
}
