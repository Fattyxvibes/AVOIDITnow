# Updates Source Review

## Supplied link

The user supplied a Google search URL for updates on Palestine and Sudan conflict reporting. The result page was CAPTCHA-blocked for interactive browsing, but its accessible result content showed the user's intended focus: Gaza/Palestine, Sudan, and humanitarian-conflict reporting rather than general news.

## Candidate publisher pages

| Publisher | Candidate page | Intended use |
| --- | --- | --- |
| Al Jazeera | https://www.aljazeera.com/middle-east/ | Gaza and regional conflict reporting |
| BBC News | https://www.bbc.com/news/world/middle_east | Gaza and Middle East conflict reporting |
| Middle East Eye | https://www.middleeasteye.net/home | Regional conflict and humanitarian reporting; used as the likely interpretation of the user's “East News” reference |
| Middle East News Agency (MENA) | https://mena.org.eg/en/mena-news | Official English news service and RSS source; used as the verified “East News” source for scoped reporting |

## Editorial scope

Only reporting demonstrably related to Gaza/Palestine, Sudan, or comparable humanitarian conflicts affecting Muslim communities should enter the public Updates section. Every item must retain its original publisher URL and publication date, and unrelated general outlet coverage must be excluded.

## Verified feed endpoints and current relevance

| Publisher | Machine-readable source | Current focused item observed | Feed handling |
| --- | --- | --- | --- |
| Al Jazeera | https://www.aljazeera.com/xml/rss/all.xml | Reporting on the Hind Rajab case and aid reaching Gaza | Parse RSS items and retain only scoped conflict keywords. |
| BBC News | https://feeds.bbci.co.uk/news/world/rss.xml | Reporting on the Hind Rajab case, Gaza missing persons, and West Bank settlement plans | Parse RSS items and retain only scoped conflict keywords. |
| Middle East Eye | https://www.middleeasteye.net/rss | Reporting connected to alleged war crimes in Gaza and Palestinian land access | Parse the public RSS-like source, retaining only scoped items. |
| Middle East News Agency (MENA) | https://mena.org.eg/en/rss | MENA’s official English news service exposes an RSS endpoint linked from its news-services page. | Parse RSS items and retain only scoped conflict keywords. |

The fetched feeds also contained unrelated sport, technology, entertainment, and other world news. Those items are explicitly out of scope and must not be stored or displayed.

## Initial verified refresh

On 19 August 2026, the focused refresh reached all four approved sources and imported 19 source-linked articles. Refresh metadata recorded status `ok`, a timestamp of `2026-08-19 17:32:39`, and `lastImportedCount` of 19. Stored source URLs were unique within each publisher group: Al Jazeera (9), BBC News (3), and Middle East Eye (9). The source-linked results included Gaza humanitarian reporting, the Hind Rajab investigation, West Bank settler violence, Palestinian detainees, and Syrian conflict coverage.

The relevant feed URLs remain [Al Jazeera RSS](https://www.aljazeera.com/xml/rss/all.xml), [BBC World RSS](https://feeds.bbci.co.uk/news/world/rss.xml), [Middle East Eye RSS](https://www.middleeasteye.net/rss), and [MENA RSS](https://mena.org.eg/en/rss).
