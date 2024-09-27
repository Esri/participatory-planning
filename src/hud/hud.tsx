import { HUDSubBar } from "./hud-sub-bar";
import { NewPlanModal } from "./routes/new-plan";
import { Submission } from "./routes/submission";
import { HUDButton, HUDLink } from "./hud-button";
import { useWebScene } from "../arcgis/components/web-scene";
import { useAccessorValue } from "../arcgis/hooks/useAccessorValue";
import { useSceneView } from "../arcgis/components/scene-view";
import { ComponentProps, PropsWithChildren, useEffect, useRef, useState } from "react";

import './hud-styles.css';
import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { EditorProvider, SketchLayer, useEditor } from "../drawing/editor";
import ArcgisGraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import { splitGraphic } from "../drawing/drawing-tool";
import { useQuery } from "@tanstack/react-query";
import { useSettingsQueryOptions } from "../scene/settings";
import Polygon from "@arcgis/core/geometry/Polygon";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Graphic from "@arcgis/core/Graphic";
import { tools, toolEntries } from "./tool-config";

function Timeline() {
  const scene = useWebScene();
  const view = useSceneView();

  const slides = useAccessorValue(() => (scene.presentation.slides.map(slide => slide.id), scene.presentation.slides.toArray())) ?? [];

  return (
    <HUDSubBar>
      {slides.map(slide => (<HUDButton key={slide.id} onPress={() => {
        slide.applyTo(view)
      }}>{slide.title.text}</HUDButton>))}
    </HUDSubBar>
  );
}

export function HUD() {
  const [identityDialog, setIdentityDialog] = useState(false)
  const [observer] = useState(() => new MutationObserver(() => {
    const authPopup = document.body.querySelector(".esri-identity-modal")
    setIdentityDialog(authPopup != null);
  }));

  useEffect(() => {
    observer.observe(document.body, { childList: true })
  })

  const ref = useRef<HTMLDivElement>(null)

  const onTheGroundTools2 = toolEntries.filter(([, tool]) => tool.elevationMode === 'on-the-ground');
  const relativeToSceneTools2 = toolEntries.filter(([, tool]) => tool.elevationMode === 'relative-to-scene');

  const { data: settings } = useQuery(useSettingsQueryOptions());

  return (
    <div className="flex flex-col gap-4 items-center justify-center flex-1 pointer-events-none">
      <Timeline />
      <div className="flex-grow"></div>
      <div ref={ref} className="bg-white/80 w-fit flex rounded-lg justify-between gap-8 p-4 px-12 pointer-events-auto">
        {!identityDialog ? <NewPlanModal /> : null}
        <EditorProvider
          onCreate={(graphic) => {
            if (settings?.planningArea == null) return;

            const polygon = new Polygon({
              rings: [settings!.planningArea],
              spatialReference: SpatialReference.WebMercator
            })
            const layer = graphic.layer as ArcgisGraphicsLayer
            const index = layer.graphics.indexOf(graphic)

            const geometry = graphic.geometry;
            const intersection = geometryEngine.intersect(polygon, geometry) as typeof geometry;
            graphic.geometry = intersection

            const parts = splitGraphic(graphic)

            layer.graphics.addMany(parts, index);
            layer.remove(graphic);
          }}
          onUpdate={(graphic, index) => {
            if (settings?.planningArea == null) return;

            const polygon = new Polygon({
              rings: [settings!.planningArea],
              spatialReference: SpatialReference.WebMercator
            })

            const layer = graphic.layer as ArcgisGraphicsLayer;
            const geometry = graphic.geometry;
            const intersection = geometryEngine.intersect(polygon, geometry) as typeof geometry;

            if (intersection != null) {
              layer.graphics.forEach((g, idx) => {
                g.attributes ??= {}
                g.attributes.idx = idx
              });

              graphic.geometry = intersection;

              const parts = splitGraphic(graphic);
              const graphicsAfter = layer.graphics.slice(index, -1).toArray();

              layer.remove(graphic);
              layer.removeMany(graphicsAfter);

              layer.graphics.addMany(parts, index)
              layer.graphics.addMany(graphicsAfter.map((g) => Graphic.fromJSON(g.toJSON())))
            } else {
              layer.remove(graphic);
            }
          }}
        >
          <SketchLayer elevationMode="on-the-ground">
            {onTheGroundTools2.map(([key, tool]) => (
              <Tool
                key={key}
                triggerRef={ref}
                tool={tool}
                closeWhenActive={tool.closeWhenActive}
              >
                {tool.element}
              </Tool>
            ))}
          </SketchLayer>
          <SketchLayer elevationMode="relative-to-scene">
            {relativeToSceneTools2.map(([key, tool]) => (
              <Tool
                key={key}
                triggerRef={ref}
                tool={tool}
                closeWhenActive={tool?.closeWhenActive}
              >
                {tool.element}
              </Tool>
            ))}
          </SketchLayer>
        </EditorProvider>
        <Submission />
      </div>
    </div>
  );
}

function Tool(props: PropsWithChildren<{
  triggerRef: ComponentProps<typeof Popover>['triggerRef'],
  tool: typeof tools[number],
  closeWhenActive?: boolean
}>) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null);

  const editor = useEditor();

  const activeTool = useAccessorValue(() => editor?.activeTool);
  const isActive = activeTool?.name === props.tool.name;

  useEffect(() => {
    if (isActive && props.closeWhenActive) setOpen(false);
  }, [isActive, props.closeWhenActive])

  return (
    <DialogTrigger>
      <HUDLink ref={buttonRef} onPress={() => setOpen(!open)} className={
        "hudlink flex flex-col" + (isActive || open ? " text-sky-700" : "")
      }>
        <span >{props.tool.icon}</span>
        <span className="text-xs">{props.tool.name}</span>
        {props.tool.preloadElement}
      </HUDLink>
      <Popover
        isNonModal
        offset={16}
        shouldCloseOnInteractOutside={(element) => {
          return element instanceof HTMLButtonElement && element !== buttonRef.current
        }}
        triggerRef={props.triggerRef}
        isOpen={open}
        onOpenChange={setOpen}
      >
        <Dialog>
          {props.children}
        </Dialog>
      </Popover>
    </DialogTrigger >
  )
}
