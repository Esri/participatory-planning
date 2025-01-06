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

import { useEffect, useMemo, useRef } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useGraphicsContext } from "../arcgis/components/graphics-layer";
import { useSceneView } from "../arcgis/components/scene-view";
import { placeMesh, useEditor } from "../editor/editor";
import Polygon from "@arcgis/core/geometry/Polygon";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import { useSettingsQueryOptions } from "../scene/settings";

export function SketchfabImport(props: { isActive: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current
    if (container) {
      let throttled = false;
      new SketchfabImporter(container, {
        onModelSelected: async function (result) {
          if (!throttled) {
            window.dispatchEvent(new SketchFabModelSelectedEvent(result))
            throttled = true;
            setTimeout(() => throttled = false)
          }
        }
      });

      return () => { container.innerHTML = "" }
    }
  }, [])

  useEffect(() => {
    if (props.isActive) {
      const container = ref.current
      const iframe = container?.querySelector("iframe");
      iframe?.contentWindow?.focus();
    }
  }, [props.isActive])

  return (
    <div
      ref={ref}
      style={{ visibility: props.isActive ? 'visible' : 'hidden' }}
      className="w-full h-full rounded-md overflow-hidden pointer-events-auto"
    />
  );
}

export function SketchfabImportTool(props: { onComplete?: () => void; }) {
  const view = useSceneView();
  const layer = useGraphicsContext();
  const editor = useEditor();
  const { data: settings } = useSuspenseQuery(useSettingsQueryOptions());
  const polygon = useMemo(() => new Polygon({
    rings: [settings.planningArea],
    spatialReference: SpatialReference.WebMercator
  }), [settings.planningArea])

  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const operation = placeMesh({
        view, layer, url, boundary: polygon
      })

      editor.applyOperation(operation);
      return operation.promise;
    },
    onSuccess: props.onComplete
  });

  const mutate = mutation.mutate;

  useEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      'sketchfab-model-selected',
      ((event: SketchFabModelSelectedEvent) => {
        const url = event.download.glb.url
        mutate(url);
      }) as EventListener,
      { signal: controller.signal })

    return () => controller.abort();
  }, [mutate]);

  return null;
}

class SketchFabModelSelectedEvent extends Event {
  download: SketchFabDownloadInfo;
  model: SketchFabModelMetadata;

  constructor(data: SketchFabImport, options?: EventInit) {
    super('sketchfab-model-selected', options);
    this.download = data.download;
    this.model = data.model;
  }
}

declare global {
  class SketchfabImporter {
    constructor(
      el: HTMLElement,
      options: { onModelSelected: (result: SketchFabImport) => void }
    );
  }

  interface SketchFabImport {
    download: SketchFabDownloadInfo;
    model: SketchFabModelMetadata;
  }

  interface SketchFabDownloadInfo {
    source: SketchFabModelDownloadInfo;
    gltf: SketchFabModelDownloadInfo;
    usdz: SketchFabModelDownloadInfo;
    glb: SketchFabModelDownloadInfo;
  }

  interface SketchFabModelDownloadInfo {
    "url": string;
    "size": number;
    "expires": number
  }

  interface SketchFabModelMetadata {
    name: string;
    isDownloadable: boolean;
    license: {
      uri: string;
      label: string;
      fullName: string;
      requirements: string;
      url: string;
      slug: string;
    }
  }
}
