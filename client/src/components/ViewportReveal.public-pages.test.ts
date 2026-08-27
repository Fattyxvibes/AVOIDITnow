import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const revealSource = readFileSync(new URL("./ViewportReveal.tsx", import.meta.url), "utf8");
const publicPageSource = readFileSync(new URL("./PublicPage.tsx", import.meta.url), "utf8");
const directorySource = readFileSync(new URL("../pages/Directory.tsx", import.meta.url), "utf8");
const newsSource = readFileSync(new URL("../pages/News.tsx", import.meta.url), "utf8");
const assistantSource = readFileSync(new URL("../pages/Assistant.tsx", import.meta.url), "utf8");
const donateSource = readFileSync(new URL("../pages/Donate.tsx", import.meta.url), "utf8");
const aboutSource = readFileSync(new URL("../pages/About.tsx", import.meta.url), "utf8");

describe("public page hero-style reveals", () => {
  it("uses the hero easing modes with viewport observation and reduced-motion support", () => {
    expect(revealSource).toContain("IntersectionObserver");
    expect(revealSource).toContain('prefers-reduced-motion: no-preference');
    expect(revealSource).toContain('threshold: 0.22');
    expect(revealSource).toContain('rootMargin: "0px 0px -4% 0px"');
    expect(revealSource).toContain('viewport-reveal-${variant}');
    expect(publicPageSource).toContain("<ViewportReveal delay={120}>");
  });

  it("applies staged reveal wrappers to every requested public route", () => {
    [directorySource, newsSource, assistantSource, donateSource, aboutSource].forEach(source => expect(source).toContain("ViewportReveal"));
    expect(directorySource).toContain("Every boycotted product displays three related alternatives");
    expect(newsSource).toContain('variant="scale"');
    expect(assistantSource).toContain('Ask a thoughtful Islamic question');
    expect(donateSource).toContain('Fund the work that makes choices clearer');
    expect(aboutSource).toContain('Awareness can become a considered act of solidarity');
  });
});
