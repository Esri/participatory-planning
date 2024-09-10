import { Outlet, useMatch, useNavigate } from "react-router-dom";

import { routes } from "../main";
import { HUDSubBar } from "./hud-sub-bar";
import { NewPlanModal } from "./routes/new-plan";

import './hud-styles.css';
import { Submission } from "./routes/submission";
import { HUDButton, HUDLink } from "./hud-button";
import { useWebScene } from "../arcgis/components/web-scene";
import { useAccessorValue } from "../arcgis/hooks/useAccessorValue";
import { useSceneView } from "../arcgis/components/scene-view";

function RouteButton(props: { route: typeof routes[number] }) {
  const navigate = useNavigate();
  const match = useMatch(props.route.path ?? "/");

  return (
    <HUDLink
      onClick={(e) => {
        if (match) {
          e.preventDefault();
          navigate("/plan", {
            state: { previousLocationPathname: location.pathname }
          });
        }
      }}
      state={{ previousLocationPathname: location.pathname }}
      to={props.route.path!}
      className="flex flex-col"
    >
      <span >{props.route.icon}</span>
      <span className="text-xs">{props.route.name}</span>
      {props.route.preloadElement}
    </HUDLink>
  )
}

function Timeline() {
  const scene = useWebScene();
  const view = useSceneView();

  const slides = useAccessorValue(() => (scene.presentation.slides.map(slide => slide.id), scene.presentation.slides.toArray())) ?? [];

  return (
    <HUDSubBar>
      {slides.map(slide => (<HUDButton key={slide.id} onPress={() => {
        slide.applyTo(view)
      }}>{slide.title.text}</HUDButton>))}
    </HUDSubBar>
  );
}

export function HUD() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center flex-1 pointer-events-none">
      <Timeline />
      <div className="flex-grow"></div>
      <Outlet />

      <div className="bg-white/80 w-fit flex rounded-lg justify-between gap-8 p-4 px-12 pointer-events-auto">
        <NewPlanModal />
        {routes.slice(1).map(route => (
          <RouteButton key={route.path} route={route} />
        ))}
        <Submission />
      </div>
    </div>
  );
}
