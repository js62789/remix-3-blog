import { RequestContext } from "@remix-run/fetch-router";
import {
  getOrCreateSession,
  SESSION_DATA_KEY,
} from "../app/server/middleware/session.ts";

export function setupFakeSession(context: RequestContext, sessionId: string) {
  // Simulate that the user has a session cookie
  context.headers.set("Cookie", `sessionId=${sessionId}`);

  // Create a fake session
  const session = getOrCreateSession(sessionId);

  // Store the session in the context storage
  context.storage.set(SESSION_DATA_KEY, session);

  return session;
}

export function mockFunction<T extends (...args: unknown[]) => unknown>(
  impl?: T,
): T & { calls: unknown[][] } {
  const calls: unknown[][] = [];
  const mockFn = function (...args: unknown[]) {
    calls.push(args);
    return impl ? impl(...args) : undefined;
  } as T & { calls: unknown[][] };

  mockFn.calls = calls;
  return mockFn;
}
