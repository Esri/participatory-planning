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

import App from "./ts/App";


const planningArea = [
  [-73.9845647, 40.7037208],
  [-73.9799378, 40.7035781],
  [-73.979259, 40.7048104],
  [-73.9789216, 40.7062514],
  [-73.9864537, 40.7056929],
  [-73.9864922, 40.7044834],
  [-73.9845199, 40.7043917],
];

const webSceneId = "bceae470c9a04e5bb3ad42323c726c97";

/**
 * Initialize application
 */
export const app = new App({
  planningArea,
  webSceneId,
});
app.container = "app";
