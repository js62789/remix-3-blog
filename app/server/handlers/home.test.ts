import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import homeHandler from "./home.tsx";
import { requestContextStorage } from "../middleware/context.ts";
import {
  assertAccessibleHtml,
  createMockContext,
} from "../../../test/helpers.ts";

describe("Home Handler", () => {
  it("should return status 200", async () => {
    const response = await requestContextStorage.run(
      createMockContext(),
      () => homeHandler(),
    );
    assert.equal(response.status, 200);
  });

  it("should meet accessibility standards", async () => {
    const content = await requestContextStorage.run(
      createMockContext(),
      async () => {
        const response = await homeHandler();
        return response.text();
      },
    );

    assertAccessibleHtml(content);
  });
});
