# Participatory Planning

An interactive 3D web application enabling citizens to engage in urban planning, using the [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/). This is a non-commercial demo application made by the Esri R&D Center Zurich. It is intended for presentations or as a starting point for new projects.

[![screenshot](./screenshot.png)](https://esri.github.io/participatory-planning)

The app uses various API features such as [3D drawing](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Sketch.html), [glTF import](https://developers.arcgis.com/javascript/latest/sample-code/import-gltf/index.html) and [client-side filtering](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-support-FeatureFilter.html). The example scene used in the app is located in Dumbo, Brooklyn NY.

On the technical side the app is built using [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [vite](https://vite.dev/) and [npm](https://www.npmjs.com/)

## Instructions

A live version is available [here](https://esri.github.io/participatory-planning).

To run the source code locally, follow these steps:

```
git clone https://github.com/Esri/participatory-planning.git
cd participatory-planning/
npm install
npm run dev
```

## Configuration

If you would like to use the app for a different area or city, see the [CONFIGURATION.md](./CONFIGURATION.md) file for details.

## Resources

The following external libraries, APIs, open datasets and specifications were used to make this application:

- [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/)
- Icons from [Font Awesome](https://fontawesome.com/)
- [Motion](https://motion.dev/) for animations
- [Sketchfab widget](https://sketchfab.com/developers/download-api/downloading-models/javascript) for downloading glTF models

## Disclaimer

This demo application is for illustrative purposes only and it is not maintained. The area in Dumbo, Brooklyn NY used in the application is a fictional redevelopment area. There is no support available for deployment or development of the application.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing

Copyright 2024 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt](./LICENSE.txt) file.
