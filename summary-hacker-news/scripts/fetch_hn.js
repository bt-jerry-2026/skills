#!/usr/bin/env node
// Fetch top N stories from Hacker News and save as source markdown.
// Usage: node fetch_hn.js [--limit N]
// Outputs the saved file path to stdout.

import https from "https";
import fs from "fs";
import path from "path";
import os from "os";

const TOPSTORIES = "https://hacker-news.firebaseio.com/v0/topstories.json";
const ITEM_URL   = (id) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
const LIMIT      = 30;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

function stripHtml(text = "") {
  return text.replace(/<[^>]+>/g, "").trim();
}

function scoreTag(s) {
  if (s >= 500) return " 🔥🔥🔥";
  if (s >= 200) return " 🔥🔥";
  if (s >= 100) return " 🔥";
  return "";
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatUtc(d) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())} ` +
         `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())} UTC`;
}

function formatDate(d) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}`;
}

function buildMd(stories, now) {
  const date = formatDate(now);
  const time = formatUtc(now);
  const lines = [
    `# Hacker News Top Stories — ${date}`,
    "",
    `- **爬取时间**: ${time}`,
    `- **条数**: ${stories.length}`,
    "- **数据源**: https://hacker-news.firebaseio.com/v0/",
    "",
    "---",
    "",
  ];

  stories.forEach((item, i) => {
    const sid   = item.id;
    const title = item.title || "(no title)";
    const url   = item.url   || `https://news.ycombinator.com/item?id=${sid}`;
    const hnUrl = `https://news.ycombinator.com/item?id=${sid}`;
    const score = item.score       ?? 0;
    const by    = item.by          || "unknown";
    const cmts  = item.descendants ?? 0;
    const itype = item.type        || "story";
    let   text  = stripHtml(item.text || "");
    if (text.length > 500) text = text.slice(0, 500) + "...";

    lines.push(
      `## ${i + 1}. ${title}${scoreTag(score)}`,
      "",
      `- **链接**: ${url}`,
      `- **HN 讨论**: ${hnUrl}`,
      `- **分数**: ${score}  |  **评论数**: ${cmts}  |  **作者**: ${by}  |  **类型**: ${itype}`,
    );
    if (text) lines.push("", `> ${text}`);
    lines.push("");
  });

  return lines.join("\n");
}

async function main() {
  const args  = process.argv.slice(2);
  const li    = args.indexOf("--limit");
  const limit = li !== -1 ? parseInt(args[li + 1], 10) : LIMIT;

  const now    = new Date();
  const date   = formatDate(now);
  const outDir = path.join(os.homedir(), ".openclaw/workspace/summary/source/hacker-news");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${date}.md`);

  process.stderr.write(`[HN] Fetching top ${limit} stories ...\n`);
  const ids = (await fetchJson(TOPSTORIES)).slice(0, limit);

  const stories = [];
  for (let idx = 0; idx < ids.length; idx++) {
    try {
      const item = await fetchJson(ITEM_URL(ids[idx]));
      stories.push(item);
      process.stderr.write(`  [${idx + 1}/${limit}] ${(item.title || "").slice(0, 70)}\n`);
    } catch (e) {
      process.stderr.write(`  [${idx + 1}/${limit}] SKIP sid=${ids[idx]}: ${e.message}\n`);
    }
  }

  fs.writeFileSync(outPath, buildMd(stories, now), "utf8");
  process.stdout.write(outPath + "\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
