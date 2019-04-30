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
import "./config";

import request from "esri/request";

import App from "./ts/App";

// See DEPLOYMENT.md for customization or deploying your own version of this app.
const params = {
  settings: "./js/settings.json",
};

const queryParams = document.location.search.substr(1);
queryParams.split("&").forEach((pair) => {
  const item = pair.split("=");
  params[item[0]] = decodeURIComponent(item[1]);
});

/**
 * Load settings and initialize application
 */
request(params.settings).then((settings) => {
  const app = new App(settings.data);
  app.container = "app";

}).catch(console.error);
