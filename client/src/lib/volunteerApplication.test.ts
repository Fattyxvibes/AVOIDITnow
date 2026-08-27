import { describe, expect, it } from "vitest";
import { buildVolunteerApplicationMailto } from "./volunteerApplication";

describe("volunteer application email draft", () => {
  it("creates a pre-addressed Volunteer Application email without storing applicant data", () => {
    const link = buildVolunteerApplicationMailto({
      name: "Amina Yusuf",
      email: "amina@example.com",
      region: "Lagos, Nigeria",
      role: "Alternative-product researcher",
      experience: "Community research",
    });

    expect(link).toContain("mailto:contactavoidit@gmail.com");
    expect(link).toContain("subject=Volunteer%20Application");
    expect(decodeURIComponent(link)).toContain("Preferred role: Alternative-product researcher");
    expect(decodeURIComponent(link)).not.toContain("Availability:");
    expect(decodeURIComponent(link)).not.toContain("Languages:");
  });
});
