import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");

describe("home hero video", () => {
  it("keeps the lightweight source-resolution video portable while retaining user-selectable stereo audio and inline autoplay", () => {
    expect(homeSource).toContain('import { deploymentAssets } from "@/lib/deploymentAssets"');
    expect(homeSource).toContain("const HERO_VIDEO_SOURCE = deploymentAssets.heroVideo;");
    expect(homeSource).toContain("const HERO_VIDEO_POSTER = deploymentAssets.heroPoster;");
    expect(homeSource).toContain("autoPlay muted loop playsInline preload=\"metadata\"");
    expect(homeSource).toContain("void attempt.catch(() => undefined)");
  });

  it("provides only an on-video accessible sound control alongside the transparent glass panel", () => {
    expect(homeSource).toContain('aria-label={isVideoMuted ? "Turn on hero video sound" : "Mute hero video sound"}');
    expect(homeSource).not.toContain('aria-label={isVideoPlaying ? "Pause hero video" : "Play hero video"}');
    expect(homeSource).toContain("<VolumeX className");
    expect(homeSource).toContain("<Volume2 className");
    expect(homeSource).toContain('bg-[#101712]/[.28]');
    expect(homeSource).toContain("backdrop-blur-lg");
  });

  it("stages the existing hero headline, search, and video-backed panel with the reference transition sequence", () => {
    expect(homeSource).toContain('className="hero-transition-up mt-7 font-display');
    expect(homeSource).toContain('animationDelay: "300ms"');
    expect(homeSource).toContain('animationDelay: "500ms"');
    expect(homeSource).toContain('animationDelay: "700ms"');
    expect(homeSource).toContain('className="hero-transition-scale relative mx-auto');
    expect(homeSource).toContain('animationDelay: "900ms"');
  });

  it("extends the same entrance-motion language across the remaining landing-page sections", () => {
    expect(homeSource).toContain("useLandingSectionTransitions();");
    expect(homeSource).toContain('data-landing-transition className="border-y border-black/10 bg-[#f2f5ef]"');
    expect(homeSource).toContain('data-landing-transition className="container py-20 sm:py-24"');
    expect(homeSource).toContain('data-landing-transition className="container pb-24"');
    expect(homeSource).toContain("revealItems");
    expect(homeSource).toContain("[data-landing-transition] .landing-transition-up");
    expect(homeSource).toContain("IntersectionObserver");
    expect(homeSource).toContain("landing-transition-scale relative rounded-2xl");
  });

  it("uses the original boycott-awareness supporting copy beneath the hero heading", () => {
    expect(homeSource).toContain("Choose with intention. Our focused boycott list helps turn everyday purchases into a peaceful stand for Palestinian rights");
    expect(homeSource).not.toContain("Search a product name to check a reviewed match against published boycott guidance");
  });

  it("uses scroll-triggered boycott figures in the landing strip and original AVOIDITnow objectives in the larger cards", () => {
    expect(homeSource).toContain("target: 220");
    expect(homeSource).toContain("target: 600");
    expect(homeSource).toContain("target: 2_000_000");
    expect(homeSource).toContain("function MetricCounter");
    expect(homeSource).toContain("requestAnimationFrame");
    expect(homeSource).toContain("prefers-reduced-motion: no-preference");
    expect(homeSource).toContain("const animateFromZero");
    expect(homeSource).toContain("const checkMetricVisibility");
    expect(homeSource).toContain("metric.getBoundingClientRect()");
    expect(homeSource).toContain('window.addEventListener("scroll", checkMetricVisibility');
    expect(homeSource).toContain("rootMargin: \"0px 0px -18% 0px\"");
    expect(homeSource).toContain("setCount(0)");
    expect(homeSource).not.toContain('window.addEventListener("scroll", handleScroll');
    expect(homeSource).toContain("formatMillions");
    expect(homeSource).toContain('description: "Peace-advocacy goal"');
    expect(homeSource).toContain(">Our objectives</p>");
    expect(homeSource).toContain(">What AVOIDITnow works toward.</h2>");
    expect(homeSource).toContain('title: "Make choices clearer"');
    expect(homeSource).toContain('title: "Build peaceful pressure"');
    expect(homeSource).toContain('title: "Grow informed solidarity"');
    expect(homeSource).not.toContain('title: "Check a product"');
    expect(homeSource).not.toContain('title: "Choose an alternative"');
    expect(homeSource).not.toContain('title: "Read the source"');
  });
});
