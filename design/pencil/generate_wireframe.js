const fs = require("fs");
const path = require("path");

const OUT_DIR = __dirname;
const CANVAS_W = 1800;
const CANVAS_H = 2860;
const PHONE_W = 375;
const PHONE_H = 812;
const MARGIN_X = 55;
const MARGIN_Y = 120;
const GAP_X = 70;
const GAP_Y = 110;

const C = {
  bg: "#F4F1EA",
  ink: "#24302B",
  muted: "#70756F",
  line: "#D4D8D0",
  panel: "#FFFFFF",
  paper: "#FDFCF8",
  pale: "#EEF5EB",
  accent: "#2F7D52",
  accent2: "#A6B75E",
  warning: "#B95E3B",
  dark: "#17251E",
  blue: "#355C7D"
};

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(attrs = {}) {
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}="${esc(v)}"`)
    .join(" ");
}

function el(name, attrs = {}, children = "") {
  const a = attr(attrs);
  if (children === "") return `<${name}${a ? " " + a : ""}/>`;
  return `<${name}${a ? " " + a : ""}>${children}</${name}>`;
}

function rect(x, y, w, h, opts = {}) {
  return el("rect", {
    x, y, width: w, height: h,
    rx: opts.r ?? 8,
    fill: opts.fill ?? C.panel,
    stroke: opts.stroke ?? C.line,
    "stroke-width": opts.sw ?? 1,
    opacity: opts.opacity
  });
}

function line(x1, y1, x2, y2, opts = {}) {
  return el("line", {
    x1, y1, x2, y2,
    stroke: opts.stroke ?? C.line,
    "stroke-width": opts.sw ?? 1,
    "stroke-linecap": "round",
    "stroke-dasharray": opts.dash
  });
}

function text(x, y, value, opts = {}) {
  return el("text", {
    x, y,
    fill: opts.fill ?? C.ink,
    "font-family": opts.family ?? "Microsoft YaHei, Noto Sans SC, PingFang SC, sans-serif",
    "font-size": opts.size ?? 14,
    "font-weight": opts.weight ?? 400,
    "text-anchor": opts.anchor,
    "letter-spacing": 0
  }, esc(value));
}

function multiText(x, y, lines, opts = {}) {
  const size = opts.size ?? 14;
  const gap = opts.gap ?? Math.round(size * 1.55);
  return lines.map((lineText, i) => text(x, y + i * gap, lineText, opts)).join("\n");
}

function pill(x, y, w, label, opts = {}) {
  const selected = !!opts.selected;
  return [
    rect(x, y, w, 32, {
      r: 16,
      fill: selected ? C.accent : opts.fill ?? C.paper,
      stroke: selected ? C.accent : C.line
    }),
    text(x + w / 2, y + 21, label, {
      size: 13,
      weight: selected ? 700 : 400,
      fill: selected ? "#FFFFFF" : C.ink,
      anchor: "middle"
    })
  ].join("\n");
}

function button(x, y, w, label, opts = {}) {
  const primary = opts.primary !== false;
  return [
    rect(x, y, w, opts.h ?? 46, {
      r: 8,
      fill: primary ? C.accent : C.paper,
      stroke: primary ? C.accent : C.line
    }),
    text(x + w / 2, y + 29, label, {
      size: 15,
      weight: 700,
      fill: primary ? "#FFFFFF" : C.ink,
      anchor: "middle"
    })
  ].join("\n");
}

function optionCard(x, y, w, h, title, sub, opts = {}) {
  const selected = !!opts.selected;
  const mark = selected ? [
    el("circle", { cx: x + w - 22, cy: y + 22, r: 10, fill: C.accent }),
    text(x + w - 22, y + 27, "✓", { size: 13, fill: "#FFFFFF", anchor: "middle", weight: 700 })
  ].join("\n") : "";
  return [
    rect(x, y, w, h, {
      r: 8,
      fill: selected ? C.pale : C.panel,
      stroke: selected ? C.accent : C.line,
      sw: selected ? 1.5 : 1
    }),
    text(x + 16, y + 28, title, { size: 15, weight: 700 }),
    sub ? text(x + 16, y + 52, sub, { size: 12, fill: C.muted }) : "",
    mark
  ].join("\n");
}

function sectionTitle(x, y, title, sub) {
  return [
    text(x, y, title, { size: 22, weight: 800 }),
    sub ? multiText(x, y + 28, Array.isArray(sub) ? sub : [sub], { size: 13, fill: C.muted, gap: 19 }) : ""
  ].join("\n");
}

function progress(x, y, step, total = 7) {
  const w = 160;
  const filled = Math.round(w * step / total);
  return [
    rect(x, y, w, 6, { r: 3, fill: "#E5E7E1", stroke: "none" }),
    rect(x, y, filled, 6, { r: 3, fill: C.accent, stroke: "none" }),
    text(x + w + 14, y + 9, `${step}/${total}`, { size: 12, fill: C.muted })
  ].join("\n");
}

function navBar(x, y, label, step) {
  return [
    text(x + 22, y + 51, "9:41", { size: 12, weight: 700 }),
    rect(x + 308, y + 39, 26, 10, { r: 3, fill: "none", stroke: C.ink }),
    rect(x + 336, y + 42, 3, 4, { r: 1, fill: C.ink, stroke: "none" }),
    text(x + 22, y + 88, "‹", { size: 26, weight: 700 }),
    text(x + PHONE_W / 2, y + 84, label, { size: 16, weight: 700, anchor: "middle" }),
    step ? progress(x + 108, y + 104, step) : ""
  ].join("\n");
}

function phoneShell(x, y, title, step, body) {
  return [
    text(x, y - 22, title, { size: 16, weight: 800, fill: C.dark }),
    rect(x, y, PHONE_W, PHONE_H, { r: 28, fill: C.dark, stroke: C.dark, sw: 2 }),
    rect(x + 9, y + 9, PHONE_W - 18, PHONE_H - 18, { r: 22, fill: C.paper, stroke: "none" }),
    navBar(x + 9, y + 9, title.replace(/^\d+\.\s*/, ""), step),
    el("g", { transform: `translate(${x + 28}, ${y + 130})` }, body),
    line(x + 139, y + PHONE_H - 22, x + 236, y + PHONE_H - 22, { stroke: "#BFC6BD", sw: 4 })
  ].join("\n");
}

function bottomCta(primary = "下一步", secondary = "") {
  return [
    button(0, 617, 319, primary, { primary: true }),
    secondary ? text(160, 686, secondary, { anchor: "middle", size: 13, fill: C.muted }) : ""
  ].join("\n");
}

function welcome() {
  return [
    rect(0, 0, 319, 86, { r: 8, fill: C.pale, stroke: "none" }),
    text(18, 34, "先设规则，再开始执行", { size: 18, weight: 800, fill: C.accent }),
    text(18, 61, "3 分钟生成一份可提醒、可记录、可复盘的定投计划", { size: 12, fill: C.muted }),
    sectionTitle(0, 128, "只需几步，创建你的定投计划", ["默认值可以直接使用，高级项后续再改。", "不做交易撮合，只帮你执行计划。"]),
    [
      ["1", "确定目标", "养老、教育金、长期增值"],
      ["2", "设置预算", "只用闲钱，不影响生活"],
      ["3", "定义规则", "低估多投，高估少投"]
    ].map(([n, t, s], i) => {
      const y = 248 + i * 70;
      return [
        el("circle", { cx: 20, cy: y + 19, r: 15, fill: i === 0 ? C.accent : "#E7EAE2" }),
        text(20, y + 24, n, { anchor: "middle", size: 13, weight: 800, fill: i === 0 ? "#FFFFFF" : C.muted }),
        text(48, y + 16, t, { size: 15, weight: 700 }),
        text(48, y + 39, s, { size: 12, fill: C.muted })
      ].join("\n");
    }).join("\n"),
    button(0, 557, 319, "开始设置", { primary: true }),
    text(84, 646, "查看示例", { size: 13, fill: C.accent, anchor: "middle", weight: 700 }),
    text(235, 646, "跳过", { size: 13, fill: C.muted, anchor: "middle" })
  ].join("\n");
}

function goal() {
  return [
    sectionTitle(0, 0, "你这次定投，是为了什么？", "不同目标会影响默认期限和卖出方式。"),
    optionCard(0, 86, 151, 78, "长期增值", "5 年以上更适合"),
    optionCard(168, 86, 151, 78, "养老准备", "偏稳健与现金流"),
    optionCard(0, 180, 151, 78, "教育金", "关注用钱时间"),
    optionCard(168, 180, 151, 78, "财务自由", "长期持有优先", { selected: true }),
    text(0, 302, "目标期限", { size: 15, weight: 700 }),
    pill(0, 326, 76, "3 年内"),
    pill(86, 326, 74, "3-5 年"),
    pill(170, 326, 82, "5 年以上", { selected: true }),
    pill(262, 326, 57, "未定"),
    text(0, 395, "目标描述（可选）", { size: 15, weight: 700 }),
    rect(0, 417, 319, 78, { r: 8, fill: "#FFFFFF" }),
    text(14, 447, "例如：10 年后覆盖家庭月支出", { size: 13, fill: C.muted }),
    rect(0, 525, 319, 54, { r: 8, fill: C.pale, stroke: "none" }),
    text(14, 548, "系统建议：默认采用长期持有 + 估值止盈提示", { size: 12, fill: C.accent, weight: 700 }),
    bottomCta()
  ].join("\n");
}

function budget() {
  return [
    sectionTitle(0, 0, "你每月准备投多少钱？", "这笔钱最好 3 年内不会用到。"),
    text(0, 86, "每月定投金额", { size: 15, weight: 700 }),
    rect(0, 110, 319, 58, { r: 8, fill: "#FFFFFF" }),
    text(16, 147, "¥ 3,000", { size: 24, weight: 800, fill: C.accent }),
    text(0, 205, "每月可支配结余（可选）", { size: 15, weight: 700 }),
    rect(0, 229, 319, 48, { r: 8, fill: "#FFFFFF" }),
    text(16, 260, "¥ 8,000", { size: 18, weight: 700 }),
    [
      ["已预留备用金", true],
      ["未来 3 年有大额支出", false]
    ].map(([label, on], i) => {
      const y = 312 + i * 64;
      return [
        rect(0, y, 319, 48, { r: 8, fill: "#FFFFFF" }),
        text(16, y + 30, label, { size: 14, weight: 700 }),
        rect(258, y + 13, 44, 22, { r: 11, fill: on ? C.accent : "#DCDDD8", stroke: "none" }),
        el("circle", { cx: on ? 288 : 272, cy: y + 24, r: 9, fill: "#FFFFFF" })
      ].join("\n");
    }).join("\n"),
    rect(0, 464, 319, 76, { r: 8, fill: "#FFF9EF", stroke: "#E4C98C" }),
    text(14, 490, "风险提示", { size: 13, weight: 800, fill: "#8A6222" }),
    multiText(14, 514, ["当前金额约为结余 37.5%。", "建议先从结余的一部分开始。"], { size: 12, fill: "#8A6222", gap: 18 }),
    bottomCta()
  ].join("\n");
}

function products() {
  return [
    sectionTitle(0, 0, "你想投哪类长期资产？", "先选长期更稳的品种，再开始定投。"),
    pill(0, 82, 76, "宽基", { selected: true }),
    pill(86, 82, 86, "策略加权"),
    pill(182, 82, 76, "行业"),
    pill(268, 82, 51, "组合"),
    optionCard(0, 132, 319, 82, "沪深300指数", "推荐：覆盖主流大盘资产", { selected: true }),
    optionCard(0, 228, 319, 82, "中证500指数", "可作为宽基补充"),
    optionCard(0, 324, 319, 82, "红利低波指数", "适合现金流偏好"),
    rect(0, 444, 319, 102, { r: 8, fill: C.pale, stroke: "none" }),
    text(14, 470, "推荐理由", { size: 14, weight: 800, fill: C.accent }),
    multiText(14, 497, ["宽基指数成分更分散，适合新手长期定投。", "V1.0 建议少而精，先从 1 个品种开始。"], { size: 12, fill: C.ink, gap: 19 }),
    bottomCta()
  ].join("\n");
}

function buyRule() {
  return [
    sectionTitle(0, 0, "越便宜，买得越多", "默认推荐定期不定额，降低临时决策。"),
    text(0, 86, "买入方式", { size: 15, weight: 700 }),
    pill(0, 112, 78, "固定"),
    pill(88, 112, 98, "定期不定额", { selected: true }),
    pill(196, 112, 76, "估值"),
    pill(282, 112, 37, "自定"),
    rect(0, 180, 319, 258, { r: 8, fill: "#FFFFFF" }),
    text(16, 210, "估值区间", { size: 13, fill: C.muted, weight: 700 }),
    text(160, 210, "投入比例", { size: 13, fill: C.muted, weight: 700 }),
    [
      ["低估", "基础金额 × 1.5", C.accent],
      ["正常", "基础金额 × 1.0", C.blue],
      ["高估", "暂停或 × 0.5", C.warning]
    ].map(([label, value, color], i) => {
      const y = 238 + i * 68;
      return [
        el("circle", { cx: 30, cy: y + 12, r: 10, fill: color }),
        text(50, y + 17, label, { size: 15, weight: 800 }),
        rect(154, y - 6, 135, 36, { r: 8, fill: "#F7F8F4" }),
        text(222, y + 17, value, { anchor: "middle", size: 13, weight: 700 }),
        line(16, y + 48, 303, y + 48)
      ].join("\n");
    }).join("\n"),
    rect(0, 470, 319, 62, { r: 8, fill: "#FFF9EF", stroke: "#E4C98C" }),
    text(14, 496, "高级配置已折叠", { size: 13, weight: 800, fill: "#8A6222" }),
    text(14, 518, "后续可调整每个区间的倍数。", { size: 12, fill: "#8A6222" }),
    bottomCta("应用默认规则并继续")
  ].join("\n");
}

function schedule() {
  return [
    sectionTitle(0, 0, "什么时候自动执行？", "固定时间执行，更容易坚持。"),
    text(0, 86, "定投频率", { size: 15, weight: 700 }),
    pill(0, 112, 74, "每周"),
    pill(84, 112, 74, "每月", { selected: true }),
    text(0, 176, "执行时间点", { size: 15, weight: 700 }),
    optionCard(0, 202, 319, 72, "发工资后第一个交易日", "默认推荐，减少犹豫", { selected: true }),
    optionCard(0, 288, 319, 72, "自定义日期", "每月固定某一天"),
    rect(0, 396, 319, 108, { r: 8, fill: C.pale, stroke: "none" }),
    text(14, 426, "下次执行时间", { size: 13, weight: 800, fill: C.accent }),
    text(14, 461, "2026-06-05 09:30", { size: 22, weight: 800 }),
    text(14, 488, "系统会在当日上午提醒", { size: 12, fill: C.muted }),
    bottomCta()
  ].join("\n");
}

function sellRule() {
  return [
    sectionTitle(0, 0, "什么时候考虑卖出？", "先定规则，再执行，不临时决定。"),
    optionCard(0, 86, 319, 72, "长期持有", "适合财务自由、现金流目标", { selected: true }),
    optionCard(0, 172, 319, 72, "估值止盈", "高估时分批卖出"),
    optionCard(0, 258, 319, 72, "收益率止盈", "适合短期用钱场景"),
    text(0, 374, "卖出后资金去向", { size: 15, weight: 700 }),
    rect(0, 400, 319, 48, { r: 8, fill: "#FFFFFF" }),
    text(16, 431, "保留现金，等待下一轮低估", { size: 14, weight: 700 }),
    rect(0, 486, 319, 68, { r: 8, fill: C.pale, stroke: "none" }),
    text(14, 512, "系统摘要", { size: 13, weight: 800, fill: C.accent }),
    text(14, 536, "未触发卖出条件前，只执行买入规则。", { size: 12, fill: C.ink }),
    bottomCta()
  ].join("\n");
}

function reminders() {
  return [
    sectionTitle(0, 0, "让系统帮你坚持下去", "提醒为执行服务，记录为复盘服务。"),
    [
      ["定投提醒", true, "每个执行日 08:30"],
      ["估值提醒", true, "进入低估/高估区间"],
      ["月度复盘提醒", false, "每月最后一个交易日"]
    ].map(([label, on, sub], i) => {
      const y = 86 + i * 70;
      return [
        rect(0, y, 319, 54, { r: 8, fill: "#FFFFFF" }),
        text(16, y + 23, label, { size: 14, weight: 800 }),
        text(16, y + 42, sub, { size: 11, fill: C.muted }),
        rect(258, y + 16, 44, 22, { r: 11, fill: on ? C.accent : "#DCDDD8", stroke: "none" }),
        el("circle", { cx: on ? 288 : 272, cy: y + 27, r: 9, fill: "#FFFFFF" })
      ].join("\n");
    }).join("\n"),
    text(0, 334, "记录字段", { size: 15, weight: 700 }),
    [
      ["日期", true], ["品种", true], ["买/卖", true],
      ["金额", true], ["估值", true], ["备注", false]
    ].map(([label, selected], i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      return pill(col * 106, 360 + row * 42, 96, label, { selected });
    }).join("\n"),
    rect(0, 482, 319, 64, { r: 8, fill: "#FFF9EF", stroke: "#E4C98C" }),
    text(14, 508, "合规提示", { size: 13, weight: 800, fill: "#8A6222" }),
    text(14, 532, "提醒仅作策略参考，不构成投资建议。", { size: 12, fill: "#8A6222" }),
    bottomCta()
  ].join("\n");
}

function confirmPlan() {
  const rows = [
    ["目标", "财务自由 · 5 年以上"],
    ["预算", "每月 ¥3,000"],
    ["品种", "沪深300指数"],
    ["买入", "低估 1.5 倍，正常 1 倍，高估暂停"],
    ["频率", "每月 · 发工资后第一个交易日"],
    ["卖出", "长期持有，触发条件前不临时卖出"],
    ["提醒", "执行提醒 + 估值提醒"]
  ];
  return [
    sectionTitle(0, 0, "确认你的定投规则", "不预测涨跌，只执行规则。"),
    rect(0, 74, 319, 386, { r: 8, fill: "#FFFFFF" }),
    rows.map(([k, v], i) => {
      const y = 106 + i * 50;
      return [
        text(16, y, k, { size: 12, fill: C.muted, weight: 700 }),
        text(78, y, v, { size: 13, weight: 700 }),
        i < rows.length - 1 ? line(16, y + 24, 303, y + 24) : ""
      ].join("\n");
    }).join("\n"),
    rect(0, 490, 319, 58, { r: 8, fill: C.pale, stroke: "none" }),
    text(14, 516, "低估多投，高估少投。", { size: 13, weight: 800, fill: C.accent }),
    text(14, 538, "不操作，也是一种纪律。", { size: 12, fill: C.ink }),
    button(0, 600, 319, "创建计划", { primary: true }),
    text(160, 684, "返回修改", { anchor: "middle", size: 13, fill: C.muted })
  ].join("\n");
}

function detail() {
  return [
    rect(0, 0, 319, 116, { r: 8, fill: C.dark, stroke: "none" }),
    text(18, 34, "今日建议动作", { size: 13, fill: "#C7D4CA", weight: 700 }),
    text(18, 73, "买入 ¥4,500", { size: 30, fill: "#FFFFFF", weight: 900 }),
    text(18, 99, "沪深300 · 当前低估 · 基础金额 1.5 倍", { size: 12, fill: "#DDE6DE" }),
    rect(0, 144, 319, 86, { r: 8, fill: "#FFFFFF" }),
    text(16, 172, "计划状态", { size: 13, fill: C.muted, weight: 700 }),
    text(16, 202, "进行中", { size: 22, weight: 800, fill: C.accent }),
    text(170, 172, "下次执行", { size: 13, fill: C.muted, weight: 700 }),
    text(170, 202, "06-05", { size: 22, weight: 800 }),
    rect(0, 254, 319, 132, { r: 8, fill: "#FFFFFF" }),
    text(16, 282, "核心规则", { size: 14, weight: 800 }),
    multiText(16, 314, ["月预算 ¥3,000 · 财务自由目标", "低估 1.5 倍，正常 1 倍，高估暂停", "卖出：长期持有，按规则复盘"], { size: 13, fill: C.ink, gap: 24 }),
    button(0, 424, 151, "立即执行", { primary: true }),
    button(168, 424, 151, "记录结果", { primary: false }),
    rect(0, 506, 319, 74, { r: 8, fill: C.pale, stroke: "none" }),
    text(14, 532, "修改计划会影响后续执行", { size: 13, weight: 800, fill: C.accent }),
    text(14, 556, "建议确认修改原因后再保存。", { size: 12, fill: C.ink }),
    text(160, 648, "查看记录 · 查看复盘建议 · 修改计划", { size: 12, fill: C.muted, anchor: "middle" })
  ].join("\n");
}

function record() {
  return [
    sectionTitle(0, 0, "记录本次定投结果", "记录不是负担，是复盘基础。"),
    [
      ["日期", "2026-06-05"],
      ["品种", "沪深300指数"],
      ["操作", "买入"],
      ["金额", "¥4,500"],
      ["估值状态", "低估"]
    ].map(([label, value], i) => {
      const y = 86 + i * 64;
      return [
        text(0, y, label, { size: 13, fill: C.muted, weight: 700 }),
        rect(0, y + 12, 319, 42, { r: 8, fill: "#FFFFFF" }),
        text(14, y + 39, value, { size: 14, weight: 700 })
      ].join("\n");
    }).join("\n"),
    text(0, 430, "备注（可选）", { size: 13, fill: C.muted, weight: 700 }),
    rect(0, 446, 319, 72, { r: 8, fill: "#FFFFFF" }),
    text(14, 476, "今天按计划执行", { size: 13, fill: C.muted }),
    button(0, 590, 319, "保存记录", { primary: true }),
    text(160, 670, "本工具不提供交易下单", { size: 12, fill: C.muted, anchor: "middle" })
  ].join("\n");
}

function review() {
  return [
    sectionTitle(0, 0, "月度复盘与优化", "复盘是为了更好地坚持。"),
    rect(0, 86, 319, 82, { r: 8, fill: "#FFFFFF" }),
    text(16, 116, "本月执行率", { size: 13, fill: C.muted, weight: 700 }),
    text(16, 148, "100%", { size: 28, weight: 900, fill: C.accent }),
    text(170, 116, "计划修改", { size: 13, fill: C.muted, weight: 700 }),
    text(170, 148, "0 次", { size: 28, weight: 900 }),
    text(0, 210, "复盘清单", { size: 15, weight: 800 }),
    [
      "是否按计划执行",
      "是否错过定投",
      "预算是否仍然可承受",
      "品种是否仍然合适",
      "是否达到卖出条件"
    ].map((label, i) => {
      const y = 238 + i * 48;
      return [
        rect(0, y, 319, 36, { r: 8, fill: "#FFFFFF" }),
        el("circle", { cx: 19, cy: y + 18, r: 9, fill: i < 4 ? C.accent : "#DCDDD8" }),
        text(19, y + 23, i < 4 ? "✓" : "", { size: 12, anchor: "middle", fill: "#FFFFFF", weight: 700 }),
        text(42, y + 23, label, { size: 13, weight: 700 })
      ].join("\n");
    }).join("\n"),
    rect(0, 510, 319, 58, { r: 8, fill: C.pale, stroke: "none" }),
    text(14, 536, "优化建议", { size: 13, weight: 800, fill: C.accent }),
    text(14, 558, "继续当前预算；暂不增加品种数量。", { size: 12, fill: C.ink }),
    button(0, 610, 319, "保存复盘", { primary: true })
  ].join("\n");
}

const screens = [
  ["1. 新手引导", null, welcome],
  ["2. 目标设置", 1, goal],
  ["3. 月度预算", 2, budget],
  ["4. 品种选择", 3, products],
  ["5. 买入规则", 4, buyRule],
  ["6. 频率时间", 5, schedule],
  ["7. 卖出规则", 6, sellRule],
  ["8. 提醒记录", 7, reminders],
  ["9. 计划确认", null, confirmPlan],
  ["10. 计划详情", null, detail],
  ["11. 记录定投", null, record],
  ["12. 复盘优化", null, review]
];

function connector(x1, y1, x2, y2) {
  const mid = (x1 + x2) / 2;
  return [
    line(x1, y1, mid, y1, { stroke: "#A7AEA4", sw: 1.4, dash: "5 6" }),
    line(mid, y1, mid, y2, { stroke: "#A7AEA4", sw: 1.4, dash: "5 6" }),
    line(mid, y2, x2, y2, { stroke: "#A7AEA4", sw: 1.4, dash: "5 6" }),
    el("path", { d: `M ${x2 - 8} ${y2 - 5} L ${x2} ${y2} L ${x2 - 8} ${y2 + 5}`, fill: "none", stroke: "#A7AEA4", "stroke-width": 1.4, "stroke-linecap": "round", "stroke-linejoin": "round" })
  ].join("\n");
}

function buildBody() {
  const body = [
    rect(0, 0, CANVAS_W, CANVAS_H, { r: 0, fill: C.bg, stroke: "none" }),
    text(55, 54, "定投计划设置向导 · Pencil 线框稿", { size: 28, weight: 900, fill: C.dark }),
    text(55, 84, "依据：定投计划设置向导_PRD.md · V1.0 目标：3 分钟完成计划，确认后进入执行/记录/复盘闭环", { size: 14, fill: C.muted }),
    rect(1290, 34, 455, 50, { r: 8, fill: C.paper, stroke: "#D9D5CA" }),
    text(1310, 64, "设计原则：默认简单 · 规则先行 · 长期导向 · 可记录可复盘", { size: 13, fill: C.ink, weight: 700 })
  ];

  const positions = [];
  screens.forEach(([title, step, render], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = MARGIN_X + col * (PHONE_W + GAP_X);
    const y = MARGIN_Y + row * (PHONE_H + GAP_Y);
    positions.push([x, y]);
    body.push(phoneShell(x, y, title, step, render()));
  });

  for (let i = 0; i < 8; i++) {
    const [x1, y1] = positions[i];
    const [x2, y2] = positions[i + 1];
    body.push(connector(x1 + PHONE_W + 10, y1 + PHONE_H / 2, x2 - 10, y2 + PHONE_H / 2));
  }
  body.push(connector(positions[8][0] + PHONE_W + 10, positions[8][1] + PHONE_H / 2, positions[9][0] - 10, positions[9][1] + PHONE_H / 2));
  body.push(connector(positions[9][0] + PHONE_W + 10, positions[9][1] + PHONE_H / 2, positions[10][0] - 10, positions[10][1] + PHONE_H / 2));
  body.push(connector(positions[10][0] + PHONE_W + 10, positions[10][1] + PHONE_H / 2, positions[11][0] - 10, positions[11][1] + PHONE_H / 2));

  return body.join("\n");
}

function prefixSvgTags(svg) {
  const tags = ["g", "rect", "text", "line", "circle", "path", "tspan"];
  let out = svg;
  tags.forEach(tag => {
    out = out.replace(new RegExp(`<${tag}(?=[\\s>/])`, "g"), `<svg:${tag}`);
    out = out.replace(new RegExp(`</${tag}>`, "g"), `</svg:${tag}>`);
  });
  return out;
}

const body = buildBody();
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">
${body}
</svg>
`;

