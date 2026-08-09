import React from "react";
import type { CompositionRoot } from "../../CompositionRoot";

export interface AppContextState {
  compositionRoot: CompositionRoot;
}

export const AppContext = React.createContext<AppContextState | null>(null);
