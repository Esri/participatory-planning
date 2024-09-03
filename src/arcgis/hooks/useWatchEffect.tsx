import { useRef, useEffect } from "react";
import * as ru from "@arcgis/core/core/reactiveUtils";

export function useWatch<Value>(
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
    const handle = ru.watch(
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
