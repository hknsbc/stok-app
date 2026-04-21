"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { type Lang, translations } from "./i18n";

type T = typeof translations[Lang];

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
}

const LangContext = createContext<LangContextType>({
  lang: "tr",
  setLang: () => {},
  t: translations.tr,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "tr" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
