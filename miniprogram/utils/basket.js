/**
 * utils/basket.js —— 菜篮子本地数据层（骨架实现）
 *
 * 当前用 wx.setStorageSync 落地本地数据，保证「识别 → 加入菜篮子 → 食谱匹配」
 * 闭环在阶段 2 就能演示；
 * 阶段 2 后续替换为云数据库集合 user_basket 的读写，本文件对外接口保持不变。
 *
 * ⚠️ 本地缓存机制说明（改动种子数据时必读）：
 *    菜篮子一旦写入缓存就会一直复用，不会自动重读种子数据。
 *    因此只要调整了 data/knowledge.js 里的 BASKET_SEED（增删条目、换图片路径等），
 *    必须把 DATA_VERSION 加 1，否则已安装过的设备会一直显示旧数据。
 *    素材文件重命名/换格式时，同时补进 IMAGE_MIGRATION，避免缓存里出现失效引用。
 *
 * ⚠️ 剩余保质期计算属于核心业务逻辑（文档 5.2 要求人工审核），
 *    这里只按「品类 + 购买日期」做通用参考天数的近似计算，
 *    上线前需按真实知识库数据与人工确认的规则重写并补充测试。
 */
const { BASKET_SEED } = require("../data/knowledge");

/** 数据版本：BASKET_SEED 结构或图片路径变更时 +1，用于自动刷新本地缓存 */
const DATA_VERSION = 2;

const STORAGE_KEY = "shichaju_basket";
const VERSION_KEY = "shichaju_basket_version";

/**
 * 历史图片路径迁移表
 * 素材文件名或格式调整时在此登记，保证已缓存的菜篮子记录不会指向已删除的图片。
 */
const IMAGE_MIGRATION = {
  "/images/ingredient-tomato.png": "/images/basket-tomato.jpg",
  "/images/basket-tomato.png": "/images/basket-tomato.jpg",
  "/images/basket-egg.png": "/images/basket-egg.jpg",
  "/images/basket-milk.png": "/images/basket-milk.jpg",
};

/** 迁移单条记录中的图片路径（无变化时返回原对象引用） */
function migrateItem(item) {
  const next = IMAGE_MIGRATION[item && item.image];
  return next ? Object.assign({}, item, { image: next }) : item;
}

/**
 * 读取菜篮子列表
 *  - 首次进入，或 DATA_VERSION 变化：写入最新演示种子数据
 *  - 版本一致：仅做图片路径迁移，保留用户自己添加的食材
 */
function list() {
  const version = wx.getStorageSync(VERSION_KEY);
  const stored = wx.getStorageSync(STORAGE_KEY);

  if (!stored || !stored.length || version !== DATA_VERSION) {
    const seed = JSON.parse(JSON.stringify(BASKET_SEED));
    wx.setStorageSync(STORAGE_KEY, seed);
    wx.setStorageSync(VERSION_KEY, DATA_VERSION);
    return seed;
  }

  const migrated = stored.map(migrateItem);
  const changed = migrated.some((item, index) => item !== stored[index]);
  if (changed) {
    wx.setStorageSync(STORAGE_KEY, migrated);
  }
  return migrated;
}

/** 覆盖写入 */
function save(items) {
  wx.setStorageSync(STORAGE_KEY, items);
  return items;
}

/**
 * 新增食材（同一品类合并数量提示，不合并数据）
 * @param {{ingredientId:string,name:string,category:string,buyDate:string,quantity?:string,shelfLife?:object,image?:string}} item
 */
function add(item) {
  const items = list();
  const row = Object.assign(
    {
      id: "b" + Date.now(),
      quantity: "1 份",
      image: "/images/basket-tomato.jpg",
      shelfLife: { normal: "-", cold: "-" },
    },
    item
  );
  items.unshift(row);
  save(items);
  return row;
}

/** 按 id 删除 */
function remove(id) {
  const items = list().filter((item) => item.id !== id);
  save(items);
  return items;
}

/** 数量统计，用于首页角标 */
function count() {
  return list().length;
}

module.exports = { list, save, add, remove, count };
