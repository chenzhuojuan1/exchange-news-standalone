/**
 * 预置默认信息源和关键词规则
 * 
 * 包含：交易所/证监会信息源模板 + 关键词规则（包含/排除/白名单）
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
];

// ========== 可供用户一键添加的网站模板 ==========
export const SOURCE_TEMPLATES = [
  // --- 交易所 ---
  {
    name: "Mondo Visione - 交易所新闻",
    category: "交易所",
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
  {
    name: "Nasdaq - 新闻发布",
    category: "交易所",
    url: "https://www.nasdaq.com/press-release",
    sourceType: "html" as const,
    selectors: {},
    description: "纳斯达克交易所新闻发布（智能抓取模式）",
  },
  {
    name: "NYSE - 新闻",
    category: "交易所",
    url: "https://www.nyse.com/news",
    sourceType: "html" as const,
    selectors: {},
    description: "纽约证券交易所新闻（智能抓取模式）",
  },
  {
    name: "LSEG - 新闻发布",
    category: "交易所",
    url: "https://www.lseg.com/en/media-centre/press-releases",
    sourceType: "html" as const,
    selectors: {},
    description: "伦敦证券交易所集团新闻发布（智能抓取模式）",
  },
  {
    name: "SGX - 新闻发布",
    category: "交易所",
    url: "https://www.sgx.com/media-centre",
    sourceType: "html" as const,
    selectors: {},
    description: "新加坡交易所新闻发布（智能抓取模式）",
  },
  {
    // JPX 通过 JSON API 提供数据，使用 API 模式抓取当月和上月公告
    name: "JPX - 新闻发布",
    category: "交易所",
    url: "https://www.jpx.co.jp/english/corporate/news/news-releases/index.html",
    sourceType: "api" as const,
    selectors: {},
    apiConfig: {
      // 动态端点：当月 JSON 文件（month_between=0）
      endpoint: "https://www.jpx.co.jp/english/news/news_ym_00.json",
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.jpx.co.jp/english/corporate/news/news-releases/index.html",
      },
      // 只取 JPX 公告类（排除市场行情类）
      dataPath: "",
      titleField: "title",
      urlField: "url",
      dateField: "updated_date",
    },
    description: "日本交易所集团新闻发布（JSON API 模式，仅抓取 JPX 公告类）",
  },
  {
    name: "KRX - 新闻",
    category: "交易所",
    url: "https://global.krx.co.kr/contents/GLB/06/0608/0608010000/GLB0608010000.jsp",
    sourceType: "html" as const,
    selectors: {},
    description: "韩国交易所新闻（智能抓取模式）",
  },
  {
    name: "HKEX - 新闻发布",
    category: "交易所",
    url: "https://www.hkex.com.hk/News/News-Release?sc_lang=en",
    sourceType: "html" as const,
    selectors: {},
    description: "香港交易所新闻发布（智能抓取模式）",
  },
  {
    name: "Deutsche Börse - 新闻发布",
    category: "交易所",
    url: "https://www.deutsche-boerse.com/dbg-en/media/press-releases",
    sourceType: "html" as const,
    selectors: {},
    description: "德意志交易所集团新闻发布（智能抓取模式）",
  },
  {
    name: "Euronext - 新闻发布",
    category: "交易所",
    url: "https://www.euronext.com/en/about/media/press-releases",
    sourceType: "html" as const,
    selectors: {},
    description: "泛欧交易所新闻发布（智能抓取模式）",
  },
  {
    name: "WFE - 世界交易所联合会",
    category: "交易所",
    url: "https://www.world-exchanges.org/news",
    sourceType: "html" as const,
    selectors: {},
    description: "世界交易所联合会新闻与研究报告（智能抓取模式）",
  },

  // --- 监管机构/证监会 ---
  {
    name: "SEC - 新闻发布",
    category: "监管机构",
    url: "https://www.sec.gov/news/pressreleases",
    sourceType: "html" as const,
    selectors: {},
    description: "美国证券交易委员会新闻发布（智能抓取模式）",
  },
  {
    name: "FCA - 新闻与声明",
    category: "监管机构",
    url: "https://www.fca.org.uk/news",
    sourceType: "html" as const,
    selectors: {},
    description: "英国金融行为监管局新闻（智能抓取模式）",
  },
  {
    name: "MAS - 新闻发布",
    category: "监管机构",
    url: "https://www.mas.gov.sg/news",
    sourceType: "html" as const,
    selectors: {},
    description: "新加坡金融管理局新闻发布（智能抓取模式）",
  },
  {
    // JFSA 页面有精确的 <ul><li> 结构，链接文本包含日期
    name: "JFSA - 新闻发布",
    category: "监管机构",
    url: "https://www.fsa.go.jp/en/news/index.html",
    sourceType: "html" as const,
    selectors: {
      // 主内容区的 ul > li > a 结构
      container: "#main ul li",
      title: "a",
      link: "a",
      date: "",  // 日期嵌在标题文本末尾，由 scraper 特殊处理
    },
    description: "日本金融厅新闻发布（精确选择器模式，日期从标题提取）",
  },
  {
    name: "FSC 韩国 - 新闻发布",
    category: "监管机构",
    url: "https://www.fsc.go.kr/eng/pr010101",
    sourceType: "html" as const,
    selectors: {},
    description: "韩国金融委员会新闻发布（智能抓取模式）",
  },
  {
    // SFC 香港有精确的表格结构：<tr> 包含日期 <td> 和标题 <td>
    name: "SFC 香港 - 政策声明与公告",
    category: "监管机构",
    url: "https://www.sfc.hk/en/News-and-announcements/Policy-statements-and-announcements",
    sourceType: "html" as const,
    selectors: {
      container: "table tr:not(:first-child)",  // 跳过表头行
      title: "td:nth-child(2) a",
      link: "td:nth-child(2) a",
      date: "td:nth-child(1)",
    },
    description: "香港证券及期货事务监察委员会政策声明（精确选择器，日期格式 DD Mon YYYY）",
  },
  {
    // SFC 香港 Circulars 页面（通函）
    name: "SFC 香港 - 通函",
    category: "监管机构",
    url: "https://www.sfc.hk/en/News-and-announcements/Circulars",
    sourceType: "html" as const,
    selectors: {
      container: "table tr:not(:first-child)",
      title: "td:nth-child(2) a",
      link: "td:nth-child(2) a",
      date: "td:nth-child(1)",
    },
    description: "香港证券及期货事务监察委员会通函（精确选择器）",
  },
  {
    // ESMA 有精确的 <article> 结构，日期在 <div class="search-date"> 中
    name: "ESMA - 新闻与公告",
    category: "监管机构",
    url: "https://www.esma.europa.eu/press-news/esma-news",
    sourceType: "html" as const,
    selectors: {
      container: "article.node--view-mode-teaser",
      title: ".field--name-title",
      link: "a[rel='bookmark']",
      date: ".search-date",
    },
    description: "欧洲证券和市场管理局新闻（精确选择器，日期格式 DD/MM/YYYY）",
  },
];

// ========== 默认关键词规则 ==========
// 注意：短缩写（<=5字符纯字母）会自动使用 word boundary 匹配，
// 例如 "SEC" 不会匹配 "section"、"sector"、"second" 等
export const DEFAULT_KEYWORD_RULES = [
  // ===== 包含规则 =====
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

  // --- 制度改革（精简） ---
  {
    name: "制度改革关键词",
    ruleType: "include",
    logic: "or",
    keywords: JSON.stringify([
      "regulatory reform", "rule change", "rule amendment",
      "rule proposal", "rule filing",
      "regulatory framework", "new regulation",
      "regulatory sandbox", "consultation paper",
      "market reform", "capital framework"
    ]),
    description: "制度改革、规则修订、监管框架变更",
    enabled: true,
  },

  // --- 重要产品（精简，去掉泛词） ---
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

  // --- 市场结构（精简） ---
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

  // --- 技术改革（精简，去掉 API/real-time/low latency 等泛词） ---
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

  // --- 跨境合作（精简，去掉 partnership/collaboration/working group 等泛词） ---
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

  // ===== 排除规则（增强） =====
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
];
