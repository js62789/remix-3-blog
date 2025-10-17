import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import csrf from "./csrf.ts";
import { createMockContext, mockFunction } from "../../../test/helpers.ts";

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

    assert.ok(response, "Response should be defined");
    assert.equal(response.status, 400);
    const text = await response.text();
    assert.equal(text, "Session not found");
    assert.equal(0, next.calls.length);
  });

  it("should return 400 if CSRF token is missing on non-GET request", async () => {
    const sessionId = "test";
    const handler = csrf();
    const context = createMockContext({
      method: "POST",
      sessionId,
    });
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Execute the csrf middleware without a CSRF token
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
    const handler = csrf();
    const context = createMockContext({
      headers: { "Cookie": `sessionId=${sessionId}` },
      method: "POST",
      sessionId,
    });
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Add an invalid CSRF token to formData
    context.formData.set("_csrf", "invalid-token");

    // Execute the csrf middleware with an invalid CSRF token
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

  it("should always pass through GET requests", async () => {
    const handler = csrf();
    const context = createMockContext({ sessionId: "test" });
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Execute the csrf middleware
    const response = await handler(
      context,
      next,
    );

    assert.ok(response, "Response should be defined");
    assert.equal(response.status, 200);
    assert.equal(1, next.calls.length);
  });
});
