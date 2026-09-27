/**
 * pages/fresh/index.js —— 生鲜果蔬识别结果页（页面 04）
 *
 * 架构约定（文档 3.4）：多模态模型只输出「食材名称」，不输出新鲜度与食用建议；
 * 选购技巧、参考保质期全部来自自建知识库（fresh_ingredient 表）。
 * 识别误差兜底：提供「重新选择」入口，允许手动从食材库中修正品类。
 */
const { getIngredient, formatDate } = require("../../utils/domain");
const { toast } = require("../../utils/router");
const basket = require("../../utils/basket");

Page({
  data: {
    ingredient: null,
    confidence: 98,
    tabs: [
      { key: "tips", label: "选购技巧" },
      { key: "storage", label: "保鲜时长" },
      { key: "nutrition", label: "营养价值" },
    ],
    activeTab: "tips",
  },

  /** ingredientId 由上一个页面传入，缺省用番茄演示 */
  onLoad(options) {
    const id = (options && options.id) || "tomato";
    const ingredient = getIngredient(id) || getIngredient("tomato");
    this.setData({ ingredient });
    wx.setNavigationBarTitle({ title: `${ingredient.name} · 选购指南` });
  },

  onSwitchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key });
  },

  /** 识别错误兜底：从食材库手动修正 */
  onReselect() {
    const ids = ["tomato", "lettuce", "egg"];
    const names = ids.map((id) => (getIngredient(id) || {}).name);
    wx.showActionSheet({
      itemList: names,
      success: (res) => {
        const picked = getIngredient(ids[res.tapIndex]);
        if (picked) {
          this.setData({ ingredient: picked });
          wx.setNavigationBarTitle({ title: `${picked.name} · 选购指南` });
        }
      },
      fail: () => {},
    });
  },

  /** 选择购买日期后加入菜篮子 */
  onAddToBasket() {
    const ingredient = this.data.ingredient;
    basket.add({
      ingredientId: ingredient.id,
      name: ingredient.name,
      category: ingredient.category,
      image: ingredient.image,
      buyDate: formatDate(new Date()),
      quantity: "1 份",
      shelfLife: ingredient.shelfLife,
    });
    toast("已加入菜篮子");
  },
});