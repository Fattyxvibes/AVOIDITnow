import { refreshFocusedNews } from "../server/newsRefresh.ts";

try {
  const result = await refreshFocusedNews();
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
