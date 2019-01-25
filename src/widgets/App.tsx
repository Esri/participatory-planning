
import {
  declared,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

import Scene from "./Scene";

@subclass("app.widgets.webmapview")
export default class App extends declared(Widget) {

  private scene: Scene = new Scene();

  public render() {
    return (
      <div>
        <div id="scene" bind={ this } afterCreate={ this._attachScene } />
      </div>
    );
  }

  private _attachScene(element: HTMLDivElement) {
    this.scene.container = element;
  }

}
