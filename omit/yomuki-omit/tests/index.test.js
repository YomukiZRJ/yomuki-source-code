/*
 * @Desc:
 * @Author: 曾茹菁
 * @Date: 2022-08-11 16:28:58
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-11 20:30:51
 */
import assert from "assert";
import omit from "../src";
describe("omit", () => {
  it("应该创建一个浅拷贝", () => {
    const original = { truth: "弥央真可爱" };
    const newObj = omit(original, []);
    assert.deepEqual(original, newObj); // 测试返回的对象和原对象的深度是否相同 此方法只考虑自身的可枚举属性
    assert.notEqual(original, newObj);
  });

  it("应该删除传入的字段", () => {
    const original = { name: "弥央", age: 18 };
    assert.deepEqual(omit(original, ["age"]), { name: "弥央" });
    assert.deepEqual(omit(original, ["name", "age"]), {});
  });
  it("应该不返回原对象原型链上的属性和自身的不可枚举属性", () => {
    const original = Object.create(
      {
        desc: "是我老婆",
      },
      {
        name: {
          value: "弥央",
          enumerable: true,
        },
        age: {
          value: 18,
        },
      }
    );
    assert.deepEqual(omit(original, ["name"]), {});
  });
});
