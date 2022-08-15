<!--
 * @Desc: 
 * @Author: 曾茹菁
 * @Date: 2022-08-14 09:20:24
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-15 14:48:35
-->
# create-vite 源码解读笔记
- 本文参加了由[公众号@若川视野](https://lxchuan12.gitee.io/) 发起的每周源码共读活动，[点击了解详情一起参与](https://juejin.cn/post/7079706017579139102)。
- 这是源码共读的第37期，链接：[【若川视野 x 源码共读】第37期 | vite 3.0 都发布了，这次来手撕 create-vite 源码](https://juejin.cn/post/7129087028947320862/)。
- [create-vite 源码](https://github.com/vitejs/vite/blob/HEAD/packages/create-vite/index.js)
## 相关依赖
- [fs](https://nodejs.org/dist/latest-v18.x/docs/api/fs.html) 处理文件
```js
import fs from " node:fs";
```
- [path](https://nodejs.org/dist/latest-v18.x/docs/api/path.html)  处理路径
```js
import path from 'node:path';
```
- [url.fileURLToPath](https://nodejs.org/dist/latest-v18.x/docs/api/url.html) 将文件 URL 字符串或 URL 对象转为路径。解码百分比编码的字符以及确保跨平台有效的绝对路径字符串。
```js
import { fileURLToPath } from 'node:url'
```
- [minimist](https://www.npmjs.com/package/minimist) 命令行参数解析
```js
import minimist from 'minimist'
```
- [prompts](https://www.npmjs.com/package/prompts)  美观、人性化的cli交互页面
```js
import prompts from 'prompts'
```
- [kolorist](https://www.npmjs.com/package/kolorist) 颜色库
```js
import {
  blue,
  cyan,
  green,
  lightRed,
  magenta,
  red,
  reset,
  yellow
} from 'kolorist'
```
## 主函数 - 前置部分
- targetDir 目标文件夹
```js
// 项目名（创建的文件夹名） -- 创建时的第一个参数
let targetDir = formatTargetDir(argv._[0]);
// 默认名
const defaultTargetDir = "vite-project";
```
- template 模板
```js
// 命令行参数 --template 或者 -t
  let template = argv.template || argv.t;
```
- getProjectName 获取项目名
```js
// 获取项目名称
const getProjectName = () =>
  targetDir === "." ? path.basename(path.resolve()) : targetDir;
```
## 主函数 - prompts 部分
[prompts 文档](https://www.npmjs.com/package/prompts)
1. 输入项目名。
  - 如果创建时带了项目名，则跳过此步骤。
```js
        {
          // 创建时带了项目名 -> 跳过步骤
          type: targetDir ? null : "text",
          name: "projectName",
          message: reset("Project name:"),
          initial: defaultTargetDir,// 默认值  "vite-project"
          onState: (state) => {
            // 格式化项目名
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
```
2. 判断项目文件夹是否存在，给出确认提示。
  - 文件夹不存在 或 文件夹内容是空的 -> 跳过步骤
```js
        {
          // 文件夹不存在 或 文件夹内容是空的 -> 跳过步骤
          // 确认提示
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm",
          name: "overwrite",
          message: () =>
            (targetDir === "."
              ? "Current directory"
              : `Target directory "${targetDir}"`) +
            ` is not empty. Remove existing files and continue?`,
        },
```
3. 处理上一步的确认值。
  - 如果用户没同意，抛出异常。同意了就继续
```js
        {
          // 处理上一步的确认值。如果用户没同意，抛出异常。同意了就继续
          type: (_, { overwrite } = {}) => {
            if (overwrite === false) {
              throw new Error(red("✖") + " Operation cancelled");
            }
            return null;
          },
          name: "overwriteChecker",
        },
```
4. 获取包名
  - 如果项目名可直接作为包名，跳过该步骤
```js
        {
          // 验证项目名称是否可为包名，是->跳过此步骤。否->让用户输入包名
          type: () => (isValidPackageName(getProjectName()) ? null : "text"),
          name: "packageName",
          message: reset("Package name:"),
          // 初始默认值为格式化后的项目名
          initial: () => toValidPackageName(getProjectName()),
          // 包名验证
          validate: (dir) =>
            isValidPackageName(dir) || "Invalid package.json name",
        },
```
5. 框架选择
  - 有模板输入，并且输入的模板在模板列中，跳过此步骤
```js
        {
          // 有模板输入，并且输入的模板在模板列中，跳过此步骤
          type: template && TEMPLATES.includes(template) ? null : "select",
          name: "framework",
          message:
            typeof template === "string" && !TEMPLATES.includes(template)
              ? reset(
                  `"${template}" isn't a valid template. Please choose from below: `
                )
              : reset("Select a framework:"),
          initial: 0,
          choices: FRAMEWORKS.map((framework) => {
            const frameworkColor = framework.color;
            return {
              title: frameworkColor(framework.name),
              value: framework,
            };
          }),
        },
```
关于FRAMEWORKS和TEMPLATES的配置
```js 
// 框架
const FRAMEWORKS = [
  {
    name: "vanilla",
    color: yellow, // kolorist的
    variants: [
      {
        name: "vanilla",
        display: "JavaScript",
        color: yellow,
      },
      {
        name: "vanilla-ts",
        display: "TypeScript",
        color: blue,
      },
    ],
  },
  {
    name: "vue",
    color: green,
    variants: [
      {
        name: "vue",
        display: "JavaScript",
        color: yellow,
      },
      {
        name: "vue-ts",
        display: "TypeScript",
        color: blue,
      },
    ],
  },
  ......
];
/**
 * 拼接上面的框架name字段为一个字符串数组
 * ['vanilla', 'vanilla-ts','vue', 'vue-ts',react',   'react-ts',preact',  'preact-ts',lit', 'lit-ts',svelte',  'svelte-ts']
 */
const TEMPLATES = FRAMEWORKS.map(
  (f) => (f.variants && f.variants.map((v) => v.name)) || [f.name]
).reduce((a, b) => a.concat(b), []);
```
6. 选择js or ts
  - 如果刚才选择的框架中存在variants，则进行该步骤的选择。
```js
        {
          type: (framework) =>
            framework && framework.variants ? 'select' : null,
          name: 'variant',
          message: reset('Select a variant:'),
          // @ts-ignore
          choices: (framework) =>
            framework.variants.map((variant) => {
              const variantColor = variant.color
              return {
                title: variantColor(variant.name),
                value: variant.name
              }
            })
        }
```
以上一套下来后，res中会有
```
✔ Project name: … vite-project
✔ Select a framework: › vue
✔ Select a variant: › vue-ts
{
  projectName: 'vite-project',
  framework: {
    name: 'vue',
    color: [Function (anonymous)],
    variants: [ [Object], [Object] ]
  },
  variant: 'vue-ts'
}
```
## 主函数 - 项目生成
获取prompts的结果
```js
const { framework, overwrite, packageName, variant } = result;
```
1. 创建项目目录
```js
  const root = path.join(cwd, targetDir);
  // console.log(root);// /Users/yomuki/My/Study/SourceCode/create-vite/yomuki-code/packages/create-vite/vite-project
  if (overwrite) {
    // 清除项目目录
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    // 项目目录不存在 则新建
    fs.mkdirSync(root, { recursive: true });
  }

/**
 * 清空目录函数
 * @param {string} dir
 */
function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}
```
2. 获取模板
```js
template = variant || framework || template;
// 模板目录
const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "..",
    `template-${template}`
);
// 读取模板目录内容
const files = fs.readdirSync(templateDir);
```
3. 将模板复制至项目目录
```js
// 循环写入，过滤package.json
for (const file of files.filter((f) => f !== 'package.json')) {
  write(file)
}
  // 文件写入函数
  const write = (file, content) => {
    // 获取目标路径
    const targetPath = renameFiles[file]
      ? path.join(root, renameFiles[file])
      : path.join(root, file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };
/**
 * 复制文件
 * @param {*} src
 * @param {*} dest
 */
function copy(src, dest) {
  const stat = fs.statSync(src);
  // console.log(stat);
  // 判断是否为目录
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    // 复制文件
    fs.copyFileSync(src, dest);
  }
}
/**
 * 复制目录
 * @param {string} srcDir
 * @param {string} destDir
 */
function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}
```
4. 创建项目的package包
```js
// 读取模板中的package
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );
  // 更改包名
  pkg.name = packageName || getProjectName();
  // 写入package文件
  write("package.json", JSON.stringify(pkg, null, 2));
```
5. 输出运行提示
```js
  // 获取包管理器和版本号
  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  // console.log(pkgInfo); // { name: 'pnpm', version: '6.33.1' }
  // 包管理器
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  console.log(`\nDone. Now run:\n`);
  // 当项目目录不在当前目录时 - 提示cd
  if (root !== cwd) {
    console.log(`  cd ${path.relative(cwd, root)}`);
  }
  // 根据不同的包管理器输出提示
  switch (pkgManager) {
    case "yarn":
      console.log("  yarn");
      console.log("  yarn dev");
      break;
    default:
      console.log(`  ${pkgManager} install`);
      console.log(`  ${pkgManager} run dev`);
      break;
  }
  console.log();

/**
 * 获取包管理器和版本号
 * @param {string | undefined} userAgent process.env.npm_config_user_agent
 * @returns object | undefined
 */
function pkgFromUserAgent(userAgent) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}
```
## 小结
create-vite的大致流程就是
1. 用户创建项目名
2. 通过用户的选择确认模板
3. 将模板复制至项目下
通过此次源码阅读，学废了
- prompts 的使用
- 如何在vite中添加自定义模板
- 如何自己整一套cli模板工具~告别一直手动clone模板（有空了再整这个）