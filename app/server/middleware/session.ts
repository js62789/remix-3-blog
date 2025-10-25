import { Cookie, SetCookie } from "@remix-run/headers";
import { createStorageKey, Middleware } from "@remix-run/fetch-router";
import { getStorage } from "./context.ts";

type SessionId = string;

export interface Session {
  sessionId: SessionId;
  data?: SessionData;
}

export interface SessionData {
  [key: string]: unknown;
}

export const SESSION_KEY = createStorageKey<Session>();

export function getSession() {
  const storage = getStorage();
  return storage.has(SESSION_KEY) ? storage.get(SESSION_KEY) : undefined;
}

export function updateSession(
  newData: Partial<Session>,
) {
  const storage = getStorage();
  const session = storage.get(SESSION_KEY);
  if (session) {
    Object.assign(session, {
      ...newData,
      data: {
        ...session.data,
        ...newData.data,
      },
    });
    storage.set(SESSION_KEY, session);
  }
  return session;
}

function createSessionId() {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

function getSessionCookie(headers: Headers): string | null {
  const cookieHeader = headers.get("Cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookie = new Cookie(cookieHeader);
  return cookie.get("sessionId") || null;
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

function createSessionStorage() {
  const sessions = new Map<SessionId, Session>();

  function getSessionId(request: Request) {
    const sessionId = getSessionCookie(request.headers);

    if (!sessionId) {
      return createSessionId();
    }

    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { sessionId });
    }

    return sessionId;
  }

  function getSession(request: Request): Session {
    const sessionId = getSessionId(request);
    let session = sessions.get(sessionId);

    if (!session) {
      session = { sessionId };
      sessions.set(sessionId, session);
    }

    return session;
  }

  return {
    getSession,
  };
}

export default function sessionMiddleware(): Middleware {
  const { getSession } = createSessionStorage();

  return async ({ request, storage }, next) => {
    const session = getSession(request);
    const { sessionId } = session;

    storage.set(SESSION_KEY, session);

    const response = await next();

    setSessionCookie(response.headers, sessionId);

    return response;
  };
}
