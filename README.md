# 食察局 · AI 食品助手（微信小程序）

专注食品赛道的 AI 工具型小程序：预包装食品配料解读、生鲜果蔬识别与选购技巧、
菜篮子保质期管理、智能食谱推荐，打通「超市买菜 → 居家做饭」全链路。

> 开发边界、合规红线、数据库表设计、分阶段计划见团队文档《食察局 项目内部开发说明书》。
> 本仓库只承载可运行代码。

## 一、目录结构

```
Food/
├─ cloudfunctions/              云函数（quickstartFunctions：示例 / AI 调用入口）
├─ miniprogram/
│  ├─ app.js / app.json         云开发初始化、13 个页面注册、tabBar
│  ├─ app.wxss                  全局设计令牌 + 全局样式入口
│  ├─ common.wxss               全站通用骨架与组件样式（页面通过 app.wxss 继承）
│  ├─ data/knowledge.js         知识库演示数据（添加剂/食材/菜谱/国标/菜篮子）
│  ├─ utils/
│  │  ├─ constants.js           固定文案与入口配置（含统一免责话术）
│  │  ├─ router.js              跳转封装（自动区分 tabBar 与普通页面）
│  │  ├─ basket.js              菜篮子数据层（本地缓存，后续换云数据库）
│  │  └─ domain.js              领域工具：取数、展示映射、剩余天数、食谱匹配
│  ├─ components/
│  │  ├─ noticeBar/             统一免责声明条（全站唯一合规文案出口）
│  │  └─ additiveSheet/         添加剂详情弹窗（页面 03）
│  ├─ pages/                    页面（见下方清单）
│  └─ images/                   图标与插画素材
└─ docs/                        设计稿与实现预览图
```

## 二、页面清单与实现状态

| # | 页面 | 路径 | 状态 |
| --- | --- | --- | --- |
| 01 | 首页（品牌头图 + 两大识别入口 + 快捷入口） | `pages/index/index` | 已完成 |
| 02 | 包装食品识别结果页（产品卡 + 综合评价徽标 / 配料分析 / 营养成分 / 添加剂解读 / 执行标准 / 风险评估） | `pages/analysis/index` | 已完成（v2 改版） |
| 03 | 添加剂详情弹窗（是什么 / 常见使用场景四宫格 / 参考摄入建议 / 相关标准 / 安全性评估） | `components/additiveSheet`（组件）+ `pages/additive/index`（独立页） | 已完成（v2 改版） |
| 04 | 生鲜果蔬识别结果页（识别卡 + 新鲜选择徽标 / 选购技巧编号列表 / 保鲜时长 / 营养价值） | `pages/fresh/index` | 已完成（v2 改版） |
| 05 | 菜篮子管理页（分类筛选 / 真实食材图 / 品类彩色标签 / 临期状态 / 剩余天数高亮 / 添加食材） | `pages/basket/index` | 已完成（v2 改版） |
| 06 | 食谱推荐页（菜篮子推荐横幅 / 食材速览 / 分类筛选 / 匹配卡片 / 可直接做标记 / 换一批） | `pages/recipe/list/index` | 已完成（v2 改版） |
| 07 | 食谱详情页（食材勾选 / 步骤 / 小贴士） | `pages/recipe/detail/index` | 已完成 |
| 08 | 我的 · 关于食察局（用户卡 / 四个数据入口 / 八项功能菜单） | `pages/mine/index` | 已完成（v2 改版，合并原「关于」页） |
| 09 | 发现页（内容入口 + 食材选购速查） | `pages/discover/index` | 已完成 |
| — | 参考的国家标准 | `pages/standard/index` | 已完成 |
| — | 拍照识别过渡页（演示数据 + 手动录入兜底） | `pages/scan/index` | 演示版 |
| — | 云开发示例页（可随时删除） | `pages/example/index` | 保留 |

底部导航：首页 / 菜篮子 / 发现 / 我的。

## 三、关键约定（务必遵守）

1. **AI 只做感知与表达**：图像识别只输出食材名称、OCR 只提取文字、大模型只做通俗化润色；
   风险等级、参考保质期、菜谱步骤等判定全部取自 `data/knowledge.js`（后续换成云数据库集合）。
