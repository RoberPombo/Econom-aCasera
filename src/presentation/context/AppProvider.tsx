import { AppContext } from "./AppContext";
import { CompositionRoot } from "../../CompositionRoot";

interface AppProviderProps {
  children: React.ReactNode;
  compositionRoot?: CompositionRoot;
}

export function AppProvider({ children, compositionRoot = CompositionRoot.getInstance() }: AppProviderProps) {
  return <AppContext.Provider value={{ compositionRoot }}>{children}</AppContext.Provider>;
}
