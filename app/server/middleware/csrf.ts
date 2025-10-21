import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import type { Middleware } from "@remix-run/fetch-router";
import * as sessionUtils from "./session.ts";

declare module "./session.ts" {
  interface SessionData {
    data?: {
      csrfToken?: string;
    };
  }
}

export function createCsrfToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex"); // 64 hex chars for 32 bytes
}

export function getCsrfToken() {
  const session = sessionUtils.getSession();

  if (!session) {
    throw new Error("Session not found");
  }

  const csrfToken = session?.data?.csrfToken;

  if (!csrfToken || typeof csrfToken !== "string") {
    throw new Error("CSRF token not found in session");
  }

  return csrfToken;
}

export function validateCsrfToken(sessionToken: string, formToken: string) {
  if (!sessionToken || !formToken) return false;
  const aBuf = Buffer.from(String(sessionToken));
  const bBuf = Buffer.from(String(formToken));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

type CsrfOptions = {
  getSession?: () => sessionUtils.SessionData | undefined;
  updateSession?: (
    newData: Partial<sessionUtils.SessionData>,
  ) => sessionUtils.SessionData | undefined;
};

export default function csrf(options: CsrfOptions = {}): Middleware {
  const {
    getSession = sessionUtils.getSession,
    updateSession = sessionUtils.updateSession,
  } = options;

  return ({ formData, request }, next) => {
    // Get the session data so we can use the sessionId to look up the CSRF token
    let session = getSession();

    // If there's no session, we can't validate CSRF tokens
    if (!session) {
      return new Response("Session not found", { status: 400 });
    }

    // Get or create a CSRF token for this session
    let token = session.data?.csrfToken;

    // If no token exists, create one and store it for validation later
    if (!token) {
      token = createCsrfToken();
      // TODO store tokens in session
      session = updateSession({ data: { csrfToken: token } });

      if (!session) {
        return new Response("Failed to create CSRF token", { status: 500 });
      }
    }

    // For non-GET/HEAD/OPTIONS requests, validate the CSRF token
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      const csrfToken = formData?.get("_csrf") as string;

      // Require CSRF token
      if (!csrfToken) {
        return new Response("CSRF token missing", { status: 400 });
      }

      // Validate CSRF token
      if (!validateCsrfToken(session.data?.csrfToken as string, csrfToken)) {
        return new Response("Invalid CSRF token", { status: 403 });
      }

      // Refresh the CSRF token after each successful validation
      const newToken = createCsrfToken();

      session = updateSession({ data: { csrfToken: newToken } });
    }

    return next();
  };
}
