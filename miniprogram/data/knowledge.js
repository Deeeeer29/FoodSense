/**
 * data/knowledge.js —— 知识库演示数据
 *
 * ⚠️ 重要（合规红线，见《项目内部开发说明书》5.2 / 6.1）：
 *   1. 本文件中的「风险等级、参考保质期、国标编号」等内容目前仅为界面演示样例，
 *      上线前必须由团队按真实国标逐条人工核对，禁止直接用 AI 生成结果。
 *   2. 所有数值与判定规则不得在本文件之外另行硬编码，统一从这里读取，
 *      保证「AI 只做感知与表达，判定全部来自自建知识库」的架构原则。
 *   3. 上线形态应改为云数据库集合：food_additive / fresh_ingredient / recipe / standard。
 *
 * 集合与字段对应关系：
 *   additives  -> food_additive   名称、别名、作用、风险等级、国标来源、摄入建议
 *   ingredients-> fresh_ingredient 名称、分类、选购技巧、冷藏/常温保质期
 *   recipes    -> recipe          菜名、所需食材、分类、制作步骤、标签
 *   standards  -> standard        标准号、标准名称、适用范围、说明
 *   basketSeed -> user_basket     用户标识、食材ID、购买日期、数量、状态
 */

/**
 * 风险等级字典（颜色与文案集中管理，避免散落各页）
 *
 * ⚠️ 等级划分与结论性文案（「可放心食用」等）属于核心知识判定，
 *    当前为界面演示文案，上线前必须由团队按国标人工审核后定稿。
 */
const RISK_LEVELS = {
  low: {
    key: "low",
    label: "风险低",
    color: "#22A552",
    bg: "#E7F7EB",
    title: "低风险",
    desc: "安全性较高，正常食用范围内无需特别担心",
    assessment: "按规定用量使用是安全的。日常食用频次内一般无需特别担心，建议保持均衡饮食。",
    icon: "/images/icon-risk-low.png",
    shield: "/images/icon-shield-amber.png",
  },
  medium: {
    key: "medium",
    label: "风险中",
    color: "#E39A16",
    bg: "#FDF3DF",
    title: "中风险",
    desc: "建议适量摄入，关注长期累积摄入量",
    assessment: "在规定使用范围内是安全的，但长期过量摄入可能对健康产生不良影响。建议适量食用。",
    icon: "/images/icon-risk-medium.png",
    shield: "/images/icon-shield-amber.png",
  },
  high: {
    key: "high",
    label: "风险高",
    color: "#E2554A",
    bg: "#FDEDEB",
    title: "高风险",
    desc: "建议减少食用频次，儿童更需注意",
    assessment: "国标对其使用范围与残留量有严格限制。建议减少含该类添加剂食品的食用频次，儿童更需注意。",
    icon: "/images/icon-risk-high.png",
    shield: "/images/icon-shield-orange.png",
  },
  unknown: {
    key: "unknown",
    label: "暂无分级",
    color: "#8A9390",
    bg: "#F2F4F1",
    title: "暂无分级",
    desc: "知识库暂无该条目的分级信息",
    icon: "/images/icon-risk-medium.png",
  },
};

/** 添加剂图标字典：按作用类别映射到统一图标 */
const ADDITIVE_ICONS = {
  "酸度调节剂": "/images/icon-add-leaf.png",
  "抗结剂": "/images/icon-add-shield.png",
  "抗氧化剂": "/images/icon-add-crown.png",
  "增味剂": "/images/icon-add-leaf.png",
  "护色剂 / 防腐剂": "/images/icon-add-shield.png",
};

/** 综合安全评价档位（产品整体结论，用于结果页右上角徽标） */
const SAFETY_GRADES = {
  safe: { key: "safe", label: "较安全", color: "#1B8A3D", bg: "#E7F7EB" },
  watch: { key: "watch", label: "需留意", color: "#D2890F", bg: "#FDF3DF" },
  caution: { key: "caution", label: "谨慎选择", color: "#E2554A", bg: "#FDEDEB" },
};

