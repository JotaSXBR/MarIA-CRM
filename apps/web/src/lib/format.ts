export function initials(name: string | undefined): string {
  return (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

const dayMonthTime = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const shortDateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const shortDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** dd/mm hh:mm — compact timestamps for lists (inbox, channels). */
export const formatTime = (iso: string) => dayMonthTime.format(new Date(iso));

/** dd/mm/aaaa hh:mm — full timestamps for detail views. */
export const formatDateTime = (iso: string) =>
  shortDateTime.format(new Date(iso));

/** dd/mm/aaaa — date-only deadlines. */
export const formatDate = (iso: string) => shortDate.format(new Date(iso));

/** Centavos → BRL; `null` means the entity carries no monetary value. */
export const formatCurrency = (valueCents: number | null) =>
  valueCents == null ? null : brl.format(valueCents / 100);
