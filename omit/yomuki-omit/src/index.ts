/*
 * @Desc:
 * @Author: 曾茹菁
 * @Date: 2022-08-11 14:27:48
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-11 16:21:57
 */
function omit<T, K extends keyof T>(obj: T, fields: K[]): Omit<T, K> {
  const shallowCopy = Object.assign({}, obj);
  for (let i = 0; i < fields.length; i += 1) {
    const key = fields[i];
    delete shallowCopy[key];
  }
  return shallowCopy;
}
export default omit;
