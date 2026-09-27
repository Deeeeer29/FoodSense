/**
 * preview.js —— 开发辅助：把 WXML/WXSS 渲染成 1:1 的 HTML 预览
 *
 * 用法：node .tools/preview.js
 *   读取 miniprogram 下真实的 .wxml / .wxss（含 app.wxss、common.wxss、组件样式），
 *   按页面数据快照渲染成 HTML，再用无头浏览器截图，用于和设计稿比对。
 * 说明：仅用于设计还原度检查，不参与小程序运行。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'miniprogram');
const OUT = path.join(__dirname, '..', '.tmp_preview');
const IMG_BASE = 'file:///E:/code/Food/miniprogram/images/';

let skippedFlag = false;

function rpx2px(css) {
  return String(css).replace(/(-?\d*\.?\d+)rpx/g, function (_m, n) {
    return parseFloat(n) * 0.5085 + 'px';
  });
}

function parseAttrs(str) {
  const attrs = {};
  // 带值属性
  const re = /([:\w.-]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(str))) attrs[m[1]] = m[2];
  // 无值属性（wx:else、hidden 等）：WXML 中 wx:else 不带值，必须单独识别
  const bare = /(^|\s)([:\w.-]+)(?=\s|$)/g;
  const stripped = str.replace(/([:\w.-]+)\s*=\s*"[^"]*"/g, ' ');
  while ((m = bare.exec(stripped))) {
    const name = m[2];
    if (name && attrs[name] === undefined) attrs[name] = '';
  }
  return attrs;
}

const VOID_TAGS = ['input', 'image', 'icon', 'br', 'hr', 'img'];

function parseTemplate(src, start, end) {
  const root = { name: 'root', attrs: {}, children: [] };
  const stack = [root];
  let i = start;
  while (i < end) {
    const lt = src.indexOf('<', i);
    if (lt < 0 || lt >= end) {
      const txt = src.slice(i, end);
      if (txt.trim()) stack[stack.length - 1].children.push({ name: '#text', text: txt });
      break;
    }
    if (lt > i) {
      const txt = src.slice(i, lt);
      if (txt.trim()) stack[stack.length - 1].children.push({ name: '#text', text: txt });
    }
    if (src.startsWith('<!--', lt)) {
      const close = src.indexOf('-->', lt);
      i = close < 0 ? end : close + 3;
      continue;
    }
    const gt = src.indexOf('>', lt);
    if (gt < 0) break;
    let head = src.slice(lt + 1, gt);
    let selfClose = false;
    if (head.endsWith('/')) {
      selfClose = true;
      head = head.slice(0, -1);
    }
    const isClose = head.startsWith('/');
    const nameMatch = head.replace(/^\//, '').match(/^([\w-]+)/);
    const name = nameMatch ? nameMatch[1] : '';
    if (!name) {
      i = gt + 1;
      continue;
    }
    if (isClose) {
      if (stack.length > 1) stack.pop();
      i = gt + 1;
      continue;
    }
    const attrs = parseAttrs(head);
    const node = { name, attrs, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!selfClose && VOID_TAGS.indexOf(name) < 0) stack.push(node);
    i = gt + 1;
  }
  return root;
}

function evalExpr(expr, ctx) {
  const fn = new Function(
    'ctx',
    'with (ctx) { try { return (' + expr + '); } catch (e) { return undefined; } }'
  );
  return fn(ctx);
}

function interpolate(text, ctx) {
  return text.replace(/\{\{([\s\S]+?)\}\}/g, function (_all, expr) {
    const v = evalExpr(expr.trim(), ctx);
    return v === undefined || v === null ? '' : String(v);
  });
}

/**
 * 渲染同级节点，并正确处理 wx:if / wx:elif / wx:else 兄弟链。
 *
 * 关键点：链命中状态必须随父级下传，否则「外层 wx:if 命中的 block」内部的
 * 内层 wx:else 会被无条件渲染（例如配料分析 tab 里误渲染执行标准说明）。
 *
 * @param {boolean} inheritedSat 父级链是否已命中（命中则本条链整体跳过）
 * @returns {{html: string, sat: boolean}} 渲染结果与链命中状态
 */
/**
 * 预扫描：为每个节点标注它在 if/elif/else 链中的归属。
 * chainId 相同的节点属于同一条链；非条件节点各自独立（chainId=-1）。
 * 这样后续渲染时，链内已命中分支之后的节点直接跳过，链外节点不受影响。
 */
