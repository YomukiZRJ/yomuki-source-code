/*
 * @Desc: 
 * @Author: 曾茹菁
 * @Date: 2022-08-11 16:06:11
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-11 16:06:39
 */
declare function Omit<T, K extends keyof T>(
    obj: T,
    keys: Array<K>
): Omit<T, K>;