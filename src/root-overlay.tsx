import { createContext, PropsWithChildren, useState, useLayoutEffect, useContext } from "react";
import { createPortal } from "react-dom";

const RootOverlayContext = createContext<HTMLElement | null>(null!);
export function RootOverlayProvider({ id, children }: PropsWithChildren<{ id: string }>) {
  const [element, setElement] = useState(() => document.getElementById(id));

  useLayoutEffect(() => {
    const element = document.getElementById(id);
    setElement(element);
  }, [id]);

  return (
    <RootOverlayContext.Provider value={element}>
      {children}
    </RootOverlayContext.Provider>
  )
}

export function RootOverlayPortal({ children }: PropsWithChildren) {
  const element = useContext(RootOverlayContext);

  if (element == null) return null;

  return createPortal(children, element);
}