/**
 * pages/recipe/list/index.js —— 食谱推荐页
 *
 * 匹配逻辑（文档 2.3「基于菜篮子内现有食材匹配推荐」）：
 *   1. 命中菜篮子食材数量越多，排序越靠前
 *   2. 所需食材全部命中时标记「可直接做」
 *   3. 横幅展示当前可匹配的食谱数量
 *   算法集中在 utils/domain.js#matchRecipes，本页只负责展示与筛选。
 *
 * ⚠️「优先使用临期食材」属规则性逻辑，待人工确认后补充排序权重。
 */
const { RECIPE_FILTERS } = require("../../../data/knowledge");
const { matchRecipes, countCookable, thumbFor } = require("../../../utils/domain");
const { toast } = require("../../../utils/router");
const basket = require("../../../utils/basket");

Page({
  data: {
    filters: RECIPE_FILTERS,
    activeFilter: "all",
    recipes: [],
    /** 菜篮子食材速览 */
    ownedList: [],
    /** 可匹配食谱数量 */
    cookableCount: 0,
    /** 「换一批」的轮换起点 */
    rotate: 0,
  },

  onShow() {
    this.refresh();
  },

  onPullDownRefresh() {
    this.refresh();
    wx.stopPullDownRefresh();
  },

  refresh() {
    const items = basket.list();
    const all = matchRecipes(items, "", this.data.activeFilter);
    // 「换一批」：整体轮换，保证每次顺序不同但匹配数仍优先
    const rotate = this.data.rotate % Math.max(all.length, 1);
    const recipes = all.slice(rotate).concat(all.slice(0, rotate)).sort((a, b) => b.matchedCount - a.matchedCount);

    const ownedList = [];
    const seen = {};
    items.forEach((item) => {
      if (!item.ingredientId || seen[item.ingredientId]) return;
      const thumb = thumbFor(item.ingredientId);
      if (!thumb) return;
      seen[item.ingredientId] = true;
      ownedList.push({ id: item.id, ingredientId: item.ingredientId, name: item.name, thumb });
    });

    this.setData({
      recipes,
      ownedList,
      cookableCount: countCookable(items),
    });
  },

  onSwitchFilter(e) {
    this.setData({ activeFilter: e.currentTarget.dataset.key, rotate: 0 }, () => this.refresh());
  },

  /** 点击菜篮子食材：查看选购技巧 */
  onTapOwned(e) {
    wx.navigateTo({ url: `/pages/fresh/index?id=${e.currentTarget.dataset.id}` });
  },

  onOpenRecipe(e) {
    wx.navigateTo({ url: `/pages/recipe/detail/index?id=${e.currentTarget.dataset.id}` });
  },

  onTapBasket() {
    wx.switchTab({ url: "/pages/basket/index" });
  },

  /** 换一批：重新洗牌推荐顺序 */
  onRefresh() {
    this.setData({ rotate: this.data.rotate + 1 }, () => this.refresh());
    toast("已换一批推荐");
  },
});