/** 菜谱分类筛选标签（食谱推荐页顶部） */
const RECIPE_FILTERS = [
  { key: "all", label: "全部" },
  { key: "快手菜", label: "快手菜" },
  { key: "营养餐", label: "营养餐" },
  { key: "低脂", label: "低脂" },
  { key: "甜品", label: "甜品" },
];

/** 食材分类字典 */
const INGREDIENT_CATEGORIES = {
  vegetable: "蔬菜",
  fruit: "水果",
  meat: "肉蛋奶",
  packaged: "预包装食品",
};

/** 添加剂知识库（演示样例，上线前需人工核对国标与分级） */
const ADDITIVES = [
  {
    id: "citric-acid",
    scenes: [
      { image: "/images/scene-chips.png", name: "饮料", label: "碳酸饮料" },
      { image: "/images/scene-cookie.png", name: "果酱", label: "果酱罐头" },
      { image: "/images/scene-oil.png", name: "糖果", label: "糖果蜜饯" },
      { image: "/images/scene-nut.png", name: "调味", label: "复合调味" },
    ],
    name: "柠檬酸",
    alias: "枸橼酸",
    risk: "low",
    role: "酸度调节剂",
    plain: "调节酸度，常用于食品保鲜",
    desc: "一种酸度调节剂，用于调节食品酸味、辅助防腐，延长保质期。",
    sceneText: "多用于饮料、果酱、罐头、糖果等，用来调节酸味、辅助防腐。",
    intake: "按国标规定的使用范围与限量添加，正常食用范围内无需特别担心。",
    standards: ["GB 2760-2014"],
  },
  {
    id: "silicon-dioxide",
    scenes: [
      { image: "/images/scene-chips.png", name: "调味粉", label: "复合调味粉" },
      { image: "/images/scene-cookie.png", name: "奶粉", label: "固体饮料" },
      { image: "/images/scene-oil.png", name: "咖啡", label: "咖啡伴侣" },
      { image: "/images/scene-nut.png", name: "药片", label: "粉状食品" },
    ],
    name: "二氧化硅",
    alias: "抗结剂",
    risk: "low",
    role: "抗结剂",
    plain: "抗结剂，防止结块",
    desc: "一种抗结剂，用于防止粉末类食品受潮结块，保持松散状态。",
    sceneText: "多用于粉末类食品，如调味粉、奶粉、咖啡伴侣，防止受潮结块。",
    intake: "按国标限量使用，正常食用范围内无需特别担心。",
    standards: ["GB 2760-2014"],
  },
  {
    id: "tbhq",
    scenes: [
      { image: "/images/scene-chips.png", name: "薯片", label: "膨化食品" },
      { image: "/images/scene-cookie.png", name: "饼干", label: "饼干糕点" },
      { image: "/images/scene-oil.png", name: "油脂", label: "食用油脂" },
      { image: "/images/scene-nut.png", name: "坚果", label: "坚果炒货" },
    ],
    name: "TBHQ",
    alias: "特丁基对苯二酚",
    risk: "medium",
    role: "抗氧化剂",
    plain: "抗氧化剂，延长保质期",
    desc: "一种抗氧化剂，用于防止食品油脂氧化变质，延长保质期。",
    sceneText: "多用于油炸食品、膨化食品、食用油脂等，防止油脂氧化变质。",
    intake: "根据国标规定，TBHQ 的最大使用量为 0.2g/kg，在正常食用范围内是安全的。",
    standards: ["GB 2760-2014"],
  },
  {
    id: "msg",
    scenes: [
      { image: "/images/scene-chips.png", name: "调味", label: "家庭调味" },
      { image: "/images/scene-cookie.png", name: "方便面", label: "方便食品" },
      { image: "/images/scene-oil.png", name: "酱料", label: "复合酱料" },
      { image: "/images/scene-nut.png", name: "汤料", label: "汤料底料" },
    ],
    name: "谷氨酸钠",
    alias: "味精",
    risk: "low",
    role: "增味剂",
    plain: "增味剂，提升鲜味",
    desc: "一种增味剂，用于提升食品鲜味，广泛用于家庭调味与方便食品。",
    sceneText: "广泛用于家庭调味与方便食品，按需添加即可。",
    intake: "属于常规增味剂，正常烹饪用量下无需特别担心。",
    standards: ["GB 2760-2014"],
  },
  {
    id: "sodium-nitrite",
    scenes: [
      { image: "/images/scene-chips.png", name: "腊肉", label: "腌腊肉制品" },
      { image: "/images/scene-cookie.png", name: "火腿", label: "酱卤肉制品" },
      { image: "/images/scene-oil.png", name: "香肠", label: "灌肠制品" },
      { image: "/images/scene-nut.png", name: "罐头", label: "肉类罐头" },
    ],
    name: "亚硝酸钠",
    alias: "护色剂",
    risk: "high",
    role: "护色剂 / 防腐剂",
    plain: "护色防腐，常用于腌腊肉制品",
    desc: "一种护色剂兼防腐剂，用于腌腊肉制品护色与抑制肉毒杆菌，需严格按国标限量使用。",
    sceneText: "主要用于腌腊肉制品、酱卤肉制品，需严格按国标限量使用。",
    intake: "国标对残留量有明确限量要求，建议控制腌腊肉制品的食用频次。",
    standards: ["GB 2760-2014"],
  },
];

