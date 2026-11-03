// Verification shots for the compact island. node tools/.check-shot.mjs
import { chromium } from 'playwright';
const url = (await import('node:fs')).readFileSync(new URL('./.serve-url', import.meta.url), 'utf8').trim();
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url);
await page.waitForFunction(() => window.__home, null, { timeout: 15000 });
await page.waitForTimeout(4000); // 等开场镜头结束
const shots = [
  ['island-overview', [-6, 17, 40], [-19, 0, 17]],
  ['portal-spawn', [-8, 3, 17], [-14, 1, 10]],
];
for (const [name, cam, look] of shots) {
  await page.evaluate(([c, l]) => __home.rig.showcase(c, l), [cam, look]);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tools/.check/view-${name}.png` });
}
await browser.close();
