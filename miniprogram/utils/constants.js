/**
 * constants.js —— 全局常量
 *
 * 约定：
 *  - 所有面向用户的固定文案（合规话术、入口配置）集中在此，便于统一评审与修改。
 *  - 页面路径统一以 / 开头的绝对路径书写，避免相对路径层级出错。
 */

/** 小程序基本信息 */
const APP_INFO = {
  name: "食察局",
  slogan: "AI 食品助手",
};

/** 底部 tabBar 页面路径（与 app.json 保持一致） */
const TAB_PAGES = {
  home: "/pages/index/index",
  basket: "/pages/basket/index",
  discover: "/pages/discover/index",
  mine: "/pages/mine/index",
};

/**
 * 首页快捷入口
 * route 为已实现页面；为 null 表示该页面尚未开发，点击时给出友好提示。
 */
const QUICK_ENTRIES = [
  {
    key: "basket",
    label: "我的菜篮子",
    icon: "/images/icons/q-basket.png",
    route: TAB_PAGES.basket,
  },
  {
    key: "recommend",
    label: "今日推荐",
    icon: "/images/icons/q-star.png",
    route: null,
  },
  {
    key: "guide",
    label: "使用指南",
    icon: "/images/icons/q-guide.png",
    route: null,
  },
  {
    key: "about",
    label: "关于我们",
    icon: "/images/icons/q-user.png",
    route: TAB_PAGES.mine,
  },
];

/** 免责声明（合规红线：仅科普参考、不作绝对性表述、不涉医疗） */
const DISCLAIMER = {
  short: "内容仅作日常选购科普参考，具体以商品标签及实物为准",
  full:
    "本小程序所有识别结果与解读内容仅作为日常选购的科普参考，不构成任何专业性判定或建议；" +
    "保质期类信息均为通用参考时长，实际存放时间受储存环境影响，请以实物为准。",
};

module.exports = {
  APP_INFO,
  TAB_PAGES,
  QUICK_ENTRIES,
  DISCLAIMER,
};