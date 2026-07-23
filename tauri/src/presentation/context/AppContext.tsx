import React from "react";
import { CompositionRoot } from "../../CompositionRoot";

export interface AppContextState {
  compositionRoot: CompositionRoot;
}

export const AppContext = React.createContext<AppContextState | null>(null);
