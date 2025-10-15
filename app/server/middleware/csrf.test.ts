import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { csrf } from "./csrf.ts";
import { AppStorage, RequestMethod } from "@remix-run/fetch-router";
import { SESSION_DATA_KEY } from "./session.ts";
import { mockFunction, setupFakeSession } from "../../../test/helpers.ts";

type MockOptions = {
  method?: RequestMethod;
};

function createMockContext(mockOptions: MockOptions = {}) {
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

describe("CSRF Middleware", () => {
  it("should return 400 if no session is found", async () => {
    const handler = csrf();
    const context = createMockContext();
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Execute the csrf middleware without a session
    const response = await handler(
      context,
      next,
    );

    assert.equal(response instanceof Response, true);
    assert.equal(response!.status, 400);
    const text = await response!.text();
    assert.equal(text, "Session not found");
    assert.equal(0, next.calls.length);
  });

  it("should return 400 if CSRF token is missing on non-GET request", async () => {
    const handler = csrf();
    const context = createMockContext({ method: "POST" });
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );
    const sessionId = "test";

    // Create a fake session
    setupFakeSession(context, sessionId);

    // Execute the csrf middleware without a CSRF token
    const response = await handler(
      context,
      next,
    );

    assert.equal(response instanceof Response, true);
    assert.equal(response!.status, 400);
    const text = await response!.text();
    assert.equal(text, "CSRF token missing");
    assert.equal(0, next.calls.length);
  });

  it("should return 403 if CSRF token is invalid on non-GET request", async () => {
    const handler = csrf();
    const context = createMockContext({ method: "POST" });
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Create a fake session
    setupFakeSession(context, "test");

    // Add an invalid CSRF token to formData
    context.formData.set("_csrf", "invalid-token");

    // Execute the csrf middleware with an invalid CSRF token
    const response = await handler(
      context,
      next,
    );

    assert.equal(response instanceof Response, true);
    assert.equal(response!.status, 403);
    const text = await response!.text();
    assert.equal(text, "Invalid CSRF token");
    assert.equal(0, next.calls.length);
  });

  it("should always pass through GET requests", async () => {
    const handler = csrf();
    const context = createMockContext();
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Create a fake sesfsion
    context.storage.set(SESSION_DATA_KEY, {
      sessionId: "test",
      expiresAt: Date.now() + 10000,
    });

    // Execute the csrf middleware
    const response = await handler(
      context,
      next,
    );

    assert.equal(response instanceof Response, true);
    assert.equal(response!.status, 200);
    assert.equal(1, next.calls.length);
  });
});