function annotateChains(nodes) {
  const info = [];
  let currentChain = 0;
  let prevWasChain = false;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.name === '#text' && !String(node.text || '').trim()) {
      info.push({ chainId: -1, role: 'text' });
      continue; // 纯空白不打断链
    }
    const a = node.attrs || {};
    const isIf = a['wx:if'] !== undefined;
    const isElif = a['wx:elif'] !== undefined;
    const isElse = a['wx:else'] !== undefined;
    if (isIf) {
      currentChain += 1;
      info.push({ chainId: currentChain, role: 'if' });
      prevWasChain = true;
      continue;
    }
    if ((isElif || isElse) && prevWasChain) {
      info.push({ chainId: currentChain, role: isElif ? 'elif' : 'else' });
      prevWasChain = true;
      continue;
    }
    info.push({ chainId: -1, role: 'plain' });
    if (!(isElif || isElse)) prevWasChain = false;
    else prevWasChain = false; // 孤立的 elif/else 不参与任何链
  }
  return info;
}

function renderNodes(nodes, ctx, inheritedSat) {
  const info = annotateChains(nodes);
  const takenChains = {};
  let html = '';
  for (let idx = 0; idx < nodes.length; idx++) {
    const node = nodes[idx];
    if (node.name === '#text' && !String(node.text || '').trim()) {
      html += node.text || '';
      continue;
    }
    const meta = info[idx];
    const attrs = node.attrs || {};
    if (meta.chainId > 0) {
      if (inheritedSat || takenChains[meta.chainId]) continue;
      let cond = true;
      if (attrs['wx:if'] !== undefined) {
        cond = !!evalExpr(attrs['wx:if'].replace(/^\{\{|\}\}$/g, ''), ctx);
      } else if (attrs['wx:elif'] !== undefined) {
        cond = !!evalExpr(attrs['wx:elif'].replace(/^\{\{|\}\}$/g, ''), ctx);
      }
      if (!cond) continue;
      takenChains[meta.chainId] = true;
      const r = renderNode({ name: node.name, attrs: stripIf(attrs), children: node.children }, ctx, false);
      html += typeof r === 'string' ? r : r.html;
      continue;
    }
    const res = renderNode(node, ctx, false);
    html += typeof res === 'string' ? res : res.html;
  }
  return { html: html, sat: false };
}
function stripLoop(attrs) {
  const a = Object.assign({}, attrs);
  delete a['wx:for']; delete a['wx:for-item']; delete a['wx:for-index']; delete a['wx:key'];
  return a;
}

function stripIf(attrs) {
  const a = Object.assign({}, attrs);
  delete a['wx:if']; delete a['wx:elif']; delete a['wx:else'];
  return a;
}

