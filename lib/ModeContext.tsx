"use client";
import { createContext, useContext } from "react";
import type { AppMode } from "./getMode";
import type { AppTheme } from "./theme";
import { themes } from "./theme";
import { features, hasFeature } from "./features";
import type { FeatureSet } from "./features";

type ModeContextValue = {
  mode: AppMode;
  theme: AppTheme;
  hasFeature: (feature: keyof FeatureSet) => boolean;
};

const ModeContext = createContext<ModeContextValue>({
  mode: "stok",
  theme: themes.stok,
  hasFeature: () => false,
});

export function ModeProvider({
  mode,
  children,
}: {
  mode: AppMode;
  children: React.ReactNode;
}) {
  return (
    <ModeContext.Provider
      value={{
        mode,
        theme: themes[mode],
        hasFeature: (feature) => hasFeature(mode, feature),
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode(): ModeContextValue {
  return useContext(ModeContext);
}

// Usage example in any client component:
//
//   const { mode, theme, hasFeature } = useMode();
//
//   if (hasFeature("petCard")) { ... }
//   <button style={{ background: theme.primary }}>...</button>
