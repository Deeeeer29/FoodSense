/**
 * pages/mine/index.js —— 我的（关于食察局）
 *
 * 页面结构：用户信息卡 + 四个数据入口（收藏/菜篮子/食谱/浏览记录）+ 功能菜单。
 * 其中「我的菜篮子」「我的食谱」的数据来自本地数据层与知识库，其余为演示数值。
 *
 * ⚠️ 用户昵称、ID、会员等级当前为演示数据，接入微信登录后由云函数回填。
 * 「使用免责声明」按钮输出统一合规文案（utils/constants.js#DISCLAIMER）。
 */
const { APP_INFO, DISCLAIMER } = require("../../utils/constants");
const { toast, navigate, toastPending } = require("../../utils/router");
const basket = require("../../utils/basket");
const knowledge = require("../../data/knowledge");

Page({
  data: {
    userName: "小食同学",
    userId: "12345678",
    userLevel: "普通用户",
    version: "1.0.0",
    stats: [],
    menus: [
      { key: "account", label: "账号与安全", icon: "/images/menu-account.png" },
      { key: "standard", label: "参考的国家标准", icon: "/images/menu-standard.png" },
      { key: "disclaimer", label: "使用免责声明", icon: "/images/menu-disclaimer.png" },
      { key: "feedback", label: "意见反馈", icon: "/images/menu-feedback.png" },
      { key: "faq", label: "常见问题", icon: "/images/menu-faq.png" },
      { key: "privacy", label: "隐私政策", icon: "/images/menu-privacy.png" },
      { key: "agreement", label: "服务协议", icon: "/images/menu-agreement.png" },
      { key: "contact", label: "联系我们", icon: "/images/menu-contact.png" },
    ],
  },

  onShow() {
    this.refreshStats();
  },

  /** 数据概览：菜篮子与食谱取真实数据，收藏/浏览记录为演示值 */
  refreshStats() {
    this.setData({
      stats: [
        { key: "favorite", label: "我的收藏", value: 12, icon: "/images/stat-favorite.png" },
        { key: "basket", label: "我的菜篮子", value: basket.count(), icon: "/images/stat-basket.png" },
        { key: "recipe", label: "我的食谱", value: knowledge.RECIPES.length, icon: "/images/stat-recipe.png" },
        { key: "history", label: "浏览记录", value: 32, icon: "/images/stat-history.png" },
      ],
    });
  },

  /** 复制用户 ID */
  onCopyId() {
    wx.setClipboardData({
      data: this.data.userId,
      success: () => toast("ID 已复制"),
    });
  },

  onTapStat(e) {
    const key = e.currentTarget.dataset.key;
    if (key === "basket") {
      wx.switchTab({ url: "/pages/basket/index" });
      return;
    }
    if (key === "recipe") {
      wx.navigateTo({ url: "/pages/recipe/list/index" });
      return;
    }
    toastPending(key === "favorite" ? "我的收藏" : "浏览记录");
  },

  onTapMenu(e) {
    const key = e.currentTarget.dataset.key;
    if (key === "standard") {
      navigate("/pages/standard/index");
      return;
    }
    if (key === "disclaimer") {
      wx.showModal({
        title: "使用免责声明",
        content: DISCLAIMER.full,
        showCancel: false,
        confirmText: "我知道了",
      });
      return;
    }
    if (key === "feedback") {
      wx.showModal({
        title: "意见反馈",
        editable: true,
        placeholderText: "请描述你遇到的问题或建议",
        success: (res) => {
          if (res.confirm) toast("感谢反馈");
        },
      });
      return;
    }
    if (key === "faq") {
      wx.showModal({
        title: "常见问题",
        content:
          "1. 识别不准怎么办？可在结果页手动修正品类，或使用手动录入兜底。\n" +
          "2. 保质期为什么只是参考？实际受储存环境影响，请以实物为准。\n" +
          "3. 数据来源？添加剂分级与国标说明均来自自建知识库，可在「参考的国家标准」查看。",
        showCancel: false,
        confirmText: "我知道了",
      });
      return;
    }
    if (key === "privacy" || key === "agreement") {
      wx.showModal({
        title: key === "privacy" ? "隐私政策" : "服务协议",
        content: "该文档随小程序上线材料一并发布，当前版本为开发阶段，暂未接入。",
        showCancel: false,
        confirmText: "我知道了",
      });
      return;
    }
    toastPending(this.data.menus.filter((m) => m.key === key)[0].label);
  },
});