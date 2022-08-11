/*
 * @Desc:
 * @Author: 曾茹菁
 * @Date: 2022-08-11 16:28:58
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-11 17:16:29
 */
import assert from "assert";
import omit from "../src";
describe("omit", () => {
  it("应该创建一个浅拷贝", () => {
    const benjy = { name: "Benjy" };
    const copy = omit(benjy, []);
    assert.deepEqual(copy, benjy); // 测试返回的对象和原对象的深度是否相同 此方法只考虑自身的可枚举属性
    assert.notEqual(copy, benjy);
  });

  it("should drop fields which are passed in", () => {
    const benjy = { name: "Benjy", age: 18 };
    assert.deepEqual(omit(benjy, ["age"]), { name: "Benjy" });
    assert.deepEqual(omit(benjy, ["name", "age"]), {});
  });
});
