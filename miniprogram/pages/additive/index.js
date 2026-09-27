/**
 * pages/additive/index.js —— 添加剂详情页
 * 与 components/additiveSheet 使用同一份知识库内容，供列表类页面跳转使用。
 *
 * ⚠️ 安全性评估结论文案来自 RISK_LEVELS，属核心知识判定，上线前需人工审核。
 */
const { getAdditive, decorateAdditive } = require("../../utils/domain");
const knowledge = require("../../data/knowledge");

Page({
  data: {
    additive: null,
    standardText: "",
    riskTitle: "",
    riskColor: "#22A552",
    riskBg: "#E7F7EB",
    riskShield: "/images/icon-shield-amber.png",
    riskAssessment: "",
  },

  onLoad(options) {
    const additive = decorateAdditive(getAdditive((options && options.id) || ""));
    if (!additive) return;
    const level = knowledge.RISK_LEVELS[additive.risk] || knowledge.RISK_LEVELS.unknown;
    this.setData({
      additive,
      standardText: additive.standardText || "-",
      riskTitle: level.title,
      riskColor: level.color,
      riskBg: level.bg,
      riskShield: level.shield || "/images/icon-shield-amber.png",
      riskAssessment: level.assessment,
    });
    wx.setNavigationBarTitle({ title: additive.name });
  },
});