import { Cookie, SetCookie } from "@remix-run/headers";
import { createStorageKey, type Middleware } from "@remix-run/fetch-router";
import { days, minutes } from "../utils/time.ts";

interface SessionData {
  sessionId: string;
  expiresAt: number;
}

export const SESSION_DATA_KEY = createStorageKey<SessionData>();

function createId() {
  return Math.random().toString(36).substring(2, 15);
}

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

export function createSessionStore(
  initialSessions: SessionData[] = [],
): Map<string, SessionData> {
  const store = new Map<string, SessionData>();
  for (const session of initialSessions) {
    store.set(session.sessionId, session);
  }
  return store;
}

class MemoryStore {
  private sessions = createSessionStore();

  constructor(store?: Map<string, SessionData>) {
    if (store) {
      this.sessions = store;
    }
  }

  createSessionId(): string {
    const sessionId = createId() + createId();

    // Ensure the sessionId is unique
    if (this.sessions.has(sessionId)) {
      return this.createSessionId();
    }

    return sessionId;
  }

  getOrCreateSession(sessionId?: string, options: { expiry?: number } = {}) {
    let session = sessionId && this.sessions.get(sessionId);
    if (!session) {
      session = this.createSession(
        sessionId || this.createSessionId(),
        options,
      );
    }
    return session;
  }

  createSession(sessionId?: string, options: { expiry?: number } = {}) {
    const session = {
      sessionId: sessionId || this.createSessionId(),
      expiresAt: Date.now() + (options.expiry ?? days(1)),
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  invalidateExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions) {
      if (session.expiresAt <= now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

type SessionOptions = {
  // Optional session expiration time in milliseconds
  expiry?: number;
  // Optional timer function for testing purposes
  timerFn?: typeof setInterval;
  // Optional initial sessions for testing purposes
  store?: Map<string, SessionData>;
};

export function session(options: SessionOptions = {}): Middleware {
  const { expiry, timerFn, store } = options;

  const sessionStore = new MemoryStore(store);

  // Periodically invalidate expired sessions
  (timerFn || setInterval)(
    () => sessionStore.invalidateExpiredSessions(),
    minutes(1),
  );

  return async ({ headers, storage }, next) => {
    const incomingSessionId = getCookieValue(headers, "sessionId");

    // Get an existing session or create a new one
    const session = sessionStore.getOrCreateSession(incomingSessionId, {
      expiry,
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