function renderNode(node, ctx) {
  if (node.name === '#text') return interpolate(node.text, ctx);
  if (node.name === 'wxs' || node.name === 'import' || node.name === 'include') return { html: '', sat: false };

  const attrs = node.attrs || {};

  if (attrs['wx:for'] !== undefined) {
    const list = evalExpr(attrs['wx:for'].replace(/^\{\{|\}\}$/g, ''), ctx) || [];
    const itemName = attrs['wx:for-item'] || 'item';
    const indexName = attrs['wx:for-index'] || 'index';
    let out = '';
    list.forEach(function (item, index) {
      const child = Object.assign({}, ctx);
      child[itemName] = item;
      child[indexName] = index;
      const r = renderNode({ name: node.name, attrs: stripLoop(attrs), children: node.children }, child, true);
      out += typeof r === 'string' ? r : r.html;
    });
    return { html: out, sat: true };
  }

  const innerRes = renderNodes(node.children, ctx, false);
  const inner = innerRes.html;
  const wrap = (markup) => ({ html: markup, sat: innerRes.sat });

  if (node.name === 'notice-bar') {
    const mode = attrs.mode || 'card';
    const content =
      mode === 'block'
        ? '本小程序所有识别结果与解读内容仅作为日常选购的科普参考，不构成任何专业性判定或建议；保质期类信息均为通用参考时长，实际存放时间受储存环境影响，请以实物为准。'
        : '内容仅作日常选购科普参考，具体以商品标签及实物为准';
    const cls = ['notice', 'notice--' + mode, attrs.class || ''].join(' ').trim();
    return '<div class="' + cls + '"><div class="notice__icon">i</div><span class="notice__text">' + content + '</span></div>';
  }
  if (node.name === 'additive-sheet') return '';

  const tagMap = { view: 'div', text: 'span', block: 'div', 'scroll-view': 'div', image: 'img', button: 'div', input: 'input' };
  const tag = tagMap[node.name] || 'div';

  const cls = attrs.class ? interpolate(attrs.class, ctx) : '';
  const style = attrs.style ? rpx2px(interpolate(attrs.style, ctx)) : '';
  const parts = [];
  if (cls.trim()) parts.push('class="' + cls.trim() + '"');
  if (style.trim()) parts.push('style="' + style.trim() + '"');

  if (node.name === 'image') {
    let src = (attrs.src || '').trim();
    src = src.replace(/\{\{([\s\S]+?)\}\}/g, function (_a, e) {
      const v = evalExpr(e.trim(), ctx);
      return v === undefined || v === null ? '' : String(v);
    });
    parts.push('src="' + IMG_BASE + String(src).replace(/^\/images\//, '') + '"');
    return '<img ' + parts.join(' ') + ' />';
  }
  if (node.name === 'input') {
    return '<input ' + parts.join(' ') + ' placeholder="' + (attrs.placeholder || '') + '" />';
  }
  return '<' + tag + ' ' + parts.join(' ') + '>' + inner + '</' + tag + '>';
}

function renderWxml(file, ctx) {
  const src = fs.readFileSync(file, 'utf8');
  const tree = parseTemplate(src, 0, src.length);
  return renderNodes(tree.children, ctx, false).html;
}

function wxss() {
  const files = Array.prototype.slice.call(arguments);
  return files
    .filter(function (f) { return fs.existsSync(f); })
    .map(function (f) { return rpx2px(fs.readFileSync(f, 'utf8')); })
    .join('\n');
}

function styles() {
  const extra = Array.prototype.slice.call(arguments);
  return wxss.apply(null, [
    path.join(ROOT, 'app.wxss'),
    path.join(ROOT, 'common.wxss'),
    path.join(ROOT, 'components', 'noticeBar', 'index.wxss'),
    path.join(ROOT, 'components', 'additiveSheet', 'index.wxss'),
  ].concat(extra));
}

function shell(cfg) {
  const tabs = [
    { text: '首页', icon: 'tab-home', active: false },
    { text: '菜篮子', icon: 'tab-basket', active: false },
    { text: '发现', icon: 'tab-discover', active: false },
    { text: '我的', icon: 'tab-user', active: false },
  ];
  if (cfg.tabbar) tabs.forEach(function (t) { t.active = t.text === cfg.tabbar; });
  const tabHtml = cfg.tabbar
    ? '<div class="tabbar">' + tabs.map(function (t) {
        return '<div class="tabbar__item ' + (t.active ? 'tabbar__item--active' : '') + '"><img src="' + IMG_BASE + t.icon + (t.active ? '-active' : '') + '.png"><span>' + t.text + '</span></div>';
      }).join('') + '</div>'
    : '';
  const navColor = cfg.navColor || '#FFFFFF';
  const navText = cfg.navText || '#000000';
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">\n<style>\n' +
    '  * { box-sizing: border-box; }\n' +
    '  body { margin: 0; width: 390px; background: #F4F6F3; font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; }\n' +
    '  .navbar { height: 44px; background: ' + navColor + '; color: ' + navText + '; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 600; position: relative; }\n' +
    '  .navbar__back { position: absolute; left: 12px; top: 0; line-height: 44px; font-size: 20px; }\n' +
    '  .navbar__status { position: absolute; left: 12px; top: 10px; font-size: 12px; font-weight: 600; }\n' +
    '  .navbar__capsule { position: absolute; right: 10px; top: 9px; width: 87px; height: 26px; border: 1px solid #EDEDED; border-radius: 13px; background: rgba(255,255,255,.7); display: flex; align-items: center; justify-content: space-around; color: #333; font-size: 12px; }\n' +
    '  .navbar__capsule i { font-style: normal; letter-spacing: 1px; }\n' +
    '  .tabbar { display: flex; height: 50px; background: #FFF; border-top: 1px solid #F0F0F0; }\n' +
    '  .tabbar__item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }\n' +
    '  .tabbar__item img { width: 22px; height: 22px; }\n' +
    '  .tabbar__item span { margin-top: 2px; font-size: 10px; color: #969CA0; }\n' +
    '  .tabbar__item--active span { color: #1FA84B; }\n' +
    '</style>\n<style>' + cfg.css + '</style>\n</head><body>\n' +
    '<div class="navbar">' + (cfg.back === false ? '' : '<span class="navbar__back">‹</span>') +
    '<span class="navbar__status">9:41</span>' + cfg.title +
    '<div class="navbar__capsule"><i>···</i><i>◎</i></div></div>\n' +
    '<div class="page">' + cfg.html + '</div>\n' + tabHtml + '\n</body></html>';
}

const knowledge = require(path.join(ROOT, 'data', 'knowledge.js'));
const domain = require(path.join(ROOT, 'utils', 'domain.js'));
const constants = require(path.join(ROOT, 'utils', 'constants.js'));

const basketItems = knowledge.BASKET_SEED.map(function (i) {
  return domain.decorateBasketItem(Object.assign({}, i, { categoryLabel: knowledge.INGREDIENT_CATEGORIES[i.category] || '其他' }));
});

const pages = {
  '02-pack-result': {
    file: 'pages/analysis/index.wxml', title: '配料解读',
    css: styles(path.join(ROOT, 'pages', 'analysis', 'index.wxss')),
    data: function () {
      return {
        product: knowledge.PACK_RESULT_DEMO.product,
        productMeta: [
          { label: '品牌', value: knowledge.PACK_RESULT_DEMO.product.brand },
          { label: '净含量', value: knowledge.PACK_RESULT_DEMO.product.netWeight },
          { label: '执行标准', value: knowledge.PACK_RESULT_DEMO.product.standard },
        ],
        ingredientsText: knowledge.PACK_RESULT_DEMO.ingredientsText,
        additives: domain.getAdditiveList(knowledge.PACK_RESULT_DEMO.additiveIds),
        nutritionCells: knowledge.PACK_RESULT_DEMO.nutrition.map(function (n) { return domain.parseNutrition(n); }),
        standards: knowledge.STANDARDS,
        safetyGrade: domain.getSafetyGrade(knowledge.PACK_RESULT_DEMO.safetyGrade),
        riskCards: domain.getRiskCards(knowledge.PACK_RESULT_DEMO.riskSummary),
        tabs: [{ key: 'ingredient', label: '配料分析' }, { key: 'nutrition', label: '营养成分' }, { key: 'additive', label: '添加剂解读' }, { key: 'standard', label: '执行标准' }],
        activeTab: 'ingredient',
      };
    },
  },
  '04-fresh-result': {
    file: 'pages/fresh/index.wxml', title: '果蔬识别',
    css: styles(path.join(ROOT, 'pages', 'fresh', 'index.wxss')),
    data: function () {
      return {
        ingredient: domain.getIngredient('tomato'), confidence: 98,
        tabs: [{ key: 'tips', label: '选购技巧' }, { key: 'storage', label: '保鲜时长' }, { key: 'nutrition', label: '营养价值' }],
        activeTab: 'tips',
      };
    },
  },
  '05-basket': {
    file: 'pages/basket/index.wxml', title: '我的菜篮子', tabbar: '菜篮子',
    css: styles(path.join(ROOT, 'pages', 'basket', 'index.wxss')),
    data: function () {
      return {
        categories: [{ key: 'all', label: '全部' }].concat(Object.keys(knowledge.INGREDIENT_CATEGORIES).map(function (k) {
          return { key: k, label: knowledge.INGREDIENT_CATEGORIES[k] };
        })),
        activeCategory: 'all', items: basketItems,
      };
    },
  },
  '06-recipe-list': {
    file: 'pages/recipe/list/index.wxml', title: '食谱推荐',
    css: styles(path.join(ROOT, 'pages', 'recipe', 'list', 'index.wxss')),
    data: function () {
      const items = knowledge.BASKET_SEED;
      const ownedList = [];
      const seen = {};
      items.forEach(function (i) {
        if (!i.ingredientId || seen[i.ingredientId]) return;
        const thumb = domain.thumbFor(i.ingredientId);
        if (!thumb) return;
        seen[i.ingredientId] = true;
        ownedList.push({ id: i.id, ingredientId: i.ingredientId, name: i.name, thumb: thumb });
      });
      return {
        filters: knowledge.RECIPE_FILTERS, activeFilter: 'all',
        recipes: domain.matchRecipes(items, '', 'all'),
        ownedList: ownedList,
        cookableCount: domain.countCookable(items),
      };
    },
  },
  '07-recipe-detail': {
    file: 'pages/recipe/detail/index.wxml', title: '番茄炒鸡蛋',
    css: styles(path.join(ROOT, 'pages', 'recipe', 'detail', 'index.wxss')),
    data: function () {
      const recipe = domain.getRecipe('tomato-egg');
      const rows = recipe.ingredients.map(function (ing) {
        const meta = domain.getIngredient(ing.id);
        return { name: ing.name, amount: ing.amount, owned: true, image: meta && meta.image };
      });
      return { recipe: recipe, ingredientRows: rows, matchedCount: rows.length, fav: true };
    },
  },
  '08-about': {
    file: 'pages/mine/index.wxml', title: '关于食察局', tabbar: '我的', back: false,
    css: styles(path.join(ROOT, 'pages', 'mine', 'index.wxss')),
    data: function () {
      return {
        userName: '小食同学', userId: '12345678', userLevel: '普通用户', version: '1.0.0',
        stats: [
          { key: 'favorite', label: '我的收藏', value: 12, icon: '/images/stat-favorite.png' },
          { key: 'basket', label: '我的菜篮子', value: knowledge.BASKET_SEED.length, icon: '/images/stat-basket.png' },
          { key: 'recipe', label: '我的食谱', value: knowledge.RECIPES.length, icon: '/images/stat-recipe.png' },
          { key: 'history', label: '浏览记录', value: 32, icon: '/images/stat-history.png' },
        ],
        menus: [
          { key: 'account', label: '账号与安全', icon: '/images/menu-account.png' },
          { key: 'standard', label: '参考的国家标准', icon: '/images/menu-standard.png' },
          { key: 'disclaimer', label: '使用免责声明', icon: '/images/menu-disclaimer.png' },
          { key: 'feedback', label: '意见反馈', icon: '/images/menu-feedback.png' },
          { key: 'faq', label: '常见问题', icon: '/images/menu-faq.png' },
          { key: 'privacy', label: '隐私政策', icon: '/images/menu-privacy.png' },
          { key: 'agreement', label: '服务协议', icon: '/images/menu-agreement.png' },
          { key: 'contact', label: '联系我们', icon: '/images/menu-contact.png' },
        ],
      };
    },
  },
  '01-home': {
    file: 'pages/index/index.wxml', title: '食察局', tabbar: '首页', back: false,
    css: styles(path.join(ROOT, 'pages', 'index', 'index.wxss')),
    data: function () { return { quickEntries: constants.QUICK_ENTRIES, basketCount: 4 }; },
  },
  '09-discover': {
    file: 'pages/discover/index.wxml', title: '发现', tabbar: '发现', back: false,
    css: styles(path.join(ROOT, 'pages', 'discover', 'index.wxss')),
    data: function () {
      return {
        blocks: [
          { key: 'fresh', badge: '果蔬', title: '生鲜选购技巧', desc: '看外观、摸手感、闻气味，挑到新鲜食材' },
          { key: 'additive', badge: '配料', title: '添加剂科普', desc: '常见添加剂的作用、风险分级与国标来源' },
          { key: 'recipe', badge: '食谱', title: '智能食谱推荐', desc: '按菜篮子现有食材推荐能做的家常菜' },
          { key: 'standard', badge: '标准', title: '参考的国家标准', desc: '本小程序引用的国标编号与适用范围' },
        ],
        ingredients: knowledge.INGREDIENTS,
      };
    },
  },
};

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  Object.keys(pages).forEach(function (name) {
    const cfg = pages[name];
    const html = renderWxml(path.join(ROOT, cfg.file), cfg.data());
    const out = shell({ title: cfg.title, navColor: cfg.navColor, navText: cfg.navText, html: html, css: cfg.css, tabbar: cfg.tabbar, back: cfg.back });
    fs.writeFileSync(path.join(OUT, name + '.html'), out);
    console.log('  ' + name + '.html');
  });

  // 03 添加剂弹窗：弹窗叠加在结果页之上
  const under = renderWxml(path.join(ROOT, 'pages', 'analysis', 'index.wxml'), pages['02-pack-result'].data());
  // 组件的风险文案由 observer 生成，预览里直接给出等价数据
  const sheetAdd = domain.decorateAdditive(domain.getAdditive('tbhq'));
  const sheetLevel = knowledge.RISK_LEVELS[sheetAdd.risk] || knowledge.RISK_LEVELS.unknown;
  const sheet = renderWxml(path.join(ROOT, 'components', 'additiveSheet', 'index.wxml'), {
    show: true,
    additive: sheetAdd,
    standardText: sheetAdd.standardText,
    riskTitle: sheetLevel.title,
    riskColor: sheetLevel.color,
    riskBg: sheetLevel.bg,
    riskShield: sheetLevel.shield,
    riskAssessment: sheetLevel.assessment,
    tip: '内容仅作日常选购科普参考，具体以商品标签及实物为准',
  });
  fs.writeFileSync(
    path.join(OUT, '03-additive.html'),
    shell({ title: '配料解读', html: under + sheet, css: pages['02-pack-result'].css, tabbar: false })
  );
  console.log('  03-additive.html');
}

main();