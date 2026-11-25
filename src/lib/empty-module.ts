// Empty module for Node built-ins that browser bundles pull in but never call.
// quicktype-core's NodeIO imports `node:fs` (its package.json "browser" field only maps
// plain `fs`); it is only used to read files/URLs, never for the in-memory samples we pass.
// Aliased in next.config.ts for the browser build only.
export {};
