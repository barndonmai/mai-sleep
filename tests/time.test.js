import assert from "node:assert/strict";
import test from "node:test";

import { getNowTimeString, pad, parseTimeToDate } from "../src/lib/time.js";
import { withFixedDate } from "./helpers/freezeTime.js";

test("pad keeps two-digit formatting stable", () => {
  assert.equal(pad(3), "03");
  assert.equal(pad(12), "12");
});

test("parseTimeToDate uses today's date with the requested time", () => {
  const parsed = withFixedDate("2026-04-08T09:15:00", () =>
    parseTimeToDate("23:45"),
  );

  assert.ok(parsed instanceof Date);
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 3);
  assert.equal(parsed.getDate(), 8);
  assert.equal(parsed.getHours(), 23);
  assert.equal(parsed.getMinutes(), 45);
});

test("parseTimeToDate returns null for malformed values", () => {
  assert.equal(parseTimeToDate(""), null);
  assert.equal(parseTimeToDate("oops"), null);
  assert.equal(parseTimeToDate("12:nope"), null);
});

test("getNowTimeString returns a zero-padded 24-hour time", () => {
  const nowTimeString = withFixedDate("2026-04-08T07:05:00", () =>
    getNowTimeString(),
  );

  assert.equal(nowTimeString, "07:05");
});
