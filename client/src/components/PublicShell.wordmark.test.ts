import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shellSource = readFileSync(new URL("./PublicShell.tsx", import.meta.url), "utf8");
const documentSource = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

describe("public AVOIDITnow wordmark", () => {
  it("keeps the circular O mark while presenting AVOIDITnow with a smaller now suffix", () => {
    expect(shellSource).toContain('aria-label="AVOIDITnow — Choose with conscience"');
    expect(shellSource).toContain("<span>AV</span><WordmarkO");
    expect(shellSource).toContain("<span>IDIT</span><span");
    expect(shellSource).toContain('text-[.48em]');
    expect(shellSource).toContain(">now</span>");
    expect(shellSource).toContain('<circle cx="24" cy="24" r="15.5"');
    expect(shellSource).toContain('d="M13.5 34.5 34.5 13.5"');
    expect(shellSource).toContain("min-[1120px]:flex");
    expect(shellSource).toContain("min-[1120px]:hidden");
  });

  it("updates the browser title to the refined public name", () => {
    expect(documentSource).toContain("<title>AVOIDITnow — Choose with conscience</title>");
  });
});
