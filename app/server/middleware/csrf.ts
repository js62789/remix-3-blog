import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { createStorageKey, type Middleware } from "@remix-run/fetch-router";
import { getSessionData } from "./session.ts";

const CSRF_KEY = createStorageKey<string>();

// Simple, in-memory csrf token store
const csrfTokens = new Map<string, string>();

function createCsrfToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex"); // 64 hex chars for 32 bytes
}

export function validateCsrfToken(sessionToken: string, formToken: string) {
  if (!sessionToken || !formToken) return false;
  const aBuf = Buffer.from(String(sessionToken));
  const bBuf = Buffer.from(String(formToken));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function csrf(): Middleware {
  return ({ formData, request, storage }, next) => {
    // Get the session data so we can use the sessionId to look up the CSRF token
    const sessionData = getSessionData(storage);

    // If there's no session, we can't validate CSRF tokens
    if (!sessionData) {
      return new Response("Session not found", { status: 400 });
    }

    // Get or create a CSRF token for this session
    let token = csrfTokens.get(sessionData.sessionId);

    // If no token exists, create one and store it for validation later
    if (!token) {
      token = createCsrfToken();
      csrfTokens.set(sessionData.sessionId, token);
    }

    // Store the token for application usage
    storage.set(CSRF_KEY, token);

    // For non-GET/HEAD/OPTIONS requests, validate the CSRF token
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      const csrfToken = formData?.get("_csrf") as string;

      // Require CSRF token
      if (!csrfToken) {
        return new Response("CSRF token missing", { status: 400 });
      }

      // Validate CSRF token
      if (!validateCsrfToken(storage.get(CSRF_KEY), csrfToken)) {
        return new Response("Invalid CSRF token", { status: 403 });
      }

      // Refresh the CSRF token after each successful validation
      const newToken = createCsrfToken();

      // Store the new token for validation later
      csrfTokens.set(sessionData.sessionId, newToken);

      // Store the new token for application usage
      storage.set(CSRF_KEY, newToken);
    }

    return next();
  };
}
