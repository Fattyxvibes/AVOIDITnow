export type IslamicReferenceAppendix = {
  title: string;
  url: string;
  note: string;
};

const studyReferences: Array<{ terms: string[]; reference: IslamicReferenceAppendix }> = [
  {
    terms: ["halal", "haram", "ingredient", "food", "eat", "drink"],
    reference: {
      title: "Qur'an 2:168",
      url: "https://quran.com/2/168",
      note: "A general study reference on lawful and wholesome consumption; it does not determine the status of a specific product or ingredient.",
    },
  },
  {
    terms: ["charity", "donate", "donation", "zakat", "sadaqah", "giving"],
    reference: {
      title: "Qur'an 2:261",
      url: "https://quran.com/2/261",
      note: "A general study reference on charitable giving; seek qualified advice for personal zakat calculations or obligations.",
    },
  },
  {
    terms: ["scholar", "scholars", "disagree", "difference", "differ"],
    reference: {
      title: "Qur'an 16:43",
      url: "https://quran.com/16/43",
      note: "A study reference encouraging consultation with knowledgeable people; legitimate scholarly differences may remain.",
    },
  },
];

export function getIslamicReferenceAppendix(question: string): string {
  const normalized = question.toLowerCase();
  const match = studyReferences.find(entry => entry.terms.some(term => normalized.includes(term)));
  if (!match) return "";
  const { title, url, note } = match.reference;
  return `\n\n---\n**Study reference (not a personal ruling):** [${title}](${url}) — ${note}`;
}
