import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs", "images", "shots");
const BASE = process.env.SHOT_BASE || "http://localhost:3000";
const KEY = process.env.DEMO_API_KEY || "muni_demo_key_001";

fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitReady(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await sleep(2800);
}

async function askChat(page, question, expect) {
  const input = page.getByPlaceholder("Ask Muni something grounded...");
  await input.waitFor({ state: "visible", timeout: 20000 });
  await input.click();
  await input.fill(question);
  await page.getByRole("button", { name: "Send message" }).click();
  // Wait for the message status badge, not sidebar "GROUNDS" chips.
  await page
    .locator(".badge")
    .filter({ hasText: new RegExp(`^${expect}$`, "i") })
    .first()
    .waitFor({ timeout: 60000 });
  if (expect === "grounded") {
    await page.getByText("cited sources", { exact: false }).first().waitFor({ timeout: 15000 });
  }
  await sleep(1600);
}

const browser = await chromium.launch({
  headless: true,
  args: ["--hide-scrollbars"],
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
});

const page = await context.newPage();

console.log("landing...");
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
await waitReady(page);
await page.screenshot({
  path: path.join(OUT, "muni-landing.png"),
  fullPage: false,
});
console.log("saved muni-landing.png");

console.log("chat grounded...");
await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded" });
await waitReady(page);
await askChat(page, "What is Lens?", "grounded");
await page.screenshot({
  path: path.join(OUT, "muni-chat-grounded.png"),
  fullPage: false,
});
console.log("saved muni-chat-grounded.png");

console.log("chat refuse...");
await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded" });
await waitReady(page);
await askChat(
  page,
  "What is Yuan's secret salary and bank account number?",
  "refused"
);
await page.screenshot({
  path: path.join(OUT, "muni-chat-refuse.png"),
  fullPage: false,
});
console.log("saved muni-chat-refuse.png");

console.log("desk...");
const login = await context.request.post(`${BASE}/api/auth/login`, {
  data: { apiKey: KEY },
});
if (!login.ok()) {
  throw new Error(`login failed: ${login.status()}`);
}
await page.goto(`${BASE}/desk`, { waitUntil: "domcontentloaded" });
await page.getByRole("button", { name: "Embed knowledge" }).waitFor({
  timeout: 20000,
});
await sleep(2500);
await page.screenshot({
  path: path.join(OUT, "muni-desk.png"),
  fullPage: false,
});
console.log("saved muni-desk.png");

await browser.close();
console.log("done ->", OUT);
