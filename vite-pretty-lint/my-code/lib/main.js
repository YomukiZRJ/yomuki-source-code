import path from "path";
import chalk from "chalk";
import gradient from "gradient-string";
const projectDirectory = process.cwd(); // 项目路径
const eslintFile = path.join(projectDirectory, ".eslintrc.json"); // eslintrc文件路径
const prettierFile = path.join(projectDirectory, ".prettierrc.json"); // prettierrc文件路径
const eslintIgnoreFile = path.join(projectDirectory, ".eslintignore"); // eslintignore文件路径
async function run() {
  console.log(chalk.bold(gradient.morning("Hi!")));
}
run().catch((e) => {
  console.error(e);
});
