/**
 * router.js —— 页面跳转与轻提示封装
 *
 * 目的：页面里不散落 wx.navigateTo / wx.switchTab 的细节，
 *      便于后续统一添加埋点、登录校验或灰度开关。
 */
const { TAB_PAGES } = require("./constants");

/** tabBar 页面集合，switchTab 与 navigateTo 用法不同，需分别处理 */
const TAB_PATH_LIST = Object.keys(TAB_PAGES).map((k) => TAB_PAGES[k]);

/**
 * 判断是否为 tabBar 页面
 * @param {string} url 绝对路径，如 /pages/basket/index
 */
function isTabPage(url) {
  const path = url.split("?")[0];
  return TAB_PATH_LIST.indexOf(path) > -1;
}

/**
 * 通用跳转：自动区分 tabBar / 普通页面
 * @param {string} url 绝对路径
 */
function navigate(url) {
  if (!url) return;
  if (isTabPage(url)) {
    wx.switchTab({ url });
    return;
  }
  wx.navigateTo({ url });
}

/**
 * 功能未完成时的友好提示（阶段 3 逐步替换为真实页面）
 * @param {string} featureName 功能名称
 */
function toastPending(featureName) {
  wx.showToast({
    title: `${featureName}功能开发中`,
    icon: "none",
    duration: 1600,
  });
}

/** 轻提示 */
function toast(title) {
  wx.showToast({ title, icon: "none", duration: 1600 });
}

module.exports = {
  isTabPage,
  navigate,
  toastPending,
  toast,
};