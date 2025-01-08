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

import { HUDSubBar } from "../hud-sub-bar";
import { NewPlanModal } from "../dialogs/new-plan";
import { Submission } from "../dialogs/submission";
import { ToolbarButton, GridButton, ToolkitButton } from "../hud-button";
import { useAccessorValue } from "../../arcgis/hooks/useAccessorValue";
import { ComponentProps, PropsWithChildren, Suspense, useEffect, useMemo, useRef } from "react";

import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { EditorToolConfig } from "../../editor/tool-config";
import { Toolkits, ToolkitConfig } from "../tool-config";
import { useMatch } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HUDSubGrid } from "../hud-sub-grid";
import { SketchfabImportTool } from "../../sketch-fab/sketch-fab-importer";
import { useSceneSettings } from "../../scene/scene-store";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getStyleName, styleNameMatchesGroup, webStyleGroupItemsQueryOptions, webStyleGroupListQueryOptions } from "../../scene/web-styles";
import PortalItem from "@arcgis/core/portal/PortalItem";
import { createGeometry, useEditor } from "../../editor/editor";
import { useSceneView } from "../../arcgis/components/scene-view";
import { GraphicsLayer, useGraphicsContext } from "../../arcgis/components/graphics-layer";
import { useSettingsQueryOptions } from "../../scene/settings";
import Polygon from "@arcgis/core/geometry/Polygon";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";

export function Toolbar(props: { identityDialog: boolean, selectedToolkit: string | null, toggleToolkit: (toolkit: string) => void; }) {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useEditor();

  const staticToolkits = Toolkits
    .filter(toolkit => toolkit.tools != null);

  const gltfToolkit = Toolkits.find(toolkit => toolkit.id === 'gltf')!;

  const isRootRoute = useMatch("/") != null;

  const sceneSettings = useSceneSettings();
  const showGraphics = useAccessorValue(() => sceneSettings.graphics);

  const { data } = useSuspenseQuery(webStyleGroupListQueryOptions());

  const dynamicToolkits = Toolkits
    .filter(toolkit => toolkit.tools == null && toolkit.id !== 'gltf');

  const dynamicToolkitPortalItems = dynamicToolkits.map(toolkit => [
    toolkit,
    data?.filter(item => styleNameMatchesGroup(toolkit.id, getStyleName(item)))
  ] as const);

  useEffect(() => {
    editor.activeOperation?.cancel()
  }, [editor, props.selectedToolkit])

  const queryClient = useQueryClient();
  useEffect(() => {
    data.map(item => queryClient.prefetchQuery(webStyleGroupItemsQueryOptions(item)))
  }, [data, queryClient])

  return (
    <div
      ref={ref}
      className="bg-white/80 w-fit flex rounded-lg justify-between gap-8 p-4 px-12 pointer-events-auto"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          editor.activeOperation?.cancel();
        }
      }}
    >
      {!props.identityDialog ? <NewPlanModal /> : null}
      <GraphicsLayer key={isRootRoute ? 'reset-on-the-ground' : 'draw-on-the-ground'} hidden={!showGraphics} elevationMode="on-the-ground">
        {
          staticToolkits.map(toolkit => (
            <Toolkit
              key={toolkit.id}
              selected={props.selectedToolkit === toolkit.id}
              toggle={() => props.toggleToolkit(toolkit.id)}
              triggerRef={ref}
              tool={toolkit}
              closeWhenActive={toolkit.closeWhenActive}
            >
              <HUDSubBar>
                {toolkit.tools!.map(tool => (
                  <BarButtonToolTrigger
                    key={tool.id}
                    toolkit={toolkit.id}
                    id={tool.id}
                    label={tool.label}
                    drawingMode={toolkit.drawingMode}
                    symbol={tool.symbol}
                  />
                ))}
              </HUDSubBar>
            </Toolkit>
          ))
        }
      </GraphicsLayer>
      <GraphicsLayer key={isRootRoute ? 'reset-relative-to-scene' : 'draw-relative-to-scene'} hidden={!showGraphics} elevationMode="relative-to-scene">
        {
          dynamicToolkitPortalItems.map(([toolkit, styleGroup]) => (
            <Toolkit
              key={toolkit.id}
              selected={props.selectedToolkit === toolkit.id}
              toggle={() => props.toggleToolkit(toolkit.id)}
              triggerRef={ref}
              tool={toolkit}
              closeWhenActive={toolkit.closeWhenActive}
            >
              <HUDSubGrid>
                <Suspense>
                  {
                    styleGroup.map(style => (
                      <DynamicTools key={style.id} item={style} toolkit={toolkit} />
                    ))
                  }
                </Suspense>
              </HUDSubGrid>
            </Toolkit>
          ))
        }
        <ToolkitButton onPress={() => props.toggleToolkit('gltf')} isActive={props.selectedToolkit === 'gltf'}>
          <span >{<Icon icon={gltfToolkit.icon} />}</span>
          <span className="text-xs">{gltfToolkit.name}</span>
          <SketchfabImportTool onComplete={() => props.toggleToolkit('gltf')} />
        </ToolkitButton>
      </GraphicsLayer>

      <Submission
        onOpen={() => {
          if (props.selectedToolkit) props.toggleToolkit(props.selectedToolkit);
        }}
      />
    </div>
  )
}

