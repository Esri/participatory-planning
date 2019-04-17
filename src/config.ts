/*
 * Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import esriConfig from "esri/config";

const DEFAULT_WORKER_URL = "https://js.arcgis.com/4.11/";
const DEFAULT_LOADER_URL = `${DEFAULT_WORKER_URL}dojo/dojo-lite.js`;

(esriConfig.workers as any).loaderUrl = DEFAULT_LOADER_URL;
esriConfig.workers.loaderConfig = {
  baseUrl: `${DEFAULT_WORKER_URL}dojo`,
  packages: [
    { name: "esri", location: DEFAULT_WORKER_URL + "esri" },
    { name: "dojo", location: DEFAULT_WORKER_URL + "dojo" },
    { name: "dojox", location: DEFAULT_WORKER_URL + "dojox" },
    { name: "dijit", location: DEFAULT_WORKER_URL + "dijit" },
    { name: "dstore", location: DEFAULT_WORKER_URL + "dstore" },
    { name: "moment", location: DEFAULT_WORKER_URL + "moment" },
    { name: "@dojo", location: DEFAULT_WORKER_URL + "@dojo" },
    {
      name: "cldrjs",
      location: DEFAULT_WORKER_URL + "cldrjs",
      main: "dist/cldr",
    },
    {
      name: "globalize",
      location: DEFAULT_WORKER_URL + "globalize",
      main: "dist/globalize",
    },
    {
      name: "maquette",
      location: DEFAULT_WORKER_URL + "maquette",
      main: "dist/maquette.umd",
    },
    {
      name: "maquette-css-transitions",
      location: DEFAULT_WORKER_URL + "maquette-css-transitions",
      main: "dist/maquette-css-transitions.umd",
    },
    {
      name: "maquette-jsx",
      location: DEFAULT_WORKER_URL + "maquette-jsx",
      main: "dist/maquette-jsx.umd",
    },
    { name: "tslib", location: DEFAULT_WORKER_URL + "tslib", main: "tslib" },
  ],
} as any;
