/*
 * @Desc:
 * @Author: 曾茹菁
 * @Date: 2022-08-14 09:28:51
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-15 14:55:20
 */
/**
 * 处理文件的读写、复制、删除、重命名等操作。
 */
import fs from "node:fs";
/**
 * 处理路径
 */
import path from "node:path";
/**
 * 将文件 URL 字符串或 URL 对象转为路径。解码百分比编码的字符以及确保跨平台有效的绝对路径字符串。
 */
import { fileURLToPath } from "node:url";
/**
 * 命令行参数解析
 */
import minimist from "minimist";
/**
 * 美观的cli交互页
 */
import prompts from "prompts";
/**
 * 颜色库
 */
import {
  blue,
  cyan,
  green,
  lightRed,
  magenta,
  red,
  reset,
  yellow,
} from "kolorist";

/**
 * 通过定义参数，避免自动转换为项目名称的编号
 * 将与选项（_）不关联的项解析为字符串
 *  { _: [] }
 */
const argv = minimist(process.argv.slice(2), { string: ["_"] });
/**
 * 当前node执行目录
 */
const cwd = process.cwd();
/**
 * 框架配置
 */
const FRAMEWORKS = [
  {
    name: "vanilla",
    color: yellow,
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
  {
    name: "react",
    color: cyan,
    variants: [
      {
        name: "react",
        display: "JavaScript",
        color: yellow,
      },
      {
        name: "react-ts",
        display: "TypeScript",
        color: blue,
      },
    ],
  },
  {
    name: "preact",
    color: magenta,
    variants: [
      {
        name: "preact",
        display: "JavaScript",
        color: yellow,
      },
      {
        name: "preact-ts",
        display: "TypeScript",
        color: blue,
      },
    ],
  },
  {
    name: "lit",
    color: lightRed,
    variants: [
      {
        name: "lit",
        display: "JavaScript",
        color: yellow,
      },
      {
        name: "lit-ts",
        display: "TypeScript",
        color: blue,
      },
    ],
  },
  {
    name: "svelte",
    color: red,
    variants: [
      {
        name: "svelte",
        display: "JavaScript",
        color: yellow,
      },
      {
        name: "svelte-ts",
        display: "TypeScript",
        color: blue,
      },
    ],
  },
];
/**
 * 拼接上面的框架name字段为一个字符串数组
 * ['vanilla', 'vanilla-ts','vue', 'vue-ts',react',   'react-ts',preact',  'preact-ts',lit', 'lit-ts',svelte',  'svelte-ts']
 */
const TEMPLATES = FRAMEWORKS.map(
  (f) => (f.variants && f.variants.map((v) => v.name)) || [f.name]
).reduce((a, b) => a.concat(b), []);
/**
 * 需要在项目中重命名的文件
 * 有些系统.开头的文件读不到
 */
const renameFiles = {
  _gitignore: ".gitignore",
};

/**
 *
 * @returns 主函数
 */
async function init() {
  // 目标目录 -- 创建时的第一个参数
  let targetDir = formatTargetDir(argv._[0]);
  // 命令行参数 --template 或者 -t
  let template = argv.template || argv.t;
  // 默认名
  const defaultTargetDir = "vite-project";
  // 获取项目名称
  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;

  let result = {};

  try {
    result = await prompts(
      [
        {
          // 创建时带了项目名 -> 跳过步骤
          type: targetDir ? null : "text",
          name: "projectName",
          message: reset("Project name:"),
          initial: defaultTargetDir,
          onState: (state) => {
            // 格式化项目名
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
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
        // 框架选择
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
        {
          type: (framework) =>
            framework && framework.variants ? "select" : null,
          name: "variant",
          message: reset("Select a variant:"),
          // @ts-ignore
          choices: (framework) =>
            framework.variants.map((variant) => {
              const variantColor = variant.color;
              return {
                title: variantColor(variant.name),
                value: variant.name,
              };
            }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled");
        },
      }
    );
  } catch (cancelled) {
    console.log(cancelled.message);
    return;
  }
  console.log(result);
  // user choice associated with prompts
  const { framework, overwrite, packageName, variant } = result;
  const root = path.join(cwd, targetDir);
  // console.log(root);// /Users/yomuki/My/Study/SourceCode/create-vite/yomuki-code/packages/create-vite/vite-project
  if (overwrite) {
    // 清除项目目录
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    // 项目目录不存在 则新建
    fs.mkdirSync(root, { recursive: true });
  }
  console.log(`\nScaffolding project in ${root}...`);
  template = variant || framework || template;
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "..",
    `template-${template}`
  );
  // console.log(templateDir); // /Users/yomuki/My/Study/SourceCode/create-vite/yomuki-code/packages/create-vite/template-vanilla
  // 文件写入函数
  const write = (file, content) => {
    console.log(file, content);
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
  // 读取模板目录内容
  const files = fs.readdirSync(templateDir);
  console.log(files);
  // 循环写入，过滤package.json
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }
  // 读取模板中的package
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );
  // 更改包名
  pkg.name = packageName || getProjectName();
  // 写入package文件
  write("package.json", JSON.stringify(pkg, null, 2));
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
}

/**
 * 格式化目标目录 替换反斜杠 / 为空字符串
 * @param {string | undefined} targetDir
 */
function formatTargetDir(targetDir) {
  return targetDir?.trim().replace(/\/+$/g, "");
}
/**
 * 验证包名
 * @param {string} projectName
 */
function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  );
}
/**
 * 项目名格式化为包名
 * @param {string} projectName
 */
function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z0-9-~]+/g, "-");
}
/**
 * @param {string} path
 */
function isEmpty(path) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}
/**
 * @param {string} dir
 */
function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}
/**
 * 复制文件
 * @param {*} src
 * @param {*} dest
 */
function copy(src, dest) {
  const stat = fs.statSync(src);
  console.log(stat);
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
init().catch((e) => {
  console.error(e);
});
