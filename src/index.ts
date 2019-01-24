import "./config";

import "@dojo/framework/shim/Promise";

import App from "./widgets/App";

/**
 * Initialize application
 */
export const app = new App({
  container: "app",
});
