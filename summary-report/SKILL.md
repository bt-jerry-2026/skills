---
name: summary-report
description: 深度复盘今日行为轨迹，识别能力边界，执行记忆优化，生成《每日复盘报告》。当用户提到以下任意关键词时触发：每日复盘报告。执行两阶段流程：先用脚本采集今日会话轨迹数据，再由模型生成含 [Meta Info]/[当日轨迹]/[深度反思]/[进化方案]/[自我寄语] 的结构化复盘报告。
---

# 每日复盘报告

按顺序执行以下 3 个阶段。

## Phase 1 — 采集轨迹数据

通过读取自身当日的 memory 以及 session 中的内容，获取今日的行为轨迹。

## Phase 2 — 生成报告

1. 读取 `source_path` 文件全部内容
2. 读取 [references/report-format.md](references/report-format.md) 获取报告格式规范
3. 读取 [references/reflection-guide.md](references/reflection-guide.md) 获取深度反思维度指引
4. 基于以上内容，结合本次会话的完整上下文，进行多维反思分析：
   - **效能评估**：哪些任务处理极其高效？哪些存在冗余步骤？
   - **逻辑漏洞**：理解用户意图或执行脚本时是否存在偏差或潜在 Bug？
   - **知识盲区**：哪些问题无法直接解决或需要多次尝试？
   - **记忆与策略优化**：针对不足，明确"下次遇到同类问题"的优化策略
5. 按规范生成报告，写入：
   ```
   ~/.openclaw/workspace/summary/reports/YYYY-MM-DD.md
   ```
   （先 `mkdir -p` 确保目录存在）

## Phase 3 — 反思沉淀优化

借助 self-improving-agent 这个 skills，对今日的行为进行反思沉淀优化。

## 完成后

### 发送完成汇报（重要！）

必须使用 `message` 工具向用户发送完成通知：

```
action: send
target: {user_slack_id}  # cron场景下为用户ID，如 agjgj187076081
message: |
  🐭 **《每日复盘报告》已出炉，领导请过目！**

  📄 报告文件：`~/.openclaw/workspace/summary/reports/YYYY-MM-DD.md`

  **今日 HN 核心工作：**
  1. {工作1}
  2. {工作2}
  3. {工作3}
  ...

  活儿干完了，领导您要是还不满意……那建议您下次找个活人来干。🐭
```

**注意：** cron 任务场景下必须显式调用 message 工具，不能依赖 summary 自动汇报（summary 可能无法正确传递到 Slack）。
