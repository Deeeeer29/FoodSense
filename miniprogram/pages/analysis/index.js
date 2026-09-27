/**
 * pages/analysis/index.js —— 包装食品识别结果页
 *
 * 数据来源约定（文档 3.1 / 3.4）：
 *   OCR 只负责提取包装文字；配料拆解、添加剂分级、国标来源全部来自自建知识库。
 *   当前使用 data/knowledge.js 的演示数据，阶段 3 接入云函数后替换 loadResult 即可。
 *
 * ⚠️ 综合安全评价（safetyGrade）与风险结论文案属于核心知识判定，
 *    当前为界面演示档位，上线前必须由团队按国标人工审核后定稿。
 */
const { PACK_RESULT_DEMO, STANDARDS } = require("../../data/knowledge");
const { getAdditiveList, getSafetyGrade, getRiskCards, parseNutrition, formatDate } = require("../../utils/domain");
const { toast, navigate } = require("../../utils/router");
const basket = require("../../utils/basket");

Page({
  data: {
    product: PACK_RESULT_DEMO.product,
    productMeta: [],
    safetyGrade: getSafetyGrade(PACK_RESULT_DEMO.safetyGrade),
    ingredientsText: PACK_RESULT_DEMO.ingredientsText,
    additives: [],
    nutritionCells: [],
    standards: [],
    riskCards: [],
    tabs: [
      { key: "ingredient", label: "配料分析" },
      { key: "nutrition", label: "营养成分" },
      { key: "additive", label: "添加剂解读" },
      { key: "standard", label: "执行标准" },
    ],
    activeTab: "ingredient",
    /** 添加剂详情弹窗 */
    sheetVisible: false,
    sheetAdditive: null,
  },

  onLoad() {
    this.loadResult();
  },

  /** 装载识别结果（阶段 3 替换为云函数返回数据） */
  loadResult() {
    const demo = PACK_RESULT_DEMO;
    const product = demo.product;

    this.setData({
      productMeta: [
        { label: "品牌", value: product.brand },
        { label: "净含量", value: product.netWeight },
        { label: "执行标准", value: product.standard },
      ],
      safetyGrade: getSafetyGrade(demo.safetyGrade),
      additives: getAdditiveList(demo.additiveIds),
      nutritionCells: (demo.nutrition || []).map((item) => parseNutrition(item)),
      riskCards: getRiskCards(demo.riskSummary),
      standards: STANDARDS.filter((s) => s.code === product.standard || s.code === "GB 2760-2014"),
    });
  },

  /** 切换分段标签 */
  onSwitchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key });
  },

  /** 综合安全评价说明 */
  onTapGrade() {
    wx.showModal({
      title: `综合评价：${this.data.safetyGrade.label}`,
      content:
        "综合评价依据配料表中各添加剂的国标分级情况汇总得出，仅作为选购参考，" +
        "不构成任何专业性判定；准确结论请以商品标签与官方标准为准。",
      showCancel: false,
      confirmText: "我知道了",
    });
  },

  /** 打开添加剂详情弹窗 */
  onOpenAdditive(e) {
    const id = e.currentTarget.dataset.id;
    const additive = this.data.additives.filter((item) => item.id === id)[0];
    if (!additive) return;
    this.setData({ sheetVisible: true, sheetAdditive: additive });
  },

  onCloseAdditive() {
    this.setData({ sheetVisible: false });
  },

  /** 查看全部添加剂 */
  onTapAllAdditives() {
    this.setData({ activeTab: "additive" });
  },

  /** 营养成分详情（二期：营养统计能力） */
  onTapNutritionDetail() {
    toast("营养详情纳入二期规划");
  },

  /** 加入我的食品库（记录产品与通用参考保质期） */
  onAddToLibrary() {
    const product = this.data.product;
    basket.add({
      ingredientId: "pack-" + Date.now(),
      name: product.name,
      category: "packaged",
      image: product.image,
      buyDate: formatDate(new Date()),
      quantity: "1 包",
      shelfLife: { normal: "见包装标示", cold: "见包装标示" },
    });
    toast("已加入我的食品库");
  },

  /** 再次扫描 */
  onRescan() {
    navigate("/pages/scan/index?mode=pack");
  },
});