/** 生鲜食材知识库（演示样例） */
const INGREDIENTS = [
  {
    id: "tomato",
    name: "番茄",
    recommend: "新鲜选择",
    category: "vegetable",
    image: "/images/basket-tomato.jpg",
    tipsTitle: "如何挑选新鲜的番茄？",
    tips: [
      { label: "看外观", text: "表皮光滑，颜色匀匀，呈自然红色" },
      { label: "摸手感", text: "饱满有弹性，轻按不易变形" },
      { label: "闻气味", text: "有自然的番茄香味，无异味" },
      { label: "看果蒂", text: "果蒂鲜绿，说明新鲜度较高" },
    ],
    shelfLife: { normal: "3-5 天", cold: "7-10 天" },
  },
  {
    id: "lettuce",
    name: "生菜",
    recommend: "新鲜选择",
    category: "vegetable",
    image: "/images/basket-lettuce.png",
    tipsTitle: "如何挑选新鲜的生菜？",
    tips: [
      { label: "看叶片", text: "叶片挺括、颜色鲜绿，无黄斑" },
      { label: "摸手感", text: "叶柄脆实，掰开有清脆声" },
      { label: "看根部", text: "根部切口新鲜、不发黑" },
    ],
    shelfLife: { normal: "1-2 天", cold: "3-5 天" },
  },
  {
    id: "egg",
    name: "鸡蛋",
    recommend: "新鲜选择",
    category: "meat",
    image: "/images/basket-egg.jpg",
    tipsTitle: "如何挑选新鲜的鸡蛋？",
    tips: [
      { label: "看蛋壳", text: "蛋壳完整、表面粗糙有霜状粉末" },
      { label: "摇一摇", text: "无晃动感，说明蛋液饱满" },
      { label: "泡水", text: "沉底为新鲜，浮起则不建议食用" },
    ],
    shelfLife: { normal: "10-15 天", cold: "30-40 天" },
  },
  {
    id: "strawberry",
    name: "草莓",
    recommend: "新鲜选择",
    category: "fruit",
    image: "/images/basket-strawberry.png",
    tipsTitle: "如何挑选新鲜的草莓？",
    tips: [
      { label: "看颜色", text: "通体鲜红均匀，果肩不发白" },
      { label: "看果蒂", text: "果蒂鲜绿、紧贴果肉，不干枯" },
      { label: "摸手感", text: "果肉饱满有弹性，不软塌" },
      { label: "闻气味", text: "有清甜果香，无发酵味" },
    ],
    shelfLife: { normal: "1-2 天", cold: "3-5 天" },
  },
  {
    id: "potato",
    name: "土豆",
    recommend: "新鲜选择",
    category: "vegetable",
    image: "/images/basket-potato.png",
    tipsTitle: "如何挑选新鲜的土豆？",
    tips: [
      { label: "看表皮", text: "表皮完整光滑，无发芽与青皮" },
      { label: "摸手感", text: "手感坚实、分量沉，不发软" },
      { label: "看芽眼", text: "芽眼浅而少，无绿色斑块" },
    ],
    shelfLife: { normal: "7-15 天", cold: "15-30 天" },
  },
];

