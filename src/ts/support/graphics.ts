
// esri
import Accessor from "esri/core/Accessor";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";

export const redraw = <T>(graphic: Graphic, propertyName: string, value: T): Graphic => {
  const layer = graphic.layer as GraphicsLayer;
  if (!layer) {
    throw new Error("Graphic must belong to a GraphicsLayer");
  }

  const clone = graphic.clone();
  layer.remove(graphic);
  clone.set(propertyName, value);
  layer.add(clone);
  return clone;
};
