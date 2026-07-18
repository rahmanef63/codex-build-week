export const tabs = [
  { id: "today", label: "Hari ini" },
  { id: "orders", label: "Pesanan" },
  { id: "activity", label: "Aktivitas AI" },
] as const;

export type Tab = (typeof tabs)[number]["id"];
