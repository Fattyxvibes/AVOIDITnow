export type VolunteerApplicationDraft = {
  name: string;
  email: string;
  region: string;
  role: string;
  experience: string;
};

const APPLICATION_ADDRESS = "contactavoidit@gmail.com";
const APPLICATION_SUBJECT = "Volunteer Application";

export function buildVolunteerApplicationMailto(draft: VolunteerApplicationDraft) {
  const body = [
    "AVOIDITnow volunteer application",
    "",
    `Name: ${draft.name.trim()}`,
    `Email: ${draft.email.trim()}`,
    `Country or region: ${draft.region.trim() || "Not provided"}`,
    `Preferred role: ${draft.role.trim() || "Not provided"}`,
    `Relevant experience: ${draft.experience.trim() || "Not provided"}`,
  ].join("\n");

  return `mailto:${APPLICATION_ADDRESS}?subject=${encodeURIComponent(APPLICATION_SUBJECT)}&body=${encodeURIComponent(body)}`;
}
