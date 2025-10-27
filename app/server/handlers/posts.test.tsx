import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import postsHandlers from "./posts.tsx";
import { requestContextStorage } from "../middleware/context.ts";
import {
  assertAccessibleHtml,
  createMockContext,
} from "../../../test/helpers.ts";

describe("Posts Handler", () => {
  it("should return status 200", async () => {
    const response = await requestContextStorage.run(
      createMockContext(),
      () => postsHandlers.index(),
    );
    assert.equal(response.status, 200);
  });

  it("should meet accessibility standards", async () => {
    const content = await requestContextStorage.run(
      createMockContext(),
      async () => {
        const response = await postsHandlers.index();
        return response.text();
      },
    );

    assertAccessibleHtml(content);
  });
});

describe("Post Handler", () => {
  it("should return status 200", async () => {
    const context = createMockContext({ params: { slug: "my-first-post" } });
    const response = await requestContextStorage.run(
      context,
      () => postsHandlers.show(context),
    );
    assert.equal(response.status, 200);
  });

  it("should meet accessibility standards", async () => {
    const context = createMockContext({ params: { slug: "my-first-post" } });
    const content = await requestContextStorage.run(
      context,
      async () => {
        const response = await postsHandlers.show(context);
        return response.text();
      },
    );

    assertAccessibleHtml(content);
  });
});
