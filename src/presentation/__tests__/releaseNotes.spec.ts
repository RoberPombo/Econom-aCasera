import { describe, expect, test } from "vitest";
import { formatReleaseNotes } from "../releaseNotes";

describe("formatReleaseNotes", () => {
  test("turns release-please markdown into readable blocks", () => {
    const notes = `## [2.0.0](https://github.com/o/r/compare/v1.0.0...v2.0.0) (2026-11-25)

### Features

* add the changelog button ([#190](https://github.com/o/r/issues/190)) ([abc1234](https://github.com/o/r/commit/abc1234))

### Bug Fixes

* fix a crash on start ([#191](https://github.com/o/r/issues/191)) ([def5678](https://github.com/o/r/commit/def5678))`;

    expect(formatReleaseNotes(notes)).toEqual([
      { kind: "title", text: "2.0.0 (2026-11-25)" },
      { kind: "section", text: "Novedades" },
      { kind: "item", text: "add the changelog button (#190)" },
      { kind: "section", text: "Correcciones" },
      { kind: "item", text: "fix a crash on start (#191)" },
    ]);
  });

  test("keeps unknown sections and plain paragraphs", () => {
    const notes = `### Something Else

A paragraph with **bold**, \`code\` and [a link](https://example.com).`;

    expect(formatReleaseNotes(notes)).toEqual([
      { kind: "section", text: "Something Else" },
      { kind: "text", text: "A paragraph with bold, code and a link." },
    ]);
  });

  test("returns no blocks for empty notes", () => {
    expect(formatReleaseNotes("")).toEqual([]);
    expect(formatReleaseNotes("   \n\n ")).toEqual([]);
  });
});
