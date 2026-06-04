# 定投计划设置向导

基于 `D:\aiapp\dtapp\项目开发计划.md` 开发的移动端可点击原型。当前版本使用 uni-app + Vue 3 + TypeScript 实现，优先交付 H5 预览，同时保留微信小程序构建能力。

## 当前实现

- 新手引导页
- 8 步计划创建向导
- 默认值直接生成计划
- 目标、预算、品种、买入规则、频率、卖出规则、提醒记录配置
- 预算风险提示
- 品种未选时阻止继续
- 计划确认页
- 计划详情页
- 估值状态演示：低估、正常、高估、未知
- 当前建议动作计算
- 定投记录保存
- 复盘记录保存
- 修改计划二次确认
- 暂停/恢复计划
- 本地持久化：计划、记录、复盘
- 埋点日志占位：先输出到控制台

合规边界：本工具只做计划配置、执行提醒和记录复盘，不提供交易下单，不构成投资建议。

## 技术栈

- uni-app
- Vue 3
- TypeScript
- Pinia
- Vitest
- Playwright Core

## 安装依赖

项目已配置国内 npm 镜像：

```bash
npm install
```

镜像配置位于 `.npmrc`：

```text
registry=https://registry.npmmirror.com
```

## 本地开发

启动 H5 开发服务：

```bash
npm run dev:h5
```

构建 H5：

```bash
npm run build:h5
```

构建后启动静态预览：

```bash
npm run preview:h5
```

默认预览地址：

```text
http://127.0.0.1:5173
```

## 测试与校验

单元测试：

```bash
npm run test
```

类型检查：

```bash
npm run type-check
```

H5 主流程冒烟测试：

```bash
npm run smoke:h5
```

冒烟测试覆盖：

1. 首页进入计划创建向导
2. 使用默认值走完 8 步配置
3. 创建计划并进入计划详情
4. 保存一次定投记录
5. 保存一次复盘记录
6. 返回计划详情

冒烟截图输出到：

```text
artifacts/
```

## 项目结构

```text
app/
  scripts/
    serve-h5.mjs       # H5 构建产物静态预览
    smoke-h5.mjs       # H5 可点击主流程冒烟测试
  src/
    components/
      ActionBar/
      OptionCard/
      StepHeader/
    domain/
      analytics.ts     # 埋点事件占位
      plan.ts          # 计划领域模型、默认规则、建议动作、校验
      plan.test.ts     # 领域逻辑单元测试
    pages/
      index/           # 新手引导
      wizard/          # 8 步计划创建向导
      plan-detail/     # 计划详情与日常执行入口
      record/          # 定投记录
      review/          # 复盘优化
    stores/
      planStore.ts     # Pinia 状态与本地存储
    styles/
      global.css       # 全局移动端样式
```

## 关键命令

```bash
npm run test
npm run type-check
npm run build:h5
npm run preview:h5
npm run smoke:h5
```

## 后续开发建议

- 接入真实估值数据源。
- 增加数据导出能力，降低本地存储丢失风险。
- 增加微信小程序订阅消息授权与提醒。
- 增加月度复盘卡片。
- 增加推荐组合模板。
- 发布前做合规文案检查，避免收益承诺和交易撮合暗示。