2. **知识判定需要人工核对**：`data/knowledge.js` 中的风险分级、参考时长、国标编号目前是
   **界面演示样例**，上线前必须按真实国标逐条人工核对，禁止直接用 AI 生成结果。
3. **合规文案统一出口**：所有免责与科普提示走 `notice-bar` 组件（文案在 `utils/constants.js`），
   不得出现「绝对安全 / 一定有害」等绝对性表述，不得涉及医疗内容。
4. **改菜篮子种子数据必须升版本号**：菜篮子落在 `wx.setStorageSync` 本地缓存里，一旦写入就不会再读种子数据。
   调整 `data/knowledge.js` 的 `BASKET_SEED`（增删条目、换图片）后，务必把 `utils/basket.js` 的
   `DATA_VERSION` 加 1，否则已打开过小程序的设备会一直显示旧数据；素材重命名时同时补 `IMAGE_MIGRATION`。
5. **剩余保质期计算待固化**：`utils/domain.js#calcRemaining` 为骨架实现（取常温参考区间下限），
   属于核心业务逻辑，需人工确认规则后重写并补测试。
6. **页面留白与卡片尺寸**：设计基准 750rpx，页面左右留白 12rpx，卡片宽 726rpx，圆角 26rpx；
   颜色与间距统一使用 `app.wxss` 中的 CSS 变量。

## 四、前后端对接位置（阶段 3）

| 能力 | 当前实现 | 对接位置 |
| --- | --- | --- |
| OCR 提取配料文字 | 演示数据 | `pages/scan/index.js` → 云函数 → `pages/analysis/index.js#loadResult` |
| 多模态识别食材名 | 演示数据 | `pages/scan/index.js` → 云函数 → `pages/fresh/index.js#onLoad` |
| 菜篮子读写 | 本地缓存 | `utils/basket.js`（换成 user_basket 集合，对外接口不变） |
| 知识库查询 | 本地 js 数据 | `data/knowledge.js`（换成云数据库查询，字段已对齐表设计） |
| 食谱匹配排序 | 本地算法 | `utils/domain.js#matchRecipes` |

## 五、本地运行

1. 用微信开发者工具导入本目录（AppID：`wx0be4e315664de487`）。
2. 在 `miniprogram/app.js` 中把 `globalData.env` 填成自己的云开发环境 ID。
3. 编译运行，首页 → 两大识别入口 → 结果页 → 加入菜篮子 → 智能食谱，全链路可走通。

## 六、开发辅助脚本（`.tools/`，不参与打包）

| 脚本 | 用途 |
| --- | --- |
| `gen_assets.py` | 生成 tabBar / 相机 / 快捷入口 / Logo 等图标素材（Pillow） |
| `gen_content_images.py` | 生成产品、食材、菜品占位插画，接入真实素材后覆盖同名文件即可 |
| `preview.js` | 把真实 WXML/WXSS 渲染成 1:1 HTML，用于和设计稿比对 |
| `place_photos.py` | 把实拍照片按各页面展示尺寸裁剪压缩后落到 `images/`（换真实图时改这里） |

截图对比见 `docs/all-pages-preview.png`，首页对比见 `docs/home-design-vs-impl.png`。

设计稿存档：
- `docs/ui-all-pages.png`（首版 8 屏）
- `docs/ui-pack-result-v2.png`（包装识别页 v2）
- `docs/ui-fresh-result-v2.png`（生鲜识别页 v2）
- `docs/ui-additive-v2.png`（添加剂详情页 v2）
- `docs/ui-basket-v2.png`（菜篮子页 v2）
- `docs/ui-recipe-list-v2.png`（食谱推荐页 v2）
- `docs/ui-about-v2.png`（关于食察局页 v2）

> 尺寸基准（按 v2 设计稿统一）：页面宽 750rpx，卡片宽 726rpx、圆角 26rpx；
> 列表行内边距 26rpx、缩略图 140rpx；主标题 34~40rpx，正文 26~28rpx，标签 24rpx。
> 所有 rpx 换算为 375px 设备宽下 1rpx = 0.5px，与设计稿比例一致。

> 注：`tools/preview.js` 是把真实 WXML/WXSS 渲染成 HTML 再截图的开发辅助工具，
> 用于在无法打开微信开发者工具的环境下核对设计还原度；小程序运行时完全不依赖它。