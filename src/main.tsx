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

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createHashRouter, RouterProvider } from 'react-router-dom'

// this clears the history state, which carries information about the previous location
// it's persisted between page reloads, so we clear it to make sure the intro animation is skipped if refreshing on the `plan` route
window.history.replaceState({}, '')

const router = createHashRouter(
  [{
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        path: '/plan',
        element: null
      },
      {
        path: '/submission',
        element: null,
      }
    ],
    errorElement: <div>Unknown error occurred...</div>
  }],
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}
