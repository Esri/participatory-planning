import { create as createPromise } from "esri/core/promiseUtils";

import { Operation } from "../../App";
import DrawWidget from "../DrawWidget";

export interface OperationHandle<T> {
  resolve: (_: T) => void;
  reject: (error?: any) => void;
}

interface OperationCancel {
  cancel(): void;
}

export default class WidgetOperation implements Operation {

  private handle: OperationCancel | null;

  constructor(protected widget: DrawWidget) {
  }

  public cancel() {
    if (this.handle) {
      this.handle.cancel();
      this.handle = null;
    }
  }

  protected initiate<T>(start: (_: OperationHandle<T>) => void, cancel: () => void): IPromise<T> {

    const promise = createPromise(((resolve: (_: T) => void, reject: (error?: any) => void) => {
      // Make this the current running operation
      this.widget.app.currentOperation = this;

      this.handle = {cancel};

      start({resolve, reject});
    }) as any);

    promise.always(() => {
      this.widget.app.currentOperation = null;
    });
    return promise;
  }

}
