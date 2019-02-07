
import { create as createPromise } from "esri/core/promiseUtils";

import Scene from "../../Scene";
import "../support/extensions";

export default class Operation<TargetType = any> {

  public finished: IPromise<TargetType>;

  protected resolve: (value: TargetType) => void;

  protected reject: (error?: any) => void;

  constructor(public scene: Scene) {
    this.finished = createPromise(((resolve: (_: TargetType) => void, reject: (error?: any) => void) => {
      this.resolve = resolve;
      this.reject = reject;
    }) as any);

    const lastOp = scene.currentOperation;
    if (lastOp) {
      lastOp.cancel();
    }

    scene.currentOperation = this;
    this.finished.always(() => {
      if (scene.currentOperation === this) {
        scene.currentOperation = null;
      }
    });
  }

  public cancel() {
    this.reject("canceled");
  }

}
