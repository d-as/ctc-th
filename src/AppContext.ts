import { createContext } from "react";

export const AppContext = createContext({
  showTransposedGrid: false,
  setShowTransposedGrid: (show: boolean) => {}
});
