import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSearchAnalyticsCsv } from "@/lib/dashboardCsv";
import { trpc } from "@/lib/trpc";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, CalendarDays, Download, LockKeyhole, Search, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

const OWNER_EMAIL = "adegokefaatihat@gmail.com";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangeFromDays(days: number) {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { startDate: toDateInput(start), endDate: toDateInput(end) };
}

const dashboardMenu = [{ icon: BarChart3, label: "Search analytics", path: "/dashboard" }];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const isOwner = user?.email?.trim().toLowerCase() === OWNER_EMAIL;

  return (
    <DashboardLayout menuItems={dashboardMenu} label="AVOIDITnow dashboard">
      {loading ? <div className="min-h-[50vh]" /> : !isOwner ? <AccessDenied /> : <SearchAnalytics />}
    </DashboardLayout>
  );
}

function AccessDenied() {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center rounded-3xl border border-[#ce2d32]/20 bg-[#fff9f8] p-8 text-center shadow-[0_16px_45px_rgba(60,20,16,.06)]">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#ce2d32]/10 text-[#a42328]"><LockKeyhole className="size-6" /></span>
      <p className="mt-6 text-xs font-extrabold uppercase tracking-[.16em] text-[#a42328]">Private dashboard</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-.04em] text-[#172119]">Access is restricted</h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-[#536057]">This dashboard is available only to the authorised AVOIDITnow owner. Public site browsing and product checks remain available without signing in.</p>
    </section>
  );
}

