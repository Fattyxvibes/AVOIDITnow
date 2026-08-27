import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePolicyAgreement } from "@/components/PolicyAgreement";
import PublicShell, { AvoiditMark } from "@/components/PublicShell";
import { deploymentAssets } from "@/lib/deploymentAssets";
import { ArrowRight, CheckCircle2, FileText, Globe2, HeartHandshake, Search, UsersRound, Volume2, VolumeX } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const HERO_VIDEO_SOURCE = deploymentAssets.heroVideo;
const HERO_VIDEO_POSTER = deploymentAssets.heroPoster;

const steps = [
  { icon: Search, title: "Make choices clearer", copy: "Turn careful research into practical guidance for everyday purchasing decisions." },
  { icon: Globe2, title: "Build peaceful pressure", copy: "Use informed spending to support Palestinian rights, dignity, and justice." },
  { icon: FileText, title: "Grow informed solidarity", copy: "Share reliable resources that help more people advocate for a fairer future." },
];

const metricFigures = [
  { target: 220, description: "On our boycott list", label: "220 or more companies on our boycott list", format: (value: number) => `${value}+ companies` },
  { target: 600, description: "Flagged for boycott", label: "600 or more products flagged for boycott", format: (value: number) => `${value}+ products` },
  { target: 2_000_000, description: "Peace-advocacy goal", label: "2 million or more people, a peace-advocacy goal", format: (value: number) => `${formatMillions(value)}M+ people` },
];

