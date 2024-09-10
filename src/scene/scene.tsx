import { useSuspenseQuery } from "@tanstack/react-query";
import { useSettingsQueryOptions } from "./settings";
import { useWebScene, WebScene } from "../arcgis/components/web-scene";
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { SceneView } from "../arcgis/components/scene-view";
import { useLocation, useMatch } from "react-router-dom";
import { useAccessorValue } from "../arcgis/hooks/useAccessorValue";
import ArcgisSceneView from '@arcgis/core/views/SceneView';
import { VectorTileLayer } from "../arcgis/components/vector-tile-layer";
import Polygon from "@arcgis/core/geometry/Polygon";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import { GraphicsLayer } from "../arcgis/components/graphics-layer";
import { PerimeterGraphic } from "./perimeter-graphic";
import { SurfaceGraphic } from "./surface-graphic";
import { FocusAreaGraphic } from "./focus-area-graphic";

export function Scene({ children }: PropsWithChildren) {
  const { data: settings } = useSuspenseQuery(useSettingsQueryOptions());

  return (
    <WebScene websceneId={settings.webSceneId}>{children}</WebScene>
  )
}

export function View({ children }: PropsWithChildren) {
  const scene = useWebScene();
  const view = useRef<ArcgisSceneView>(null);
  const { data: settings } = useSuspenseQuery(useSettingsQueryOptions());

  const initialViewpoint = useAccessorValue(() => scene.initialViewProperties.viewpoint);
  const drawViewpoint = useAccessorValue(() => scene.presentation.slides.getItemAt(0)?.viewpoint);
  const polygon = useMemo(() => new Polygon({
    rings: [settings.planningArea],
    spatialReference: SpatialReference.WebMercator
  }), [settings.planningArea])

  const isRootRoute = useMatch("/") != null;
  const { state } = useLocation();

  const cameFromDeepLink = !isRootRoute && state?.previousLocationPathname == null;
  const playIntro = state?.playIntro && !cameFromDeepLink;

  const [introState, setIntroState] = useState<IntroStep>(cameFromDeepLink ? 5 : 0);
  const introStateConfig = SceneAnimationStateConfig[introState];

  useEffect(() => {
    if (isRootRoute)
      setIntroState(0);
    else if (playIntro) setIntroState(1)
    else setIntroState(5)
  }, [cameFromDeepLink, isRootRoute, playIntro])

  useEffect(() => {
    if (introStateConfig.basemap) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scene.basemap = 'satellite' as any;
    } else {
      scene.basemap = null!
    }
  }, [introStateConfig.basemap, scene])

  useEffect(() => {
    switch (introStateConfig.viewpoint) {
      case 'initial':
        view.current?.goTo(initialViewpoint, { duration: 1500 });
        break;
      case 'perimeter':
        view.current?.goTo(polygon, { duration: 1500 })
          .finally(() => setIntroState(2))
        break;
      case 'drawing':
        if (!cameFromDeepLink) {
          view.current?.goTo(drawViewpoint, { duration: 1500 })
        } else if (view.current) {
          view.current.viewpoint = drawViewpoint ?? view.current.viewpoint;
        }
    }
  }, [introStateConfig.viewpoint, cameFromDeepLink, drawViewpoint, initialViewpoint, polygon]);

  return (
    <SceneView ref={view}>
      <VectorTileLayer hidden={introStateConfig.basemap} itemId="5cf1abb43c25482e8a9e373953498999" />
      <GraphicsLayer elevationMode="on-the-ground">
        <PerimeterGraphic
          perimeter={settings.planningArea}
          onComplete={() => setIntroState(state => state + 1 as IntroStep)}
          isActive={introStateConfig.perimeter}
        />
        <SurfaceGraphic
          surface={settings.planningArea}
          isActive={introStateConfig.surface}
          onComplete={() => setIntroState(state => state + 1 as IntroStep)}
        />
        <FocusAreaGraphic surface={settings.planningArea} isActive={introStateConfig.focusArea} />
      </GraphicsLayer>
      {children}
    </SceneView>
  )
}

export type IntroStep = 0 | 1 | 2 | 3 | 4 | 5;

const SceneAnimationStateConfig = {
  0: {
    perimeter: false,
    surface: false,
    focusArea: false,
    basemap: true,
    viewpoint: 'initial'
  },
  1: {
    perimeter: false,
    surface: false,
    focusArea: false,
    basemap: true,
    viewpoint: 'perimeter'
  },
  2: {
    perimeter: true,
    surface: false,
    focusArea: true,
    basemap: true,
    viewpoint: 'perimeter'
  },
  3: {
    perimeter: true,
    surface: true,
    focusArea: true,
    basemap: true,
    viewpoint: 'perimeter'
  },
  4: {
    perimeter: false,
    surface: false,
    focusArea: true,
    basemap: false,
    viewpoint: 'drawing'
  },
  5: {
    perimeter: false,
    surface: false,
    focusArea: true,
    basemap: false,
    viewpoint: 'drawing'
  },
} as const satisfies Record<IntroStep, Record<string, unknown>>