import { Outlet, useMatch, useNavigate } from "react-router-dom";

import { routes } from "../main";
import { HUDSubBar } from "./hud-sub-bar";
import { NewPlanModal } from "./routes/new-plan";

import './hud-styles.css';
import { Submission } from "./routes/submission";
import { HUDButton, HUDLink } from "./hud-button";

function RouteButton(props: { route: typeof routes[number] }) {
  const navigate = useNavigate();
  const match = useMatch(props.route.path ?? "/");

  return (
    <HUDLink
      onClick={(e) => {
        if (match) {
          e.preventDefault();
          navigate('/');
        }
      }}
      to={props.route.path!}
      className="flex flex-col"
    >
      <span >{props.route.icon}</span>
      <span className="text-xs">{props.route.name}</span>
      {props.route.preloadElement}
    </HUDLink>
  )
}

export function HUD() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center flex-1">
      <HUDSubBar>
        <HUDButton>Shore</HUDButton>
        <HUDButton>Bridge</HUDButton>
        <HUDButton>Neighborhood</HUDButton>
      </HUDSubBar>
      <div className="flex-grow"></div>
      <Outlet />

      <div className="bg-white/80 w-fit flex rounded-lg justify-between gap-8 p-4 px-12">
        <NewPlanModal />
        {routes.map(route => (
          <RouteButton key={route.path} route={route} />
        ))}
        <Submission />
      </div>
    </div>
  );
}
