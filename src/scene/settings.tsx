import { queryOptions } from "@tanstack/react-query";
import defaultSettings from '../assets/settings.json?url';
import { useSearchParams } from "react-router-dom";

interface Settings {
  planningArea: [x: number, y: number][],
  planningAreaName: string;
  webSceneId: string;
}

function isSettings(object: unknown): object is Settings {
  if (object == null) return false;
  if (typeof object !== 'object') return false;
  const hasPlanningArea = 'planningArea' in object;
  const hasPlanningAreaName = 'planningAreaName' in object;
  const hasWebSceneId = 'webSceneId' in object;

  if (!hasPlanningArea || !hasPlanningAreaName || !hasWebSceneId) return false;

  const isPlanningAreaPolygonRing =
    Array.isArray(object.planningArea) &&
    object.planningArea.every(
      item => Array.isArray(item) && typeof item[0] === 'number' && typeof item[1] === 'number'
    )

  return isPlanningAreaPolygonRing && typeof object.planningAreaName === 'string' && typeof object.webSceneId === 'string';
}

export class SettingsValidationError extends Error { }

export const settingsQuery = (settingsUrl: string) => queryOptions({
  queryKey: ['settings', settingsUrl],
  queryFn: async ({ signal }) => {
    const settings = await fetch(settingsUrl, { signal }).then(res => res.json());
    if (isSettings(settings)) return settings;
    else throw new SettingsValidationError('Settings did not match schema');
  },
  retry: false
});

export function useSettingsQueryOptions() {
  const [params] = useSearchParams()
  const settingsUrl = params.get('settings') ?? defaultSettings;

  return settingsQuery(settingsUrl);
}
