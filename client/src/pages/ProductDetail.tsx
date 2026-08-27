import { BackLink, PublicPage, QueryState } from "@/components/PublicPage";
import { trpc } from "@/lib/trpc";
import { ExternalLink, SearchCheck, Tag } from "lucide-react";
import { Link, useRoute } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const result = trpc.platform.directory.productDetail.useQuery({ slug: params?.slug ?? "" }, { enabled: Boolean(params?.slug) });
  const entry = result.data;
  return <PublicPage eyebrow="Legacy product record" title={entry?.product.name ?? "Product record"} summary={entry?.product.description ?? "Loading published product context."}>
    <BackLink href="/directory" children="Back to product checker" />
    <QueryState loading={result.isLoading} error={result.error} empty={!entry} emptyTitle="This product record is unavailable" emptyDescription="Use the product checker to search the supplied database directly.">
      {entry && <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><article className="rounded-2xl border border-black/10 bg-white p-7"><div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.14em] text-[#137547]"><Tag className="size-4" />{entry.product.category}</div><h2 className="mt-7 text-2xl font-bold tracking-[-.04em] text-[#172119]">Published product context</h2><p className="mt-4 text-base leading-7 text-[#566159]">{entry.product.description}</p>{entry.brand && <p className="mt-7 rounded-xl bg-[#f4f6f3] p-4 text-sm text-[#566159]">Associated brand: <span className="font-semibold text-[#172119]">{entry.brand.name}</span></p>}</article><aside className="space-y-5"><section className="rounded-2xl border border-black/10 bg-white p-6"><p className="text-xs font-extrabold uppercase tracking-[.15em] text-[#137547]">Published sources</p><div className="mt-5 space-y-3">{entry.citations.length ? entry.citations.map(citation => <a key={citation.id} href={citation.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-black/8 p-4 transition hover:border-[#137547]/25"><p className="font-semibold text-[#172119]">{citation.title}</p><p className="mt-1 text-xs text-[#6b756d]">{citation.publisher ?? citation.sourceType}</p><ExternalLink className="mt-3 size-4 text-[#137547]" /></a>) : <p className="text-sm leading-6 text-[#687269]">No product-specific source links are published for this legacy record.</p>}</div></section><section className="rounded-2xl border border-[#137547]/20 bg-[#edf6ef] p-6"><SearchCheck className="size-5 text-[#137547]" /><h2 className="mt-4 text-lg font-bold text-[#172119]">Check this product now</h2><p className="mt-2 text-sm leading-6 text-[#566159]">The unified checker returns the database result and direct alternatives together, when a reviewed match exists.</p><Link href={`/directory?q=${encodeURIComponent(entry.product.name)}`} className="mt-5 inline-flex rounded-lg bg-[#137547] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f653d]">Check {entry.product.name}</Link></section></aside></div>}
    </QueryState>
  </PublicPage>;
}
