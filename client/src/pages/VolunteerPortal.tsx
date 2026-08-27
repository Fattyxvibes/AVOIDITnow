import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicPage } from "@/components/PublicPage";
import { ViewportReveal } from "@/components/ViewportReveal";
import { buildVolunteerApplicationMailto, type VolunteerApplicationDraft } from "@/lib/volunteerApplication";
import { ArrowRight, BookOpenCheck, Bug, Globe2, HeartHandshake, Languages, MapPinned, Newspaper, Send, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { type FormEvent, useState } from "react";

const roles = [
  { icon: BookOpenCheck, title: "Boycott-list researcher", copy: "Verify brands, parent companies, and source links before a proposed update is considered." },
  { icon: Sparkles, title: "Alternative-product researcher", copy: "Identify credible local and regional alternatives, including availability context." },
  { icon: Newspaper, title: "News and source curator", copy: "Select relevant humanitarian updates from approved sources and check attribution." },
  { icon: ShieldCheck, title: "Islamic-guidance editorial reviewer", copy: "Help review educational references and careful disclaimers for guidance content." },
  { icon: MapPinned, title: "Regional coordinator", copy: "Develop local product and alternatives context for a country or region." },
  { icon: HeartHandshake, title: "Community and outreach volunteer", copy: "Share verified resources, support general enquiries, and extend informed reach." },
  { icon: Languages, title: "Translator and accessibility volunteer", copy: "Make approved content clearer and more accessible across languages and formats." },
  { icon: Bug, title: "Quality-assurance volunteer", copy: "Test searches, source links, mobile pages, and report reproducible issues." },
  { icon: Wrench, title: "Technical volunteer", copy: "Contribute to safe maintenance, accessibility, data quality, and security review." },
];

const initialDraft: VolunteerApplicationDraft = { name: "", email: "", region: "", role: "", experience: "" };

export default function VolunteerPortal() {
  const [draft, setDraft] = useState<VolunteerApplicationDraft>(initialDraft);
  const [openedEmail, setOpenedEmail] = useState(false);

  const update = (field: keyof VolunteerApplicationDraft) => (value: string) => setDraft(current => ({ ...current, [field]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenedEmail(true);
    window.location.href = buildVolunteerApplicationMailto(draft);
  };

  return <PublicPage eyebrow="Volunteer with AVOIDITnow" title="Bring careful research to more everyday choices." summary="Volunteer your research, regional knowledge, editorial care, or technical skill to help keep this public resource useful, source-led, and accessible.">
    <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
      <ViewportReveal delay={0}><aside className="h-full rounded-[2rem] border border-[#137547]/18 bg-[#eaf4eb] p-7 sm:p-9"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#137547]">How it works</p><h2 className="mt-4 font-display text-3xl font-semibold tracking-[-.045em] text-[#172119]">A small, thoughtful application.</h2><p className="mt-4 text-sm leading-7 text-[#4b594f]">Choose the kind of contribution that fits your experience. Your details are not stored in this website. Instead, the form opens a prepared email addressed to our contact inbox for you to review and send.</p><ol className="mt-7 space-y-5"><li className="flex gap-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#137547]">1</span><p className="pt-1 text-sm font-semibold text-[#243228]">Choose a role or area of contribution.</p></li><li className="flex gap-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#137547]">2</span><p className="pt-1 text-sm font-semibold text-[#243228]">Share only the details needed for your application.</p></li><li className="flex gap-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#137547]">3</span><p className="pt-1 text-sm font-semibold text-[#243228]">Review and send the prepared email from your own email app.</p></li></ol></aside></ViewportReveal>
      <ViewportReveal delay={100}><form onSubmit={submit} className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_14px_34px_rgba(20,33,23,.05)] sm:p-8"><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#ce2d32]">Volunteer application</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-[-.045em] text-[#172119]">Tell us where you can help.</h2></div><Send className="mt-1 size-6 shrink-0 text-[#137547]" /></div><p className="mt-3 text-sm leading-6 text-[#59645b]">Fields marked with an asterisk are included so we can reply to you. Please do not include sensitive personal information.</p><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="Your name" required><Input required value={draft.name} onChange={event => update("name")(event.target.value)} className="mt-2 h-11 border-black/12" autoComplete="name" /></Field><Field label="Your email" required><Input required type="email" value={draft.email} onChange={event => update("email")(event.target.value)} className="mt-2 h-11 border-black/12" autoComplete="email" /></Field><Field label="Country or region"><Input value={draft.region} onChange={event => update("region")(event.target.value)} className="mt-2 h-11 border-black/12" autoComplete="country-name" /></Field><Field label="Preferred role"><select value={draft.role} onChange={event => update("role")(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-black/12 bg-white px-3 text-sm text-[#172119] focus:outline-none focus:ring-2 focus:ring-[#137547]/30"><option value="">Select a role</option>{roles.map(role => <option key={role.title} value={role.title}>{role.title}</option>)}</select></Field></div><div className="mt-5"><Field label="Relevant experience or interests (optional)"><textarea value={draft.experience} onChange={event => update("experience")(event.target.value)} className="mt-2 min-h-28 w-full rounded-md border border-black/12 bg-white px-3 py-2.5 text-sm leading-6 text-[#172119] focus:outline-none focus:ring-2 focus:ring-[#137547]/30" /></Field></div><div className="mt-7 flex flex-col gap-4 border-t border-black/8 pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-md text-xs leading-5 text-[#667169]">Selecting the button opens a pre-addressed email to <strong>contactavoidit@gmail.com</strong> with the subject <strong>Volunteer Application</strong>. Nothing is submitted or stored by this website.</p><Button type="submit" className="shrink-0 bg-[#137547] font-bold text-white hover:bg-[#0e633b]">Open email draft <ArrowRight className="ml-2 size-4" /></Button></div>{openedEmail && <p className="mt-4 rounded-xl bg-[#edf6ee] px-4 py-3 text-sm font-semibold text-[#137547]">Your email application should now show a prepared Volunteer Application draft. Review it, then send when ready.</p>}</form></ViewportReveal>
    </section>

    <section className="mt-16"><ViewportReveal delay={0}><div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#137547]">Ways to contribute</p><h2 className="mt-4 font-display text-4xl font-semibold tracking-[-.055em] text-[#172119]">A role for careful research, clear communication, or practical support.</h2></div></ViewportReveal><div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{roles.map((role, index) => <ViewportReveal key={role.title} delay={index * 50}><article className="h-full rounded-2xl border border-black/10 bg-white p-6 shadow-[0_7px_20px_rgba(20,33,23,.035)]"><role.icon className="size-6 text-[#137547]" /><h3 className="mt-7 text-lg font-bold text-[#172119]">{role.title}</h3><p className="mt-3 text-sm leading-6 text-[#59645b]">{role.copy}</p></article></ViewportReveal>)}</div></section>

    <ViewportReveal delay={120}><section className="mt-16 rounded-[2rem] border border-[#ce2d32]/16 bg-[#fff7f6] p-7 sm:p-10"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#ce2d32]">Good application practice</p><h2 className="mt-4 font-display text-3xl font-semibold tracking-[-.045em] text-[#172119]">Keep it simple and safe.</h2><div className="mt-5 grid gap-4 text-sm leading-6 text-[#4d594f] md:grid-cols-3"><p>Apply for the role that best fits your current skills and availability.</p><p>Use sources and public information responsibly; do not submit confidential or sensitive information.</p><p>Volunteer roles are reviewed before access to any internal workspaces or materials is granted.</p></div></section></ViewportReveal>
  </PublicPage>;
}

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-[#314034]">{label}{required && <span className="ml-1 text-[#ce2d32]" aria-hidden="true">*</span>}{children}</label>;
}
