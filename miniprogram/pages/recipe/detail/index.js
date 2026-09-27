/**
 * pages/recipe/detail/index.js —— 食谱详情页（页面 07）
 *
 * 菜谱做法、步骤、小贴士均来自自建菜谱库（recipe 表），
 * 大模型只允许对文案做通俗化润色（文档 3.4），不得自行生成步骤。
 */
const { getRecipe, getIngredient } = require("../../../utils/domain");
const { toast } = require("../../../utils/router");
const basket = require("../../../utils/basket");

Page({
  data: {
    recipe: null,
    ingredientRows: [],
    matchedCount: 0,
    fav: false,
  },

  onLoad(options) {
    const id = (options && options.id) || "tomato-egg";
    const recipe = getRecipe(id) || getRecipe("tomato-egg");
    this.setData({ recipe });
    wx.setNavigationBarTitle({ title: recipe.name });
    this.markOwned(recipe);
  },

  /** 标记哪些食材已在菜篮子中 */
  markOwned(recipe) {
    const owned = {};
    basket.list().forEach((item) => {
      if (item.ingredientId) owned[item.ingredientId] = true;
    });
    const rows = (recipe.ingredients || []).map((ing) => {
      const meta = getIngredient(ing.id);
      return {
        name: ing.name,
        amount: ing.amount,
        owned: !!owned[ing.id],
        image: (meta && meta.image) || "/images/icons/q-basket.png",
      };
    });
    this.setData({
      ingredientRows: rows,
      matchedCount: rows.filter((row) => row.owned).length,
    });
  },

  onToggleFav() {
    this.setData({ fav: !this.data.fav });
    toast(this.data.fav ? "已收藏" : "已取消收藏");
  },
});