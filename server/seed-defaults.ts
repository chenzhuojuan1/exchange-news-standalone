/**
 * 预置默认信息源和关键词规则
 * 
 * 信息源：Mondovisione + Financial Times + The Economist
 * 关键词规则：包含/排除/白名单 + 财经媒体专用
 */

// 默认信息源配置（seedDefaults时自动导入）
export const DEFAULT_SOURCES = [
  {
    name: "Mondo Visione - 交易所新闻",
    layer: "website",
    enabled: true,
    url: "https://mondovisione.com/news/",
    sourceType: "html",
    selectors: JSON.stringify({
      container: "table.views-table tbody tr",
      title: "td.views-field-title a",
      link: "td.views-field-title a",
      date: "td.views-field-created span.date-display-single",
      summary: ""
    }),
    dateFormat: "DD/MM/YYYY",
    description: "全球交易所和金融基础设施新闻聚合网站，覆盖主要交易所公告",
  },
  {
    name: "Financial Times - 市场新闻",
    layer: "website",
    enabled: true,
    url: "https://www.ft.com/markets?format=rss",
    sourceType: "rss",
    selectors: JSON.stringify({}),
    description: "英国金融时报市场版块 RSS",
  },
  {
    name: "Financial Times - 金融服务",
    layer: "website",
    enabled: true,
    url: "https://www.ft.com/financial-services?format=rss",
    sourceType: "rss",
    selectors: JSON.stringify({}),
    description: "英国金融时报金融服务版块 RSS",
  },
  {
    name: "Financial Times - 金融科技",
    layer: "website",
    enabled: true,
    url: "https://www.ft.com/fintech?format=rss",
    sourceType: "rss",
    selectors: JSON.stringify({}),
    description: "英国金融时报金融科技版块 RSS",
  },
  {
    name: "Financial Times - 全球经济",
    layer: "website",
    enabled: true,
    url: "https://www.ft.com/global-economy?format=rss",
    sourceType: "rss",
    selectors: JSON.stringify({}),
    description: "英国金融时报全球经济版块 RSS",
  },
  {
    name: "The Economist - 金融与经济",
    layer: "website",
    enabled: true,
    url: "https://www.economist.com/finance-and-economics/rss.xml",
    sourceType: "rss",
    selectors: JSON.stringify({}),
    description: "经济学人金融与经济版块 RSS",
  },
  {
    name: "The Economist - 商业",
    layer: "website",
    enabled: true,
    url: "https://www.economist.com/business/rss.xml",
    sourceType: "rss",
    selectors: JSON.stringify({}),
    description: "经济学人商业版块 RSS",
  },
  {
    name: "The Economist - 社论",
    layer: "website",
    enabled: true,
    url: "https://www.economist.com/leaders/rss.xml",
    sourceType: "rss",
    selectors: JSON.stringify({}),
    description: "经济学人社论版块 RSS",
  },
];

// ========== 可供用户一键添加的网站模板 ==========
export const SOURCE_TEMPLATES = [
  // --- Mondovisione ---
  {
    name: "Mondo Visione - 交易所新闻",
    category: "交易所新闻",
    url: "https://mondovisione.com/news/",
    sourceType: "html" as const,
    selectors: {
      container: "table.views-table tbody tr",
      title: "td.views-field-title a",
      link: "td.views-field-title a",
      date: "td.views-field-created span.date-display-single",
    },
    dateFormat: "DD/MM/YYYY",
    description: "全球交易所和金融基础设施新闻聚合网站",
  },

  // --- Financial Times ---
  {
    name: "Financial Times - 市场新闻",
    category: "财经媒体",
    url: "https://www.ft.com/markets?format=rss",
    sourceType: "rss" as const,
    selectors: {},
    description: "英国金融时报市场版块 RSS（免费，实时更新，约25条/次）",
  },
  {
    name: "Financial Times - 金融服务",
    category: "财经媒体",
    url: "https://www.ft.com/financial-services?format=rss",
    sourceType: "rss" as const,
    selectors: {},
    description: "英国金融时报金融服务版块 RSS（免费，实时更新，涵盖银行、资管、监管等）",
  },
  {
    name: "Financial Times - 金融科技",
    category: "财经媒体",
    url: "https://www.ft.com/fintech?format=rss",
    sourceType: "rss" as const,
    selectors: {},
    description: "英国金融时报金融科技版块 RSS（免费，实时更新，涵盖数字资产、监管科技等）",
  },
  {
    name: "Financial Times - 全球经济",
    category: "财经媒体",
    url: "https://www.ft.com/global-economy?format=rss",
    sourceType: "rss" as const,
    selectors: {},
    description: "英国金融时报全球经济版块 RSS（免费，实时更新）",
  },

  // --- The Economist ---
  {
    name: "The Economist - 金融与经济",
    category: "财经媒体",
    url: "https://www.economist.com/finance-and-economics/rss.xml",
    sourceType: "rss" as const,
    selectors: {},
    description: "经济学人金融与经济版块 RSS（免费，每周更新，深度分析）",
  },
  {
    name: "The Economist - 商业",
    category: "财经媒体",
    url: "https://www.economist.com/business/rss.xml",
    sourceType: "rss" as const,
    selectors: {},
    description: "经济学人商业版块 RSS（免费，每周更新）",
  },
  {
    name: "The Economist - 社论",
    category: "财经媒体",
    url: "https://www.economist.com/leaders/rss.xml",
    sourceType: "rss" as const,
    selectors: {},
    description: "经济学人社论版块 RSS（免费，每周更新，重要政策立场）",
  },
];

