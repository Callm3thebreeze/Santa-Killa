const RELATIVE_LABEL_PATTERN = /^hace\s+(un|una|\d+)\s+(mes|meses|año|años)$/i;

function subtractMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  const day = copy.getDate();

  copy.setDate(1);
  copy.setMonth(copy.getMonth() - months);

  const lastDay = new Date(copy.getFullYear(), copy.getMonth() + 1, 0).getDate();
  copy.setDate(Math.min(day, lastDay));
  return copy;
}

function fullMonthsBetween(from: Date, to: Date): number {
  let months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());

  if (to.getDate() < from.getDate()) {
    months -= 1;
  }

  return Math.max(months, 0);
}

export function relativeLabelToDate(label: string, referenceDate: Date): Date {
  const match = label.trim().match(RELATIVE_LABEL_PATTERN);

  if (!match) {
    return new Date(referenceDate);
  }

  const amountRaw = match[1].toLowerCase();
  const unit = match[2].toLowerCase();
  const amount = amountRaw === "un" || amountRaw === "una" ? 1 : Number(amountRaw);

  if (unit === "mes" || unit === "meses") {
    return subtractMonths(referenceDate, amount);
  }

  return subtractMonths(referenceDate, amount * 12);
}

export function formatRelativeFromDate(from: Date, today: Date = new Date()): string {
  const months = fullMonthsBetween(from, today);

  if (months < 12) {
    if (months <= 1) {
      return "Hace 1 mes";
    }

    return `Hace ${months} meses`;
  }

  const years = Math.floor(months / 12);

  if (years === 1) {
    return "Hace un año";
  }

  return `Hace ${years} años`;
}
