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

import { Button } from "react-aria-components"
import { ScreenshotModal } from "../hud-modal";
import { HUDEndButton } from "../hud-button";
import { useMutation } from "@tanstack/react-query";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import { useSceneSettings } from "../../scene/scene-store";
import SceneView from "@arcgis/core/views/SceneView";
import { useSceneView } from "../../arcgis/components/scene-view";
import { useEffect, useState } from "react";

export function Submission(props: { onOpen?: () => void; }) {
  const view = useSceneView()
  const mutation = useScreenshotPreviewMutation();
  const download = useDownloadScreenshotMutation();

  const [open, setOpen] = useState(mutation.isSuccess);

  useEffect(() => {
    setOpen(mutation.isPending || mutation.isSuccess)
  }, [mutation.isPending, mutation.isSuccess]);

  const screenWidth = Math.min(view.width, view.height);

  return (
    <ScreenshotModal
      overlayOpacity={mutation.isPending ? 0.90 : 0.25}
      // overlayOpacity={0}
      isOpen={open}
      isDismissisable={!mutation.isPending}
      onOpenChange={isOpen => {
        setOpen(isOpen)
        if (isOpen) props.onOpen?.();
      }}
      trigger={
        <HUDEndButton onPress={() => {
          mutation.mutate({ view });
        }}>
          Submit plan
        </HUDEndButton>
      }
    >
      {({ close }) => (
        <div className="flex flex-col justify-center items-center min-h-0 flex-1 gap-4">
          <div style={{ '--preview-size': `${screenWidth * 0.8}px` }} className="flex-shrink min-h-0 max-w-full">
            {mutation.isSuccess ? (<img className='w-[var(--preview-size)] h-full animate-fade' src={mutation.data.preview} />) : null}
            {mutation.isPending ? (<div className='w-[var(--preview-size)] h-[var(--preview-size)] flex justify-center items-center'>Capturing scene</div>) : null}
            {mutation.isError ? (<div className='w-[var(--preview-size)] h-[var(--preview-size)] flex justify-center items-center' />) : null}
          </div>
          <div className="w-full flex gap-4">
            <Button
              className="p-2 bg-sky-600 text-white rounded-lg"
              isDisabled={mutation.data == null || download.isPending}
              onPress={() => {
                download.mutate(mutation.data!)
              }}
            >
              Share
            </Button>
            <Button onPress={close} className="p-2 text-sky-600">Back</Button>
          </div>
        </div>
      )}
    </ScreenshotModal>
  )
}

function drawImage(props: {
  canvas: HTMLCanvasElement,
  before: __esri.SceneViewScreenshot,
  after: __esri.SceneViewScreenshot
}) {
  const canvas = props.canvas;
  const before = props.before;
  const after = props.after;

  const height = Math.min(before.data.width, 2 * before.data.height);
  const width = Math.min(before.data.width, 2 * before.data.height);
  canvas.width = width;
  canvas.height = height;


  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const x = -(before.data.width - height) / 2;
  const dirtyY = (before.data.height - height / 2) / 2;
  context.putImageData(before.data, x, -dirtyY, 0, dirtyY, before.data.width, height / 2);
  context.putImageData(after.data, x, height / 2 - dirtyY, 0, dirtyY, after.data.width, height / 2);

  context.font = "bold 50px Helvetica";
  context.fillStyle = "white";
  context.fillText("Now", 15, height / 2 - 22);
  context.fillText("My Plan", 15, height - 22);
}

function useScreenshotPreviewMutation() {
  const sceneSettings = useSceneSettings();

  const mutation = useMutation({
    mutationKey: ['screenshot'],
    mutationFn: async ({ view }: { view: SceneView }) => {
      const screenWidth = Math.min(view.width, view.height);
      const options = { format: "png", width: screenWidth * 0.8 } as const;

      sceneSettings.setConfig('screenshot-before');
      // wait for changes to apply
      await new Promise(resolve => setTimeout(resolve, 100));
      await reactiveUtils.whenOnce(() => !view.updating);

      const before = await view.takeScreenshot(options);

      sceneSettings.setConfig('screenshot-after');
      // wait for changes to apply
      await new Promise(resolve => setTimeout(resolve, 100));
      await reactiveUtils.whenOnce(() => !view.updating);

      const after = await view.takeScreenshot(options);

      sceneSettings.setConfig('drawing');

      const canvas = document.createElement('canvas');

      drawImage({
        canvas,
        before,
        after
      })

      await new Promise(resolve => setTimeout(resolve, 1000));
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png", 1));

      if (blob == null) throw new Error('Failed to generate image');

      return {
        preview: URL.createObjectURL(blob),
        before,
        after
      }
    },
  })

  return mutation;
}

function useDownloadScreenshotMutation() {
  return useMutation({
    mutationFn: async (props: {
      before: __esri.SceneViewScreenshot,
      after: __esri.SceneViewScreenshot
    }) => {
      const filename = "ParticipatoryPlanning.png";
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;

      drawImage({
        canvas,
        before: props.before,
        after: props.after,
      });

      const dataUrl = canvas.toDataURL("image/png");

      // a link is created and a programmatic click will trigger the download
      const element = document.createElement("a");
      element.setAttribute("href", dataUrl);
      element.setAttribute("download", filename);
      element.style.display = "none";
      element.click();
    }
  })
}