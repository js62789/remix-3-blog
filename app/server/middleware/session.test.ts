import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSessionStore, session, SESSION_DATA_KEY } from "./session.ts";
import {
  createMockContext,
  setupFakeSession as createSessionStoreWithSession,
} from "../../../test/helpers.ts";
import { mockFunction } from "../../../test/helpers.ts";

describe("Session Middleware", () => {
  it("should expire old sessions", () => {
    const context = createMockContext();
    const sessionId = "test";
    // Create a session store for this test only
    const sessions = createSessionStoreWithSession(context, sessionId, {
      expiry: 0,
    });

    assert.equal(sessions.size, 1, "There should be one initial session");

    const timerFn = mockFunction(
      (
        handler: TimerHandler,
        _timeout?: number | undefined,
      ) => {
        if (typeof handler === "function") {
          handler();
        }
        return 1; // Return a mock timer ID
      },
    );

    session({ store: sessions, timerFn });

    // Check that the sessions map is empty
    assert.equal(sessions.size, 0, "Expired session should be removed");
    assert.equal(timerFn.calls.length, 1, "setInterval should be called once");
    assert.equal(
      timerFn.calls[0][1],
      60000,
      "Timer should be set for 1 minute interval",
    );
  });

  it("should use existing session if sessionId cookie is present", async () => {
    const context = createMockContext();
    const sessionId = "test";
    // Create a fake session
    const sessions = createSessionStoreWithSession(context, sessionId);

    const handler = session({ store: sessions });
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    assert.equal(sessions.size, 1, "There should be one initial session");

    // Execute the session middleware
    const response = await handler(
      context,
      next,
    );

    assert.equal(sessions.size, 1, "There should still be one session");
    assert.equal(
      context.storage.get(SESSION_DATA_KEY)?.sessionId,
      sessionId,
      "Request context should have the existing session",
    );
    assert.equal(
      response!.headers.get("Set-Cookie"),
      null,
      "Set-Cookie header should not be set for existing session",
    );
    assert.equal(response!.status, 200, "Response status should be 200");
    assert.equal(1, next.calls.length, "Next middleware should be called once");
  });

  it("should create a new session if no cookie is provided", async () => {
    // Create a session store for this test only
    const sessions = createSessionStore();
    const handler = session({ store: sessions });
    const context = createMockContext();
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Execute the session middleware
    const response = await handler(
      context,
      next,
    );

    assert.equal(sessions.size, 1, "A new session should be created");
    assert.equal(
      context.storage.get(SESSION_DATA_KEY)?.sessionId,
      response?.headers.get("Set-Cookie")?.split(";")[0].split("=")[1],
      "Request context should have a sessionId",
    );
    assert.equal(
      response!.headers.get("Set-Cookie")?.includes("sessionId="),
      true,
      "Set-Cookie header should be set",
    );
    assert.equal(response!.status, 200, "Response status should be 200");
    assert.equal(1, next.calls.length, "Next middleware should be called once");
  });
});
