/**
 * utils/domain.js —— 领域工具函数
 *
 * 只做「取数 + 展示映射」，不在这里创造任何知识性判定。
 * 风险等级、保质期等全部来自 data/knowledge.js（后续改为知识库集合）。
 */
const knowledge = require("../data/knowledge");

const {
  RISK_LEVELS,
  ADDITIVE_ICONS,
  SAFETY_GRADES,
  ADDITIVES,
  INGREDIENTS,
  RECIPES,
  STANDARDS,
} = knowledge;

/** 按 id 取添加剂 */
function getAdditive(id) {
  return ADDITIVES.filter((item) => item.id === id)[0] || null;
}

/** 按 id 取食材 */
function getIngredient(id) {
  return INGREDIENTS.filter((item) => item.id === id)[0] || null;
}

/** 按 id 取菜谱 */
function getRecipe(id) {
  return RECIPES.filter((item) => item.id === id)[0] || null;
}

/** 添加剂补全展示字段（颜色、标签、图标、国标名称） */
function decorateAdditive(additive) {
  if (!additive) return null;
  const risk = RISK_LEVELS[additive.risk] || RISK_LEVELS.unknown;
  return Object.assign({}, additive, {
    riskLabel: risk.label,
    riskColor: risk.color,
    riskBg: risk.bg,
    icon: ADDITIVE_ICONS[additive.role] || "/images/icon-add-shield.png",
    standardText: (additive.standards || []).join("、"),
  });
}

/** 取综合安全评价档位（结果页右上角徽标） */
function getSafetyGrade(key) {
  return SAFETY_GRADES[key] || SAFETY_GRADES.safe;
}

/** 风险评估三档卡片数据（低/中/高） */
function getRiskCards(summary) {
  const s = summary || {};
  return ["low", "medium", "high"].map((key) => {
    const level = RISK_LEVELS[key];
    return {
      key,
      title: level.title,
      desc: level.desc,
      count: s[key] || 0,
      color: level.color,
      bg: level.bg,
      icon: level.icon,
    };
  });
}

/**
 * 把「2258 kJ」这类数值文本拆成数值与单位，便于五列指标卡排版
 * @param {{label:string,value:string,sub?:string}} item
 */
function parseNutrition(item) {
  const matched = String(item.value || "").match(/^([\d.]+)\s*(.*)$/);
  return {
    label: item.label,
    num: matched ? matched[1] : item.value,
    unit: matched ? matched[2] : "",
    sub: item.sub || "",
  };
}

/** 按 id 列表批量取添加剂（结果页用） */
function getAdditiveList(ids) {
  return (ids || []).map((id) => decorateAdditive(getAdditive(id))).filter(Boolean);
}

/** 格式化日期为 YYYY-MM-DD */
function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const m = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 解析「3-5 天」这类参考时长为天数区间 */
function parseRange(text) {
  const matched = String(text || "").match(/(\d+)\s*-\s*(\d+)/);
  if (matched) return [Number(matched[1]), Number(matched[2])];
  const single = String(text || "").match(/(\d+)/);
  if (single) return [Number(single[1]), Number(single[1])];
  return null;
}

/**
 * 计算菜篮子条目的剩余参考天数
 *
 * ⚠️ 业务逻辑，待人工确认后固化：
 *    目前取「常温参考区间下限」作为基准，仅用于界面演示，
 *    不代表真实可食用期限（合规要求：通用参考时长，以实物为准）。
 *
 * @param {{buyDate:string, shelfLife:{normal:string, cold:string}}} item
 * @returns {{days:number|null, status:'normal'|'soon'|'expired'|'unknown', statusLabel:string}}
 */
function calcRemaining(item) {
  const range = parseRange(item && item.shelfLife && item.shelfLife.normal);
  if (!range) return { days: null, status: "unknown", statusLabel: "" };
  const base = range[0];
  const buy = new Date(String(item.buyDate).replace(/-/g, "/"));
  const today = new Date();
  buy.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const used = Math.floor((today - buy) / 86400000);
  const left = base - used;
  if (left < 0) return { days: left, status: "expired", statusLabel: "已过期" };
  if (left <= 2) return { days: left, status: "soon", statusLabel: "临期" };
  return { days: left, status: "normal", statusLabel: "" };
}

/** 给菜篮子条目补全剩余天数与状态 */
function decorateBasketItem(item) {
  const remain = calcRemaining(item);
  return Object.assign({}, item, {
    remainDays: remain.days,
    remainStatus: remain.status,
    remainLabel: remain.statusLabel,
    remainText: remain.days === null ? "参考时长待补充" : `剩余 ${remain.days} 天`,
  });
}

/**
 * 食谱匹配：按菜篮子现有食材计算命中情况
 *
 * 命中数量越多排序越靠前；canCook 表示所需食材在菜篮子中全部具备，
 * 对应列表页的「可直接做」标记。
 *
 * ⚠️「优先使用临期食材」属于规则性逻辑，待人工确认后再补充排序权重。
 *
 * @param {Array} basketItems 菜篮子条目（来自 utils/basket）
 * @param {string} keyword 菜名关键词
 * @param {string} filter 分类筛选（all 表示不筛选）
 */
function matchRecipes(basketItems, keyword, filter) {
  const owned = {};
  const ownedThumbs = {};
  (basketItems || []).forEach((item) => {
    if (item.ingredientId) {
      owned[item.ingredientId] = true;
      ownedThumbs[item.ingredientId] = thumbFor(item.ingredientId);
    }
  });
  const kw = (keyword || "").trim();
  return RECIPES.filter((recipe) => !kw || recipe.name.indexOf(kw) > -1)
    .filter((recipe) => !filter || filter === "all" || (recipe.tags || []).indexOf(filter) > -1)
    .map((recipe) => {
      const need = recipe.ingredients || [];
      const matched = need.filter((i) => owned[i.id]);
      const matchedThumbs = matched.map((i) => ownedThumbs[i.id]).filter(Boolean);
      return Object.assign({}, recipe, {
        ingredientNames: need.map((i) => i.name).join("、"),
        matchedNames: matched.map((i) => i.name).join("、"),
        matchedCount: matched.length,
        matchedThumbs,
        canCook: need.length > 0 && matched.length === need.length,
        matchedText:
          matched.length > 0 ? `已匹配：${matched.map((i) => i.name).join("、")}` : "暂未匹配到现有食材",
      });
    })
    .sort((a, b) => b.matchedCount - a.matchedCount);
}

/** 食材 id -> 圆形缩略图（用于「已匹配」小图与菜篮子速览） */
function thumbFor(ingredientId) {
  const map = {
    tomato: "/images/thumb-tomato.png",
    egg: "/images/thumb-egg.png",
    lettuce: "/images/thumb-lettuce.png",
    potato: "/images/thumb-potato.png",
    strawberry: "/images/thumb-strawberry.png",
    milk: "/images/thumb-milk.png",
  };
  return map[ingredientId] || "";
}

/** 统计菜篮子中可匹配到的食谱数量（横幅展示用） */
function countCookable(basketItems) {
  return matchRecipes(basketItems, "", "all").filter((r) => r.canCook).length;
}
module.exports = {
  RISK_LEVELS,
  SAFETY_GRADES,
  getSafetyGrade,
  getRiskCards,
  parseNutrition,
  getAdditive,
  getIngredient,
  getRecipe,
  decorateAdditive,
  getAdditiveList,
  formatDate,
  calcRemaining,
  decorateBasketItem,
  matchRecipes,
  thumbFor,
  countCookable,
  STANDARDS,
  ADDITIVES,
  INGREDIENTS,
  RECIPES,
};