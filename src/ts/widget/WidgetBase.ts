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
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Widget from "@arcgis/core/widgets/Widget";

import App from "../App";

@subclass("app.widgets.WidgetBase")
export default class WidgetBase extends Widget {
  @property()
  public app: App;

  constructor(params: any = {}) {
    super(params);
  }

  protected toggleLoadingIndicator(show: boolean, message = "Loading...") {
    this.toggleElement("loadingIndicator", show);
    this.toggleOverlay(show);
    const text = document.getElementById("loadingIndicatorText");
    if (text) {
      text.innerText = message;
    }
  }

  protected toggleElement(id: string, show: boolean) {
    const element = document.getElementById(id);
    if (element) {
      if (show) {
        element.classList.remove("hide");
      } else {
        element.classList.add("hide");
      }
    }
  }

  protected toggleOverlay(show: boolean, opacity = 0.6) {
    this.toggleElement("overlay", show);
    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.style.opacity = opacity.toString();
    }
  }
}
