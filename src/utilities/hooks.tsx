import { useCallback } from "react";
import { useNavigate as useRouterNavigate, NavigateFunction, useSearchParams } from "react-router-dom";

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