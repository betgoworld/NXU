import { test } from "node:test";
import assert from "node:assert/strict";
import { maskBrPhone, normalizeBrPhone, isValidName } from "./phone.ts";

test("mask", () => {
  assert.equal(maskBrPhone("2"), "(2");
  assert.equal(maskBrPhone("22"), "(22");
  assert.equal(maskBrPhone("229"), "(22) 9");
  assert.equal(maskBrPhone("22999998888"), "(22) 99999-8888");
  assert.equal(maskBrPhone("2233334444"), "(22) 3333-4444");
  assert.equal(maskBrPhone("229999988887777"), "(22) 99999-8888");
});

test("normalize", () => {
  assert.equal(normalizeBrPhone("(22) 99999-8888".replace("99999-8888", "98765-4321")), "+5522987654321");
  assert.equal(normalizeBrPhone("+55 22 98765-4321"), "+5522987654321");
  assert.equal(normalizeBrPhone("5522987654321"), "+5522987654321");
  assert.equal(normalizeBrPhone("2233334444"), "+552233334444");
  assert.equal(normalizeBrPhone("22 88765-4321"), null); // celular sem 9
  assert.equal(normalizeBrPhone("(22) 99999-9999"), null);
  assert.equal(normalizeBrPhone("(01) 98765-4321"), null);
  assert.equal(normalizeBrPhone("123"), null);
  assert.equal(normalizeBrPhone(""), null);
});

test("name", () => {
  assert.ok(isValidName("Ana"));
  assert.ok(!isValidName(" a "));
  assert.ok(!isValidName("1234"));
});
