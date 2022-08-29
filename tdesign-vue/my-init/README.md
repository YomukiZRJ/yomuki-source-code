<!--
 * @Desc: 
 * @Author: 曾茹菁
 * @Date: 2022-08-29 11:02:19
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-29 17:38:53
-->
# tdesign-vue 初始化组件
- 本文参加了由[公众号@若川视野](https://lxchuan12.gitee.io/) 发起的每周源码共读活动，[点击了解详情一起参与](https://juejin.cn/post/7079706017579139102)。
- 这是源码共读的第34期，链接：[第34期 | tdesign-vue 初始化组件](https://www.yuque.com/ruochuan12/notice/p34)。
## 解读
### 主函数init
```js
function init() {
  // 通过node执行命令行参数获取 组件名称，和删除标志
  const [component, isDeleted] = process.argv.slice(2);
  // 组件名称不存在就退出
  if (!component) {
    console.error('[组件名]必填 - Please enter new component name');
    process.exit(1);
  }
  // 获取组件的安装文件
  const indexPath = path.resolve(cwdPath, 'src/index.ts');
  // 获取该组件的路径和模板配置。（组件源码，说明文档，demo，单元测试，e2e测试）
  const toBeCreatedFiles = config.getToBeCreatedFiles(component);
  if (isDeleted === 'del') {
    // 删除组件
    deleteComponent(toBeCreatedFiles, component);
    deleteComponentFromIndex(component, indexPath);
  } else {
    // 添加组件
    addComponent(toBeCreatedFiles, component);
    insertComponentToIndex(component, indexPath);
  }
}

init();
```
#### getToBeCreatedFiles
- 获取某组件的路径和模板配置。（组件源码，说明文档，demo，单元测试，e2e测试）
```js
function getToBeCreatedFiles(component) {
  return {
    [`src/${component}`]: {
      desc: 'component source code',
      files: [
        {
          file: 'index.ts',
          template: 'index.ts.tpl',
        },
        {
          file: `${component}.tsx`,
          template: 'component.tsx.tpl',
        },
      ],
    },
    [`examples/${component}`]: {
      desc: 'component API',
      files: [
        {
          file: `${component}.md`,
          template: 'component.md.tpl',
        },
      ],
    },
    [`examples/${component}/demos`]: {
      desc: 'component demo code',
      files: [
        {
          file: 'base.vue',
          template: 'base.demo.tpl',
        },
      ],
    },
    [`test/unit/${component}`]: {
      desc: 'unit test',
      files: [
        {
          file: 'index.test.js',
          template: 'index.test.tpl',
        },
        {
          file: 'demo.test.js',
          template: 'demo.test.tpl',
        },
      ],
    },
    [`test/e2e/${component}`]: {
      desc: 'e2e test',
      files: [`${component}.spec.js`],
    },
  };
}
```
### addComponent 添加组件文件
```js
function addComponent(toBeCreatedFiles, component) {
  // At first, we need to create directories for components.
  Object.keys(toBeCreatedFiles).forEach((dir) => {
    // 创建目录
    const _d = path.resolve(cwdPath, dir);
    fs.mkdir(_d, { recursive: true }, (err) => {
      if (err) {
        utils.log(err, 'error');
        return;
      }
      console.log(`${_d} directory has been created successfully！`);
      // Then, we create files for components.
      const contents = toBeCreatedFiles[dir];
      contents.files.forEach((item) => {
        if (typeof item === 'object') {
          // 有模板 通过模板写入
          if (item.template) {
            outputFileWithTemplate(item, component, contents.desc, _d);
          }
        } else {
          // 没模板的 写入desc
          const _f = path.resolve(_d, item);
          createFile(_f, '', contents.desc);
        }
      });
    });
  });
}
function outputFileWithTemplate(item, component, desc, _d) {
  // 模板路径
  const tplPath = path.resolve(__dirname, `./tpl/${item.template}`);
  // 读取模板文件内容
  let data = fs.readFileSync(tplPath).toString();
  // lodash的模板注入
  const compiled = _.template(data);
  data = compiled({
    component,
    upperComponent: getFirstLetterUpper(component),
  });
  // 模板写入路径
  const _f = path.resolve(_d, item.file);
  // 写入模板
  createFile(_f, data, desc);
}
```
### 将组件插入至注册index
```js
function insertComponentToIndex(component, indexPath) {
  // 首字母大写
  const upper = getFirstLetterUpper(component);
  // last import line pattern
  const importPattern = /import.*?;(?=\n\n)/;
  // components pattern
  const cmpPattern = /(?<=const components = {\n)[.|\s|\S]*?(?=};\n)/g;
  const importPath = getImportStr(upper, component);
  const desc = '> insert component into index.ts';
  let data = fs.readFileSync(indexPath).toString();
  if (data.match(new RegExp(importPath))) {
    utils.log(`there is already ${component} in /src/index.ts`, 'notice');
    return;
  }
  // insert component at last import and component lines.
  data = data.replace(importPattern, (a) => `${a}\n${importPath}`).replace(cmpPattern, (a) => `${a}  ${upper},\n`);
  fs.writeFile(indexPath, data, (err) => {
    if (err) {
      utils.log(err, 'error');
    } else {
      utils.log(`${desc}\n${component} has been inserted into /src/index.ts`, 'success');
    }
  });
}
```
### deleteComponent 删除组件文件
```js
function deleteComponent(toBeCreatedFiles, component) {
  // 获取单元测试快照文件
  const snapShotFiles = getSnapshotFiles(component);
  const files = Object.assign(toBeCreatedFiles, snapShotFiles);
  // 执行文件删除操作
  Object.keys(files).forEach((dir) => {
    const item = files[dir];
    // 配置的删除文件存在的话
    if (item.deleteFiles && item.deleteFiles.length) {
      item.deleteFiles.forEach((f) => {
        // 检测文件是否存在 并且  删除
        fs.existsSync(f) && fs.unlinkSync(f);
      });
    } else {
    // 配置的删除文件不存在的话 递归删除该目录下的文件夹
    // node >= 14.14的话 应该可以用fs.rmSync
      utils.deleteFolderRecursive(dir);
    }
  });
  // 打印删除success
  utils.log('All radio files have been removed.', 'success');
}
// 获取单元测试快照文件
function getSnapshotFiles(component) {
  return {
    [`test/unit/${component}/__snapshots__/`]: {
      desc: 'snapshot test',
      files: ['index.test.js.snap', 'demo.test.js.snap'],
    },
  };
}
// 递归删除文件夹
function deleteFolderRecursive(path) {
    // 目录是否存在
  if (fs.existsSync(path)) {
    // 读取目录下的内容，循环目录中的文件名
    fs.readdirSync(path).forEach((file) => {
        // 拼接文件路径
      const current = `${path}/${file}`;
      // 当前文件是否为目录
      if (fs.statSync(current).isDirectory()) {
        // 递归
        deleteFolderRecursive(current);
      } else {
        // 不为目录直接删除文件
        fs.unlinkSync(current);
      }
    });
    // 删除目录（目录必须为空）
    fs.rmdirSync(path);
  }
}
```
### 删除组件安装信息
```js
function deleteComponentFromIndex(component, indexPath) {
  // 首字母大写 button => Button
  const upper = getFirstLetterUpper(component);
  // 拼接引入语句 import Button from "./button";
  const importStr = `${getImportStr(upper, component)}\n`;
  // 读取安装文件的内容
  let data = fs.readFileSync(indexPath).toString();
  // 将安装文件中的相关import和组件信息删除
  data = data.replace(new RegExp(importStr), () => '').replace(new RegExp(`  ${upper},\n`), '');
  // 写入文件
  fs.writeFile(indexPath, data, (err) => {
    if (err) {
      utils.log(err, 'error');
    } else {
      utils.log(`${component} has been removed from /src/index.ts`, 'success');
    }
  });
}
```