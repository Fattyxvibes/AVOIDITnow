import { createHash } from "node:crypto";
import * as db from "./db";

export const APPROVED_NEWS_SOURCES = [
  { name: "Al Jazeera", feedUrl: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "BBC News", feedUrl: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { name: "Middle East Eye", feedUrl: "https://www.middleeasteye.net/rss" },
  { name: "Middle East News Agency (MENA)", feedUrl: "https://mena.org.eg/en/rss" },
] as const;

export type FeedItem = { title: string; url: string; summary: string; publishedAt: Date };

const FOCUSED_CONFLICT_GEOGRAPHY_PATTERN = /\b(gaza|palestin(?:e|ian)|rafah|west bank|sudan|sudanese|darfur|khartoum|el[ -]?fasher|syria|yemen|kashmir|rohingya|somalia|lebanon)\b/i;
const FOCUSED_CONFLICT_IMPACT_PATTERN = /\b(war|conflict|attack|airstrike|bomb(?:ing|ed)?|military|soldier|fired|killed|death|casualt(?:y|ies)|injur(?:ed|y)|war crimes?|detainee|detain(?:ed|ing)|settler|settlement|raid|siege|blockade|famine|humanitarian aid|\baid\b|displace(?:d|ment)|ceasefire|violence|occupation)\b/i;

function decodeEntities(value: string) {
  let decoded = value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  for (let pass = 0; pass < 2; pass += 1) {
    decoded = decoded
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  return decoded
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagValue(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

export function parseRssItems(xml: string): FeedItem[] {
  return Array.from(xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)).flatMap(match => {
    const item = match[1];
    const title = tagValue(item, "title");
    const url = tagValue(item, "link") || tagValue(item, "guid");
    const summary = tagValue(item, "description") || tagValue(item, "content:encoded");
    const rawDate = tagValue(item, "pubDate") || tagValue(item, "published");
    const publishedAt = new Date(rawDate);
    if (!title || !url || Number.isNaN(publishedAt.getTime())) return [];
    return [{ title, url, summary, publishedAt }];
  });
}

export function isFocusedConflictItem(item: Pick<FeedItem, "title" | "summary">) {
  const text = `${item.title} ${item.summary}`;
  return FOCUSED_CONFLICT_GEOGRAPHY_PATTERN.test(text) && FOCUSED_CONFLICT_IMPACT_PATTERN.test(text);
}

function sourceStoryKey(sourceName: string | null | undefined, title: string) {
  const normalizedTitle = title.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  return `${sourceName ?? "Unnamed source"}:${normalizedTitle}`;
}

export function deduplicatePublisherItems<T extends FeedItem & { sourceName: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = sourceStoryKey(item.sourceName, item.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createExternalKey(url: string) {
  return createHash("sha256").update(url).digest("hex").slice(0, 64);
}

export async function refreshFocusedNews() {
  const results = await Promise.allSettled(APPROVED_NEWS_SOURCES.map(async source => {
    const response = await fetch(source.feedUrl, {
      headers: { "user-agent": "Avoidit focused-news refresh/1.0" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`${source.name} feed returned ${response.status}`);
    return { source, items: parseRssItems(await response.text()) };
  }));

  let imported = 0;
  let availableSources = 0;
  const candidateItems: Array<FeedItem & { sourceName: string }> = [];
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    availableSources += 1;
    candidateItems.push(...result.value.items.filter(isFocusedConflictItem).map(item => ({ ...item, sourceName: result.value.source.name })));
  }

  for (const item of deduplicatePublisherItems(candidateItems)) {
    const externalKey = createExternalKey(item.url);
      await db.upsertFocusedNewsArticle({
        externalKey,
        title: item.title.slice(0, 240),
        slug: `source-update-${externalKey.slice(0, 28)}`,
        excerpt: (item.summary || "Read the original publisher report for details.").slice(0, 1000),
        content: `${item.summary || "Read the original publisher report for details."}\n\nThis source-linked update is refreshed from ${item.sourceName}. Open the original report for full context.`,
        category: "Conflict update",
        sourceName: item.sourceName,
        sourceUrl: item.url.slice(0, 512),
        publishedAt: item.publishedAt,
      });
      imported += 1;
  }

  const storedFocusedArticles = await db.listFocusedNewsArticlesForScopeReview();
  const retainedStoryKeys = new Set<string>();
  const idsToRemove = new Set<number>();
  for (const article of storedFocusedArticles) {
    if (!isFocusedConflictItem({ title: article.title, summary: article.excerpt })) {
      idsToRemove.add(article.id);
      continue;
    }
    const key = sourceStoryKey(article.sourceName, article.title);
    if (retainedStoryKeys.has(key)) idsToRemove.add(article.id);
    else retainedStoryKeys.add(key);
  }
  const pruned = await db.removeFocusedNewsArticles(Array.from(idsToRemove));

  if (!availableSources) {
    await db.updateFocusedNewsRefreshState({ lastStatus: "source-unavailable", lastImportedCount: 0 });
    throw new Error("No approved publisher feed was available.");
  }
  await db.updateFocusedNewsRefreshState({ lastStatus: "ok", lastImportedCount: imported });
  return { availableSources, imported, pruned };
}
