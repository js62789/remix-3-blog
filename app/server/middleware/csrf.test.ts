import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import csrf from "./csrf.ts";
import { createMockContext, mockFunction } from "../../../test/helpers.ts";

describe("CSRF Middleware", () => {
  it("should return 400 if no session is found", async () => {
    const handler = csrf({ getSession: () => undefined });
    const context = createMockContext();
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // TODO use dependency injection instead
    const response = await handler(
      context,
      next,
    );

    assert.ok(response, "Response should be defined");
    assert.equal(response.status, 400);
    const text = await response.text();
    assert.equal(text, "Session not found");
    assert.equal(0, next.calls.length);
  });

  it("should return 400 if CSRF token is missing on non-GET request", async () => {
    const sessionId = "test";
    const handler = csrf({
      getSession: () => ({ sessionId }),
      updateSession: () => ({ sessionId }),
    });
    const context = createMockContext({
      method: "POST",
      sessionId,
    });
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // TODO use dependency injection instead
    const response = await handler(
      context,
      next,
    );

    assert.ok(response, "Response should be defined");
    assert.equal(response.status, 400);
    const text = await response.text();
    assert.equal(text, "CSRF token missing");
    assert.equal(0, next.calls.length);
  });

  it("should return 403 if CSRF token is invalid on non-GET request", async () => {
    const sessionId = "test";
    const handler = csrf({
      getSession: () => ({ sessionId, data: { csrfToken: "valid" } }),
    });
    const context = createMockContext({
      method: "POST",
      sessionId,
    });
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Add an invalid CSRF token to formData
    context.formData.set("_csrf", "invalid-token");

    // TODO use dependency injection instead
    const response = await handler(
      context,
      next,
    );

    assert.ok(response, "Response should be defined");
    assert.equal(response.status, 403);
    const text = await response.text();
    assert.equal(text, "Invalid CSRF token");
    assert.equal(0, next.calls.length);
  });

  it("should return 200 if CSRF token is valid on non-GET request", async () => {
    const sessionId = "test";
    const csrfToken = "valid-csrf-token";
    const updateSession = mockFunction((updates) => ({
      sessionId,
      ...updates,
      data: updates.data,
    }));
    const handler = csrf({
      getSession: () => ({ sessionId, data: { csrfToken } }),
      // TODO use a mock function to verify this gets called
      updateSession,
    });
    const context = createMockContext({
      method: "POST",
      sessionId,
    });
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Add a valid CSRF token to formData
    context.formData.set("_csrf", csrfToken);

    // TODO use dependency injection instead
    const response = await handler(
      context,
      next,
    );

    assert.ok(response, "Response should be defined");
    assert.equal(response.status, 200, "Response status should be 200");
    assert.equal(1, next.calls.length, "Next middleware should be called once");
    assert.equal(
      1,
      updateSession.calls.length,
      "Session should be updated to set a new CSRF token",
    );
    assert.ok(
      updateSession.calls[0][0].data.csrfToken,
      "New CSRF token should be set",
    );
    assert.notEqual(
      updateSession.calls[0][0].data.csrfToken,
      csrfToken,
      "A new CSRF token should be set in the session",
    );
  });

  it("should always pass through GET requests", async () => {
    const updateSession = mockFunction((updates) => ({
      sessionId: "new-session-id",
      ...updates,
      data: updates.data,
    }));
    const handler = csrf({
      getSession: () => ({ sessionId: "new-session-id" }),
      updateSession,
    });
    const context = createMockContext({ sessionId: "test" });
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // TODO use dependency injection instead
    const response = await handler(
      context,
      next,
    );

    assert.ok(response, "Response should be defined");
    assert.equal(response.status, 200);
    assert.equal(1, next.calls.length);
    assert.equal(
      1,
      updateSession.calls.length,
      "Session should be updated to set a new CSRF token",
    );
  });
});
