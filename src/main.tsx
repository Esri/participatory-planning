import { ComponentProps, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createHashRouter, LoaderFunctionArgs, RouterProvider } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as FA from '@fortawesome/free-solid-svg-icons'
import { Ground } from './hud/routes/ground.tsx'
import { Icons } from './hud/routes/icons.tsx'
import { Paths } from './hud/routes/paths.tsx'
import { Buildings } from './hud/routes/buildings.tsx'
import { Trees } from './hud/routes/trees.tsx'
import { Vehicles } from './hud/routes/vehicles.tsx'

function Icon(props: ComponentProps<typeof FontAwesomeIcon>) {
  return <FontAwesomeIcon {...props} className='h-[25px] aspect-square' />
}

export const routes = [
  {
    name: 'New plan',
    path: '/',
    element: <div>route</div>,
  },
  {
    name: 'Ground',
    path: '/ground',
    icon: <Icon icon={FA.faLayerGroup} />,
    element: <Ground />,
  },
  {
    name: 'Paths',
    path: '/paths',
    icon: <Icon icon={FA.faRoad} />,
    element: <Paths />,
  },
  {
    name: 'Buildings',
    path: '/buildings',
    icon: <Icon icon={FA.faBuilding} />,
    element: <Buildings />,
  },
  {
    name: 'Icons',
    path: '/icons',
    icon: <Icon icon={FA.faMapMarkerAlt} />,
    element: <Icons />,
  },
  {
    name: 'Trees',
    path: '/trees',
    icon: <Icon icon={FA.faTree} />,
    element: <Trees />,
  },
  {
    name: 'Vehicles',
    path: '/vehicles',
    icon: <Icon icon={FA.faCar} />,
    element: <Vehicles />,
  },
  {
    name: 'glTF',
    path: '/gltf',
    icon: <Icon icon={FA.faCloudDownloadAlt} />,
    element: <div>route</div>,
  },
  {
    name: 'Submit plan',
    path: '/plan',
    element: <div>route</div>,
    loader: async (_args: LoaderFunctionArgs) => {
      console.log('plan')
      return null;
    }
  }
]

const router = createHashRouter(
  [{
    path: '/',
    element: <App />,
    children: routes.slice(1),
  }],
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
