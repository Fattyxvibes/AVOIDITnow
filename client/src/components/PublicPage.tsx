import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Inbox, Loader2 } from "lucide-react";
import { Link } from "wouter";
import PublicShell from "./PublicShell";
import { ViewportReveal } from "./ViewportReveal";

export function PublicPage({ eyebrow, title, summary, children }: { eyebrow: string; title: string; summary: string; children: React.ReactNode }) {
  return <PublicShell><section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_82%_10%,rgba(19,117,71,.13),transparent_28%),linear-gradient(180deg,#fffef9,rgba(245,248,243,.75))]"><div aria-hidden className="absolute right-0 top-0 hidden h-full w-28 bg-black/92 md:block [clip-path:polygon(58%_0,100%_0,100%_100%,0_100%)]" /><div aria-hidden className="absolute -right-12 top-0 hidden h-full w-32 bg-[#ce2d32] md:block [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]" /><div className="container relative py-16 sm:py-20"><ViewportReveal delay={0}><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#137547]">{eyebrow}</p></ViewportReveal><ViewportReveal delay={120}><h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-[-.06em] text-[#152118] sm:text-6xl">{title}</h1></ViewportReveal><ViewportReveal delay={240}><p className="mt-5 max-w-2xl text-base leading-7 text-[#4d594f]">{summary}</p></ViewportReveal></div></section><section className="container py-10 sm:py-14">{children}</section></PublicShell>;
}

export function QueryState({ loading, error, empty, children, emptyTitle = "No reviewed records yet", emptyDescription = "This source-backed resource is being updated through administrator review.", emptyActionLabel = "Check a product", emptyActionHref = "/directory", hideEmptyIcon = false, compactEmpty = false, emptyIcon = <Inbox className="mx-auto size-8 text-[#137547]" /> }: { loading: boolean; error?: unknown; empty: boolean; children: React.ReactNode; emptyTitle?: string; emptyDescription?: string; emptyActionLabel?: string; emptyActionHref?: string; hideEmptyIcon?: boolean; compactEmpty?: boolean; emptyIcon?: React.ReactNode }) {
  if (loading) return <div className="grid min-h-72 place-items-center rounded-2xl border border-black/10 bg-white"><Loader2 className="size-6 animate-spin text-[#137547]" /></div>;
  if (error) return <div className="rounded-2xl border border-[#ce2d32]/25 bg-[#fff2f1] p-8 text-center"><AlertCircle className="mx-auto size-7 text-[#ce2d32]" /><h2 className="mt-3 text-lg font-semibold text-[#251412]">We could not load that right now.</h2><p className="mt-2 text-sm text-[#7a3935]">Please refresh or try again shortly.</p></div>;
  if (empty) return <div className={`rounded-2xl border border-dashed border-black/15 bg-white px-6 text-center ${compactEmpty ? "py-10" : "py-14"}`}>{!hideEmptyIcon && emptyIcon}<h2 className={`${hideEmptyIcon ? "" : "mt-4"} text-lg font-semibold text-[#172119]`}>{emptyTitle}</h2>{emptyDescription && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#59645b]">{emptyDescription}</p>}{emptyActionLabel && <Link href={emptyActionHref}><Button variant="outline" className="mt-6 border-[#137547]/25 bg-white font-semibold text-[#137547] hover:bg-[#e9f3eb] hover:text-[#0e633b]">{emptyActionLabel}</Button></Link>}</div>;
  return <>{children}</>;
}

export function BackLink({ href, children = "Back" }: { href: string; children?: string }) { return <Link href={href} className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#137547] hover:text-[#0e633b]"><ArrowLeft className="size-4" />{children}</Link>; }
