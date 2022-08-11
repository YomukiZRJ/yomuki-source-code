/*
 * @Desc:
 * @Author: 曾茹菁
 * @Date: 2022-08-11 15:27:23
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-11 16:18:08
 */
import { IBundleOptions } from "father"
const fatherOption: IBundleOptions = {
  /**
 * 入口文件
 */
  entry: "src/index.ts",
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
