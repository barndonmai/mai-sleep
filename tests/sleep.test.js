import assert from "node:assert/strict";
import test from "node:test";

import {
  FALL_ASLEEP_MINUTES,
  getSleepTimesFromWake,
  getWakeTimesFromNow,
  getWakeTimesFromSleepTime,
  qualityLabel,
  recommendationText,
} from "../src/lib/sleep.js";
import { withFixedDate } from "./helpers/freezeTime.js";

function toClockParts(date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
  };
}

test("getSleepTimesFromWake returns four bedtimes in descending cycle order", () => {
  const results = withFixedDate("2026-01-15T10:00:00", () =>
    getSleepTimesFromWake("08:00"),
  );

  assert.equal(results.length, 4);
  assert.deepEqual(
    results.map((result) => ({ cycles: result.cycles, type: result.type })),
    [
      { cycles: 6, type: "sleep" },
      { cycles: 5, type: "sleep" },
      { cycles: 4, type: "sleep" },
      { cycles: 3, type: "sleep" },
    ],
  );

  assert.deepEqual(toClockParts(results[0].time), {
    year: 2026,
    month: 0,
    day: 14,
    hours: 22,
    minutes: 46,
  });
  assert.deepEqual(toClockParts(results.at(-1).time), {
    year: 2026,
    month: 0,
    day: 15,
    hours: 3,
    minutes: 16,
  });
});

test("getWakeTimesFromNow applies the fall-asleep buffer before cycles", () => {
  const results = withFixedDate("2026-01-15T22:30:00", () =>
    getWakeTimesFromNow(),
  );

  assert.equal(results.length, 6);
  assert.equal(results[0].cycles, 6);
  assert.equal(results.at(-1).cycles, 1);
  assert.equal(results[0].type, "wake");

  assert.deepEqual(toClockParts(results[0].time), {
    year: 2026,
    month: 0,
    day: 16,
    hours: 7,
    minutes: 44,
  });
  assert.deepEqual(toClockParts(results.at(-1).time), {
    year: 2026,
    month: 0,
    day: 16,
    hours: 0,
    minutes: 14,
  });
});

test("getWakeTimesFromSleepTime rolls into the next day when needed", () => {
  const results = withFixedDate("2026-01-15T12:00:00", () =>
    getWakeTimesFromSleepTime("23:00"),
  );

  assert.equal(results.length, 6);
  assert.deepEqual(toClockParts(results[0].time), {
    year: 2026,
    month: 0,
    day: 16,
    hours: 8,
    minutes: 14,
  });
  assert.deepEqual(toClockParts(results.at(-1).time), {
    year: 2026,
    month: 0,
    day: 16,
    hours: 0,
    minutes: 44,
  });
});

test("invalid time strings return empty result sets", () => {
  assert.deepEqual(getSleepTimesFromWake("not-a-time"), []);
  assert.deepEqual(getSleepTimesFromWake("12:xx"), []);
  assert.deepEqual(getWakeTimesFromSleepTime(""), []);
});

test("sleep recommendation labels stay aligned with cycle count thresholds", () => {
  assert.equal(qualityLabel(6), "Best");
  assert.equal(qualityLabel(4), "Good");
  assert.equal(qualityLabel(3), "Okay");
  assert.equal(qualityLabel(2), "Short");

  assert.equal(recommendationText(5), "ideal range");
  assert.equal(recommendationText(4), "solid");
  assert.equal(recommendationText(3), "minimum");
  assert.equal(recommendationText(2), "power sleep");

  assert.equal(FALL_ASLEEP_MINUTES, 14);
});
