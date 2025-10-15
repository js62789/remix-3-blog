import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { createStorageKey, type Middleware } from "@remix-run/fetch-router";

const CSRF_KEY = createStorageKey<string>();

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
    if (!storage.has(CSRF_KEY)) {
      storage.set(CSRF_KEY, createCsrfToken());
    }

    if (!["GET", "HEAD"].includes(request.method)) {
      const csrfToken = formData?.get("_csrf") as string;

      // Validate CSRF token
      if (!csrfToken) {
        return new Response("CSRF token missing", { status: 400 });
      }

      if (
        !validateCsrfToken(storage.get(CSRF_KEY), csrfToken)
      ) {
        return new Response("Invalid CSRF token", { status: 403 });
      }
    }

    next();
  };
}
