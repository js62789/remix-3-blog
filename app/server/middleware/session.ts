import { Cookie, SetCookie } from "@remix-run/headers";
import { createStorageKey, Middleware } from "@remix-run/fetch-router";

type SessionId = string;

interface SessionData {
  sessionId: SessionId;
}

export const SESSION_ID_KEY = createStorageKey<SessionId>();

function createSessionId() {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

function createSessionStorage() {
  const sessions = new Map<SessionId, SessionData>();

  function getSessionId(request: Request) {
    const cookieHeader = request.headers.get("Cookie");

    if (!cookieHeader) {
      return createSessionId();
    }

    const cookie = new Cookie(cookieHeader);
    const sessionId = cookie.get("sessionId");

    if (!sessionId) {
      return createSessionId();
    }

    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { sessionId });
    }

    return sessionId;
  }

  function getSession(request: Request): SessionData {
    const sessionId = getSessionId(request);
    let session = sessions.get(sessionId);

    if (!session) {
      session = { sessionId };
      sessions.set(sessionId, session);
    }

    return session;
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

  return {
    getSession,
    setSessionCookie,
  };
}

export default function sessionMiddleware(): Middleware {
  const { getSession, setSessionCookie } = createSessionStorage();

  return async ({ request, storage }, next) => {
    const session = getSession(request);
    const { sessionId } = session;

    storage.set(SESSION_ID_KEY, sessionId);

    const response = await next();

    setSessionCookie(response.headers, sessionId);

    return response;
  };
}
