import * as cheerio from "cheerio";
import type { Source, KeywordRule, InsertArticle } from "../drizzle/schema";

// ========== 类型定义 ==========
export interface ScrapedItem {
  title: string;
  url: string;
  date: string;
  summary?: string;
}

export interface ScrapeResult {
  source: Source;
  items: ScrapedItem[];
  errors: string[];
}

// ========== 获取网页HTML ==========
async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

// ========== 日期解析工具 ==========

/**
 * 解析多种日期格式，返回 Date 对象或 null
 * 支持：
 *   - "11 Feb 2026" / "11 February 2026"（SFC格式）
 *   - "18/03/2026"（ESMA格式 DD/MM/YYYY）
 *   - "2026-03-18"（ISO格式）
 *   - "(March 19, 2026)"（JFSA标题内嵌格式）
 *   - "March 19, 2026"
 *   - "Mar 19, 2026"
 */
export function parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const s = dateStr.trim();

  // DD/MM/YYYY (ESMA)
  const dmySlash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmySlash) {
    const d = new Date(
      parseInt(dmySlash[3]),
      parseInt(dmySlash[2]) - 1,
      parseInt(dmySlash[1])
    );
    if (!isNaN(d.getTime())) return d;
  }

  // DD Mon YYYY or DD Month YYYY (SFC: "11 Feb 2026")
  const dMonY = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (dMonY) {
    const d = new Date(`${dMonY[2]} ${dMonY[1]}, ${dMonY[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  // Extract "(Month DD, YYYY)" or "Month DD, YYYY" from text (JFSA title)
  const titleDate = s.match(/\(?(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})\)?/i);
  if (titleDate) {
    const d = new Date(`${titleDate[1]} ${titleDate[2]}, ${titleDate[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  // Standard ISO / JS parseable
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  return null;
}

/**
 * 判断日期是否在最近 N 天内（用于过滤旧新闻）
 * 默认 90 天，对于 SFC 政策声明等更新频率低的页面可放宽
 */
function isRecentDate(date: Date | null, maxDays: number = 90): boolean {
  if (!date) return true; // 无法判断日期时保留
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= maxDays;
}

/**
 * 从 JFSA 标题文本中提取日期（格式如 "(March 19, 2026)"）
 */
function extractDateFromTitle(title: string): string {
  const m = title.match(/\(([A-Za-z]+\s+\d{1,2},?\s+\d{4})\)/);
  return m ? m[1] : "";
}

// ========== 智能抓取模式（无需CSS选择器） ==========
export function smartExtractFromHtml(html: string, baseUrl: string): ScrapedItem[] {
  const $ = cheerio.load(html);
  const items: ScrapedItem[] = [];
  const seen = new Set<string>();

  // 移除导航、页脚、侧边栏等非内容区域
  $("nav, footer, header, aside, .sidebar, .nav, .footer, .header, .menu, .breadcrumb, script, style, noscript").remove();

  // 策略1: 查找常见新闻列表结构
  const listSelectors = [
    "article", ".news-item", ".news-list li", ".article-item",
    ".post-item", ".entry", ".item", ".list-item",
    "table.views-table tbody tr",  // Drupal views
    ".view-content .views-row",    // Drupal views
    "ul.news li", "ol li",
    ".press-release", ".announcement",
  ];

  for (const selector of listSelectors) {
    const elements = $(selector);
    if (elements.length >= 3) { // 至少有3个元素才认为是列表
      elements.each((_, el) => {
        const $el = $(el);
        // 找到第一个有意义的链接
        const $link = $el.find("a").first();
        const title = $link.text().trim() || $el.find("h2, h3, h4, .title").first().text().trim();
        if (!title || title.length < 5 || seen.has(title)) return;
        seen.add(title);

        let url = $link.attr("href") || "";
        if (url && !url.startsWith("http")) {
          try { url = new URL(url, baseUrl).href; } catch { /* ignore */ }
        }

        // 过滤无效链接：不能是列表页、目录页、锚点等
        if (!url || url === baseUrl || url.endsWith("/index.html") || url.endsWith("/index.htm")) return;
        if (url.includes("?") && !url.includes("/news/") && !url.includes("/press")) return;

        // 尝试提取日期
        const dateText = $el.find("time, .date, .time, .published, [datetime]").first().text().trim()
          || $el.find("time, .date, .time, .published").first().attr("datetime") || "";

        items.push({ title, url, date: dateText });
      });
      if (items.length >= 3) break; // 找到就停止
    }
  }

  // 策略2: 如果策略1没找到，扫描所有有意义的链接
  if (items.length < 3) {
    items.length = 0;
    seen.clear();
    $("a").each((_, el) => {
      const $a = $(el);
      const title = $a.text().trim();
      let href = $a.attr("href") || "";

      // 过滤太短、导航链接、锚点等
      if (!title || title.length < 10 || seen.has(title)) return;
      if (href.startsWith("#") || href.startsWith("javascript:") || href === "/") return;
      if (/^\s*(Home|About|Contact|Login|Sign|Menu|More|Back|Next|Previous|\d+)\s*$/i.test(title)) return;
      // 过滤分类/导航页面链接（标题太通用）
      if (/^(Other|All|View|See|Read|Show|Browse|Search|Filter|Sort|Category|Archive|Tag)\s/i.test(title)) return;
      if (/^(News|Announcements?|Press|Media|Publications?|Reports?|Statements?|Decisions?)$/i.test(title)) return;
      // 过滤PDF直链和非新闻页面
      if (href.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip)$/i)) return;
      // 过滤列表/目录页面链接
      if (href.endsWith("/index.html") || href.endsWith("/index.htm") || href.endsWith("/index")) return;

      seen.add(title);
      if (href && !href.startsWith("http")) {
        try { href = new URL(href, baseUrl).href; } catch { /* ignore */ }
      }

      items.push({ title, url: href, date: "" });
    });
  }

  return items;
}

// ========== HTML 抓取器 ==========
export async function scrapeHtmlSource(source: Source): Promise<ScrapeResult> {
  const errors: string[] = [];
  const items: ScrapedItem[] = [];

  if (!source.url) {
    return { source, items, errors: ["信息源URL为空"] };
  }

  const selectors = source.selectors as {
    container?: string;
    title?: string;
    link?: string;
    date?: string;
    summary?: string;
  } | null;

  try {
    const html = await fetchHtml(source.url);
    const $ = cheerio.load(html);

    // 如果有CSS选择器，使用精确抓取
    if (selectors?.container && selectors?.title) {
      $(selectors.container).each((_, el) => {
        const $el = $(el);
        const titleEl = $el.find(selectors.title!);
        const title = titleEl.text().trim();
        if (!title) return;

        let url = "";
        if (selectors.link) {
          const linkEl = $el.find(selectors.link);
          url = linkEl.attr("href") || "";
        } else {
          const linkEl = $el.find(selectors.title!);
          url = linkEl.attr("href") || linkEl.closest("a").attr("href") || "";
        }

        if (url && !url.startsWith("http")) {
          try { url = new URL(url, source.url!).href; } catch { /* ignore */ }
        }

        // 过滤无效链接（列表页、目录页等）
        if (!url) return;
        try {
          const parsedUrl = new URL(url);
          const parsedBase = new URL(source.url!);
          // 如果链接和来源页面完全相同，跳过
          if (parsedUrl.pathname === parsedBase.pathname) return;
          // 如果链接是目录页（以 /index.html 结尾且不含文章标识符），跳过
          if (parsedUrl.pathname.endsWith("/index.html") || parsedUrl.pathname.endsWith("/index.htm")) return;
        } catch { /* ignore */ }

        let date = "";
        if (selectors.date) {
          date = $el.find(selectors.date).text().trim();
        }

        // JFSA 特殊处理：日期嵌在标题文本中
        if (!date && source.url?.includes("fsa.go.jp")) {
          date = extractDateFromTitle(title);
        }

        let summary = "";
        if (selectors.summary) {
          summary = $el.find(selectors.summary).text().trim();
        }

        items.push({ title, url, date, summary });
      });

      if (items.length === 0) {
        errors.push("精确模式未找到匹配，尝试智能抓取...");
        // 回退到智能抓取
        const smartItems = smartExtractFromHtml(html, source.url);
        items.push(...smartItems);
        if (smartItems.length > 0) {
          errors.length = 0; // 清除错误，智能抓取成功
          errors.push(`已自动切换到智能抓取模式，获取到 ${smartItems.length} 条新闻`);
        }
      }
    } else {
      // 没有选择器，直接使用智能抓取
      const smartItems = smartExtractFromHtml(html, source.url);
      items.push(...smartItems);
      if (items.length === 0) {
        errors.push("智能抓取未找到新闻条目，该网站可能需要手动配置CSS选择器");
      }
    }
  } catch (err: any) {
    errors.push(`抓取失败: ${err.message}`);
  }

  return { source, items, errors };
}

// ========== RSS 抓取器 ==========
export async function scrapeRssSource(source: Source): Promise<ScrapeResult> {
  const errors: string[] = [];
  const items: ScrapedItem[] = [];

  if (!source.url) {
    return { source, items, errors: ["RSS订阅地址为空"] };
  }

  try {
    const response = await fetch(source.url, {
      headers: { "User-Agent": "NewsAggregator/1.0", "Accept": "application/rss+xml,application/xml,text/xml,*/*" },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return { source, items, errors: [`HTTP请求失败: ${response.status}`] };
    }

    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    // RSS 2.0
    $("item").each((_, el) => {
      const $el = $(el);
      items.push({
        title: $el.find("title").text().trim(),
        url: $el.find("link").text().trim() || $el.find("guid").text().trim(),
        date: $el.find("pubDate").text().trim(),
        summary: $el.find("description").text().trim().substring(0, 500),
      });
    });

    // Atom
    if (items.length === 0) {
      $("entry").each((_, el) => {
        const $el = $(el);
        items.push({
          title: $el.find("title").text().trim(),
          url: $el.find("link").attr("href") || "",
          date: $el.find("published").text().trim() || $el.find("updated").text().trim(),
          summary: $el.find("summary").text().trim().substring(0, 500),
        });
      });
    }

    if (items.length === 0) {
      errors.push("未找到RSS/Atom条目，请检查订阅地址");
    }
  } catch (err: any) {
    errors.push(`RSS抓取失败: ${err.message}`);
  }

  return { source, items, errors };
}

// ========== API 抓取器 ==========
export async function scrapeApiSource(source: Source): Promise<ScrapeResult> {
  const errors: string[] = [];
  const items: ScrapedItem[] = [];

  const apiConfig = source.apiConfig as {
    endpoint?: string;
    headers?: Record<string, string>;
    method?: string;
    body?: string;
    titleField?: string;
    urlField?: string;
    dateField?: string;
    summaryField?: string;
    dataPath?: string;
  } | null;

  if (!apiConfig?.endpoint) {
    return { source, items, errors: ["API端点地址为空"] };
  }

  // ===== JPX 特殊处理：动态计算当月和上月 JSON 文件 ==========
  if (apiConfig.endpoint.includes("jpx.co.jp") && apiConfig.endpoint.includes("news_ym_")) {
    return scrapeJpxApi(source, apiConfig);
  }

  try {
    const fetchOpts: RequestInit = {
      method: apiConfig.method || "GET",
      headers: {
        "User-Agent": "NewsAggregator/1.0",
        "Accept": "application/json",
        ...apiConfig.headers,
      },
      signal: AbortSignal.timeout(30000),
    };

    if (apiConfig.body && apiConfig.method === "POST") {
      fetchOpts.body = apiConfig.body;
      (fetchOpts.headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    const response = await fetch(apiConfig.endpoint, fetchOpts);
    if (!response.ok) {
      return { source, items, errors: [`API请求失败: ${response.status}`] };
    }

    const json = await response.json();

    // 根据dataPath提取数据数组
    let dataArray: any[] = json;
    if (apiConfig.dataPath) {
      const parts = apiConfig.dataPath.split(".");
      let current: any = json;
      for (const part of parts) {
        current = current?.[part];
      }
      dataArray = Array.isArray(current) ? current : [];
    }

    if (!Array.isArray(dataArray)) {
      return { source, items, errors: ["API返回数据格式不正确，无法提取新闻列表"] };
    }

    for (const item of dataArray) {
      const title = apiConfig.titleField ? getNestedValue(item, apiConfig.titleField) : "";
      if (!title) continue;
      items.push({
        title: String(title),
        url: apiConfig.urlField ? String(getNestedValue(item, apiConfig.urlField) || "") : "",
        date: apiConfig.dateField ? String(getNestedValue(item, apiConfig.dateField) || "") : "",
        summary: apiConfig.summaryField ? String(getNestedValue(item, apiConfig.summaryField) || "").substring(0, 500) : "",
      });
    }

    if (items.length === 0) {
      errors.push("API返回数据中未找到新闻条目，请检查字段映射配置");
    }
  } catch (err: any) {
    errors.push(`API抓取失败: ${err.message}`);
  }

  return { source, items, errors };
}

// ========== JPX 专用 API 抓取器 ==========
/**
 * JPX 通过月度 JSON 文件提供新闻数据。
 * 文件命名规则：news_ym_{month_between:02d}.json
 * 其中 month_between = (baseYear * 12 + baseMonth) - (targetYear * 12 + targetMonth)
 * baseYear/baseMonth 为 JS 文件中写死的最新月份（随时间更新）。
 * 
 * 我们采用更稳健的方式：直接尝试当月和前3个月的文件，取得最新数据。
 */
async function scrapeJpxApi(source: Source, apiConfig: any): Promise<ScrapeResult> {
  const errors: string[] = [];
  const items: ScrapedItem[] = [];
  const seen = new Set<string>();

  const baseUrl = "https://www.jpx.co.jp";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.jpx.co.jp/english/corporate/news/news-releases/index.html",
    "Accept": "application/json",
    ...apiConfig.headers,
  };

  // 尝试当月及前3个月的 JSON 文件（month_between = 0, 1, 2, 3）
  for (let mb = 0; mb <= 3; mb++) {
    const jsonUrl = `${baseUrl}/english/news/news_ym_${String(mb).padStart(2, "0")}.json`;
    try {
      const response = await fetch(jsonUrl, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) continue;

      const data: any[] = await response.json();
      if (!Array.isArray(data)) continue;

      for (const item of data) {
        // 只取 JPX 公告类（排除市场行情类，如个股上市、每日价格等）
        if (item.kind !== "JPXからのお知らせ") continue;

        const title: string = item.title || "";
        if (!title || seen.has(title)) continue;
        seen.add(title);

        // 构建完整 URL
        let url = item.url || "";
        if (url && !url.startsWith("http")) {
          url = `${baseUrl}${url}`;
        }

        // 过滤无效链接（列表页、目录页）
        if (!url || url.endsWith("/index.html") || url.endsWith("/index.htm")) continue;
        // 过滤 external_flg 为空且 url 是列表页的情况
        if (url.includes("/index.html")) continue;

        // 构建日期字符串
        const ud = item.updated_date;
        const dateStr = ud ? `${ud.year}-${ud.month}-${ud.day}` : "";

        items.push({ title, url, date: dateStr });
      }
    } catch (err: any) {
      errors.push(`JPX JSON ${mb} 获取失败: ${err.message}`);
    }
  }

  if (items.length === 0) {
    errors.push("JPX API 未获取到有效公告，请检查网络或 JSON 文件路径");
  }

  return { source, items, errors };
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

// ========== 统一抓取入口 ==========
export async function scrapeSource(source: Source): Promise<ScrapeResult> {
  switch (source.sourceType) {
    case "html": return scrapeHtmlSource(source);
    case "rss": return scrapeRssSource(source);
    case "api": return scrapeApiSource(source);
    default: return { source, items: [], errors: [`不支持的信息源类型: ${source.sourceType}`] };
  }
}

// ========== 关键词规则引擎 ==========
export interface FilterResult {
  passed: boolean;
  matchedKeywords: string[];
  excludeReason?: string;
}

/**
 * 智能关键词匹配：
 * - 短关键词（<=5字符且全字母）使用 word boundary 正则匹配，
 *   避免 "SEC" 误匹配 "section"、"sector" 等
 * - 长关键词或含空格的短语使用普通 includes 匹配
 */
function keywordMatchesTitle(keyword: string, titleLower: string): boolean {
  const kwLower = keyword.toLowerCase().trim();
  if (!kwLower) return false;

  // 短缩写（<=5字符、纯字母）→ word boundary 正则
  if (kwLower.length <= 5 && /^[a-z]+$/i.test(kwLower)) {
    const regex = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(titleLower);
  }

  // 长关键词或含特殊字符 → includes
  return titleLower.includes(kwLower);
}

export function applyKeywordRules(title: string, rules: KeywordRule[]): FilterResult {
  const titleLower = title.toLowerCase();
  const matchedKeywords: string[] = [];

  // 分类规则
  const includeRules = rules.filter(r => r.ruleType === "include" && r.enabled);
  const excludeRules = rules.filter(r => r.ruleType === "exclude" && r.enabled);
  const whitelistRules = rules.filter(r => r.ruleType === "whitelist" && r.enabled);

  // 1. 检查白名单（白名单优先级最高，匹配则直接通过）
  for (const rule of whitelistRules) {
    const keywords = rule.keywords as string[];
    for (const kw of keywords) {
      if (keywordMatchesTitle(kw, titleLower)) {
        matchedKeywords.push(kw);
        return { passed: true, matchedKeywords };
      }
    }
  }

  // 2. 检查硬排除（标题包含即丢弃）
  for (const rule of excludeRules) {
    if (rule.excludeStrength !== "hard") continue;
    const keywords = rule.keywords as string[];
    for (const kw of keywords) {
      if (keywordMatchesTitle(kw, titleLower)) {
        return { passed: false, matchedKeywords: [], excludeReason: `硬排除: "${kw}"` };
      }
    }
  }

  // 3. 检查软排除
  let softExcludeReason = "";
  for (const rule of excludeRules) {
    if (rule.excludeStrength !== "soft") continue;
    const keywords = rule.keywords as string[];
    for (const kw of keywords) {
      if (keywordMatchesTitle(kw, titleLower)) {
        softExcludeReason = `软排除: "${kw}"`;
        break;
      }
    }
    if (softExcludeReason) break;
  }

  // 4. 检查包含规则
  let includeMatched = false;
  if (includeRules.length === 0) {
    // 没有包含规则时，所有新闻都通过
    includeMatched = true;
  } else {
    for (const rule of includeRules) {
      const keywords = rule.keywords as string[];
      if (rule.logic === "and") {
        // AND逻辑：所有关键词都要匹配
        const allMatch = keywords.every(kw => keywordMatchesTitle(kw, titleLower));
        if (allMatch) {
          includeMatched = true;
          matchedKeywords.push(...keywords);
        }
      } else {
        // OR逻辑：任一关键词匹配
        for (const kw of keywords) {
          if (keywordMatchesTitle(kw, titleLower)) {
            includeMatched = true;
            matchedKeywords.push(kw);
          }
        }
      }
    }
  }

  // 5. 综合判断
  if (!includeMatched) {
    return { passed: false, matchedKeywords: [], excludeReason: "未匹配任何包含规则" };
  }

  if (softExcludeReason) {
    return { passed: false, matchedKeywords, excludeReason: softExcludeReason };
  }

  return { passed: true, matchedKeywords: Array.from(new Set(matchedKeywords)) };
}

// ========== 手动粘贴解析 ==========
export function parseManualText(text: string): ScrapedItem[] {
  const items: ScrapedItem[] = [];
  // 按空行或换行分割为独立条目
  const blocks = text.split(/\n\s*\n/).filter(b => b.trim());

  for (const block of blocks) {
    const lines = block.trim().split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // 第一行作为标题
    let title = lines[0];
    let url = "";
    let date = "";

    // 查找URL
    for (const line of lines) {
      const urlMatch = line.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        url = urlMatch[0];
        break;
      }
    }

    // 查找日期
    for (const line of lines) {
      const dateMatch = line.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/) ||
                        line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{4}/) ||
                        line.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4}/i);
      if (dateMatch) {
        date = dateMatch[0];
        break;
      }
    }

    // 清理标题中的URL
    title = title.replace(/https?:\/\/[^\s]+/g, "").trim();
    if (title) {
      items.push({ title, url, date });
    }
  }

  // 如果按空行分割没有结果，尝试按单行分割
  if (items.length === 0) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const urlMatch = line.match(/https?:\/\/[^\s]+/);
      const cleanTitle = line.replace(/https?:\/\/[^\s]+/g, "").trim();
      if (cleanTitle.length > 5) {
        items.push({
          title: cleanTitle,
          url: urlMatch?.[0] || "",
          date: "",
        });
      }
    }
  }

  return items;
}

