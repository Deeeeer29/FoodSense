/**
 * components/additiveSheet/index.js —— 添加剂详情弹窗
 *
 * 内容全部来自自建知识库（data/knowledge.js），组件本身不做任何判定，
 * 保证「知识可溯源、AI 不生成风险等级」的架构约定。
 *
 * ⚠️ 安全性评估结论文案来自 RISK_LEVELS，属于核心知识判定，
 *    当前为界面演示文案，上线前必须人工审核定稿。
 */
const { DISCLAIMER } = require("../../utils/constants");
const knowledge = require("../../data/knowledge");

Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    /** 是否展示 */
    show: {
      type: Boolean,
      value: false,
    },
    /** 添加剂对象（含 decorateAdditive 补全后的字段） */
    additive: {
      type: Object,
      value: null,
    },
  },

  data: {
    standardText: "",
    riskTitle: "",
    riskColor: "#22A552",
    riskBg: "#E7F7EB",
    riskShield: "/images/icon-shield-amber.png",
    riskAssessment: "",
    tip: DISCLAIMER.short,
  },

  observers: {
    additive(value) {
      if (!value) return;
      const level = knowledge.RISK_LEVELS[value.risk] || knowledge.RISK_LEVELS.unknown;
      this.setData({
        standardText: value.standardText || "-",
        riskTitle: level.title,
        riskColor: level.color,
        riskBg: level.bg,
        riskShield: level.shield || "/images/icon-shield-amber.png",
        riskAssessment: level.assessment,
      });
    },
  },

  methods: {
    onClose() {
      this.triggerEvent("close");
    },
    /** 阻止弹窗内部点击冒泡到遮罩 */
    onStop() {},
  },
});