/** 菜谱知识库（演示样例，做法文案需人工润色后上线）
 *
 * 字段说明：desc 一句话卖点 / kcal 每份参考热量 / difficulty 难度 /
 *          minutes 参考耗时 / tags 分类标签 / ingredients 所需食材（id 对应 fresh_ingredient） */
const RECIPES = [
  {
    id: "tomato-egg",
    name: "番茄炒蛋",
    image: "/images/recipe-tomato-egg.jpg",
    largeImage: "/images/dish-tomato-egg-large.jpg",
    desc: "家常快手菜，酸甜开胃",
    minutes: 10,
    difficulty: "简单",
    kcal: 220,
    servings: "2 人",
    category: "快手菜",
    tags: ["快手菜", "家常菜"],
    ingredients: [
      { id: "tomato", name: "番茄", amount: "2 个" },
      { id: "egg", name: "鸡蛋", amount: "3 个" },
    ],
    steps: [
      "番茄洗净切块，鸡蛋打散备用。",
      "热锅倒油，先将鸡蛋炒至金黄盛出。",
      "锅内留底油，下番茄块炒出汁水。",
      "倒回鸡蛋翻炒均匀，加盐调味出锅。",
    ],
    tip: "番茄先用开水烫一下去皮，口感更细腻。",
  },
  {
    id: "potato-egg-pancake",
    name: "土豆鸡蛋饼",
    image: "/images/recipe-potato-egg.jpg",
    largeImage: "/images/recipe-potato-egg.jpg",
    desc: "外酥里嫩，适合早餐",
    minutes: 20,
    difficulty: "简单",
    kcal: 310,
    servings: "2 人",
    category: "营养餐",
    tags: ["营养餐", "家常菜"],
    ingredients: [
      { id: "potato", name: "土豆", amount: "2 个" },
      { id: "egg", name: "鸡蛋", amount: "2 个" },
    ],
    steps: [
      "土豆去皮擦成细丝，用清水冲去淀粉后沥干。",
      "土豆丝中加入鸡蛋、少量面粉与盐拌匀。",
      "平底锅刷油，倒入面糊摊成圆饼。",
      "小火煎至两面金黄，切块装盘。",
    ],
    tip: "土豆丝沥干水分再拌，饼身更酥脆。",
  },
  {
    id: "strawberry-milk",
    name: "草莓牛奶昔",
    image: "/images/recipe-strawberry-milk.jpg",
    largeImage: "/images/recipe-strawberry-milk.jpg",
    desc: "清爽香甜，适合加餐",
    minutes: 5,
    difficulty: "超简单",
    kcal: 180,
    servings: "1 人",
    category: "甜品",
    tags: ["甜品", "低脂"],
    ingredients: [
      { id: "strawberry", name: "草莓", amount: "6 颗" },
      { id: "milk", name: "牛奶", amount: "200 ml" },
    ],
    steps: [
      "草莓去蒂洗净，留两颗切片装饰。",
      "其余草莓与牛奶一起放入料理机。",
      "搅打约 30 秒至顺滑。",
      "倒入杯中，放上草莓片即可。",
    ],
    tip: "草莓提前冷藏，口感更清凉。",
  },
  {
    id: "lettuce-egg-soup",
    name: "生菜鸡蛋汤",
    image: "/images/dish-lettuce-egg.jpg",
    largeImage: "/images/dish-lettuce-egg.jpg",
    desc: "清淡少油，暖胃易做",
    minutes: 8,
    difficulty: "简单",
    kcal: 90,
    servings: "2 人",
    category: "低脂",
    tags: ["低脂", "快手菜"],
    ingredients: [
      { id: "lettuce", name: "生菜", amount: "1 棵" },
      { id: "egg", name: "鸡蛋", amount: "2 个" },
    ],
    steps: [
      "生菜洗净撕成小片，鸡蛋打散。",
      "锅中加水烧开，淋入蛋液形成蛋花。",
      "放入生菜煮约 1 分钟。",
      "加盐、几滴香油调味即可。",
    ],
    tip: "生菜下锅后不要久煮，保持翠绿与脆嫩。",
  },
  {
    id: "tomato-beef-noodle",
    name: "番茄牛肉面",
    image: "/images/dish-beef-noodle.jpg",
    largeImage: "/images/dish-beef-noodle.jpg",
    desc: "汤浓面滑，一锅到底",
    minutes: 20,
    difficulty: "普通",
    kcal: 460,
    servings: "2 人",
    category: "营养餐",
    tags: ["营养餐"],
    ingredients: [{ id: "tomato", name: "番茄", amount: "2 个" }],
    steps: [
      "番茄切块炒出沙，加水煮成汤底。",
      "下入面条煮至断生。",
      "加入熟牛肉片同煮 2 分钟。",
      "调味后盛出，撒上葱花。",
    ],
    tip: "番茄多炒一会儿出沙，汤底会更浓郁。",
  },
  {
    id: "stir-lettuce",
    name: "清炒生菜",
    image: "/images/dish-stir-lettuce.jpg",
    largeImage: "/images/dish-stir-lettuce.jpg",
    desc: "3 分钟上桌，清爽解腻",
    minutes: 8,
    difficulty: "简单",
    kcal: 70,
    servings: "2 人",
    category: "低脂",
    tags: ["低脂", "快手菜"],
    ingredients: [{ id: "lettuce", name: "生菜", amount: "1 棵" }],
    steps: [
      "生菜洗净沥干水分。",
      "热锅放油，下蒜末爆香。",
      "大火下生菜快速翻炒。",
      "加盐调味，断生立即出锅。",
    ],
    tip: "全程大火快炒，出锅前再放盐，避免出水。",
  },
  {
    id: "potato-stew",
    name: "土豆炖菜",
    image: "/images/recipe-potato-egg.jpg",
    largeImage: "/images/recipe-potato-egg.jpg",
    desc: "软糯入味，下饭首选",
    minutes: 25,
    difficulty: "普通",
    kcal: 280,
    servings: "3 人",
    category: "家常菜",
    tags: ["家常菜", "营养餐"],
    ingredients: [
      { id: "potato", name: "土豆", amount: "3 个" },
      { id: "tomato", name: "番茄", amount: "1 个" },
    ],
    steps: [
      "土豆去皮切滚刀块，番茄切块。",
      "热锅下番茄炒出汁，加入土豆块翻炒。",
      "加水没过食材，小火炖 15 分钟。",
      "收汁调味，撒葱花出锅。",
    ],
    tip: "土豆切好后泡水，去除表面淀粉不易糊锅。",
  },
  {
    id: "egg-milk-pudding",
    name: "牛奶鸡蛋羹",
    image: "/images/recipe-milk-custard.jpg",
    largeImage: "/images/recipe-milk-custard.jpg",
    desc: "嫩滑清甜，老少皆宜",
    minutes: 15,
    difficulty: "简单",
    kcal: 150,
    servings: "2 人",
    category: "甜品",
    tags: ["甜品", "营养餐"],
    ingredients: [
      { id: "egg", name: "鸡蛋", amount: "2 个" },
      { id: "milk", name: "牛奶", amount: "150 ml" },
    ],
    steps: [
      "鸡蛋打散，加入温牛奶搅匀。",
      "过筛两遍，去掉浮沫。",
      "盖保鲜膜扎孔，上锅中小火蒸 10 分钟。",
      "出锅后可淋少许蜂蜜。",
    ],
    tip: "蛋液与牛奶比例约 1:1.5，口感最嫩。",
  },
];