// ========== 将抓取结果转换为文章记录 ==========
export function convertToArticles(
  result: ScrapeResult,
  rules: KeywordRule[],
): InsertArticle[] {
  const articleList: InsertArticle[] = [];
  const seen = new Set<string>();

  for (const item of result.items) {
    // 去重：同一次抓取中相同标题只保留一条
    const titleKey = item.title.toLowerCase().trim();
    if (seen.has(titleKey)) continue;
    seen.add(titleKey);

    // 过滤太短的标题（通常是导航链接）
    if (item.title.trim().length < 10) continue;

    // 过滤明显的导航/功能性链接
    const navPatterns = /^(Visit|View|See|Read|Browse|Search|Filter|Sort|Home|About|Contact|Login|Sign|Menu|More|Back|Next|Previous|Subscribe|Download|Share|Print|RSS|Sitemap|Privacy|Terms|Disclaimer|Copyright|FAQ|Help)\b/i;
    if (navPatterns.test(item.title.trim())) continue;

    const filterResult = applyKeywordRules(item.title, rules);

    // 解析日期（支持多种格式）
    const parsedDate = parseFlexibleDate(item.date);

    // 日期过滤：超过90天的旧新闻直接丢弃（不入库）
    if (parsedDate && !isRecentDate(parsedDate, 90)) continue;

    articleList.push({
      sourceId: result.source.id,
      title: item.title,
      url: item.url,
      publishDate: parsedDate || new Date(),
      matchedKeywords: filterResult.matchedKeywords,
      summary: item.summary || null,
      sourceName: result.source.name,
      inReport: false,
      isManual: false,
      isExcluded: !filterResult.passed,
    });
  }

  return articleList;
}
