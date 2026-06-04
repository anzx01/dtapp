import { chromium } from "playwright-core";

const executablePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:5173";

const browser = await chromium.launch({
  executablePath,
  headless: true,
});

const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });

await page.getByText("开始设置").click();
await page.getByText("下一步").click();
await page.locator("uni-input").nth(0).locator("input").fill("5000");
await page.locator("uni-input").nth(1).locator("input").fill("100000");
await page.getByText("下一步").click();
await page.getByText("下一步").click();
await page.getByText("下一步").click();
await page.getByText("下一步").click();
await page.getByText("下一步").click();
await page.getByText("下一步").click();
await page.locator("uni-page-body").getByText("创建计划").click();
await page.getByText("当前建议动作").waitFor();
await page.getByText("预计总收入").waitFor();
await page.screenshot({ path: "artifacts/detail-390x844.png", fullPage: true });

await page.getByText("立即执行 / 记录结果").click();
await page.getByText("保存记录").click();
await page.getByText("记录已保存").waitFor();
await page.getByText("查看详情").click();
await page.getByText("当前建议动作").waitFor();

await page.getByText("查看复盘建议").click();
await page.getByText("保存复盘").click();
await page.getByText("当前建议动作").waitFor();

await page.screenshot({ path: "artifacts/final-390x844.png", fullPage: true });
await browser.close();

console.log("H5 smoke passed");
