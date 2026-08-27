import { cn } from "@/lib/utils";
import { deploymentAssets } from "@/lib/deploymentAssets";
import ContactFooter from "./ContactFooter";
import { CircleHelp, HandHeart, Menu, Newspaper, Search, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { href: "/directory", label: "Check a product" },
  { href: "/news", label: "Updates" },
  { href: "/assistant", label: "Islamic guidance" },
  { href: "/donate", label: "Donate" },
  { href: "/about", label: "About Us" },
];

export function AvoiditMark({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("relative inline-block shrink-0", className)}><img src={deploymentAssets.logo} alt="" className="size-full object-contain" /><span className="pointer-events-none absolute right-[6%] top-[13%] h-[25%] w-[25%] bg-[#ce2d32] [clip-path:polygon(0_0,100%_50%,0_100%)]" /></span>;
}

function WordmarkO({ className }: { className?: string }) {
  return <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("inline-block shrink-0", className)}><circle cx="24" cy="24" r="15.5" fill="none" stroke="#075c35" strokeWidth="5.3" /><path d="M13.5 34.5 34.5 13.5" fill="none" stroke="#075c35" strokeWidth="5.3" strokeLinecap="square" /><path d="m31.2 10.2 7.5-.8-.9 7.5z" fill="#a40d2c" /></svg>;
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return <Link href="/" aria-label="AVOIDITnow — Choose with conscience" className="inline-flex items-center text-[#121612] no-underline"><span className="inline-flex items-center font-display text-xl font-semibold leading-none tracking-[.06em]"><span>AV</span><WordmarkO className="mx-[.08em] size-[1em] origin-center scale-[1.1]" /><span>IDIT</span><span className="ml-[.22em] self-center font-sans text-[.48em] font-extrabold leading-none tracking-[.02em] text-[#137547]">now</span></span>{!compact && <span className="ml-3 inline whitespace-nowrap text-[10px] font-bold uppercase tracking-[.15em] text-[#137547]">Choose with conscience</span>}</Link>;
}

export default function PublicShell({ children, className }: { children: React.ReactNode; className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfbf7] text-[#142117]">
      <header className="sticky top-0 z-50 border-b border-black/10 border-t-4 border-[#128348] bg-[#fffef9]/95 shadow-[0_1px_0_rgba(0,0,0,.03)] backdrop-blur-xl">
        <div className="container flex h-[72px] items-center justify-between gap-4">
          <Wordmark />
          <nav className="hidden items-center gap-1 min-[1120px]:flex" aria-label="Primary navigation">
            {navItems.map(item => <Link key={item.href} href={item.href} className={cn("rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#e9f3eb] hover:text-[#137547]", location === item.href ? "bg-[#e9f3eb] text-[#137547]" : "text-[#38423a]")}>{item.label}</Link>)}
          </nav>
          <div className="hidden items-center gap-2 min-[1120px]:flex">
            <Link href="/directory" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#137547] px-4 text-sm font-bold text-white shadow-sm transition-transform hover:bg-[#0e633b] active:scale-[.97]"><Search className="size-4" />Check now</Link>
          </div>
          <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="grid size-11 place-items-center rounded-lg text-[#121612] transition hover:bg-[#f0f3ef] hover:text-[#137547] min-[1120px]:hidden" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </div>
        {menuOpen && <div className="border-t border-black/10 bg-[#fffef9] px-4 py-4 min-[1120px]:hidden"><nav id="mobile-navigation" className="mx-auto grid max-w-xl gap-1" aria-label="Mobile primary navigation">{navItems.map(item => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-semibold text-[#26342a] hover:bg-[#e9f3eb] hover:text-[#137547]">{item.label}</Link>)}</nav></div>}
      </header>
      <main className={cn("pb-24 min-[1120px]:pb-0", className)}>{children}</main>
      <ContactFooter />
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-black/10 bg-[#fffef9]/95 px-2 py-2 pb-[max(.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_25px_rgba(14,26,16,.08)] backdrop-blur min-[1120px]:hidden" aria-label="Quick actions">
        <Link href="/directory" className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-[#38423a]"><Search className="size-4 text-[#137547]" />Check</Link>
        <Link href="/news" className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-[#38423a]"><Newspaper className="size-4 text-[#137547]" />Updates</Link>
        <Link href="/assistant" className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-[#38423a]"><HandHeart className="size-4 text-[#ce2d32]" />Guidance</Link>
        <Link href="/about" className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-[#38423a]"><CircleHelp className="size-4 text-[#137547]" />About</Link>
      </nav>
    </div>
  );
}
