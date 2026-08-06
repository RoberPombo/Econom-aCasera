import type { TransactionFilters } from "../domain/entities";

export interface FilterQuery {
  where: string;
  params: (string | number)[];
}

export function buildTransactionFilterQuery(filters: TransactionFilters): FilterQuery {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filters.period.mode === "month") {
    clauses.push("t.year = ?");
    params.push(filters.period.year);
    clauses.push("t.month = ?");
    params.push(filters.period.month);
  } else {
    const from = filters.period.from;
    const to = filters.period.to;
    const rangeOk = !from || !to || from <= to;
    if (rangeOk && from) {
      clauses.push("t.date >= ?");
      params.push(from);
    }
    if (rangeOk && to) {
      clauses.push("t.date <= ?");
      params.push(to);
    }
  }

  if (filters.types.length === 1) {
    clauses.push("t.type = ?");
    params.push(filters.types[0]);
  } else if (filters.types.length > 1) {
    clauses.push(`t.type IN (${filters.types.map(() => "?").join(", ")})`);
    params.push(...filters.types);
  }

  if (filters.categoryKeys.length === 1) {
    clauses.push("t.category = ?");
    params.push(filters.categoryKeys[0]);
  } else if (filters.categoryKeys.length > 1) {
    clauses.push(`t.category IN (${filters.categoryKeys.map(() => "?").join(", ")})`);
    params.push(...filters.categoryKeys);
  }

  if (filters.personKeys.length === 1) {
    clauses.push("t.person = ?");
    params.push(filters.personKeys[0]);
  } else if (filters.personKeys.length > 1) {
    clauses.push(`t.person IN (${filters.personKeys.map(() => "?").join(", ")})`);
    params.push(...filters.personKeys);
  }

  const minAmount = filters.minAmount;
  const maxAmount = filters.maxAmount;
  const amountOk = minAmount === null || maxAmount === null || minAmount <= maxAmount;
  if (amountOk && minAmount !== null) {
    clauses.push("t.amount >= ?");
    params.push(minAmount);
  }
  if (amountOk && maxAmount !== null) {
    clauses.push("t.amount <= ?");
    params.push(maxAmount);
  }

  if (filters.search) {
    const like = `%${filters.search.toLowerCase()}%`;
    clauses.push(`(
      LOWER(t.concept) LIKE ?
      OR LOWER(t.category) LIKE ?
      OR LOWER(t.person) LIKE ?
      OR LOWER(COALESCE(c.label, '')) LIKE ?
      OR LOWER(COALESCE(p.label, '')) LIKE ?
    )`);
    params.push(like, like, like, like, like);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
}

export const FILTER_FROM = `
  FROM transactions t
  LEFT JOIN categories c ON c.key = t.category
  LEFT JOIN persons p ON p.key = t.person
`;
