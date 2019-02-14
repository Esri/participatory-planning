import "./config";

import "@dojo/framework/shim/Promise";

import App from "./ts/App";

/**
 * Initialize application
 */
export const app = new App();
app.container = "app";
