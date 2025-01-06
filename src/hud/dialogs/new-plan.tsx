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

import { Button, Heading } from "react-aria-components"
import { HUDModal } from "../hud-modal";
import { useMatch, useSearchParams } from "react-router-dom";
import { HUDEndButton } from "../hud-button";
import { PropsWithChildren } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SettingsValidationError, useSettingsQueryOptions } from "../../scene/settings";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useWebScene } from "../../arcgis/components/web-scene";
import { useAccessorValue } from "../../arcgis/hooks/useAccessorValue";
import { useSearchPreservingNavigate } from "../../utilities/hooks";

function InvalidSettinsgBoundary(props: FallbackProps) {
  const [, setParams] = useSearchParams();
  if (!(props.error instanceof SettingsValidationError)) throw props.error;

  return (
    <div className="flex gap-6">
      <div className="flex flex-col gap-4">
        <Heading slot="title" className="text-xl">Error reading settings</Heading>
        <p>Something went wrong reading the provided settings file.</p>
        <p>Press the button below to use the default settings.</p>
        <div className="flex gap-4">
          <Button onPress={() => {
            setParams(params => {
              params.delete("settings")
              return params;
            });
            props.resetErrorBoundary();
          }} className="p-2 bg-sky-600 text-white rounded-lg">
            Use default settings
          </Button>
        </div>
      </div>
    </div>
  )
}

export function NewPlanModal() {
  const navigate = useSearchPreservingNavigate();
  const isOnRootRoute = useMatch("/") != null;

  return (
    <HUDModal
      isOpen={isOnRootRoute}
      defaultOpen={isOnRootRoute}
      onOpenChange={isOpen => {
        if (isOpen) {
          navigate({
            pathname: "/",
          })
        }
      }}
      trigger={
        <HUDEndButton>
          New plan
        </HUDEndButton>
      }
    >
      {({ close }) => (
        <ErrorBoundary FallbackComponent={InvalidSettinsgBoundary}>
          <NewPlan onStart={close} onSkip={close} />
        </ErrorBoundary>
      )}
    </HUDModal>
  )
}

function NewPlan(props: { onStart: () => void; onSkip: () => void }) {
  const scene = useWebScene();

  const { data: settings } = useSuspenseQuery(useSettingsQueryOptions());

  const thumbnailUrl = useAccessorValue(() => (scene.portalItem.thumbnailUrl, scene.portalItem.getThumbnailUrl(400)));

  const navigate = useSearchPreservingNavigate();

  return (
    <div className="flex gap-6">
      <figure className="flex-none w-48 relative -my-6 -ms-6 flex items-end">
        {thumbnailUrl ? <img className="absolute inset-0 w-full h-full object-cover" src={thumbnailUrl} /> : <div className="bg-slate-400 absolute inset-0 w-full h-full" />}
        <figcaption className="bg-white/60 py-2 px-4 w-full backdrop-blur-lg text-sm">{settings.planningAreaName}</figcaption>
      </figure>
      <div className="flex flex-col gap-4">
        <Heading slot="title" className="text-xl">Participatory planning</Heading>
        <ul className="list-disc ps-8 flex flex-col gap-1">
          <li>When creating shapes, either double click or press <Code>C</Code> to complete.</li>
          <li>Press <Code>Del</Code> or <Code>Backspace</Code> to remove a selected object.</li>
          <li>Press <Code>Escape</Code> to revert a current editing.</li>
        </ul>
        <div className="flex gap-4">
          <Button onPress={async () => {
            props.onStart()
            navigate("/plan", {
              state: {
                playIntro: true,
                previousLocationPathname: location.pathname
              }
            })
          }} className="p-2 bg-sky-600 text-white rounded-lg">
            Start planning
          </Button>
          <Button onPress={async () => {
            props.onSkip()
            navigate("/plan", {
              state: {
                playIntro: false,
                previousLocationPathname: location.pathname
              }
            })
          }} className="p-2 text-sky-600">
            Skip animation
          </Button>
        </div>
      </div>
    </div>
  )
}

function Code({ children }: PropsWithChildren) {
  return (
    <code className="inline bg-slate-200/50 outline outline-1 outline-slate-300/80 rounded-sm p-[2px] -my-[2px] -mx-[1px]">{children}</code>
  )
}