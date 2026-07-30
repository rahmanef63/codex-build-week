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
  const labels: Record<string, string> = {
    create_order: "Buat pesanan",
    update_order: "Perbarui pesanan",
    create_product: "Tambah produk",
    update_product: "Perbarui produk",
    delete_product: "Hapus produk",
    create_business: "Buat profil usaha",
    update_business: "Perbarui profil usaha",
    get_daily_summary: "Baca ringkasan harian",
    get_low_stock_items: "Baca stok menipis",
    list_pending_orders: "Baca pesanan tertunda",
    list_products: "Baca daftar produk",
    get_business_profile: "Baca profil usaha",
    issue_agent_token: "Perbarui akses asisten",
  };
  return labels[value] ?? value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export function formatActivitySummary(value: string) {
  return value
    .replace(/^Order [a-z0-9_-]+ dibuat, total Rp(\d+)\.$/i, (_, total: string) => `Pesanan dibuat dengan total ${formatRupiah(Number(total))}.`)
    .replace(/^Status order [a-z0-9_-]+ diperbarui\.$/i, "Status pesanan diperbarui.")
    .replace(/\bRp(\d{4,})\b/g, (_, total: string) => formatRupiah(Number(total)));
}
