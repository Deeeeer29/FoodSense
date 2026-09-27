/**
 * pages/discover/index.js —— 发现页
 *
 * 承载内容型能力入口：生鲜选购技巧、添加剂科普、智能食谱、国家标准。
 * 其中「智能食谱」对应页面 06，「参考标准」对应标准说明页。
 */
const { INGREDIENTS } = require("../../data/knowledge");
const { toastPending } = require("../../utils/router");

Page({
  data: {
    blocks: [
      { key: "fresh", badge: "果蔬", title: "生鲜选购技巧", desc: "看外观、摸手感、闻气味，挑到新鲜食材" },
      { key: "additive", badge: "配料", title: "添加剂科普", desc: "常见添加剂的作用、风险分级与国标来源" },
      { key: "recipe", badge: "食谱", title: "智能食谱推荐", desc: "按菜篮子现有食材推荐能做的家常菜" },
      { key: "standard", badge: "标准", title: "参考的国家标准", desc: "本小程序引用的国标编号与适用范围" },
    ],
    ingredients: INGREDIENTS,
  },

  onTapBlock(e) {
    const key = e.currentTarget.dataset.key;
    if (key === "recipe") {
      wx.navigateTo({ url: "/pages/recipe/list/index" });
      return;
    }
    if (key === "standard") {
      wx.navigateTo({ url: "/pages/standard/index" });
      return;
    }
    if (key === "fresh") {
      wx.navigateTo({ url: "/pages/fresh/index?id=tomato" });
      return;
    }
    if (key === "additive") {
      wx.navigateTo({ url: "/pages/additive/index?id=tbhq" });
      return;
    }
    toastPending("该内容");
  },

  onTapIngredient(e) {
    wx.navigateTo({ url: `/pages/fresh/index?id=${e.currentTarget.dataset.id}` });
  },

  onTapIngredientMore() {
    toastPending("食材库");
  },
});