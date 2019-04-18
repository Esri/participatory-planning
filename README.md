# Participatory Planning

An interactive 3D web application enabling citizens to engage in urban planning, using the [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/). This is a non-commercial demo application made by the Esri R&D Center Zurich. It is intended for presentations or as a starting point for new projects.

[![screenshot](./screenshot.png)](https://esri.github.io/participatory-planning)

The app uses various API features such as [3D drawing](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Sketch.html), [glTF import](https://developers.arcgis.com/javascript/latest/sample-code/import-gltf/index.html) and [client-side filtering](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-support-FeatureFilter.html). The example scene used in the app is located in Dumbo, Brooklyn NY.

On the technical side the app is built using [TypeScript](https://www.typescriptlang.org/), [npm](https://www.npmjs.com/) and [webpack](https://webpack.js.org/).

## Instructions

A live version is available [here](https://esri.github.io/participatory-planning).

To run the source code locally, follow these steps:

```
git clone https://github.com/Esri/participatory-planning.git
cd participatory-planning/
npm install
npm run start # serves application at http://localhost:8080
```

## Configuration

If you would like to use the app for a different area or city, see the file [index.ts](./src/index.ts) for available options.

## Resources
The following external libraries, APIs, open datasets and specifications were used to make this application:
* [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/)
* Icons from [Font Awesome](https://fontawesome.com/)
* [Anime.js](https://animejs.com) for animations
* [zip.js](https://gildas-lormeau.github.io/zip.js/) for extracting glTF models
* [Calcite Web](http://esri.github.io/calcite-web/)
* [Sketchfab widget](https://sketchfab.com/developers/download-api/downloading-models/javascript) for downloading glTF models
* [3D building model](http://www1.nyc.gov/site/doitt/initiatives/3d-building.page) published on the Open Data portal of [DoITT](http://www1.nyc.gov/site/doitt/index.page) under these [Terms of use](http://www1.nyc.gov/home/terms-of-use.page)
* [Manhattan neighborhoods](http://catalog.opendata.city/dataset/pediacities-nyc-neighborhoods/resource/91778048-3c58-449c-a3f9-365ed203e914) provided by [Catalog Opendata City](http://catalog.opendata.city/) under a [Open Data Commons Attribution License](http://opendefinition.org/licenses/odc-by/)

## Disclaimer

This demo application is for illustrative purposes only and it is not maintained. There is no support available for deployment or development of the application.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Deployment

The live version is deployed using GitHub pages. The `gh-pages` branch represents a separate `git worktree` directly pointing to the contents of the `dist/` build output folder. The following commands update the `gh-pages` branch to the latest source code version:

```
git clone https://github.com/Esri/participatory-planning.git -b gh-pages dist
npm run build
cd dist/
git add .
git commit -am 'Deploy latest version from master branch'
git push
```
Usually the changes become available shortly after at
[https://esri.github.io/participatory-planning](https://esri.github.io/participatory-planning).

See this [tutorial](https://medium.com/linagora-engineering/deploying-your-js-app-to-github-pages-the-easy-way-or-not-1ef8c48424b7) for informations how to set this up.

## Licensing
Copyright 2019 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt](./license.txt) file.
