import { createFrame } from "@remix-run/dom";

createFrame(document, {
  async loadModule(moduleUrl, name) {
    const mod = await import(moduleUrl);
    if (!mod) {
      throw new Error(`Unknown module: ${moduleUrl}#${name}`);
    }

    const Component = mod[name];
    if (!Component) {
      throw new Error(`Unknown component: ${moduleUrl}#${name}`);
    }

    return Component;
  },

  async resolveFrame(frameUrl) {
    const res = await fetch(frameUrl);
    if (res.ok) {
      return res.text();
    }

    throw new Error(`Failed to fetch ${frameUrl}`);
  },
});
