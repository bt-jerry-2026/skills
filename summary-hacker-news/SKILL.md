---
name: summary-hacker-news
description: 抓取 Hacker News 热门内容并生成深度分析报告，输出到 ~/.openclaw/workspace/summary/。当用户提到以下任意关键词时触发：HN 日报。执行两阶段流程：先用脚本抓取原始数据存为数据源文件，再由模型生成含 [Meta]/[Content]/[Insights] 的结构化深度报告。
---

# Hacker News 深度分析

按顺序执行以下 2 个阶段。

## Phase 1 — 抓取数据

```bash
node ~/.openclaw/workspace/skills/summary-hacker-news/scripts/fetch_hn.js
```

脚本输出数据源文件的绝对路径到 stdout，记录为 `source_path`。

## Phase 2 — 生成报告

1. 读取 `source_path` 文件全部内容
2. 读取 [references/report-format.md](references/report-format.md) 获取报告格式规范
3. 按规范生成报告，写入：
   ```
   ~/.openclaw/workspace/summary/news/hacker-news/YYYY-MM-DD.md
   ```
   （先 `mkdir -p` 确保目录存在）

## 完成后

### 发送完成汇报（重要！）

必须使用 `message` 工具向用户发送完成通知：

```
action: send
target: {user_slack_id}  # cron场景下为用户ID，如 agjgj187076081
message: |
  🐭 **《HN日报》已出炉，领导请过目！**

  📁 数据源：`{source_path}`
  📄 报告文件：`~/.openclaw/workspace/summary/news/hacker-news/YYYY-MM-DD.md`

  **今日 HN 核心发现（三句话版）：**
  1. {发现1}
  2. {发现2}
  3. {发现3}

  活儿干完了，领导您要是还不满意……那建议您下次找个活人来干。🐭
```

**注意：** cron 任务场景下必须显式调用 message 工具，不能依赖 summary 自动汇报（summary 可能无法正确传递到 Slack）。