function useTool(props: EditorToolConfig) {
  const view = useSceneView();
  const layer = useGraphicsContext();
  const editor = useEditor();
  const { data: settings } = useSuspenseQuery(useSettingsQueryOptions());
  const polygon = useMemo(() => new Polygon({
    rings: [settings.planningArea],
    spatialReference: SpatialReference.WebMercator
  }), [settings.planningArea])

  const mutation = useMutation({
    mutationFn: () => {
      const operation = createGeometry({
        view,
        layer,
        symbol: props.symbol,
        boundary: polygon
      })

      editor.applyOperation(operation);
      return operation.promise;
    },
    onSuccess: () => {
      if (props.drawingMode === 'continuous') mutation.mutate();
    }
  })

  return { start: mutation.mutate, isActive: mutation.isPending }
}

function Toolkit(props: PropsWithChildren<{
  triggerRef: ComponentProps<typeof Popover>['triggerRef'],
  tool: ToolkitConfig,
  closeWhenActive?: boolean,
  selected: boolean,
  toggle: () => void;
}>) {
  const editor = useEditor();

  const isActive = useAccessorValue(() => editor.isActive);

  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isOpen =
    props.closeWhenActive ? props.selected && !isActive : props.selected

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (editor.activeOperation) {
          editor.activeOperation?.cancel();
        } else if (props.selected) {
          props.toggle();
        }
      }
      if (event.key === 'c') {
        editor.activeOperation?.complete();
      }
    }, { signal: controller.signal, capture: true })

    return () => { controller.abort() }
  })

  return (
    <DialogTrigger>
      <ToolkitButton ref={buttonRef} onPress={() => props.toggle()} isActive={props.selected}>
        <span >{<Icon icon={props.tool.icon} />}</span>
        <span className="text-xs">{props.tool.name}</span>
      </ToolkitButton>
      <Popover
        isNonModal
        offset={16}
        shouldCloseOnInteractOutside={(element) => {
          return element instanceof HTMLButtonElement && element !== buttonRef.current
        }}
        triggerRef={props.triggerRef}
        isOpen={isOpen}
        ref={popoverRef}
      >
        <Dialog>
          {props.children}
        </Dialog>
      </Popover>
    </DialogTrigger >
  )
}

function GridButtonToolTrigger(props: PropsWithChildren<EditorToolConfig>) {
  const { start, isActive } = useTool(props);

  return (
    <GridButton onPress={start} isActive={isActive}>
      {props.children}
    </GridButton>
  )
}

function BarButtonToolTrigger(props: EditorToolConfig) {
  const { start, isActive } = useTool({ ...props });

  return (
    <ToolbarButton onPress={start} isActive={isActive}>
      {props.label}
    </ToolbarButton>
  )
}

function DynamicTools(props: { toolkit: ToolkitConfig, item: PortalItem }) {
  const { data } = useSuspenseQuery(webStyleGroupItemsQueryOptions(props.item))

  return (
    data.map(style => (
      <GridButtonToolTrigger
        key={style.webSymbol.name}
        id={style.webSymbol.name}
        label={style.webSymbol.name}
        symbol={style.symbol}
        toolkit={props.toolkit.id}
        drawingMode={props.toolkit.drawingMode}
      >
        <img src={style.thumbnail} alt={style.webSymbol.name} />
      </GridButtonToolTrigger>
    ))
  )
}

function Icon(props: ComponentProps<typeof FontAwesomeIcon>) {
  return <FontAwesomeIcon {...props} className='h-[25px] aspect-square' />
}
