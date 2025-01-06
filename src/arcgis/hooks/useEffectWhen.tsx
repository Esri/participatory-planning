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

import { useRef, useEffect } from "react";
import * as ru from "@arcgis/core/core/reactiveUtils";

export function useEffectWhen<Value>(
  getValue: () => Value,
  callback: (next: Value, previous?: Value | null) => void,
  options?: __esri.ReactiveWatchOptions,
) {
  // this allows us to keep the `getValue` callback out of the `subscribe` methods dependency array
  // this way, the handle will not be removed any time getValue changes,
  // so users can worry less about memoizing the getter
  const currentGetter = useRef<typeof getValue>(getValue);
  const currentCallback = useRef<typeof callback>(getValue);
  useEffect(() => {
    currentGetter.current = getValue;
    currentCallback.current = callback;
  });

  useEffect(() => {
    const handle = ru.when(
      () => currentGetter.current(),
      (...args) => currentCallback.current(...args),
      {
        initial: options?.initial,
        equals: options?.equals,
        once: options?.once,
        sync: options?.sync,
      },
    );

    return handle.remove;
  }, [options?.initial, options?.equals, options?.once, options?.sync]);
}