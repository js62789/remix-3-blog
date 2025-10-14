import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Markdown } from "./markdown.tsx";

describe("Markdown Utilities", () => {
  describe("links", () => {
    it("should convert absolute links correctly", () => {
      const input = "This is a [link](https://example.com)";
      const expectedOutput =
        '<p>This is a <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a></p>';

      const actualOutput = Markdown({ children: input });
      assert.deepEqual(actualOutput, expectedOutput);
    });

    it("should convert relative links correctly", () => {
      const input = "This is a [link](/relative-path)";
      const expectedOutput =
        '<p>This is a <a href="/relative-path">link</a></p>';

      const actualOutput = Markdown({ children: input });
      assert.deepEqual(actualOutput, expectedOutput);
    });
  });

  describe("bold text", () => {
    it("should convert bold text correctly", () => {
      const input = "This is **bold** text and this is __also bold__ text.";
      const expectedOutput =
        "<p>This is <b>bold</b> text and this is <b>also bold</b> text.</p>";

      const actualOutput = Markdown({ children: input });
      assert.deepEqual(actualOutput, expectedOutput);
    });
  });

  describe("italic text", () => {
    it("should convert italic text correctly", () => {
      const input = "This is *italic* text and this is _also italic_ text.";
      const expectedOutput =
        "<p>This is <i>italic</i> text and this is <i>also italic</i> text.</p>";

      const actualOutput = Markdown({ children: input });
      assert.deepEqual(actualOutput, expectedOutput);
    });
  });

  describe("headers", () => {
    it("should convert headers correctly", () => {
      const input = "# Header 1\n## Header 2\n### Header 3";
      const expectedOutput =
        "<h1>Header 1</h1><h2>Header 2</h2><h3>Header 3</h3>";

      const actualOutput = Markdown({ children: input });
      assert.deepEqual(actualOutput, expectedOutput);
    });
  });
});
