import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { Symbol } from "@arcgis/core/symbols";

export type EditorToolConfig = {
  id: string;
  label: string;
  symbol: Symbol;
  thumbnail?: string;
  toolkit: string;
  drawingMode: 'single' | 'continuous';
  createOperation?: (sketch: SketchViewModel) => void;
}