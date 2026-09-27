/**
 * notice-bar —— 统一免责声明条
 *
 * 合规要求（见《项目内部开发说明书》6.1）：
 *  小程序内必须展示统一免责声明，且不得出现绝对性、医疗相关表述。
 *  因此该组件作为全站唯一文案出口，所有结果页复用，不再各自复制文案。
 *
 * 用法：
 *  <notice-bar />                      // 默认：浅色卡片样式，展示简短提示
 *  <notice-bar mode="block" />         // 块状样式，展示完整声明
 *  <notice-bar mode="inline" text="自定义文案" />
 */
const { DISCLAIMER } = require("../../utils/constants");

Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    /** 展示形态：card（默认，浅色小卡片） / block（完整声明块） / inline（结果页顶部提示） */
    mode: {
      type: String,
      value: "card",
    },
    /** 自定义文案，不传则使用统一免责声明 */
    text: {
      type: String,
      value: "",
    },
    /** 是否展示左侧信息图标 */
    showIcon: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    content: DISCLAIMER.short,
  },

  observers: {
    "mode, text"() {
      this.refreshContent();
    },
  },

  lifetimes: {
    attached() {
      this.refreshContent();
    },
  },

  methods: {
    refreshContent() {
      const { mode, text } = this.data;
      let content = text;
      if (!content) {
        content = mode === "block" ? DISCLAIMER.full : DISCLAIMER.short;
      }
      this.setData({ content });
    },
  },
});