import { CompositionRoot } from "../../CompositionRoot";
import { AppContext } from "./AppContext";

interface AppProviderProps {
  children: React.ReactNode;
  compositionRoot?: CompositionRoot;
}

export function AppProvider({
  children,
  compositionRoot = CompositionRoot.getInstance(),
}: AppProviderProps) {
  return (
    <AppContext.Provider value={{ compositionRoot }}>
      {children}
    </AppContext.Provider>
  );
}
