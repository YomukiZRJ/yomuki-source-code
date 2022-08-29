<!--
 * @Desc: 
 * @Author: 曾茹菁
 * @Date: 2022-08-22 14:35:35
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-22 16:33:35
-->
# 第35期 | 为 vite 项目自动添加 eslint 和 prettier
- 本文参加了由[公众号@若川视野](https://lxchuan12.gitee.io/) 发起的每周源码共读活动，[点击了解详情一起参与](https://juejin.cn/post/7079706017579139102)。
- 这是源码共读的第35期，链接：[【若川视野 x 源码共读】第35期 | 为 vite 项目自动添加 eslint 和 prettier](https://juejin.cn/post/7113563466211786783)。
- [vite-pretty-lint](https://github.com/tzsk/vite-pretty-lint)
## 目标
...等会看完写
## 先瞅瞅他的包
- @babel/core 熟悉的伙伴
- [chalk](https://www.npmjs.com/package/chalk)  终端颜色
- [gradient-string](https://www.npmjs.com/package/gradient-string) 渐变字符串
- [Enquirer](https://www.npmjs.com/package/enquirer)  一个时尚好看的命令行提示
- [nanospinner](https://www.npmjs.com/package/nanospinner) 终端调试器
## 再瞅瞅源码 main.js
1. 定义文件全路径
```js
const projectDirectory = process.cwd(); // 项目路径
const eslintFile = path.join(projectDirectory, ".eslintrc.json"); // eslintrc文件路径
const prettierFile = path.join(projectDirectory, ".prettierrc.json"); // prettierrc文件路径
const eslintIgnoreFile = path.join(projectDirectory, ".eslintignore"); // eslintignore文件路径
```
2. 通过提示询问项目类型(vue23/js/ts)和包管理器类型(npm/pnpm/yarn)
```js
  let projectType, packageManager;
  try {
    const answers = await askForProjectType();
    projectType = answers.projectType;
    packageManager = answers.packageManager;
  } catch (error) {
    console.log(chalk.blue('\n👋 Goodbye!'));
    return;
  }
```
3. 异步载入项目类型的配置文件
- packages 需要安装的额外的包列
- eslintOverrides  eslint配置内容
```js
  const { packages, eslintOverrides } = await import(
    `./templates/${projectType}.js`
  );
```
4. 拼接配置信息 和 command
```js
  const packageList = [...commonPackages, ...packages];
  const eslintConfigOverrides = [...eslintConfig.overrides, ...eslintOverrides];
  const eslint = { ...eslintConfig, overrides: eslintConfigOverrides };

  const commandMap = {
    npm: `npm install --save-dev ${packageList.join(' ')}`,
    yarn: `yarn add --dev ${packageList.join(' ')}`,
    pnpm: `pnpm install --save-dev ${packageList.join(' ')}`,
  };
```
5. 修改vite配置文件
```js
const viteConfigFiles = ['vite.config.js', 'vite.config.ts'];
  const [viteFile] = viteConfigFiles
    .map((file) => path.join(projectDirectory, file))
    .filter((file) => fs.existsSync(file));

  if (!viteFile) {
    console.log(
      chalk.red(
        '\n🚨 No vite config file found. Please run this command in a Vite project.\n'
      )
    );
    return;
  }

  const viteConfig = viteEslint(fs.readFileSync(viteFile, 'utf8'));
```
6. 命令运行 安装依赖
```js
  const installCommand = commandMap[packageManager];

  if (!installCommand) {
    console.log(chalk.red('\n✖ Sorry, we only support npm、yarn and pnpm!'));
    return;
  }

  const spinner = createSpinner('Installing packages...').start();
  exec(`${commandMap[packageManager]}`, { cwd: projectDirectory }, (error) => {
    if (error) {
      spinner.error({
        text: chalk.bold.red('Failed to install packages!'),
        mark: '✖',
      });
      console.error(error);
      return;
    }
```
7. 配置文件写入
```js
fs.writeFileSync(eslintFile, JSON.stringify(eslint, null, 2));
    fs.writeFileSync(prettierFile, JSON.stringify(prettierConfig, null, 2));
    fs.writeFileSync(eslintIgnoreFile, eslintIgnore.join('\n'));
    fs.writeFileSync(viteFile, viteConfig);

    spinner.success({ text: chalk.bold.green('All done! 🎉'), mark: '✔' });
    console.log(
      chalk.bold.cyan('\n🔥 Reload your editor to activate the settings!')
    );
```
## 小总结
- 学废了，这就把它搬运到我的cli上去 嘿嘿
