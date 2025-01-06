/* Copyright 2024 Esri
 *
 * Licensed under the Apache License Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as FA from '@fortawesome/free-solid-svg-icons'
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import WaterSymbol3DLayer from "@arcgis/core/symbols/WaterSymbol3DLayer.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { Symbol } from "@arcgis/core/symbols";
import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D.js";

export type ToolkitConfig = {
  id: string;
  name: string;
  elevationMode: GraphicsLayer['elevationInfo']['mode'];
  closeWhenActive: boolean,
  icon: FA.IconDefinition,
  tools?: EditorToolConfig[],
  drawingMode: 'single' | 'continuous';
}

const BUILDING_FLOOR_HEIGHT = 3;
export const Toolkits: ToolkitConfig[] = [
  {
    id: "ground",
    name: 'Ground',
    elevationMode: 'on-the-ground',
    closeWhenActive: false,
    icon: FA.faLayerGroup,
    drawingMode: 'single',
    tools: [
      {
        id: 'ground',
        label: 'Create ground',
        symbol: new SimpleFillSymbol({
          color: "#f0f0f0",
          outline: {
            width: 0
          }
        })
      },
      {
        id: 'lawn',
        label: 'Create lawn',
        symbol: new SimpleFillSymbol({
          color: "#bdce8a",
          outline: {
            width: 0
          }
        })
      },
      {
        id: 'beach',
        label: 'Create beach',
        symbol: new SimpleFillSymbol({
          color: "#dfca8f",
          outline: {
            width: 0
          }
        })
      },
      {
        id: 'water',
        label: 'Create water',
        symbol: new PolygonSymbol3D({
          symbolLayers: [
            new WaterSymbol3DLayer({
              waveDirection: 180,
              color: "#a0b4cf",
              waveStrength: "slight",
              waterbodySize: "small"
            })
          ],
        })
      }
    ]
  },
  {
    id: "paths",
    name: 'Paths',
    elevationMode: 'on-the-ground',
    closeWhenActive: false,
    icon: FA.faRoad,
    drawingMode: 'single',
    tools: [
      {
        id: 'street',
        label: 'Create street',
        symbol: new SimpleLineSymbol({
          color: "#cbcbcb",
          width: 20
        })
      },
      {
        id: 'walkingPath',
        label: 'Create walking path',
        symbol: new SimpleLineSymbol({
          color: "#b2b2b2",
          width: 3
        })
      }
    ]
  },
  {
    id: "buildings",
    name: 'Buildings',
    elevationMode: 'on-the-ground',
    closeWhenActive: false,
    icon: FA.faBuilding,
    drawingMode: 'single',
    tools: [
      {
        id: 'threeFloors',
        label: "3-Story building",
        symbol: new PolygonSymbol3D({
          symbolLayers: [{
            type: "extrude",
            material: {
              color: '#ffffff',
            },
            edges: new SolidEdges3D({
              color: [100, 100, 100],
            }),
            size: 3 * BUILDING_FLOOR_HEIGHT,
          }],
        })
      },
      {
        id: 'fiveFloors',
        label: "5-Story building",
        symbol: new PolygonSymbol3D({
          symbolLayers: [{
            type: "extrude",
            material: {
              color: '#ffffff',
            },
            edges: new SolidEdges3D({
              color: [100, 100, 100],
            }),
            size: 5 * BUILDING_FLOOR_HEIGHT,
          }],
        })
      },
      {
        id: 'tenFloors',
        label: "10-Story building",
        symbol: new PolygonSymbol3D({
          symbolLayers: [{
            type: "extrude",
            material: {
              color: '#ffffff',
            },
            edges: new SolidEdges3D({
              color: [100, 100, 100],
            }),
            size: 10 * BUILDING_FLOOR_HEIGHT,
          }],
        })
      }
    ]
  },
  {
    id: "icons",
    name: 'Icons',
    elevationMode: 'relative-to-scene',
    closeWhenActive: true,
    icon: FA.faMapMarkerAlt,
    drawingMode: 'continuous'
  },
  {
    id: "trees",
    name: 'Trees',
    elevationMode: 'relative-to-scene',
    closeWhenActive: true,
    icon: FA.faTree,
    drawingMode: 'continuous'
  },
  {
    id: "vehicles",
    name: 'Vehicles',
    elevationMode: 'relative-to-scene',
    closeWhenActive: true,
    icon: FA.faCar,
    drawingMode: 'continuous'
  },
  {
    id: 'gltf',
    name: 'glTF',
    icon: FA.faCloudDownloadAlt,
    elevationMode: 'relative-to-scene',
    closeWhenActive: true,
    drawingMode: 'single'
  }
]

export type EditorToolConfig = {
  id: string;
  label: string;
  symbol: Symbol;
  thumbnail?: string;
  createOperation?: (sketch: SketchViewModel) => void;
}