function formatMillions(value: number) {
  const millions = Math.round((value / 1_000_000) * 10) / 10;
  return Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1);
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isDesktopHero, setIsDesktopHero] = useState(false);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const { requestPolicyAgreement, agreementDialog } = usePolicyAgreement();

  useLandingSectionTransitions();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewport = () => setIsDesktopHero(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const resumeVideo = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.muted = isVideoMuted;
    const attempt = video.play();
    void attempt.catch(() => undefined);
  };

  useEffect(() => {
    const activeVideo = isDesktopHero ? desktopVideoRef.current : mobileVideoRef.current;
    if (!activeVideo) return;
    resumeVideo(activeVideo);
  }, [isDesktopHero, isVideoMuted]);

  const toggleHeroAudio = () => {
    const activeVideo = isDesktopHero ? desktopVideoRef.current : mobileVideoRef.current;
    if (!activeVideo) return;
    const nextMuted = !activeVideo.muted;
    activeVideo.muted = nextMuted;
    if (!nextMuted) activeVideo.volume = 1;
    setIsVideoMuted(nextMuted);
    if (activeVideo.paused) {
      const attempt = activeVideo.play();
      void attempt.catch(() => undefined);
    }
  };

  const soundControl = <button type="button" onClick={toggleHeroAudio} aria-label={isVideoMuted ? "Turn on hero video sound" : "Mute hero video sound"} aria-pressed={!isVideoMuted} title={isVideoMuted ? "Turn sound on" : "Mute sound"} className="rounded-full border border-white/40 bg-[#0c1510]/65 p-3 text-white shadow-lg backdrop-blur-md transition hover:bg-[#0c1510]/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{isVideoMuted ? <VolumeX className="size-5" aria-hidden="true" /> : <Volume2 className="size-5" aria-hidden="true" />}<span className="sr-only">{isVideoMuted ? "Turn sound on" : "Mute sound"}</span></button>;

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setLocation("/directory");
      return;
    }

    requestPolicyAgreement(() => setLocation(`/directory?q=${encodeURIComponent(trimmedQuery)}`));
  };

  return <PublicShell>
    <section className="relative overflow-hidden bg-[#fffef9]">
      <div className="absolute right-0 top-0 hidden h-full w-[48%] overflow-hidden bg-[#111411] lg:block">
        {isDesktopHero && <video ref={desktopVideoRef} className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={HERO_VIDEO_POSTER} onCanPlay={event => resumeVideo(event.currentTarget)} aria-hidden="true"><source src={HERO_VIDEO_SOURCE} type="video/mp4" /></video>}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,17,12,.54),rgba(11,17,12,.14)_58%,rgba(11,17,12,.34))]" />
      </div>
      <div className="absolute right-5 top-5 z-30 hidden lg:block">{soundControl}</div>
      <div className="absolute right-[42%] top-0 hidden h-full w-0 border-y-[390px] border-y-transparent border-l-[165px] border-l-[#ce2d32] opacity-95 lg:block" />
      <div className="container relative grid gap-10 py-12 sm:py-16 lg:min-h-[650px] lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-24">
        <div className="max-w-2xl">
          <h1 className="hero-transition-up mt-7 font-display text-5xl font-semibold leading-[.98] tracking-[-.065em] text-[#142117] sm:text-6xl lg:text-7xl" style={{ animationDelay: "300ms" }}>Know what you buy. <span className="text-[#137547]">Choose with conscience.</span></h1>
          <p className="hero-transition-up mt-7 max-w-xl text-base leading-7 text-[#435046] sm:text-lg" style={{ animationDelay: "500ms" }}>Choose with intention. Our focused boycott list helps turn everyday purchases into a peaceful stand for Palestinian rights—opposing collective punishment and supporting justice, dignity, and lasting peace.</p>
          <form onSubmit={submitSearch} className="hero-transition-up mt-9 flex max-w-xl flex-col gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(20,33,23,.11)] sm:flex-row" style={{ animationDelay: "700ms" }}>
            <div className="flex flex-1 items-center gap-3 px-3"><Search className="size-5 shrink-0 text-[#137547]" /><Input value={query} onChange={event => setQuery(event.target.value)} className="h-11 border-0 bg-transparent p-0 text-base text-[#172119] placeholder:text-[#728076] focus-visible:ring-0" placeholder="e.g. a product or brand name" aria-label="Check a product or brand" /></div>
            <Button type="submit" className="h-11 bg-[#137547] px-5 font-bold text-white hover:bg-[#0e633b]">Check product <ArrowRight className="ml-2 size-4" /></Button>
          </form>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#59645b]"><span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-[#137547]" />No account needed</span><span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-[#137547]" />Source and review date shown</span></div>
          <button type="button" onClick={() => setLocation("/volunteer")} className="hero-transition-up mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#137547] underline-offset-4 transition hover:text-[#0e633b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#137547] focus-visible:ring-offset-4" style={{ animationDelay: "820ms" }}><UsersRound className="size-4" />Call for volunteers <ArrowRight className="size-4" /></button>
        </div>
        <div className="hero-transition-scale relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[1.7rem] lg:mx-auto lg:overflow-visible" style={{ animationDelay: "900ms" }}>
          {!isDesktopHero && <div className="absolute inset-0 lg:hidden" aria-hidden="true"><video ref={mobileVideoRef} className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={HERO_VIDEO_POSTER} onCanPlay={event => resumeVideo(event.currentTarget)}><source src={HERO_VIDEO_SOURCE} type="video/mp4" /></video><div className="absolute inset-0 bg-[#111411]/[.16]" /></div>}
          {!isDesktopHero && <div className="absolute right-4 top-4 z-20 lg:hidden">{soundControl}</div>}
          <div className="relative rounded-[1.7rem] border border-white/25 bg-[#101712]/[.28] p-5 text-white shadow-[0_24px_60px_rgba(0,0,0,.24)] backdrop-blur-lg">
            <div className="flex items-center justify-between border-b border-white/20 pb-4"><div className="flex items-center gap-3"><AvoiditMark className="size-9" /><div><p className="text-sm font-bold">Product-checking protocol</p><p className="text-xs text-white/65">Transparent by design</p></div></div><span className="rounded-full bg-[#128348]/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d2f0dc]">Source-led</span></div>
            <div className="space-y-3 py-5"><div className="rounded-xl border border-white/20 bg-black/[.08] p-4"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d2f0dc]">Result basis</p><p className="mt-2 text-sm leading-6 text-white/95">A reviewed match to a public boycott record—not a claim about every item with a similar name.</p></div><div className="rounded-xl border border-white/20 bg-black/[.08] p-4"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d2f0dc]">Alternative basis</p><p className="mt-2 text-sm leading-6 text-white/95">Regional availability is labelled and can change. Absence of a listing is not an endorsement.</p></div></div>
            <div className="rounded-xl border border-white/35 bg-white/[.78] p-4 text-[#172119] backdrop-blur-md"><p className="text-sm font-bold">Primary boycott source</p><p className="mt-1 text-xs leading-5 text-[#405044]">Ireland Palestine Solidarity Campaign consumer-boycott guidance, linked on every matching record.</p></div>
          </div>
        </div>
      </div>
    </section>
    <section data-landing-transition className="border-y border-black/10 bg-[#f2f5ef]">
      <div className="container grid gap-px py-6 sm:grid-cols-3">
        {metricFigures.map((metric, index) => <div key={metric.description} className={`landing-transition-up py-3 ${index < 2 ? "sm:border-r sm:border-black/10" : ""} ${index > 0 ? "sm:pl-6" : ""}`} style={{ animationDelay: `${index * 90}ms` }}><MetricCounter {...metric} /><p className="mt-1 text-sm text-[#4d594f]">{metric.description}</p></div>)}
      </div>
    </section>
    <section data-landing-transition className="container py-20 sm:py-24">
      <div className="landing-transition-up max-w-2xl" style={{ animationDelay: "0ms" }}><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#ce2d32]">Our objectives</p><h2 className="mt-4 font-display text-4xl font-semibold tracking-[-.055em] text-[#172119] sm:text-5xl">What AVOIDITnow works toward.</h2></div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">{steps.map((item, index) => <article key={item.title} className="landing-transition-scale relative rounded-2xl border border-black/10 bg-white p-6 shadow-[0_7px_20px_rgba(20,33,23,.035)]" style={{ animationDelay: `${120 + index * 90}ms` }}><p className="absolute right-6 top-5 font-display text-4xl text-[#e6eee6]">0{index + 1}</p><item.icon className="size-6 text-[#137547]" /><h3 className="mt-8 text-lg font-bold text-[#172119]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[#59645b]">{item.copy}</p></article>)}</div>
    </section>
    <section data-landing-transition className="container pb-24"><div className="grid gap-7 rounded-[2rem] border border-[#137547]/15 bg-[#e9f3eb] p-8 sm:p-12 lg:grid-cols-[1.25fr_.75fr]"><div className="landing-transition-up" style={{ animationDelay: "0ms" }}><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#137547]">Keep learning</p><h2 className="mt-4 font-display text-4xl font-semibold tracking-[-.055em] text-[#172119]">News, guidance, and support—without losing sight of the source.</h2><p className="mt-4 max-w-xl text-base leading-7 text-[#435046]">Read sourced humanitarian updates, ask the Islamic guidance assistant for educational references, or return to the product checker whenever you need a quick starting point.</p></div><div className="landing-transition-scale flex flex-col justify-center gap-3" style={{ animationDelay: "140ms" }}><Button onClick={() => setLocation("/news")} variant="outline" className="justify-between border-[#137547]/25 bg-white font-bold text-[#137547] hover:bg-[#f9fdf9] hover:text-[#0e633b]">Read updates <ArrowRight className="size-4" /></Button><Button onClick={() => setLocation("/assistant")} variant="outline" className="justify-between border-[#137547]/25 bg-white font-bold text-[#137547] hover:bg-[#f9fdf9] hover:text-[#0e633b]">Islamic guidance <ArrowRight className="size-4" /></Button><Button onClick={() => setLocation("/donate")} className="justify-between bg-[#ce2d32] font-bold text-white hover:bg-[#b72429]">Support the work <HeartHandshake className="size-4" /></Button></div></div></section>
    {agreementDialog}
  </PublicShell>;
}

