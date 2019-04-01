import { create as createPromise } from "esri/core/promiseUtils";

export const dojoPromise = <T>(nativePromise: Promise<T>): IPromise<T> => {
  return createPromise(((resolve: any, reject: any) => {
    return nativePromise
      .then(resolve)
      .catch(reject);
  }) as any);
};
