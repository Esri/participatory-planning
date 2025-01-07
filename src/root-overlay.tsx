/* Copyright 2024 Esri
 *
 * Licensed under the Apache License Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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