import { useSuspenseQuery } from "@tanstack/react-query";
import { useSettingsQueryOptions } from "./settings";
import { WebScene } from "../arcgis/components/web-scene";
import { PropsWithChildren } from "react";

export function Scene({ children }: PropsWithChildren) {
  const { data: settings } = useSuspenseQuery(useSettingsQueryOptions());

  return (
    <WebScene websceneId={settings.webSceneId}>{children}</WebScene>
  )
}