const epBody = prefixSvgTags(body);
const pencilEp = `<?xml version="1.0" encoding="UTF-8"?>
<p:Document xmlns:p="http://www.evolus.vn/Namespace/Pencil" xmlns:svg="http://www.w3.org/2000/svg" p:version="3.1.0">
  <p:Properties>
    <p:Property name="name">定投计划设置向导</p:Property>
  </p:Properties>
  <p:Pages>
    <p:Page id="page-main" p:name="移动端主流程线框" p:width="${CANVAS_W}" p:height="${CANVAS_H}">
      <p:Properties>
        <p:Property name="name">移动端主流程线框</p:Property>
        <p:Property name="width">${CANVAS_W}</p:Property>
        <p:Property name="height">${CANVAS_H}</p:Property>
        <p:Property name="backgroundColor">#F4F1EA</p:Property>
      </p:Properties>
      <p:Content>
        <svg:g id="dt-plan-wireframe">
${epBody}
        </svg:g>
      </p:Content>
    </p:Page>
  </p:Pages>
</p:Document>
`;

const notes = `# 定投计划设置向导 - Pencil 设计说明

## 设计依据

来源文件：\`D:\\aiapp\\dtapp\\定投计划设置向导_PRD.md\`

本稿优先覆盖 PRD V1.0 的核心闭环：新手引导、计划创建、计划确认、计划详情、记录与复盘入口。

## 页面清单

1. 新手引导：说明工具边界，进入配置流程。
2. 目标设置：选择目标类型和期限，联动默认卖出策略。
3. 月度预算：输入每月金额，提示只用闲钱和安全垫。
4. 品种选择：默认推荐宽基指数，避免新手过度选择。
5. 买入规则：默认定期不定额，展示低估/正常/高估投入比例。
6. 频率时间：默认发工资后第一个交易日执行。
7. 卖出规则：提前定义止盈或长期持有，降低临时决策。
8. 提醒记录：开启执行提醒、估值提醒和记录字段。
9. 计划确认：完整摘要，一键创建。
10. 计划详情：日常执行入口，显示今日建议动作和计划状态。
11. 记录定投：记录日期、品种、买卖、金额、估值和备注。
12. 复盘优化：月度复盘清单和优化建议。

## 交互原则

- 默认值可直接继续，减少首次决策成本。
- 高级配置只以折叠提示出现，不打断主流程。
- 所有涉及计划修改的入口都需要二次提示。
- 文案避免收益承诺，保持“策略参考、独立判断”的合规口径。

## 文件说明

- \`定投计划设置向导_移动端线框.svg\`：可直接浏览，也可导入 Pencil 作为底图继续编辑。
- \`定投计划设置向导_Pencil草稿.ep\`：Pencil 旧版 XML 草稿。由于当前机器未安装 Pencil，已做 XML 校验但未做应用内打开校验。
`;

fs.writeFileSync(path.join(OUT_DIR, "定投计划设置向导_移动端线框.svg"), svg, "utf8");
fs.writeFileSync(path.join(OUT_DIR, "定投计划设置向导_Pencil草稿.ep"), pencilEp, "utf8");
fs.writeFileSync(path.join(OUT_DIR, "定投计划设置向导_设计说明.md"), notes, "utf8");

console.log("Generated:");
console.log("- 定投计划设置向导_移动端线框.svg");
console.log("- 定投计划设置向导_Pencil草稿.ep");
console.log("- 定投计划设置向导_设计说明.md");
