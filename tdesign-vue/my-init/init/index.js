/*
 * @Desc:
 * @Author: 曾茹菁
 * @Date: 2022-08-29 11:40:52
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-29 16:35:35
 */
import { cwd, exit } from "node:process";
import { resolve } from "node:path";
import { existsSync, rmSync } from "node:fs";
import getToBeCreatedFiles from "./config.js";
const cwdPath = cwd();
/**
 * @description: 首字母大写
 * @param {string} a
 * @return {string}
 */
function getFirstLetterUpper(a) {
  return a[0].toUpperCase() + a.slice(1);
}
/**
 * @description: 删除组件相关文件
 * @param {*} toBeCreatedFiles
 * @param {*} component
 * @return {*}
 */
function deleteComponent(toBeCreatedFiles, component) {
  // 获取单元测试快照文件
  const snapShotFiles = getSnapshotFiles(component);
  const files = Object.assign(toBeCreatedFiles, snapShotFiles);
  // 执行文件删除操作
  Object.keys(files).forEach((dir) => {
    existsSync(dir) &&
      rmSync(dir, {
        recursive: true,
      });
  });
  // 打印删除success
  utils.log("All radio files have been removed.", "success");
}

function init() {
  const [component, isDeleted] = process.argv.slice(2);
  if (!component) {
    console.error("请输入组件名称");
    exit(1);
  }
  const indexPath = resolve(cwdPath, "components/index.js");
  const toBeCreatedFiles = getToBeCreatedFiles(component);
  console.log(getFirstLetterUpper(component));
  if (isDeleted === "del") {
    deleteComponent(toBeCreatedFiles, component);
  }
}
init();
