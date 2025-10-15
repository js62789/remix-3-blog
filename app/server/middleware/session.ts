import { Cookie, SetCookie } from "@remix-run/headers";
import {
  type AppStorage,
  createStorageKey,
  type Middleware,
} from "@remix-run/fetch-router";
import { daysFromNow, minutes } from "../utils/time.ts";

interface SessionData {
  sessionId: string;
  expiresAt: number;
}

export const SESSION_DATA_KEY = createStorageKey<SessionData>();

// Simple, in-memory session store
const sessions = new Map<string, SessionData>();

function createId() {
  return Math.random().toString(36).substring(2, 15);
}

function createSessionId() {
  const sessionId = createId() + createId();

  // Ensure the sessionId is unique
  if (sessions.has(sessionId)) {
    return createSessionId();
  }

  return sessionId;
}

export function getSessionData(storage: AppStorage) {
  if (!storage.has(SESSION_DATA_KEY)) {
    return undefined;
  }
  return sessions.get(storage.get(SESSION_DATA_KEY).sessionId);
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

function invalidateExpiredSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}

function getCookieValue(request: Request, name: string) {
  const cookies = request.headers.get("Cookie");

  if (cookies) {
    const cookie = new Cookie(cookies);
    return cookie.get(name);
  }
}

// Export this so we can create sessions in tests
export function getOrCreateSession(sessionId: string) {
  // Try to get an existing session
  let session = sessions.get(sessionId);

  // If the session doesn't exist, create a new one
  if (!session) {
    session = {
      sessionId,
      expiresAt: daysFromNow(1),
    };

    // Store the new session for subsequent requests
    sessions.set(sessionId, session);
  }

  return session;
}

export function session(): Middleware {
  // Periodically invalidate expired sessions
  setInterval(invalidateExpiredSessions, minutes(10));

  return async ({ request, storage }, next) => {
    const incomingSessionId = getCookieValue(request, "sessionId");

    // If the user doesn't have a sessionId, create one
    const sessionId = incomingSessionId || createSessionId();

    // Get an existing session or create a new one
    const session = getOrCreateSession(sessionId);

    // Store the session in the request context storage
    storage.set(SESSION_DATA_KEY, session);

    if (!incomingSessionId) {
      // Call the next middleware/handler
      const response = await next();

      // Set the session cookie in the response
      setSessionCookie(response.headers, session.sessionId);
    }
  };
}