/** 国家标准库（演示样例，标准号与适用范围需人工核对） */
const STANDARDS = [
  {
    code: "GB 2760-2014",
    name: "食品安全国家标准 食品添加剂使用标准",
    scope: "规定食品添加剂的允许使用品种、使用范围与最大使用量或残留量",
    note: "本小程序中添加剂风险分级与摄入建议的引用来源。",
  },
  {
    code: "GB/T 22699",
    name: "膨化食品",
    scope: "规定膨化食品的产品分类、技术要求与标签要求",
    note: "用于说明包装食品执行标准代表的品类要求。",
  },
  {
    code: "GB 7718-2011",
    name: "食品安全国家标准 预包装食品标签通则",
    scope: "规定预包装食品标签的标注内容与标示方式",
    note: "配料表、净含量等标签信息的解读依据。",
  },
];

/** 演示用的菜篮子初始数据（上线后由云数据库按用户维度查询）
 *  购买日期按「相对今天」生成，保证演示时能看到正常的/临期的不同状态。 */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const m = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  return `${d.getFullYear()}-${m}-${day}`;
}

const BASKET_SEED = [
  { id: "b1", ingredientId: "tomato", name: "番茄", image: "/images/basket-tomato.jpg", category: "vegetable", buyDate: daysAgo(2), quantity: "2 个", shelfLife: { normal: "3-5 天", cold: "7-10 天" } },
  { id: "b2", ingredientId: "lettuce", name: "生菜", image: "/images/basket-lettuce.png", category: "vegetable", buyDate: daysAgo(1), quantity: "1 棵", shelfLife: { normal: "5-7 天", cold: "7-10 天" } },
  { id: "b3", ingredientId: "egg", name: "鸡蛋", image: "/images/basket-egg.jpg", category: "meat", buyDate: daysAgo(3), quantity: "3 个", shelfLife: { normal: "10-15 天", cold: "30-40 天" } },
  { id: "b4", ingredientId: "milk", name: "牛奶", image: "/images/basket-milk.jpg", category: "meat", buyDate: daysAgo(1), quantity: "1 盒", shelfLife: { normal: "1-2 天", cold: "2-3 天" } },
  { id: "b5", ingredientId: "strawberry", name: "草莓", image: "/images/basket-strawberry.png", category: "fruit", buyDate: daysAgo(1), quantity: "1 盒", shelfLife: { normal: "1-2 天", cold: "3-5 天" } },
  { id: "b6", ingredientId: "potato", name: "土豆", image: "/images/basket-potato.png", category: "vegetable", buyDate: daysAgo(2), quantity: "4 个", shelfLife: { normal: "7-15 天", cold: "15-30 天" } },
  { id: "b7", ingredientId: "pack-chips", name: "乐事原味薯片", image: "/images/basket-chips.png", category: "packaged", buyDate: daysAgo(1), quantity: "1 包", shelfLife: { normal: "30-45 天", cold: "-" } },
];

