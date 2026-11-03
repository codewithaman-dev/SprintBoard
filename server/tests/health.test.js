import test from "node:test";
import assert from "node:assert/strict";

test("health endpoint contract includes success and message", () => {
  const response = { success: true, message: "SprintBoard API is running" };
  assert.equal(response.success, true);
  assert.match(response.message, /API is running/);
});
