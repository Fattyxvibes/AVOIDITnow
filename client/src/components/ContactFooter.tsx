import { ViewportReveal } from "@/components/ViewportReveal";
import { Facebook, Instagram, Mail, Send } from "lucide-react";
import { Link } from "wouter";

const contactEmail = "contactavoidit@gmail.com";

const socialProfiles = [
  { label: "X", description: "X profile", href: "https://x.com/AVOIDITnow", icon: <span aria-hidden="true" className="font-sans text-base font-bold leading-none">X</span> },
  { label: "Instagram", description: "Instagram profile", href: "https://www.instagram.com/avoiditnow?igsi=MW0ycTV2OGl0cGZtaw==", icon: <Instagram aria-hidden="true" className="size-5" /> },
  { label: "Facebook", description: "Facebook profile", href: "https://www.facebook.com/share/1KpN8uw6Av/", icon: <Facebook aria-hidden="true" className="size-5" /> },
];

export default function ContactFooter() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-[#137547]/15 bg-[#f4f8f3]/[.58] pb-24 text-[#142117] shadow-[inset_0_1px_0_rgba(255,255,255,.72)] backdrop-blur-2xl lg:pb-8" aria-label="Contact AVOIDITnow">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_120%,rgba(19,117,71,.18),transparent_43%),radial-gradient(circle_at_88%_0%,rgba(206,45,50,.08),transparent_32%),linear-gradient(120deg,rgba(255,255,255,.22),rgba(19,117,71,.025))]" />
      <ViewportReveal>
        <div className="container relative grid gap-7 py-9 sm:py-11 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <section>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#137547]">Contact AVOIDITnow</p>
            <h2 className="mt-3 max-w-xl font-display text-2xl font-semibold tracking-[-.05em] text-[#142117] sm:text-3xl">Let’s keep the conversation thoughtful.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#425047]">For a question, collaboration, or a message about the resource, email the AVOIDITnow team directly.</p>
            <a href={`mailto:${contactEmail}`} className="mt-5 inline-flex items-center gap-3 rounded-xl border border-[#137547]/20 bg-white/[.46] px-4 py-3 text-sm font-bold text-[#142117] transition hover:-translate-y-0.5 hover:border-[#137547]/45 hover:bg-white/[.72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#137547]">
              <Mail className="size-4 text-[#137547]" />
              {contactEmail}
              <Send className="size-3.5 text-[#137547]" />
            </a>
          </section>

          <section className="border-t border-black/8 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#137547]">Follow along</p>
            <p className="mt-2 text-sm leading-6 text-[#425047]">Find <span className="font-bold text-[#142117]">AVOIDITnow</span> on social platforms. Click a profile icon below to access social media.</p>
            <div className="mt-4 flex flex-wrap gap-2" aria-label="AVOIDITnow social profiles">
              {socialProfiles.map(profile => <a key={profile.label} href={profile.href} target="_blank" rel="noreferrer" title={profile.description} aria-label={`Visit AVOIDITnow on ${profile.label} (opens in a new tab)`} className="grid size-11 place-items-center rounded-xl border border-[#137547]/15 bg-white/[.42] text-[#137547] transition hover:-translate-y-0.5 hover:border-[#137547]/40 hover:bg-white/[.72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#137547]">
                {profile.icon}
              </a>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-t border-black/8 pt-4 text-xs font-bold text-[#536057]">
              <Link href="/privacy" className="inline-flex min-h-11 items-center underline decoration-[#137547]/30 underline-offset-4 transition hover:text-[#137547]">Privacy Policy</Link>
              <Link href="/terms" className="inline-flex min-h-11 items-center underline decoration-[#137547]/30 underline-offset-4 transition hover:text-[#137547]">Terms of Use</Link>
            </div>
          </section>
        </div>
      </ViewportReveal>
    </footer>
  );
}
