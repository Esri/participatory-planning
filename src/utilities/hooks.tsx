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

import { useCallback, useMemo } from "react";
import { useNavigate as useRouterNavigate, NavigateFunction, useSearchParams, useLocation } from "react-router-dom";

export function useSearchPreservingNavigate() {
  const [params] = useSearchParams();
  const navigate = useRouterNavigate();

  return useCallback((to, options) => {
    if (typeof to === 'number') {
      navigate(to)
    } else if (typeof to === 'string') {
      navigate(
        {
          pathname: to,
          search: params.toString()
        },
        options
      )
    } else {
      navigate(
        {
          search: params.toString(),
          ...to
        },
        options
      )
    }
  }, [navigate, params]) as NavigateFunction
}

export type LocationState = {
  playIntro?: boolean;
  previousLocationPathname?: string;
}
export function useLocationState() {
  const { state } = useLocation();

  const playIntro = state?.playIntro;
  const previousLocationPathname = state?.previousLocationPathname;

  const memoizedState = useMemo(() => ({
    playIntro,
    previousLocationPathname,
  }), [
    playIntro,
    previousLocationPathname,
  ])

  return memoizedState;
}