// ========== 默认关键词规则 ==========
// 注意：短缩写（<=5字符纯字母）会自动使用 word boundary 匹配，
// 例如 "SEC" 不会匹配 "section"、"sector"、"second" 等
export const DEFAULT_KEYWORD_RULES = [
  // ===== 包含规则（Mondovisione 用） =====
  {
    name: "交易所名称",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "NYSE", "Nasdaq", "LSEG", "CME Group", "ICE", "Cboe", "HKEX",
      "SGX", "ASX", "TMX", "Euronext", "Deutsche B\u00f6rse",
      "Deutsche Borse", "Borsa Italiana", "JPX", "KRX",
      "Eurex", "Bursa Malaysia",
      "London Stock Exchange", "London Metal Exchange",
      "New York Stock Exchange", "Hong Kong Exchanges",
      "Japan Exchange Group", "Korea Exchange",
      "Chicago Mercantile Exchange", "Intercontinental Exchange",
      "Singapore Exchange", "World Federation of Exchanges"
    ]),
    description: "主要全球交易所名称（短缩写自动 word boundary 匹配）",
    enabled: true,
  },
  {
    name: "监管机构名称",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "SEC", "FCA", "ESMA", "CFTC", "IOSCO", "MAS", "SFC", "ASIC",
      "JFSA", "BIS", "FSB",
      "Securities and Exchange Commission",
      "Financial Conduct Authority",
      "Commodity Futures Trading Commission",
      "European Securities and Markets Authority",
      "Bank for International Settlements",
      "Financial Stability Board",
      "International Organization of Securities Commissions",
      "Monetary Authority of Singapore",
      "Securities and Futures Commission",
      "Australian Securities and Investments Commission",
      "Financial Services Agency"
    ]),
    description: "监管机构缩写+全称（短缩写自动 word boundary 匹配）",
    enabled: true,
  },
  {
    name: "制度改革关键词",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "regulatory reform", "rule change", "rule amendment",
      "regulatory framework", "new regulation",
      "regulatory sandbox", "consultation paper",
      "market reform", "capital framework"
    ]),
    description: "制度改革、规则修订、监管框架变更",
    enabled: true,
  },
  {
    name: "重要产品关键词",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "depositary receipt", "ETF listing", "ETF launch",
      "green bond", "sustainability bond",
      "new index launch", "new contract launch",
      "carbon credit", "digital asset", "stablecoin", "tokenized"
    ]),
    description: "DR、ETF上市、绿色债券、数字资产等重要产品",
    enabled: true,
  },
  {
    name: "市场结构关键词",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "market structure", "trading system", "matching engine",
      "tick size", "circuit breaker",
      "market microstructure", "high frequency trading",
      "central counterparty", "T+1 settlement", "T+0 settlement",
      "consolidated tape"
    ]),
    description: "市场结构、交易系统、清算结算相关",
    enabled: true,
  },
  {
    name: "技术改革关键词",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "cloud migration", "blockchain", "distributed ledger",
      "tokenization", "smart contract",
      "cybersecurity", "cyber security",
      "RegTech", "SupTech"
    ]),
    description: "技术升级、区块链、网络安全等金融科技",
    enabled: true,
  },
  {
    name: "跨境合作关键词",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "cross-border", "Stock Connect", "Bond Connect",
      "mutual recognition", "interoperability",
      "cross-listing", "dual listing",
      "memorandum of understanding",
      "regulatory cooperation", "supervisory cooperation",
      "exchange cooperation"
    ]),
    description: "跨境互联互通、监管合作",
    enabled: true,
  },

  // ===== 排除规则 =====
  {
    name: "人事变动排除",
    ruleType: "exclude",
    logic: "or",
    excludeStrength: "hard",
    keywords: JSON.stringify([
      "appoints", "appointed", "appointment", "resigns", "resignation",
      "retires", "retirement", "steps down", "new CEO", "new chairman",
      "commissioner", "board member", "board of directors"
    ]),
    description: "排除人事任命、辞职、退休等新闻",
    enabled: true,
  },
  {
    name: "企业财务排除",
    ruleType: "exclude",
    logic: "or",
    excludeStrength: "hard",
    keywords: JSON.stringify([
      "quarterly results", "annual results", "financial results",
      "revenue growth", "profit", "earnings", "dividend",
      "quarterly report", "annual report", "fiscal year"
    ]),
    description: "排除企业财务报告类新闻",
    enabled: true,
  },
  {
    name: "统计报告排除",
    ruleType: "exclude",
    logic: "or",
    excludeStrength: "hard",
    keywords: JSON.stringify([
      "monthly report", "monthly summary", "monthly review",
      "monthly bulletin", "monthly volumes", "monthly headlines",
      "trading statistics", "market statistics", "daily statistics",
      "weekly report", "weekly summary", "weekly bulletin",
      "trading volumes", "market turnover", "daily turnover",
      "market recap", "market wrap", "market update",
      "index rebalancing", "rebalance"
    ]),
    description: "排除统计报告、交易量、市场回顾等低价值内容",
    enabled: true,
  },
  {
    name: "个股上市排除",
    ruleType: "exclude",
    logic: "or",
    excludeStrength: "hard",
    keywords: JSON.stringify([
      "new listing", "lists on", "listed on", "begins trading",
      "starts trading", "IPO", "initial public offering",
      "prime standard", "general standard",
      "welcomes", "admits to trading",
      "transfers to", "delisting", "delisted"
    ]),
    description: "排除个股上市、转板、退市等新闻",
    enabled: true,
  },
  {
    name: "监管日常事务排除",
    ruleType: "exclude",
    logic: "or",
    excludeStrength: "hard",
    keywords: JSON.stringify([
      "disciplinary action", "reprimands", "bans",
      "suspends licence", "warns against", "investor alert",
      "compliance deadline", "licence revoked", "licence suspended",
      "restriction notice", "winding up petition",
      "enforcement action against"
    ]),
    description: "排除监管机构日常执法、处罚个人/小机构、投资者警示",
    enabled: true,
  },
  {
    name: "运营日常排除",
    ruleType: "exclude",
    logic: "or",
    excludeStrength: "hard",
    keywords: JSON.stringify([
      "market holiday", "trading hours", "system maintenance",
      "trading halt", "trading suspension",
      "office closure", "public holiday",
      "scheduled maintenance", "service disruption",
      "connectivity", "test environment"
    ]),
    description: "排除交易所日常运营通知（假期、维护、停牌等）",
    enabled: true,
  },
  {
    name: "活动与奖项排除",
    ruleType: "exclude",
    logic: "or",
    excludeStrength: "hard",
    keywords: JSON.stringify([
      "conference", "summit", "webinar", "seminar", "workshop",
      "award", "awards", "ceremony", "celebrates",
      "anniversary", "sponsorship", "sponsor"
    ]),
    description: "排除会议、奖项、庆典、赞助等非实质性新闻",
    enabled: true,
  },
  {
    name: "中国交易所排除",
    ruleType: "exclude",
    logic: "or",
    excludeStrength: "soft",
    keywords: JSON.stringify([
      "Shanghai Stock Exchange", "Shenzhen Stock Exchange",
      "Beijing Stock Exchange"
    ]),
    description: "软排除以中国交易所为主体的新闻（标记但保留）",
    enabled: true,
  },

  // ===== 白名单 =====
  {
    name: "SEC主席讲话白名单",
    ruleType: "whitelist",
    logic: "or",
    keywords: JSON.stringify([
      "SEC Chairman", "SEC Chair", "SEC Speaks",
      "Chairman Gensler", "Chairman Atkins"
    ]),
    description: "SEC主席讲话优先保留",
    enabled: true,
  },
  {
    name: "重大监管改革白名单",
    ruleType: "whitelist",
    logic: "or",
    keywords: JSON.stringify([
      "regulatory reform", "regulatory framework",
      "market reform", "market structure reform"
    ]),
    description: "重大监管改革新闻优先保留",
    enabled: true,
  },
  {
    name: "交易所合作白名单",
    ruleType: "whitelist",
    logic: "or",
    keywords: JSON.stringify([
      "exchange cooperation", "exchange partnership",
      "Stock Connect", "Bond Connect",
      "cross-border cooperation", "interoperability"
    ]),
    description: "交易所合作与互联互通新闻优先保留",
    enabled: true,
  },

  // ===== 财经媒体专用包含规则 =====
  // 针对 FT、Economist 叙述性标题设计，覆盖四个方向：交易所风险、证券监管、证券创新、AI
  {
    name: "财经媒体 - 交易所风险",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "stock exchange",
      "market infrastructure",
      "clearing house",
      "credit market"
    ]),
    description: "财经媒体专用：交易所风险相关（清算风险、信贷市场、市场基础设施）",
    enabled: true,
  },
  {
    name: "财经媒体 - 证券监管",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "financial regulator",
      "financial watchdog",
      "regulatory overhaul",
      "investor protection"
    ]),
    description: "财经媒体专用：证券监管相关（监管机构、监管改革、投资者保护）",
    enabled: true,
  },
  {
    name: "财经媒体 - 证券创新",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "tokenis",
      "stablecoin",
      "crypto exchange",
      "fintech"
    ]),
    description: "财经媒体专用：证券创新相关（代币化、稳定币、加密货币交易所、金融科技）",
    enabled: true,
  },
  {
    name: "财经媒体 - AI",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "AI",
      "artificial intelligence",
      "generative AI"
    ]),
    description: "财经媒体专用：人工智能相关（AI自动加词边界）",
    enabled: true,
  },
];
