/**
 * pages/index/index.js —— 首页
 *
 * 首页只做「入口分发」，不承载任何识别/判定逻辑：
 *   1. 两大识别入口：拍包装食品（OCR 配料解读）、拍生鲜果蔬（识别 + 选购技巧）
 *   2. 快捷入口：我的菜篮子 / 今日推荐 / 使用指南 / 关于我们
 *   3. 统一免责声明（由 notice-bar 组件输出）
 *
 * 路由集中登记在 ROUTES，页面未就绪时统一走 toastPending 提示，避免死链。
 */
const { QUICK_ENTRIES } = require("../../utils/constants");
const { navigate, toastPending } = require("../../utils/router");

/** 功能入口路由表：新增页面只需在这里补一行 */
const ROUTES = {
  scanPack: "/pages/scan/index?mode=pack",
  scanFresh: "/pages/scan/index?mode=fresh",
  recommend: "/pages/recipe/list/index",
  guide: null,
};

Page({
  data: {
    quickEntries: QUICK_ENTRIES,
    basketCount: 0,
  },

  onShow() {
    this.refreshBasketCount();
  },

  /** 菜篮子角标：读取本地数据层，阶段 2 后续替换为云端查询 */
  refreshBasketCount() {
    const basket = require("../../utils/basket");
    const count = basket.count();
    const app = getApp();
    if (app) app.globalData.basketCount = count;
    this.setData({ basketCount: count });
  },

  /** 拍包装食品 */
  onTapScanPack() {
    navigate(ROUTES.scanPack);
  },

  /** 拍生鲜果蔬 */
  onTapScanFresh() {
    navigate(ROUTES.scanFresh);
  },

  /** 快捷入口 */
  onTapQuickEntry(e) {
    const key = e.currentTarget.dataset.key;
    const entry = QUICK_ENTRIES.filter((item) => item.key === key)[0];
    if (!entry) return;
    if (entry.route) {
      navigate(entry.route);
      return;
    }
    if (ROUTES[key]) {
      navigate(ROUTES[key]);
      return;
    }
    this.go({ name: entry.label, route: null });
  },

  /**
   * 统一跳转：页面已就绪则跳转，未就绪给出友好提示
   * @param {{name: string, route: string|null}} target
   */
  go(target) {
    if (target && target.route) {
      navigate(target.route);
      return;
    }
    toastPending((target && target.name) || "该");
  },
});