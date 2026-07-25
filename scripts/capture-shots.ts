import fs from "fs";
import path from "path";
import { chromium } from "playwright";

async function main() {
  const outDir = path.join(process.cwd(), "docs", "images", "shots");
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const base = process.env.MUNI_BASE_URL || "http://localhost:3300";

  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, "muni-landing.png"), fullPage: false });

  await page.goto(`${base}/chat`, { waitUntil: "networkidle" });
  await page.fill('input[placeholder="Ask Muni something grounded..."]', "What is Lens and what does its mismatch guard do?");
  await page.click('button:has-text("Ask")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, "muni-chat-grounded.png"), fullPage: false });

  await page.fill('input[placeholder="Ask Muni something grounded..."]', "What is Yuan's secret salary and bank account number?");
  await page.click('button:has-text("Ask")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, "muni-chat-refuse.png"), fullPage: false });

  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await page.fill("input", "muni_demo_key_001");
  await page.click('button:has-text("Open desk")');
  await page.waitForURL("**/desk");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, "muni-desk.png"), fullPage: false });

  await browser.close();
  console.log("screenshots written to docs/images/shots");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
