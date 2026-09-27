/**
 * app.js —— 食察局 · AI 食品助手
 *
 * 职责：
 *  1. 初始化云开发环境（env 需填入自己的云环境 ID）
 *  2. 维护全局共享状态（云环境、用户标识、菜篮子数量等）
 *
 * 注意：核心知识判定（风险等级、保质期、选购技巧等）一律来自自建知识库，
 *      前端不在此处做任何业务规则计算。
 */
App({
  globalData: {
    /** 云开发环境 ID，请替换为实际环境（云开发控制台可查看） */
    env: "",
    /** 用户唯一标识，登录后由云函数 openid 回填 */
    openid: "",
    /** 菜篮子内食材数量，用于首页/菜篮子角标 */
    basketCount: 0,
    /** 全局设计令牌，供 JS 侧需要时读取（样式以 app.wxss 变量为准） */
    theme: {
      primary: "#1FA84B",
      primaryDark: "#0F7A34",
    },
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
      return;
    }
    wx.cloud.init({
      env: this.globalData.env,
      traceUser: true,
    });
  },
});
