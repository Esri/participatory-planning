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