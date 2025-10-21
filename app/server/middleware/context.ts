import { type Middleware, RequestContext } from "@remix-run/fetch-router";
import { AsyncLocalStorage } from "node:async_hooks";

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

function getContext() {
  const context = requestContextStorage.getStore();

  if (!context) {
    throw new Error(
      "Request context not found. Make sure the storeContext middleware is installed.",
    );
  }

  return context;
}

export function getStorage() {
  return getContext().storage;
}

export const storeContext: Middleware = (context, next) => {
  return requestContextStorage.run(context, () => next());
};
