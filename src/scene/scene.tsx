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

import { useSuspenseQuery } from "@tanstack/react-query";
import { useSettingsQueryOptions } from "./settings";
import { useWebScene, WebScene } from "../arcgis/components/web-scene";
import { PropsWithChildren, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { SceneView } from "../arcgis/components/scene-view";
import { useMatch } from "react-router-dom";
import { useAccessorValue } from "../arcgis/hooks/useAccessorValue";
import ArcgisSceneView from '@arcgis/core/views/SceneView';
import SceneLayerView from '@arcgis/core/views/layers/SceneLayerView';
import { VectorTileLayer } from "../arcgis/components/vector-tile-layer";
import Polygon from "@arcgis/core/geometry/Polygon";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import { GraphicsLayer } from "../arcgis/components/graphics-layer";
import { PerimeterGraphic } from "./perimeter-graphic";
import { SurfaceGraphic } from "./surface-graphic";
import { FocusAreaGraphic } from "./focus-area-graphic";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter.js";
import { useSceneSettings } from "./scene-store";
import { useLocationState } from "../utilities/hooks";

export function Scene({ children }: PropsWithChildren) {
  const { data: settings } = useSuspenseQuery(useSettingsQueryOptions());

  return (
    <WebScene websceneId={settings.webSceneId}>{children}</WebScene>
  )
}

export function View({ children }: PropsWithChildren) {
  const sceneSettings = useSceneSettings();

  const showBasemap = useAccessorValue(() => sceneSettings.basemap);
  const showPerimeter = useAccessorValue(() => sceneSettings.perimeter);
  const showSurface = useAccessorValue(() => sceneSettings.surface);
  const showFocusArea = useAccessorValue(() => sceneSettings.focusArea);
  const showBuildings = useAccessorValue(() => sceneSettings.buildings);
  const vp = useAccessorValue(() => sceneSettings.viewpoint);

  const scene = useWebScene();
  const view = useRef<ArcgisSceneView>(null);
  const { data: settings } = useSuspenseQuery(useSettingsQueryOptions()); const polygon = useMemo(() => new Polygon({
    rings: [settings.planningArea],
    spatialReference: SpatialReference.WebMercator
  }), [settings.planningArea])

  const initialViewpoint = useAccessorValue(() => scene.initialViewProperties.viewpoint);
  const drawViewpoint = useAccessorValue(() => scene.presentation.slides.getItemAt(0)?.viewpoint);

  const isRootRoute = useMatch("/") != null;
  const state = useLocationState();

  const cameFromDeepLink = !isRootRoute && state?.previousLocationPathname == null;
  const playIntro = state?.playIntro && !cameFromDeepLink;

  useLayoutEffect(() => {
    if (isRootRoute)
      sceneSettings.setConfig('new-plan');
    else if (!isRootRoute) {
      if (cameFromDeepLink && view.current && drawViewpoint) {
        view.current.viewpoint = drawViewpoint
        sceneSettings.setConfig("drawing")
      } else if (!playIntro) sceneSettings.setConfig('drawing-overview');
      if (playIntro) sceneSettings.setConfig('perimeter-overview');
    }
  }, [cameFromDeepLink, drawViewpoint, isRootRoute, playIntro, sceneSettings])

  useEffect(() => {
    switch (vp) {
      case 'initial':
        view.current?.goTo(initialViewpoint, { duration: 1500 })
        break;
      case 'perimeter':
        view.current?.goTo(polygon, { duration: 1500 })
          .finally(() => sceneSettings.setConfig("perimeter-intro"))
        break;
      case 'drawing':
        view.current?.goTo(drawViewpoint, { duration: 1500 })
          .finally(() => sceneSettings.setConfig("drawing"))
    }
  }, [cameFromDeepLink, drawViewpoint, initialViewpoint, polygon, sceneSettings, vp]);

  const buildingLayerView = useAccessorValue(() => view.current?.allLayerViews.find(lv => lv.layer.type === 'scene') as SceneLayerView | undefined);

  useLayoutEffect(() => {
    if (buildingLayerView == null) return;

    if (!showBuildings) {
      const filter = new FeatureFilter({
        geometry: polygon,
        spatialRelationship: 'disjoint'
      })
      buildingLayerView.filter = filter;
    } else {
      buildingLayerView.filter = null!;
    }
  }, [buildingLayerView, polygon, showBuildings]);

  return (
    <SceneView ref={view}>
      <VectorTileLayer
        itemId="5cf1abb43c25482e8a9e373953498999"
        hidden={showBasemap}
      />
      <GraphicsLayer elevationMode="on-the-ground">
        {
          showPerimeter ? (
            <PerimeterGraphic
              perimeter={settings.planningArea}
              onComplete={() => sceneSettings.setConfig('surface-intro')}
              isActive={showPerimeter}
            />
          ) : null
        }
        {showSurface ? (
          <SurfaceGraphic
            surface={settings.planningArea}
            isActive={showSurface}
            onComplete={() => sceneSettings.setConfig('drawing-overview')}
          />
        ) : null}
      </GraphicsLayer>
      {children}
      <GraphicsLayer elevationMode="on-the-ground">
        {showFocusArea ? (
          <FocusAreaGraphic
            surface={settings.planningArea}
            isActive={showFocusArea}
          />
        ) : null}
      </GraphicsLayer>
    </SceneView>
  )
}
