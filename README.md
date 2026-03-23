# 新闻聚合平台（独立部署版）

一个高度可定制的新闻聚合平台，支持交易所和监管机构新闻的自动抓取、AI翻译/总结、关键词筛选和邮件推送功能。

## 功能特性

- **多源新闻抓取**：支持18个预置信息源（11个交易所 + 7个监管机构），可自行添加
- **智能关键词筛选**：包含词和排除词规则，自动过滤无关新闻
- **AI总结**：基于DeepSeek/OpenAI API，一键生成中文新闻摘要报告
- **标题翻译**：自动将英文新闻标题翻译为中文
- **邮件推送**：支持QQ邮箱等SMTP服务，定时发送新闻报告
- **报告中心**：生成结构化新闻报告，支持查看历史报告
- **手动添加**：支持手动粘贴新闻内容
- **全中文界面**：新手友好，无需编程知识

## 预置信息源

### 交易所（11个）
Mondo Visione、Nasdaq、NYSE、LSEG、SGX、JPX、KRX、HKEX、Deutsche Börse、Euronext、WFE

### 监管机构（7个）
SEC、FCA、MAS、JFSA、FSC韩国、SFC香港、ESMA

## 技术栈

- **前端**：React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**：Node.js + Express + tRPC
- **数据库**：PostgreSQL
- **LLM**：DeepSeek API（兼容OpenAI API格式）
- **邮件**：Nodemailer（SMTP）
- **部署**：Docker / Render

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/chenzhuojuan1/news-aggregator.git
cd news-aggregator
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制环境变量模板并填写：

```bash
cp ENV_SETUP.md .env  # 参考ENV_SETUP.md创建.env文件
```

必需的环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL连接字符串 | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | JWT签名密钥 | 任意随机字符串 |
| `ADMIN_PASSWORD` | 管理员登录密码 | 你的密码 |

可选的环境变量（AI功能）：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `OPENAI_API_KEY` | DeepSeek/OpenAI API密钥 | 无 |
| `OPENAI_BASE_URL` | API地址 | `https://api.deepseek.com` |
| `OPENAI_MODEL` | 使用的模型 | `deepseek-chat` |

### 4. 初始化数据库

项目启动时会自动运行数据库迁移脚本，创建所需的表结构。

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## Render部署指南

### 方式一：通过GitHub自动部署（推荐）

1. 将代码推送到GitHub仓库
2. 登录 [Render](https://render.com)
3. 创建 **PostgreSQL** 数据库服务
4. 创建 **Web Service**，连接GitHub仓库
5. 配置环境变量（见上表）
6. 部署完成后访问分配的URL

### 方式二：通过Docker部署

```bash
docker build -t news-aggregator .
docker run -p 3000:3000 \
  -e DATABASE_URL=your_database_url \
  -e JWT_SECRET=your_jwt_secret \
  -e ADMIN_PASSWORD=your_password \
  news-aggregator
```

### Render环境变量配置

在Render Dashboard → Web Service → Environment 中添加：

```
DATABASE_URL=（从Render PostgreSQL服务获取Internal Database URL）
JWT_SECRET=（任意随机字符串）
ADMIN_PASSWORD=（你的登录密码）
NODE_ENV=production
OPENAI_API_KEY=（DeepSeek API Key）
OPENAI_BASE_URL=https://api.deepseek.com
```

## 使用说明

### 登录
- 访问网站后输入管理员密码登录

### 新闻浏览
- 查看已抓取并通过关键词筛选的新闻
- 点击 **立即抓取** 手动触发新闻抓取
- 点击 **AI总结** 生成当前新闻的中文摘要报告
- 使用 **关键词** 和 **排除词** 按钮快捷管理筛选规则

### 信息源管理
- 查看、启用/禁用信息源
- 添加新的信息源（支持RSS和网页抓取）

### 关键词规则
- 管理包含词（只显示包含这些词的新闻）
- 管理排除词（过滤包含这些词的新闻）

### 邮件设置
- 配置SMTP服务器信息（推荐QQ邮箱）
- 设置收件人邮箱
- 开启/关闭定时邮件发送

### 报告中心
- 查看历史生成的新闻报告
- 手动生成新报告

## 项目结构

```
news-aggregator-standalone/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   │   ├── Home.tsx          # 新闻浏览页
│   │   │   ├── SourcesPage.tsx   # 信息源管理
│   │   │   ├── KeywordsPage.tsx  # 关键词规则
│   │   │   ├── ManualPage.tsx    # 手动添加
│   │   │   ├── ReportsPage.tsx   # 报告中心
│   │   │   └── EmailPage.tsx     # 邮件设置
│   │   ├── components/    # UI组件
│   │   └── App.tsx        # 路由配置
│   └── index.html
├── server/                 # 后端代码
│   ├── routers.ts         # API路由（tRPC）
│   ├── db.ts              # 数据库操作
│   ├── scraper.ts         # 新闻抓取器
│   ├── report.ts          # 报告生成
│   ├── mailer.ts          # 邮件发送
│   ├── seed-defaults.ts   # 默认数据初始化
│   └── migrate.ts         # 数据库迁移
├── drizzle/
│   └── schema.ts          # 数据库表结构
├── shared/                 # 共享类型
├── Dockerfile             # Docker构建配置
├── render.yaml            # Render部署配置
├── package.json
└── README.md
```

## 常见问题

### Q: AI总结/翻译不工作？
A: 检查 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL` 环境变量是否正确配置。推荐使用DeepSeek API（价格便宜且效果好）。

### Q: 新闻抓取失败？
A: 部分网站可能有反爬机制。检查信息源URL是否可访问，或尝试禁用失败的信息源。

### Q: 邮件发送失败？
A: 确认SMTP配置正确。QQ邮箱需要使用授权码（非登录密码），在QQ邮箱设置→账户→POP3/SMTP服务中获取。

### Q: Render免费版有什么限制？
A: Render免费版Web Service在15分钟无访问后会休眠，首次访问需要等待约30秒启动。数据库免费版有90天有效期。

## 许可证

MIT License
