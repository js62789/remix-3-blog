import { AppStorage, type RequestMethod } from "@remix-run/fetch-router";
import { SESSION_KEY } from "../app/server/middleware/session.ts";

export function mockFunction<T extends (...args: any[]) => any>(
  fn: T,
): T & { calls: any[][] } {
  const calls: any[][] = [];
  const mock = function (...args: Parameters<T>): ReturnType<T> {
    calls.push(args);
    return fn(...args);
  } as T & { calls: any[][] };

  mock.calls = calls;
  return mock;
}

type MockContextOptions = {
  headers?: HeadersInit;
  method?: RequestMethod;
  sessionId?: string;
};

export function createMockContext(mockOptions: MockContextOptions = {}) {
  const { method = "GET", sessionId } = mockOptions;
  let { headers } = mockOptions;

  if (sessionId) {
    headers = {
      ...headers,
      Cookie: `sessionId=${sessionId}`,
    };
  }

  const context = {
    request: new Request("http://example.com", { headers, method }),
    formData: new FormData(),
    storage: new AppStorage(),
    method: method,
    params: {},
    url: new URL("http://example.com"),
    headers: new Headers(headers),
    files: new Map(),
  };

  if (sessionId) {
    context.storage.set(SESSION_KEY, { sessionId });
  }

  return context;
}
