/**
 * pages/standard/index.js —— 参考标准说明页
 *
 * 合规要求（文档 6.1）：所有引用的国家标准必须真实可查并标注标准号。
 * 标准清单来自 knowledge.js 的 standard 集合，上线前需逐条核对标准号与名称。
 */
const { STANDARDS } = require("../../data/knowledge");

Page({
  data: {
    standards: STANDARDS,
  },
});