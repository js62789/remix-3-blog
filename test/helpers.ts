import {
  AppStorage,
  type RequestContext,
  type RequestMethod,
} from "@remix-run/fetch-router";
import {
  createSessionStore,
  SESSION_DATA_KEY,
} from "../app/server/middleware/session.ts";

export function setupFakeSession(
  context: RequestContext,
  sessionId: string,
  options: { expiry?: number } = {},
) {
  // Simulate that the user has a session cookie
  context.headers.set("Cookie", `sessionId=${sessionId}`);

  const initialSession = {
    sessionId,
    expiresAt: Date.now() + (options.expiry ?? 60000),
  };

  // Create a fake session
  const sessions = createSessionStore([initialSession]);

  // Store the session in the context storage
  context.storage.set(SESSION_DATA_KEY, initialSession);

  return sessions;
}

export function mockFunction<T extends (...args: any[]) => any>(
  fn: T,
): T & { calls: unknown[][] } {
  const calls: unknown[][] = [];
  const mock = function (...args: Parameters<T>): ReturnType<T> {
    calls.push(args);
    return fn(...args);
  } as T & { calls: unknown[][] };

  mock.calls = calls;
  return mock;
}

type MockContextOptions = {
  method?: RequestMethod;
};

export function createMockContext(mockOptions: MockContextOptions = {}) {
  const { method = "GET" } = mockOptions;

  return {
    request: new Request("http://example.com", { method }),
    formData: new FormData(),
    storage: new AppStorage(),
    method: method,
    params: {},
    url: new URL("http://example.com"),
    headers: new Headers(),
    files: new Map(),
  };
}