/** 包装食品识别结果（演示样例；真实数据由 OCR + 知识库匹配产出）
 *
 * ⚠️ 产品描述、营养成分、综合安全评价均为界面演示数据，
 *    真实上线时应由 OCR 结果 + 知识库匹配产出，并保留原文来源。 */
const PACK_RESULT_DEMO = {
  product: {
    name: "乐事原味薯片",
    image: "/images/product-chips.png",
    brand: "乐事",
    netWeight: "70g",
    standard: "GB/T 22699",
    desc: "乐事经典原味薯片，精选马铃薯，口感酥脆，是广受欢迎的休闲零食。",
  },
  /** 综合安全评价档位，对应 SAFETY_GRADES 的 key */
  safetyGrade: "safe",
  ingredientsText:
    "马铃薯、植物油、食用盐、味精、柠檬酸、二氧化硅、TBHQ（特丁基对苯二酚）",
  additiveIds: ["citric-acid", "silicon-dioxide", "tbhq"],
  /** 营养成分（每 100g），展示为五列指标卡 */
  nutrition: [
    { label: "能量", value: "2258 kJ", sub: "540 kcal" },
    { label: "蛋白质", value: "6.0 g" },
    { label: "脂肪", value: "33.0 g" },
    { label: "碳水化合物", value: "54.0 g" },
    { label: "钠", value: "598 mg" },
  ],
  riskSummary: { low: 2, medium: 1, high: 0 },
};

module.exports = {
  RISK_LEVELS,
  RECIPE_FILTERS,
  ADDITIVE_ICONS,
  SAFETY_GRADES,
  INGREDIENT_CATEGORIES,
  ADDITIVES,
  INGREDIENTS,
  RECIPES,
  STANDARDS,
  BASKET_SEED,
  PACK_RESULT_DEMO,
};