import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import session, { SESSION_ID_KEY } from "./session.ts";
import { createMockContext } from "../../../test/helpers.ts";
import { mockFunction } from "../../../test/helpers.ts";

describe("Session Middleware", () => {
  it("should use existing session if sessionId cookie is present", async () => {
    const sessionId = "test";
    const context = createMockContext({
      headers: { "Cookie": `sessionId=${sessionId}` },
    });

    const handler = session();
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Execute the session middleware
    const response = await handler(
      context,
      next,
    );

    assert.ok(response, "Response should be defined");
    assert.equal(
      context.storage.get(SESSION_ID_KEY),
      sessionId,
      "Request context should store the sessionId from the cookie",
    );
    assert.equal(
      response.headers.get("Set-Cookie")?.split(";")[0].split("=")[1],
      sessionId,
      "Set-Cookie header should be set for existing session",
    );
    assert.equal(response.status, 200, "Response status should be 200");
    assert.equal(1, next.calls.length, "Next middleware should be called once");
  });

  it("should create a new session if no cookie is provided", async () => {
    const handler = session();
    const context = createMockContext();
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Execute the session middleware
    const response = await handler(
      context,
      next,
    );

    const requestContextId = context.storage.get(SESSION_ID_KEY);
    const cookieId = response?.headers.get("Set-Cookie")?.split(";")[0]
      .split("=")[1];

    assert.ok(response, "Response should be defined");
    assert.ok(requestContextId, "A sessionId should be set in the context");
    assert.ok(cookieId, "A sessionId cookie should be set");
    assert.equal(
      requestContextId,
      cookieId,
      "The sessionId in context and cookie should match",
    );
    assert.equal(response.status, 200, "Response status should be 200");
    assert.equal(1, next.calls.length, "Next middleware should be called once");
  });
});
