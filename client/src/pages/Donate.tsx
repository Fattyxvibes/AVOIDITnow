import { PublicPage, QueryState } from "@/components/PublicPage";
import { ViewportReveal } from "@/components/ViewportReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { CreditCard, HeartHandshake, Loader2, LockKeyhole } from "lucide-react";
import { useState } from "react";

const presets = [10, 25, 50, 100];

export default function Donate() {
  const result = trpc.platform.donations.campaigns.useQuery();
  const [amount, setAmount] = useState(25);
  const [recurring, setRecurring] = useState(false);
  const campaign = result.data?.[0];
  const progress = campaign ? Math.min(100, (Number(campaign.raisedAmount) / Number(campaign.goalAmount)) * 100) : 0;

  return (
    <PublicPage eyebrow="Coming soon" title="Fund the work that makes choices clearer" summary="Campaigns provide focused support for transparent research, community care and maintaining the public resource.">
      <ViewportReveal delay={80}>
        <QueryState loading={result.isLoading} error={result.error} empty={!campaign} emptyTitle="Coming soon." emptyDescription="" emptyActionLabel="" emptyActionHref="/donate" compactEmpty emptyIcon={<Loader2 aria-hidden="true" className="mx-auto size-8 animate-spin text-[#137547]" />}>
          {campaign && (
            <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
              <ViewportReveal variant="scale" delay={170}>
                <section className="rounded-3xl border border-white/10 bg-white/[.035] p-7 sm:p-9">
                  <div className="flex items-center justify-between gap-4"><Badge className="border border-amber-300/20 bg-amber-300/10 text-amber-100">{campaign.urgency}</Badge><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-50/45">Campaign</p></div>
                  <h2 className="mt-8 font-display text-3xl font-semibold tracking-[-.05em] text-white">{campaign.title}</h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-emerald-50/65">{campaign.description}</p>
                  <div className="mt-9"><div className="flex items-end justify-between"><p className="text-lg font-semibold text-white">${Number(campaign.raisedAmount).toLocaleString()}</p><p className="text-sm text-emerald-50/50">of ${Number(campaign.goalAmount).toLocaleString()}</p></div><Progress value={progress} className="mt-3 h-3 bg-white/10 [&>div]:bg-emerald-300" /><p className="mt-3 text-xs text-emerald-50/45">Campaign progress is confirmed through payment records after checkout is enabled.</p></div>
                </section>
              </ViewportReveal>
              <ViewportReveal variant="scale" delay={260}>
                <aside className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[.055] p-7">
                  <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-300 text-emerald-950"><HeartHandshake className="size-5" /></span><div><p className="font-semibold text-white">Support planning</p><p className="text-xs text-emerald-50/50">Checkout is currently unavailable</p></div></div>
                  <div className="mt-7 grid grid-cols-2 gap-2">{presets.map(value => <button key={value} onClick={() => setAmount(value)} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${amount === value ? "border-emerald-300 bg-emerald-300 text-emerald-950" : "border-white/10 bg-black/10 text-emerald-50/80 hover:bg-white/8"}`}>${value}</button>)}</div>
                  <label className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4"><span className="text-sm text-emerald-50/55">$</span><Input type="number" min="1" value={amount} onChange={event => setAmount(Number(event.target.value))} className="h-11 border-0 bg-transparent p-0 text-white focus-visible:ring-0" aria-label="Planned donation amount in US dollars" /></label>
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-4"><div><p className="text-sm font-semibold text-white">Plan monthly support</p><p className="mt-1 text-xs text-emerald-50/50">This preference will be used when Stripe is connected.</p></div><Switch checked={recurring} onCheckedChange={setRecurring} aria-label="Plan monthly support" /></div>
                  <Button disabled className="mt-6 h-12 w-full bg-emerald-300 font-semibold text-emerald-950 disabled:opacity-60"><CreditCard className="mr-2 size-4" />Checkout unavailable</Button>
                  <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-emerald-50/50"><LockKeyhole className="mt-.5 size-3.5 shrink-0 text-emerald-300" />No payment information is collected on this site until Stripe checkout has been connected in Settings → Payment.</p>
                </aside>
              </ViewportReveal>
            </div>
          )}
        </QueryState>
      </ViewportReveal>
    </PublicPage>
  );
}
