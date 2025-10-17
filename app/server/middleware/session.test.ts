import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { session, SESSION_DATA_KEY, SessionStore } from "./session.ts";
import { createMockContext, createSession } from "../../../test/helpers.ts";
import { mockFunction } from "../../../test/helpers.ts";

describe("Session Middleware", () => {
  it("should expire old sessions", () => {
    const context = createMockContext();
    const sessionId = "test";

    let invalidate: () => void = () => {};
    const timerFn = mockFunction(
      (
        handler: TimerHandler,
        _timeout?: number | undefined,
      ) => {
        if (typeof handler === "function") {
          invalidate = handler as () => void;
        }
        return 1; // Return a mock timer ID
      },
    );

    const store = new SessionStore({ expiry: 0, timerFn });

    createSession(context, store, sessionId);

    session({ store, timerFn });

    // Check that the sessions map is empty
    assert.equal(store.size, 1, "There should be one initial session");
    assert.equal(timerFn.calls.length, 1, "setInterval should be called once");
    assert.equal(
      timerFn.calls[0][1],
      60000,
      "Timer should be set for 1 minute interval",
    );
    invalidate();
    assert.equal(store.size, 0, "Expired session should be removed");
  });

  it("should use existing session if sessionId cookie is present", async () => {
    const store = new SessionStore();
    const context = createMockContext();
    const sessionId = "test";

    createSession(context, store, sessionId);

    const handler = session({ store });
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    assert.equal(store.size, 1, "There should be one initial session");

    // Execute the session middleware
    const response = await handler(
      context,
      next,
    );

    assert.equal(store.size, 1, "There should still be one session");
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
    const store = new SessionStore();
    const handler = session({ store });
    const context = createMockContext();
    const next = mockFunction(() =>
      new Promise<Response>((resolve) => resolve(new Response("Next called")))
    );

    // Execute the session middleware
    const response = await handler(
      context,
      next,
    );

    assert.equal(store.size, 1, "A new session should be created");
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
