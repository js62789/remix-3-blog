import { Cookie, SetCookie } from "@remix-run/headers";
import { createStorageKey, type Middleware } from "@remix-run/fetch-router";
import { MemoryStore, MemoryStoreOptions } from "../utils/memoryStore.ts";

interface SessionData {
  sessionId: string;
}

export const SESSION_DATA_KEY = createStorageKey<SessionData>();

function setSessionCookie(headers: Headers, sessionId: string): void {
  const cookie = new SetCookie({
    name: "sessionId",
    value: sessionId,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    maxAge: 2592000, // 30 days
  });

  headers.set("Set-Cookie", cookie.toString());
}

function getCookieValue(headers: Headers, name: string) {
  const cookies = headers.get("Cookie");

  if (cookies) {
    const cookie = new Cookie(cookies);
    return cookie.get(name) || undefined;
  }
}

export class SessionStore extends MemoryStore<SessionData> {
  constructor(options: MemoryStoreOptions<SessionData> = {}) {
    super({
      idKey: "sessionId",
      ...options,
    });
  }
}

interface SessionOptions extends MemoryStoreOptions<SessionData> {
  store?: SessionStore;
}

export function session(
  options: SessionOptions = {},
): Middleware {
  const { store, ...storeOptions } = options;
  const sessionStore = store || new SessionStore(storeOptions);

  return async ({ headers, storage }, next) => {
    const incomingSessionId = getCookieValue(headers, "sessionId");

    // Get an existing session or create a new one
    const session = sessionStore.getOrSet({
      sessionId: incomingSessionId || sessionStore.createUniqueId(),
    });

    // Store the session in the request context storage
    storage.set(SESSION_DATA_KEY, session);

    // Call the next middleware/handler
    const response = await next();

    if (!incomingSessionId) {
      // Set the session cookie in the response
      setSessionCookie(response.headers, session.sessionId);
    }

    return response;
  };
}
