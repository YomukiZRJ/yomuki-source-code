/*
 * @Desc:
 * @Author: 曾茹菁
 * @Date: 2022-08-15 09:29:35
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-08-15 13:06:05
 */
import prompts from "prompts";

// const questions1 = [
//   {
//     type: "number",
//     name: "value",
//     message: "How old are you?",
//   },
//   {
//     type: "text",
//     name: "value",
//     message: "How old are you?",
//   },
// ];
// const questions2 = [
//   {
//     name: "value",
//     message: "这次没有设置type",
//   },
//   {
//     type: "null",
//     name: "value",
//     message: "这次设置null",
//   },
//   {
//     type: "youshuaigema",
//     name: "value",
//     message: "这次设置个错误的类型",
//   },
// ];
// const questions = [
//   {
//     type: "number",
//     name: "age",
//     message: "请输入年龄",
//   },
//   {
//     type: "text",
//     name: "agemsg",
//     message: (prev, values, prompt) => {
//       console.log(prev, values, prompt);
//       return "hi";
//     },
//   },
// ];
// const questions = [
//   {
//     type: "number",
//     name: "age",
//     message: "请输入年龄",
//   },
//   {
//     type: (prev) => (prev < 18 ? "text" : null),
//     name: "agemsg",
//     message: "天哪，你未成年？我不信",
//   },
// ];
// const questions = [
//   {
//     type: "number",
//     name: "age",
//     message: "请输入年龄",
//     onRender(kleur) {
//       //   console.log(this); // NumberPrompt
//       const { bold, red, underline } = kleur;
//       this.msg = red().underline().bold("Enter a number");
//     },
//   },
// ];
// const questions = [
//   {
//     type: "number",
//     name: "age",
//     message: "请输入年龄",
//     onState: (state) => {
//       //   console.log(state);
//     },
//   },
// ];
// const questions = [
//   {
//     type: "confirm",
//     name: "isLove",
//     message: "弥央是不是我老婆？",
//     initial: true,
//   },
// ];
// const questions = [
//   {
//     type: "toggle",
//     name: "isLove",
//     message: "弥央是不是我老婆？",
//     initial: true,
//     active: "当然是啦！",
//     inactive: "做梦呢你！",
//   },
// ];
// const questions = [
//   {
//     type: "list",
//     name: "dreams",
//     message: "请说出你的梦想！",
//     separator: ",",
//   },
// ];
// const questions = [
//   {
//     type: "select",
//     name: "haopengyou",
//     message: "请选择你的伙伴！",
//     choices: [
//       { title: "弥央", description: "这是一段对弥央的说明", value: "miyo" },
//       { title: "诺亚", value: "ny", disabled: true },
//       { title: "艾拉法拉", value: "alfal" },
//     ],
//     initial: 1,
//   },
// ];
const questions = [
  {
    type: "multiselect",
    name: "haopengyou",
    message: "请选择你的伙伴！",
    choices: [
      { title: "弥央", description: "这是一段对弥央的说明", value: "miyo" },
      { title: "诺亚", value: "ny", disabled: true },
      { title: "艾拉法拉", value: "alfal" },
    ],
    max: 2,
    hint: "- Space to select. Return to submit",
  },
];
async function init() {
  const res = await prompts(questions, {
    onCancel: (prompt, answers) => {
      console.log(prompt, answers);
    },
  });
  console.log(res);
}

init().catch((err) => {
  console.error(err);
});
