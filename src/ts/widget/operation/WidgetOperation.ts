/*
 * Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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

  constructor(protected widget: DrawWidget) {}

  public cancel() {
    if (this.handle) {
      this.handle.cancel();
      this.handle = null;
    }
  }

  protected initiate<T>(
    start: (_: OperationHandle<T>) => void,
    cancel: () => void
  ): Promise<T> {
    const promise = new Promise<T>(((
      resolve: (_: T) => void,
      reject: (error?: any) => void
    ) => {
      // Make this the current running operation
      this.widget.app.currentOperation = this;

      this.handle = { cancel };

      start({ resolve, reject });
    }) as any);

    return promise.finally(() => {
      this.widget.app.currentOperation = null;
    });
  }
}
