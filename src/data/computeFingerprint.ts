export function computeFingerprint(transaction: { date: string; type: string; amount: number; concept: string; category: string; person: string }): string {
  const cents = Math.round(transaction.amount * 100);
  const normalizedConcept = transaction.concept.trim().replace(/\s+/g, " ");
  return `${transaction.date}|${transaction.type}|${cents}|${normalizedConcept}|${transaction.category}|${transaction.person}`;
}
