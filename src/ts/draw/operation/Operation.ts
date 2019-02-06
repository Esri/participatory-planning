
import { create as createPromise } from "esri/core/promiseUtils";

import Scene from "../../Scene";
import "../support/extensions";

export default class Operation<TargetType> {

  public static activeOperation: Operation<any> | null;

  public finished: IPromise<TargetType>;

  protected resolve: (value: TargetType) => void;

  protected reject: (error?: any) => void;

  constructor(public scene: Scene) {
    this.finished = createPromise(((resolve: (_: TargetType) => void, reject: (error?: any) => void) => {
      this.resolve = resolve;
      this.reject = reject;
    }) as any);

    this.finished.always(() => {
      if (Operation.activeOperation === this) {
        Operation.activeOperation = null;
      }
    });

    if (Operation.activeOperation) {
      Operation.activeOperation.cancel();
    }
    Operation.activeOperation = this;
  }

  public cancel() {
    this.reject("canceled");
  }

}
