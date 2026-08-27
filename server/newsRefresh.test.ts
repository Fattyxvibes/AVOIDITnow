import { describe, expect, it } from "vitest";
import { deduplicatePublisherItems, isFocusedConflictItem, parseRssItems } from "./newsRefresh";

describe("focused publisher news filtering", () => {
  it("parses publisher RSS items and retains Gaza and Sudan conflict updates", () => {
    const items = parseRssItems(`<?xml version="1.0"?><rss><channel><item><title>Gaza aid corridor reopens</title><link>https://example.test/gaza</link><description><![CDATA[Humanitarian aid reaches Gaza.]]></description><pubDate>Tue, 19 Aug 2026 10:00:00 GMT</pubDate></item><item><title>Football final</title><link>https://example.test/sport</link><description>Scores and highlights.</description><pubDate>Tue, 19 Aug 2026 09:00:00 GMT</pubDate></item><item><title>Displacement in Darfur</title><link>https://example.test/darfur</link><description>Sudanese families seek shelter.</description><pubDate>Tue, 19 Aug 2026 08:00:00 GMT</pubDate></item></channel></rss>`);
    expect(items).toHaveLength(3);
    expect(items.filter(isFocusedConflictItem).map(item => item.title)).toEqual(["Gaza aid corridor reopens", "Displacement in Darfur"]);
  });

  it("turns entity-encoded feed markup into readable source summaries", () => {
    const [item] = parseRssItems(`<?xml version="1.0"?><rss><channel><item><title>Gaza medical aid delivery</title><link>https://example.test/gaza-aid</link><description>&lt;p&gt;Humanitarian &amp;amp; medical aid reaches families.&lt;/p&gt;</description><pubDate>Tue, 19 Aug 2026 10:00:00 GMT</pubDate></item></channel></rss>`);
    expect(item.summary).toBe("Humanitarian & medical aid reaches families.");
    expect(item.summary).not.toContain("<p>");
  });

  it("keeps one copy when a publisher repeats a story through two RSS URLs", () => {
    const uniqueItems = deduplicatePublisherItems([
      { sourceName: "Middle East Eye", title: "Gaza hospital hit in airstrike", url: "https://example.test/live-blog", summary: "Reports from Gaza.", publishedAt: new Date("2026-08-19T10:00:00Z") },
      { sourceName: "Middle East Eye", title: "Gaza hospital hit in airstrike", url: "https://example.test/article", summary: "Full report from Gaza.", publishedAt: new Date("2026-08-19T10:01:00Z") },
      { sourceName: "BBC News", title: "Gaza hospital hit in airstrike", url: "https://example.test/bbc", summary: "Separate publisher report.", publishedAt: new Date("2026-08-19T10:02:00Z") },
    ]);
    expect(uniqueItems.map(item => item.url)).toEqual(["https://example.test/live-blog", "https://example.test/bbc"]);
  });

  it("excludes general political, diplomatic, and unrelated casualty coverage without a direct conflict-impact signal", () => {
    expect(isFocusedConflictItem({ title: "Palestinian factions explore broad alliance for elections", summary: "Parties discuss November voting." })).toBe(false);
    expect(isFocusedConflictItem({ title: "US pressure on Israel needed for peace in Syria", summary: "Diplomatic analysis." })).toBe(false);
    expect(isFocusedConflictItem({ title: "Palestinian refugee and relatives drown off English coast", summary: "Local rescue services responded." })).toBe(false);
    expect(isFocusedConflictItem({ title: "West Bank settler violence displaces Palestinian families", summary: "Aid groups report displacement after raids." })).toBe(true);
  });
});
