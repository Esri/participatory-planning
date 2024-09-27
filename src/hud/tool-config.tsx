import { ReactNode, ComponentProps } from "react";
import { Buildings } from "./routes/buildings";
import { Ground } from "./routes/ground";
import { Icons, PrefetchIcons } from "./routes/icons";
import { Paths } from "./routes/paths";
import { Trees, PrefetchTrees } from "./routes/trees";
import { Vehicles, PrefetchVehicles } from "./routes/vehicles";
import { GraphicsLayer } from "../arcgis/components/graphics-layer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as FA from '@fortawesome/free-solid-svg-icons'

function Icon(props: ComponentProps<typeof FontAwesomeIcon>) {
  return <FontAwesomeIcon {...props} className='h-[25px] aspect-square' />
}

export const tools: Record<string, ToolConfig> = {
  ground: {
    name: 'Ground',
    elevationMode: 'on-the-ground',
    icon: <Icon icon={FA.faLayerGroup} />,
    element: (
      <Ground />
    ),
  },
  paths: {
    name: 'Paths',
    elevationMode: 'on-the-ground',
    icon: <Icon icon={FA.faRoad} />,
    element: (
      <Paths />
    )
  },
  buildings: {
    name: 'Buildings',
    elevationMode: 'on-the-ground',
    icon: <Icon icon={FA.faBuilding} />,
    element: (
      <Buildings />
    )
  },
  icons: {
    name: 'Icons',
    elevationMode: 'relative-to-scene',
    closeWhenActive: true,
    icon: <Icon icon={FA.faMapMarkerAlt} />,
    element: (
      <Icons />
    ),
    preloadElement: <PrefetchIcons />
  },
  trees: {
    name: 'Trees',
    elevationMode: 'relative-to-scene',
    closeWhenActive: true,
    icon: <Icon icon={FA.faTree} />,
    element: (
      <Trees />
    ),
    preloadElement: <PrefetchTrees />

  },
  vehicles: {
    name: 'Vehicles',
    elevationMode: 'relative-to-scene',
    closeWhenActive: true,
    icon: <Icon icon={FA.faCar} />,
    element: (
      <Vehicles />
    ),
    preloadElement: <PrefetchVehicles />

  },
  glTF: {
    name: 'glTF',
    icon: <Icon icon={FA.faCloudDownloadAlt} />,
    element: <div>route</div>,
  },
};

export const toolEntries = Object.entries(tools);

type ToolConfig = {
  name: string;
  icon: ReactNode,
  element?: ReactNode
  preloadElement?: ReactNode
  elevationMode?: ComponentProps<typeof GraphicsLayer>['elevationMode']
  closeWhenActive?: boolean
}