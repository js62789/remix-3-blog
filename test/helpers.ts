import * as assert from "node:assert/strict";
import { AppStorage, type RequestMethod } from "@remix-run/fetch-router";
import * as aChecker from "accessibility-checker";
import type { IBaselineReport } from "accessibility-checker";
import { SESSION_KEY } from "../app/server/middleware/session.ts";

export function mockFunction<T extends (...args: never[]) => unknown>(
  fn: T,
): T & { calls: Parameters<T>[] } {
  const calls: Parameters<T>[] = [];
  const mock = function (...args: Parameters<T>): ReturnType<T> {
    calls.push(args);
    return fn(...args);
  } as T & { calls: Parameters<T>[] };

  mock.calls = calls;
  return mock;
}

type MockContextOptions = {
  headers?: HeadersInit;
  method?: RequestMethod;
  params?: Record<string, string>;
  sessionId?: string;
};

type MockContextBase = {
  request: Request;
  storage: AppStorage;
  method: RequestMethod;
  params: Record<string, string>;
  url: URL;
  headers: Headers;
  files: Map<string, File>;
};

type MockContextWithFormData = MockContextBase & {
  formData: FormData;
};

type MockContextWithoutFormData = MockContextBase & {
  formData: undefined;
};

// Overloaded function signatures for better type safety
export function createMockContext(
  mockOptions: MockContextOptions & { method: "POST" },
): MockContextWithFormData;
export function createMockContext(
  mockOptions?: Omit<MockContextOptions, "method"> & {
    method?: Exclude<RequestMethod, "POST">;
  },
): MockContextWithoutFormData;
export function createMockContext(
  mockOptions?: MockContextOptions,
): MockContextWithFormData | MockContextWithoutFormData;
export function createMockContext(mockOptions: MockContextOptions = {}) {
  const { method = "GET", params = {}, sessionId } = mockOptions;
  let { headers } = mockOptions;

  if (sessionId) {
    headers = {
      ...headers,
      Cookie: `sessionId=${sessionId}`,
    };
  }

  const context = {
    request: new Request("http://example.com", { headers, method }),
    formData: method === "POST" ? new FormData() : undefined,
    storage: new AppStorage(),
    method: method,
    params,
    url: new URL("http://example.com"),
    headers: new Headers(headers),
    files: new Map(),
  };

  if (sessionId) {
    context.storage.set(SESSION_KEY, { sessionId });
  }

  return context;
}

export async function assertAccessibleHtml(html: string) {
  try {
    const failLevels = ["violation"];
    await aChecker.setConfig({
      failLevels: failLevels as Parameters<
        typeof aChecker.setConfig
      >[0]["failLevels"],
    });
    const results = await aChecker.getCompliance(html, "home-page");
    const returnCode = aChecker.assertCompliance(
      results.report as IBaselineReport,
    );

    assert.equal(returnCode, 0, "Accessibility standards not met");
  } catch (err) {
    throw err;
  } finally {
    await aChecker.close();
  }
}
