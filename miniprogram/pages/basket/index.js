/**
 * pages/basket/index.js —— 菜篮子管理页
 *
 * 能力范围（文档 2.3）：
 *   食材清单管理、按品类分类展示、依据品类 + 购买日期自动计算剩余参考保质期、临期高亮。
 *
 * ⚠️ 剩余保质期计算逻辑见 utils/domain.js#calcRemaining，
 *    当前为骨架实现（取常温参考区间下限），需人工确认后固化为正式规则。
 * 数据当前落在本地缓存（utils/basket.js），阶段 2 后续切换为云数据库 user_basket。
 */
const { INGREDIENT_CATEGORIES } = require("../../data/knowledge");
const { decorateBasketItem, formatDate } = require("../../utils/domain");
const { toastPending, toast } = require("../../utils/router");
const basket = require("../../utils/basket");

Page({
  data: {
    categories: [],
    activeCategory: "all",
    items: [],
  },

  onLoad() {
    this.setData({
      categories: [{ key: "all", label: "全部" }].concat(
        Object.keys(INGREDIENT_CATEGORIES).map((key) => ({ key, label: INGREDIENT_CATEGORIES[key] }))
      ),
    });
  },

  /** 每次回到页面都重新读取，保证识别页加入后立即可见 */
  onShow() {
    this.refresh();
  },

  refresh() {
    const all = basket.list().map((item) =>
      decorateBasketItem(
        Object.assign({}, item, {
          categoryLabel: INGREDIENT_CATEGORIES[item.category] || "其他",
        })
      )
    );
    const { activeCategory } = this.data;
    const items = activeCategory === "all" ? all : all.filter((item) => item.category === activeCategory);
    this.setData({ items });
    const app = getApp();
    if (app) app.globalData.basketCount = all.length;
  },

  onSwitchCategory(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.key }, () => this.refresh());
  },

  /** 点击食材行：查看选购技巧 / 删除 */
  onOpenItem(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.items.filter((row) => row.id === id)[0];
    if (!item) return;
    const isPackaged = item.category === "packaged";
    wx.showActionSheet({
      itemList: [isPackaged ? "查看配料解读" : "查看选购技巧", "删除该食材"],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.navigateTo({
            url: isPackaged ? "/pages/analysis/index" : `/pages/fresh/index?id=${item.ingredientId}`,
          });
        }
        if (res.tapIndex === 1) this.removeItem(item);
      },
      fail: () => {},
    });
  },

  removeItem(item) {
    wx.showModal({
      title: "删除食材",
      content: `确定把「${item.name}」从菜篮子移除吗？`,
      success: (res) => {
        if (!res.confirm) return;
        basket.remove(item.id);
        this.refresh();
        toast("已移除");
      },
    });
  },

  /** 添加入口：拍照识别 / 手动录入两种方式 */
  onAddIngredient() {
    wx.showActionSheet({
      itemList: ["拍生鲜果蔬（识别后加入）", "拍包装食品（识读配料）", "手动录入食材"],
      success: (res) => {
        if (res.tapIndex === 0) wx.navigateTo({ url: "/pages/scan/index?mode=fresh" });
        if (res.tapIndex === 1) wx.navigateTo({ url: "/pages/scan/index?mode=pack" });
        if (res.tapIndex === 2) this.manualAdd();
      },
      fail: () => {},
    });
  },

  /** 手动录入兜底（识别失败时的兜底路径） */
  manualAdd() {
    wx.showModal({
      title: "手动录入食材",
      editable: true,
      placeholderText: "请输入食材名称，如：番茄",
      success: (res) => {
        if (!res.confirm) return;
        const name = (res.content || "").trim();
        if (!name) {
          toastPending("录入");
          return;
        }
        basket.add({
          ingredientId: "manual-" + Date.now(),
          name,
          category: "vegetable",
          image: "/images/basket-tomato.jpg",
          buyDate: formatDate(new Date()),
          quantity: "1 份",
          shelfLife: { normal: "-", cold: "-" },
        });
        this.refresh();
        toast("已加入菜篮子");
      },
    });
  },
});