<!--
 * @Desc: 
 * @Author: 曾茹菁
 * @Date: 2022-08-11 14:09:24
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-11 20:43:02
-->
# omit.js 剔除对象中的属性
- 本文参加了由[公众号@若川视野](https://lxchuan12.gitee.io/) 发起的每周源码共读活动，[点击了解详情一起参与](https://juejin.cn/post/7079706017579139102)。
- 这是源码共读的第36期，链接：[【若川视野 x 源码共读】第36期 | 可能是历史上最简单的一期 omit.js 剔除对象中的属性](https://juejin.cn/post/7118782469360320542)。
## 目标
1. 理解omit是如何剔除对象中的属性
2. 了解源码使用的依赖包
3. 复刻
## omit是如何剔除对象中的属性？
先来看看源码
```js
function omit(obj, fields) {
  // eslint-disable-next-line prefer-object-spread
  const shallowCopy = Object.assign({}, obj);
  for (let i = 0; i < fields.length; i += 1) {
    const key = fields[i];
    delete shallowCopy[key];
  }
  return shallowCopy;
}
```
函数的入参为**obj(目标对象)**和**fields(被剔除的属性的字符串数组)**
1. 首先，先用[**Object.assign**](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)浅拷贝了目标对象。
    - Object.assign 不会复制**原型链上的属性**和**不可枚举属性**
2. 循环**fields**，取出属性名，在浅拷贝对象上进行delete
    - 只会删除第一层的对象属性，不能删除更深次的
3. 返回浅拷贝对象
4. 综上，它不会改变原对象，返回的对象是剔除了原型链属性和其不可枚举属性以及目标剔除属性的对象。
## 依赖包
- [**father**](https://github.com/umijs/father) 基于rollup和babel的打包器
  - 基于[docz](https://www.docz.site/docs/getting-started) 的文档
  - 支持ts,eslint,test......
  - 支持 cjs、esm 和 umd 三种格式的打包
- [@umijs/fabric](https://github.com/umijs/fabric#readme) 包含 prettier，eslint，stylelint 的配置文件合集
- [assert](https://www.npmjs.com/package/assert) 一个和nodejs中assert差不多的包
- [np](https://www.npmjs.com/package/np) 发包小助手

## 复刻
### father
不需要文档的话安装father-build就行啦。[**配置说明**](https://github.com/umijs/father) 
```js
import { IBundleOptions } from "father"
const fatherOption: IBundleOptions = {
  /**
 * 入口文件
 */
  entry: "src/index.js",
  /**
   * 是否输出 cjs 格式，以及指定 cjs 格式的打包方式
   */
  cjs: "babel",
  /**
 * 是否输出 esm 格式，以及指定 esm 格式的打包方式
 */
  esm: {
    type: "babel",
    importLibToEs: true // 是否在 esm 模式下把 import 项里的 /lib/ 转换为 /es/。
  },
  preCommit: {
    eslint: true,
  }
}
export default fatherOption
```
添加指令
```
"build": "father build",
```
### [@umijs/fabric](https://github.com/umijs/fabric#readme)
1. 添加.eslintrc.js配置文件
```js
module.exports = {
  extends: [require.resolve("@umijs/fabric/dist/eslint")],
  rules: {
    // your rules lan de c+v
  },
};
```
2. 添加.eslintignore忽略文件
```
.eslintrc.js
lib
es
```
3. 添加tsconfig配置文件，给源码加点类型~，又菜又爱写ts
```js
function omit<T, K extends keyof T>(obj: T, fields: K[]): Omit<T, K> {
  const shallowCopy = Object.assign({}, obj);
  for (let i = 0; i < fields.length; i += 1) {
    const key = fields[i];
    delete shallowCopy[key];
  }
  return shallowCopy;
}
export default omit;
```
4. test
- 安装[**assert**](https://nodejs.org/api/assert.html#assertdeepequalactual-expected-message)
- deepEqual：测试返回的对象和原对象的深度是否相同 此方法只考虑自身的可枚举属性
```js
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
```
添加指令
- coverage 覆盖率测试
- test 
```
    "coverage": "father test --coverage",
    "test": "father test"
```
5. 发布
在package中定义入口
```
  "main": "lib/index.js",
  "module": "es/index.js",
  "types": "index.d.ts",
```
- 安装np npm install --global np
添加预发布指令
```
"prepublishOnly": "npm run build && np --yolo --no-publish",
```
- --yolo  跳过清理和测试
- --no-publish 跳过发布
- 
