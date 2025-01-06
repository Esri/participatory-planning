import { Link, NavLink, Outlet, useMatch } from "react-router-dom";

import './hud-styles.css';
import { routes } from "../main";
import { HudSubBar } from "./hud-sub-bar";

function HUDLink(props: { route: typeof routes[number] }) {
  const match = useMatch(props.route.path);

  return (
    <NavLink
      to={!match ? props.route.path : "/"}
      className="flex flex-col gap-1 p-1"
      style={{ textDecoration: match ? 'underline' : undefined }}
    >
      {props.route.icon}
      {props.route.name}
    </NavLink>
  )
}

export function HUD() {
  return (
    <div className="flex flex-col gap-4 items-center justify-end flex-1">
      <HudSubBar>
        <button>Shore</button>
        <button>Bridge</button>
        <button>Neighborhood</button>
      </HudSubBar>
      <div className="flex-grow"></div>
      <Outlet />
      <div className="bg-blue-500 flex rounded-lg justify-between gap-8 p-4 self-stretch">
        <Link to={routes[0].path} className="flex justify-center items-center flex-grow">{routes[0].name}</Link>
        {routes.slice(1, -1).map(route => (
          <HUDLink key={route.path} route={route} />
        ))}
        <Link to={routes.at(-1)!.path} className="flex justify-center items-center flex-grow">{routes.at(-1)!.name}</Link>
      </div>
    </div>
  );
}