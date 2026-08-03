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

export function formatDateTime(value: string | number | Date, locale: "en" | "id" = "id") {
  return locale === "id" ? dateTime.format(new Date(value)) : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export function formatStatus(value: string, locale: "en" | "id" = "id") {
  const labels: Record<string, string> = {
    PAID: locale === "id" ? "Lunas" : "Paid",
    UNPAID: locale === "id" ? "Belum bayar" : "Unpaid",
    PARTIAL: locale === "id" ? "Dibayar sebagian" : "Partially paid",
    PENDING: locale === "id" ? "Menunggu" : "Pending",
    COMPLETED: locale === "id" ? "Selesai" : "Completed",
  };
  return labels[value] ?? value;
}

export function formatAction(value: string, locale: "en" | "id" = "id") {
  const labels: Record<string, string> = {
    create_order: locale === "id" ? "Buat pesanan" : "Create order",
    update_order: locale === "id" ? "Perbarui pesanan" : "Update order",
    create_product: locale === "id" ? "Tambah produk" : "Create product",
    update_product: locale === "id" ? "Perbarui produk" : "Update product",
    delete_product: locale === "id" ? "Hapus produk" : "Delete product",
    create_business: locale === "id" ? "Buat profil ruang kerja" : "Create workspace profile",
    update_business: locale === "id" ? "Perbarui profil ruang kerja" : "Update workspace profile",
    get_daily_summary: locale === "id" ? "Baca ringkasan harian" : "Read daily summary",
    get_low_stock_items: locale === "id" ? "Baca stok menipis" : "Read low stock",
    list_pending_orders: locale === "id" ? "Baca pesanan tertunda" : "Read pending orders",
    list_products: locale === "id" ? "Baca daftar produk" : "Read product list",
    get_business_profile: locale === "id" ? "Baca profil ruang kerja" : "Read workspace profile",
    issue_agent_token: locale === "id" ? "Perbarui akses asisten" : "Update assistant access",
  };
  return labels[value] ?? value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export function formatActivitySummary(value: string, locale: "en" | "id" = "id") {
  return value
    .replace(/^Order [a-z0-9_-]+ dibuat, total Rp(\d+)\.$/i, (_, total: string) => locale === "id" ? `Pesanan dibuat dengan total ${formatRupiah(Number(total))}.` : `Order created with a total of ${formatRupiah(Number(total))}.`)
    .replace(/^Status order [a-z0-9_-]+ diperbarui\.$/i, locale === "id" ? "Status pesanan diperbarui." : "Order status updated.")
    .replace(/\bRp(\d{4,})\b/g, (_, total: string) => formatRupiah(Number(total)));
}
