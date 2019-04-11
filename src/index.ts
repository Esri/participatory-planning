import "./config";

import App from "./ts/App";

const planningArea = [
  [-8235924.058660398, 4968738.274357371],
  [-8235409.000644938, 4968717.325404106],
  [-8235333.439527529, 4968898.289607817],
  [-8235295.877979361, 4969109.891441089],
  [-8236134.357229519, 4969027.878528339],
  [-8236138.632189713, 4968850.261903069],
  [-8235919.081131686, 4968836.806196137],
];

const webSceneId = "8dd394c07205432bad112c21cbbc307f";

const integratedMeshLayerId = "0406ec9f82824f368d8710ec42b8e5f6";

/**
 * Initialize application
 */
export const app = new App({
  planningArea,
  webSceneId,
  integratedMeshLayerId,
});
app.container = "app";
