import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePolicyAgreement } from "@/components/PolicyAgreement";
import { PublicPage } from "@/components/PublicPage";
import { ViewportReveal } from "@/components/ViewportReveal";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Search, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

export default function Directory() {
  const initialQuery = useMemo(() => new URLSearchParams(window.location.search).get("q")?.trim() ?? "", []);
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const { hasAccepted, requestPolicyAgreement, agreementDialog } = usePolicyAgreement();
  const input = useMemo(() => ({ query: submittedQuery }), [submittedQuery]);
  const result = trpc.platform.productCheck.useQuery(input, { enabled: submittedQuery.trim().length >= 2 });

  useEffect(() => {
    if (hasAccepted && initialQuery.length >= 2) setSubmittedQuery(initialQuery);
  }, [hasAccepted, initialQuery]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery.length >= 2) requestPolicyAgreement(() => setSubmittedQuery(trimmedQuery));
  };
  const data = result.data;

  return (
    <PublicPage
      eyebrow="Product checker"
      title="From uncertainty to a more informed everyday choice"
      summary="Check a product and see alternatives immediately."
    >
      <ViewportReveal delay={80}><form onSubmit={submit} className="rounded-2xl border border-black/10 bg-white p-3 shadow-[0_10px_30px_rgba(20,33,23,.06)]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-[#f3f6f1] px-4">
            <Search className="size-5 shrink-0 text-[#137547]" />
            <Input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Try Coca-Cola, Kit Kat, Apple, or a sub-brand"
              className="h-12 border-0 bg-transparent p-0 text-[#172119] placeholder:text-[#728076] focus-visible:ring-0"
              aria-label="Product or brand name"
            />
          </label>
          <Button type="submit" disabled={query.trim().length < 2} className="h-12 bg-[#137547] px-7 font-bold text-white hover:bg-[#0e633b]">
            Check product
          </Button>
        </div>
        <p className="mt-3 flex items-start gap-2 px-1 text-xs leading-5 text-[#667169]">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#137547]" />
          This checker brings together current boycott-list information and related alternatives. A green result means the product is not currently on the boycott list.
        </p>
      </form></ViewportReveal>

      {!submittedQuery ? (
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <InfoCard delay={120} title="Search the item" copy="Use a listed brand, product, or sub-brand." />
          <InfoCard delay={210} title="Read the status" copy="A red result means the product is on the boycott list." />
          <InfoCard delay={300} title="Choose an alternative" copy="Every boycotted product displays three related alternatives directly below it." />
        </div>
      ) : result.isLoading ? (
        <ViewportReveal delay={120}><div className="mt-10 rounded-2xl border border-black/10 bg-white p-10 text-center text-sm text-[#59645b]">Checking the boycott list…</div></ViewportReveal>
      ) : result.error ? (
        <ViewportReveal delay={120}><div className="mt-10 rounded-2xl border border-[#ce2d32]/25 bg-[#fff2f1] p-8 text-center text-sm text-[#7a3935]">The product check could not be completed. Please try again.</div></ViewportReveal>
      ) : data ? (
        <ViewportReveal delay={120}><section className="mt-10 space-y-6">
          <div className={`rounded-2xl border p-6 sm:p-8 ${data.verdict === "reviewed_boycott_match" ? "border-[#ce2d32]/25 bg-[#fff4f3]" : "border-[#d7e7da] bg-[#f1f7f1]"}`}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge className={data.verdict === "reviewed_boycott_match" ? "border border-[#ce2d32]/20 bg-[#ce2d32]/10 text-[#9c2025]" : "border border-[#137547]/20 bg-[#137547]/10 text-[#0e633b]"}>
                  {data.verdict === "reviewed_boycott_match" ? "On boycott list" : "Not currently on boycott list"}
                </Badge>
                <h2 className="mt-4 text-2xl font-bold tracking-[-.035em] text-[#172119]">
                  {data.verdict === "reviewed_boycott_match" ? `“${data.query}” is on the boycott list.` : `“${data.query}” is not currently on the boycott list.`}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#536057]">{data.source.caveat}</p>
              </div>
              <a href={data.source.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-bold text-[#137547] hover:text-[#0e633b]">
                Open source list <ExternalLink className="size-4" />
              </a>
            </div>
            <p className="mt-5 text-xs font-semibold text-[#667169]">Source: {data.source.name} · reviewed {new Date(data.source.reviewedAt).toLocaleDateString()}</p>
          </div>

          {data.verdict === "reviewed_boycott_match" && data.matches.map((match, index) => (
            <ViewportReveal key={match.id} variant="scale" delay={170 + index * 90}><article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_7px_20px_rgba(20,33,23,.035)]">
              <div className="border-b border-black/8 p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-extrabold uppercase tracking-[.15em] text-[#137547]">{match.category}</span>
                  <Badge className="border border-[#ce2d32]/20 bg-[#fff1f0] text-[#9c2025]">Boycott list · {match.impactOnSource} impact</Badge>
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-[-.035em] text-[#172119]">{match.listedBrand}</h3>
                <p className="mt-2 text-base font-semibold text-[#465247]">{match.listedSubproduct}</p>
                <div className="mt-5 flex flex-wrap gap-3 text-xs">
                  <span className="rounded-full bg-[#f2f5ef] px-3 py-1.5 font-semibold text-[#4c594f]">Country shown: {match.countryShown || "Not listed"}</span>
                  <span className="rounded-full bg-[#f2f5ef] px-3 py-1.5 font-semibold text-[#4c594f]">Source reference {match.workbookRow}</span>
                </div>
                {match.notes && <p className="mt-5 max-w-3xl text-sm leading-6 text-[#59645b]">{match.notes}</p>}
              </div>
              <div className="bg-[#f7faf6] p-6 sm:p-7">
                <p className="text-xs font-extrabold uppercase tracking-[.17em] text-[#137547]">Related alternatives</p>
                <h4 className="mt-2 text-xl font-bold text-[#172119]">Choose a comparable option</h4>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {match.alternatives.slice(0, 3).map(alternative => (
                    <a key={alternative.id} href={alternative.sourceUrl} target="_blank" rel="noreferrer" className="group rounded-xl border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#137547]/35 hover:shadow-[0_12px_25px_rgba(20,33,23,.08)]">
                      <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#137547]">Alternative {alternative.position}</p>
                      <h5 className="mt-3 text-lg font-bold text-[#172119]">{alternative.company}</h5>
                      <p className="mt-2 text-sm leading-6 text-[#59645b]">{alternative.productService}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#137547]">Open official source <ExternalLink className="size-3" /></span>
                    </a>
                  ))}
                </div>
              </div>
            </article></ViewportReveal>
          ))}
        </section></ViewportReveal>
      ) : null}
      {agreementDialog}
    </PublicPage>
  );
}

function InfoCard({ title, copy, delay }: { title: string; copy: string; delay: number }) {
  return (
    <ViewportReveal variant="scale" delay={delay}><article className="rounded-2xl border border-black/10 bg-white p-6">
      <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#ce2d32]">One simple flow</p>
      <h2 className="mt-4 text-lg font-bold text-[#172119]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#59645b]">{copy}</p>
    </article></ViewportReveal>
  );
}
