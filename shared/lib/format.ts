const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const date = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeZone: "Asia/Jakarta",
});

const dateTime = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatRupiah(value: number) {
  return rupiah.format(value);
}

export function formatDate(value: string | number | Date) {
  return date.format(new Date(value));
}

export function formatDateTime(value: string | number | Date) {
  return dateTime.format(new Date(value));
}

export function formatStatus(value: string) {
  const labels: Record<string, string> = {
    PAID: "Lunas",
    UNPAID: "Belum bayar",
    PARTIAL: "Dibayar sebagian",
    PENDING: "Menunggu",
    COMPLETED: "Selesai",
  };
  return labels[value] ?? value;
}

export function formatAction(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
