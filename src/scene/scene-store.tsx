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

import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { useMatch } from "react-router-dom";

@subclass()
export class SceneSettings extends Accessor {
  @property()
  perimeter!: boolean;

  @property()
  surface!: boolean;

  @property()
  focusArea!: boolean;

  @property()
  basemap!: boolean;

  @property()
  buildings!: boolean;

  @property()
  graphics!: boolean;

  @property()
  viewpoint:
    | 'initial'
    | 'perimeter'
    | 'drawing'
    | null = null;

  setConfig(config: keyof typeof SceneStateConfig | keyof typeof SceneStateConfigIndex) {
    const preset =
      typeof config === 'number'
        ? SceneStateConfig[SceneStateConfigIndex[config]]
        : SceneStateConfig[config];

    this.perimeter = preset.perimeter;
    this.surface = preset.surface;
    this.focusArea = preset.focusArea;
    this.basemap = preset.basemap;
    this.buildings = preset.buildings;
    this.graphics = preset.graphics;
    this.viewpoint = preset.viewpoint;
  }
}

const SceneStateConfigIndex = {
  0: 'new-plan',
  1: 'perimeter-overview',
  2: 'perimeter-intro',
  3: 'surface-intro',
  4: 'drawing-overview',
  5: 'drawing',
  6: 'screenshot-before',
  7: 'screenshot-after',
} as const;

const SceneStateConfig = {
  'new-plan': {
    perimeter: false,
    surface: false,
    focusArea: false,
    basemap: true,
    buildings: true,
    graphics: false,
    viewpoint: 'initial'
  },
  'perimeter-overview': {
    perimeter: false,
    surface: false,
    focusArea: false,
    basemap: true,
    buildings: true,
    graphics: false,
    viewpoint: 'perimeter'
  },
  'perimeter-intro': {
    perimeter: true,
    surface: false,
    focusArea: true,
    basemap: true,
    buildings: true,
    graphics: false,
    viewpoint: 'perimeter'
  },
  'surface-intro': {
    perimeter: true,
    surface: true,
    focusArea: true,
    basemap: true,
    buildings: true,
    graphics: false,
    viewpoint: 'perimeter'
  },
  'drawing-overview': {
    perimeter: false,
    surface: false,
    focusArea: true,
    basemap: false,
    buildings: false,
    graphics: false,
    viewpoint: 'drawing'
  },
  'drawing': {
    perimeter: false,
    surface: false,
    focusArea: true,
    basemap: false,
    buildings: false,
    graphics: true,
    viewpoint: null
  },
  'screenshot-before': {
    perimeter: false,
    surface: false,
    focusArea: false,
    basemap: true,
    buildings: true,
    graphics: false,
    viewpoint: null
  },
  'screenshot-after': {
    perimeter: false,
    surface: false,
    focusArea: false,
    basemap: false,
    buildings: false,
    graphics: true,
    viewpoint: null
  }
} as const

const SceneSettingsContext = createContext<SceneSettings>(null!);

export function SceneSettingsProvider(props: PropsWithChildren) {
  const isRootRoute = useMatch("/") != null;
  const [settings] = useState(() => new SceneSettings(
    isRootRoute ? SceneStateConfig["new-plan"] : SceneStateConfig['drawing']
  ));
  return (
    <SceneSettingsContext.Provider value={settings}>
      {props.children}
    </SceneSettingsContext.Provider>
  )
}

export function useSceneSettings() {
  return useContext(SceneSettingsContext);
}