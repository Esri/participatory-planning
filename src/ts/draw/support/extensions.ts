
import Color from "esri/Color";

declare namespace asdf {
  interface Color {
    withAlpha: (a: number) => Color;
  }
}

Color.prototype.withAlpha = function(a: number): Color {
  const clone = this.clone();
  clone.a = a;
  return clone;
};
