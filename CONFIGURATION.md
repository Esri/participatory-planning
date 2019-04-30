
# Configuration

By default the Participatory Planning app takes the configuration from [`settings.json`](./assets/js/settings.json). You can override that by providing your own setting file as a query parameter:

`https://esri.github.io/participatory-planning?settings=[url]`

The settings parameter is expected to be a URL pointing to JSON file with the following structure:

```json
{
  "planningArea": [
    [-8235924.058660398, 4968738.274357371],
    [-8235409.000644938, 4968717.325404106],
    ...
    [-8235919.081131686, 4968836.806196137]
  ],
  "planningAreaName": "Dumbo, Brooklyn NY",
  "webSceneId": "bceae470c9a04e5bb3ad42323c726c97"
}
```

1. `planningArea` contains the coordinates of the planning area
2. `planningAreaName` is the name of the area shown in the welcome screen of the app
3. `webSceneId` must point to a [Webscene](https://doc.arcgis.com/en/arcgis-online/reference/what-is-web-scene.htm), you can follow these steps to create your own:
    1.  Create a [Webscene in ArcGIS Online](https://doc.arcgis.com/en/arcgis-online/get-started/get-started-with-scenes.htm)
    2.  Add some 3D data for things that currently exist in that area, such as buildings or trees
    2.  Capture a few slides with different perspectives of the planning area, they will show up at the upper navigation menu in the app

A simple way of providing your own settings file is using [GitHub Gist](https://gist.github.com/) and passing the Gist's URL (raw version) to the app. This is an example for a planning area in Zug, Switzerland:

`https://esri.github.io/participatory-planning?settings=https://gist.githubusercontent.com/arnofiva/82f57a3cc2d99769f573898560f74e3f/raw/zug.pp.json`

## GitHub Deployment

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
[https://esri.github.io/participatory-planning](https://esri.github.io/participatory-planning). For more details check out the following [tutorial](https://medium.com/linagora-engineering/deploying-your-js-app-to-github-pages-the-easy-way-or-not-1ef8c48424b7).