function useLandingSectionTransitions() {
  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-landing-transition] .landing-transition-up, [data-landing-transition] .landing-transition-scale"));
    if (!revealItems.length) return;

    const revealAll = () => revealItems.forEach(item => item.classList.add("landing-transition-visible"));
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("landing-transition-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.24, rootMargin: "0px 0px -4% 0px" });

    revealItems.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);
}

function MetricCounter({ target, label, format }: { target: number; label: string; format: (value: number) => string }) {
  const metricRef = useRef<HTMLParagraphElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const metric = metricRef.current;
    if (!metric) return;

    const finish = () => setCount(target);
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches || !("IntersectionObserver" in window)) {
      finish();
      return;
    }

    let frameId = 0;
    let hasStarted = false;
    const animateFromZero = () => {
      if (hasStarted) return;
      hasStarted = true;
      cancelAnimationFrame(frameId);
      setCount(0);
      const startedAt = performance.now();
      const duration = 420;
      const tick = (timestamp: number) => {
        const progress = Math.min((timestamp - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(target * eased));
        if (progress < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    };
    const reset = () => {
      hasStarted = false;
      cancelAnimationFrame(frameId);
      setCount(0);
    };
    const metricIsVisible = () => {
      const bounds = metric.getBoundingClientRect();
      return bounds.top < window.innerHeight * 0.88 && bounds.bottom > window.innerHeight * 0.12;
    };
    const checkMetricVisibility = () => {
      if (metricIsVisible()) {
        animateFromZero();
        return;
      }
      reset();
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateFromZero();
          return;
        }
        reset();
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -18% 0px" });
    observer.observe(metric);
    window.addEventListener("scroll", checkMetricVisibility, { passive: true });
    window.addEventListener("resize", checkMetricVisibility);
    checkMetricVisibility();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", checkMetricVisibility);
      window.removeEventListener("resize", checkMetricVisibility);
      cancelAnimationFrame(frameId);
    };
  }, [target]);

  return <p ref={metricRef} aria-label={label} className="text-xs font-extrabold uppercase tracking-[.16em] text-[#137547]"><span aria-hidden="true">{format(count)}</span><span className="sr-only">{label}</span></p>;
}
