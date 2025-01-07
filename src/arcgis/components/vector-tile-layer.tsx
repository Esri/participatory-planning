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

import { useLayoutEffect, useState } from "react";
import ArcgisVectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import { useWebScene } from "./web-scene";
import PortalItem from "@arcgis/core/portal/PortalItem";

export function VectorTileLayer(props: {
  itemId: string;
  hidden?: boolean
}) {
  const scene = useWebScene();
  const [layer] = useState(() => new ArcgisVectorTileLayer());

  useLayoutEffect(() => {
    layer.visible = !props.hidden;
    if (layer.portalItem?.id !== props.itemId)
      layer.portalItem = new PortalItem({
        id: props.itemId
      })
  }, [layer, props.hidden, props.itemId])

  useLayoutEffect(() => {
    scene.layers.add(layer);
    return () => {
      scene.layers.remove(layer);
    }
  }, [layer, scene.layers])

  return null;
}