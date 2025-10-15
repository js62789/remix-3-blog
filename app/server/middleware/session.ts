import { Cookie, SetCookie } from "@remix-run/headers";
import { createStorageKey, type Middleware } from "@remix-run/fetch-router";
import { daysFromNow, minutes } from "../utils/time.ts";

interface SessionData {
  sessionId: string;
  expiresAt: number;
}

const SESSION_DATA_KEY = createStorageKey<SessionData>();

// Simple, in-memory session store for demo purposes
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

export function session(): Middleware {
  // Periodically invalidate expired sessions
  setInterval(invalidateExpiredSessions, minutes(10));

  return async ({ request, storage }, next) => {
    const cookies = request.headers.get("Cookie");
    let incomingSessionId;

    if (cookies) {
      const cookie = new Cookie(cookies);
      incomingSessionId = cookie.get("sessionId");
    }

    let currentSessionId = incomingSessionId;

    // If the user doesn't have a sessionId, create one
    if (!currentSessionId) {
      currentSessionId = createSessionId();
    }

    // Attempt to retrieve an existing session store
    let session = sessions.get(currentSessionId);

    // Create a session if one doesn't exist
    if (!session) {
      session = {
        sessionId: currentSessionId,
        expiresAt: daysFromNow(1),
      };
      sessions.set(currentSessionId, session);
    }

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
