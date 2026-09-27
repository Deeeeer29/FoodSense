/**
 * pages/scan/index.js —— 拍照识别过渡页
 *
 * 说明：阶段 3 才接入真实链路（相机/相册 → 云函数 → OCR 或多模态识别 → 知识库匹配）。
 * 为保证阶段 2 的界面演示与「识别失败手动录入」兜底路径可走通，此处提供演示数据入口。
 * 接入真实能力时，本页替换为「拍照 → 上传 → 调用云函数 → 跳转结果页」即可，
 * 结果页（analysis / fresh）无需改动。
 */
const { toast } = require("../../utils/router");

const MODES = {
  pack: {
    label: "包装食品",
    title: "拍包装食品",
    desc: "对准包装上的配料表与营养成分表，拍摄清晰照片",
    demoPath: "/pages/analysis/index",
    demoTip: "点击下方按钮可查看「乐事原味薯片」的配料解读示例结果。",
    flow: [
      "调用相机 / 相册选取包装照片",
      "上传云存储并调用 OCR 云函数提取文字",
      "按配料表在添加剂知识库中匹配并分级",
      "结果页渲染：通俗解读 + 风险分级 + 国标来源",
    ],
  },
  fresh: {
    label: "生鲜果蔬",
    title: "拍生鲜果蔬",
    desc: "对准食材整体拍摄，光线充足、背景简洁效果更好",
    demoPath: "/pages/fresh/index?id=tomato",
    demoTip: "点击下方按钮可查看「番茄」的选购技巧示例结果。",
    flow: [
      "调用相机 / 相册选取食材照片",
      "上传云存储并调用多模态识别（仅输出食材名称）",
      "按食材名称在生鲜知识库中取选购技巧与参考保质期",
      "结果页渲染：选购技巧 + 保鲜时长 + 一键入篮",
    ],
  },
};

Page({
  data: {
    mode: "fresh",
    modeLabel: "",
    title: "",
    desc: "",
    demoTip: "",
    demoPath: "",
    flow: [],
  },

  onLoad(options) {
    const mode = options && options.mode === "pack" ? "pack" : "fresh";
    const conf = MODES[mode];
    this.setData({
      mode,
      modeLabel: conf.label,
      title: conf.title,
      desc: conf.desc,
      demoTip: conf.demoTip,
      demoPath: conf.demoPath,
      flow: conf.flow,
    });
    wx.setNavigationBarTitle({ title: conf.title });
  },

  onUseDemo() {
    wx.navigateTo({ url: this.data.demoPath });
  },

  /** 识别失败兜底：手动录入（文档 6.2 已知风险应对） */
  onManualInput() {
    wx.showModal({
      title: "手动录入",
      editable: true,
      placeholderText: this.data.mode === "pack" ? "请粘贴配料表文字" : "请输入食材名称",
      success: (res) => {
        if (!res.confirm) return;
        const text = (res.content || "").trim();
        if (!text) {
          toast("内容为空，请重新录入");
          return;
        }
        wx.navigateTo({ url: this.data.demoPath });
      },
    });
  },
});