function SearchAnalytics() {
  const [range, setRange] = useState(() => rangeFromDays(30));
  const dateInput = useMemo(() => ({ startDate: range.startDate, endDate: range.endDate }), [range]);
  const rangeIsValid = range.startDate <= range.endDate;
  const analytics = trpc.dashboard.searchAnalytics.useQuery(dateInput, { enabled: rangeIsValid });
  const exportSearches = trpc.dashboard.exportSearchAnalytics.useQuery(dateInput, { enabled: false });
  const data = analytics.data;

  const applyPreset = (days: number) => setRange(rangeFromDays(days));
  const exportCsv = async () => {
    const result = await exportSearches.refetch();
    if (!result.data) return;
    const csv = createSearchAnalyticsCsv({ ...range, rows: result.data });
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `avoiditnow-search-analytics-${range.startDate}-to-${range.endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10 text-[#172119]">
      <header className="flex flex-col gap-5 rounded-3xl border border-[#137547]/14 bg-[linear-gradient(120deg,#f7fbf6,white_58%,#eef7ef)] p-6 shadow-[0_14px_35px_rgba(20,33,23,.045)] md:flex-row md:items-end md:justify-between md:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.16em] text-[#137547]"><BarChart3 className="size-4" /> Private analytics</div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Product search activity</h1>
          <p className="mt-3 text-sm leading-6 text-[#536057]">Review what visitors look for over time. This dashboard stores only normalised product-search terms and timestamps—never searcher accounts, emails, IP addresses, sessions, or device identifiers.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#137547]/12 bg-white px-4 py-3 text-xs font-semibold text-[#536057]"><ShieldCheck className="size-4 text-[#137547]" /> Owner-only access</div>
      </header>

      <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(20,33,23,.04)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#137547]">Date range</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[{ label: "7 days", days: 7 }, { label: "30 days", days: 30 }, { label: "90 days", days: 90 }].map(preset => (
                <Button key={preset.days} variant="outline" size="sm" onClick={() => applyPreset(preset.days)} className="min-h-11 border-[#137547]/20 bg-white text-[#137547] hover:bg-[#edf6ee]">{preset.label}</Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-[#536057]">From<Input type="date" value={range.startDate} onChange={event => setRange(current => ({ ...current, startDate: event.target.value }))} className="mt-1.5 h-11 border-black/12 bg-white text-[#172119]" /></label>
            <label className="text-xs font-bold text-[#536057]">To<Input type="date" value={range.endDate} onChange={event => setRange(current => ({ ...current, endDate: event.target.value }))} className="mt-1.5 h-11 border-black/12 bg-white text-[#172119]" /></label>
            </div>
            <Button onClick={exportCsv} disabled={!rangeIsValid || exportSearches.isFetching} className="h-11 bg-[#137547] px-4 text-white hover:bg-[#0d5b36]">
              <Download className="mr-2 size-4" />{exportSearches.isFetching ? "Preparing CSV…" : "Export CSV"}
            </Button>
          </div>
        </div>
        {!rangeIsValid && <p className="mt-4 text-sm font-semibold text-[#a42328]">Choose an end date that is on or after the start date.</p>}
      </section>

      {analytics.error ? <section className="rounded-3xl border border-[#ce2d32]/20 bg-[#fff8f7] p-8 text-sm text-[#8f2d2e]">Analytics could not be loaded. Please refresh and try again.</section> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total searches" value={analytics.isLoading ? "…" : String(data?.totalSearches ?? 0)} icon={<Search className="size-5" />} />
        <MetricCard label="Unique product terms" value={analytics.isLoading ? "…" : String(data?.uniqueQueries ?? 0)} icon={<BarChart3 className="size-5" />} />
        <MetricCard label="Selected period" value={`${range.startDate} to ${range.endDate}`} icon={<CalendarDays className="size-5" />} detail />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.9fr)]">
        <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(20,33,23,.04)] sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#137547]">Search trend</p><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-.035em]">Daily product checks</h2></div><CalendarDays className="size-5 text-[#137547]" /></div>
          <div className="mt-6 h-72">
            {data?.dailySearches.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={data.dailySearches} margin={{ left: -20, right: 8, top: 6, bottom: 0 }}><defs><linearGradient id="searches" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#137547" stopOpacity={0.28} /><stop offset="100%" stopColor="#137547" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e3ebe3" /><XAxis dataKey="date" tick={{ fontSize: 11, fill: "#667169" }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#667169" }} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ borderRadius: 14, borderColor: "#d7e7da" }} /><Area type="monotone" dataKey="count" name="Searches" stroke="#137547" strokeWidth={2.5} fill="url(#searches)" /></AreaChart></ResponsiveContainer> : <EmptyChart />}
          </div>
        </article>

        <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(20,33,23,.04)] sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#137547]">Privacy note</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-.035em]">What this view does not collect</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-[#536057]">
            <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#137547]" />No visitor accounts or emails are connected to searches.</li>
            <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#137547]" />No IP address, session identifier, browser fingerprint, or device identifier is stored for this dashboard.</li>
            <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#137547]" />Results show aggregate product terms and selected-period counts only.</li>
          </ul>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RankedQueries title="Most searched products" description="Highest search counts in the selected period." icon={<TrendingUp className="size-5 text-[#137547]" />} rows={data?.mostSearched ?? []} loading={analytics.isLoading} />
        <RankedQueries title="Least searched products" description="Lowest search counts among terms searched in the selected period." icon={<TrendingDown className="size-5 text-[#ce2d32]" />} rows={data?.leastSearched ?? []} loading={analytics.isLoading} />
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon, detail = false }: { label: string; value: string; icon: React.ReactNode; detail?: boolean }) {
  return <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(20,33,23,.04)]"><div className="flex items-center justify-between text-[#137547]">{icon}<span className="text-xs font-extrabold uppercase tracking-[.14em]">Live range</span></div><p className="mt-6 text-xs font-extrabold uppercase tracking-[.15em] text-[#667169]">{label}</p><p className={`mt-2 font-display font-semibold tracking-[-.04em] text-[#172119] ${detail ? "text-xl" : "text-4xl"}`}>{value}</p></article>;
}

function EmptyChart() {
  return <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#137547]/20 bg-[#f8fbf8] text-center"><Search className="size-6 text-[#137547]" /><p className="mt-3 text-sm font-bold text-[#172119]">No searches in this period yet</p><p className="mt-1 max-w-xs text-xs leading-5 text-[#667169]">The chart will populate as visitors search for products.</p></div>;
}

function RankedQueries({ title, description, icon, rows, loading }: { title: string; description: string; icon: React.ReactNode; rows: Array<{ query: string; count: number }>; loading: boolean }) {
  return <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(20,33,23,.04)] sm:p-6"><div className="flex items-start gap-3">{icon}<div><h2 className="font-display text-2xl font-semibold tracking-[-.035em] text-[#172119]">{title}</h2><p className="mt-1 text-sm leading-6 text-[#667169]">{description}</p></div></div><div className="mt-6 divide-y divide-black/7">{loading ? <p className="py-6 text-sm text-[#667169]">Loading search activity…</p> : rows.length ? rows.map((row, index) => <div key={row.query} className="flex items-center justify-between gap-4 py-3.5"><div className="flex min-w-0 items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#edf6ee] text-xs font-extrabold text-[#137547]">{index + 1}</span><span className="truncate text-sm font-semibold text-[#172119]">{row.query}</span></div><span className="rounded-full bg-[#f3f6f1] px-3 py-1 text-xs font-extrabold text-[#4d5b50]">{row.count}</span></div>) : <p className="py-6 text-sm leading-6 text-[#667169]">No product terms have been recorded for this date range.</p>}</div></article>;
}
