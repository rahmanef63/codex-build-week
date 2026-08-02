// MCP tool catalog — one tool per published /api/agent/* operation, named with
// the SAME operationId the Custom GPT schema and the harness skill already use.
// One vocabulary across all three clients; nothing new is invented here.
//
// Descriptions are model-facing prompt context, not docs: each says when to use
// the tool, and (where an ambiguous sibling exists) when NOT to. Tenant is never
// an argument — it comes from the caller's agent token. See auth.ts.
import type { JsonSchema, ToolAnnotations, ToolDef } from "./types";

const str = (description: string) => ({ type: "string", description });
const num = (description: string) => ({ type: "number", minimum: 0, description });

const object = (
  properties: Record<string, unknown>,
  required: string[] = [],
): JsonSchema => ({ type: "object", properties, required, additionalProperties: false });

const EMPTY = object({});

// read       — pure read, client may skip confirmation
// idempotent — write that is safe to retry with identical args
// create     — write that adds a row on every successful call
// destructive— removes data; clients should always confirm
const annotations = (
  title: string,
  kind: "read" | "idempotent" | "create" | "destructive",
): ToolAnnotations => ({
  title,
  readOnlyHint: kind === "read",
  destructiveHint: kind === "destructive",
  idempotentHint: kind === "read" || kind === "idempotent" || kind === "destructive",
  // Everything below reads/writes this deployment's own Convex tables only.
  openWorldHint: false,
});

const ID_HINT = "ID Convex yang dikembalikan oleh tool baca; jangan mengarang.";

export const MCP_TOOLS: ToolDef[] = [
  {
    name: "list_pending_orders",
    description:
      "Baca semua pesanan berstatus PENDING di ruang kerja pemilik token. Pakai ini sebelum menjawab pertanyaan tentang pesanan yang belum selesai, dan sebelum update_order — klien lain (GPT, harness, dashboard) bisa menulis di antara giliran, jadi jangan mengandalkan hasil baca lama. Untuk angka harian agregat pakai get_daily_summary.",
    inputSchema: EMPTY,
    annotations: annotations("Daftar pesanan pending", "read"),
  },
  {
    name: "create_order",
    description:
      "Buat pesanan baru dan kurangi stok secara atomik. WAJIB konfirmasi ke pengguna sebelum memanggil. requestId harus unik per pesanan nyata dan dipakai ulang persis saat retry: payload sama -> pesanan lama dikembalikan (idempoten), payload berbeda -> error IDEMPOTENCY_CONFLICT. `product` diisi nama atau slug produk yang sudah ada di katalog (lihat list_products); nama yang tidak cocok menghasilkan PRODUCT_NOT_FOUND, nama ambigu menghasilkan PRODUCT_AMBIGUOUS. pickupTime dalam ISO 8601. Tool ini tidak memproses pembayaran; paymentStatus hanya mencatat.",
    inputSchema: object(
      {
        requestId: str("ID unik dari pemanggil untuk retry aman. Maks 200 karakter."),
        customerName: str("Nama pemesan. Maks 120 karakter."),
        items: {
          type: "array",
          minItems: 1,
          maxItems: 50,
          description: "Baris pesanan. Kuantitas digabung otomatis untuk produk yang sama.",
          items: object(
            {
              product: str("Nama atau slug produk yang sudah ada di katalog."),
              quantity: { type: "integer", minimum: 1, description: "Jumlah, bilangan bulat > 0." },
            },
            ["product", "quantity"],
          ),
        },
        pickupTime: {
          type: "string",
          format: "date-time",
          description: "Waktu ambil/target, ISO 8601.",
        },
        paymentStatus: {
          type: "string",
          enum: ["UNPAID", "PAID", "PARTIAL"],
          description: "Status pembayaran yang dicatat, bukan transaksi.",
        },
        notes: str("Catatan opsional. Maks 500 karakter."),
      },
      ["requestId", "customerName", "items", "pickupTime", "paymentStatus"],
    ),
    // idempotent by requestId — a retry with the same payload returns the
    // original order instead of double-writing.
    annotations: annotations("Buat pesanan", "idempotent"),
  },
  {
    name: "update_order",
    description:
      "Ubah status pesanan yang sudah ada. WAJIB konfirmasi ke pengguna sebelum memanggil. Minimal satu dari fulfillmentStatus / paymentStatus harus diisi. Tool ini TIDAK mengubah isi pesanan atau stok — untuk pesanan baru pakai create_order. orderId diambil dari list_pending_orders.",
    inputSchema: object(
      {
        orderId: str(`ID pesanan. ${ID_HINT}`),
        fulfillmentStatus: {
          type: "string",
          enum: ["PENDING", "COMPLETED"],
          description: "Status penyelesaian baru.",
        },
        paymentStatus: {
          type: "string",
          enum: ["UNPAID", "PAID", "PARTIAL"],
          description: "Status pembayaran baru.",
        },
      },
      ["orderId"],
    ),
    annotations: annotations("Perbarui status pesanan", "idempotent"),
  },
  {
    name: "get_low_stock_items",
    description:
      "Baca produk yang stoknya sudah pada atau di bawah ambang lowStockThreshold-nya. Pakai untuk pertanyaan 'apa yang perlu ditambah/restock'. Untuk katalog lengkap termasuk yang stoknya aman pakai list_products.",
    inputSchema: EMPTY,
    annotations: annotations("Daftar stok rendah", "read"),
  },
  {
    name: "get_daily_summary",
    description:
      "Baca ringkasan hari ini (zona Asia/Jakarta): jumlah pesanan, total nilai, dan sorotan stok rendah. Pakai untuk pertanyaan agregat 'hari ini bagaimana'. Untuk daftar pesanan satu per satu pakai list_pending_orders.",
    inputSchema: EMPTY,
    annotations: annotations("Ringkasan hari ini", "read"),
  },
  {
    name: "get_business_profile",
    description:
      "Baca profil ruang kerja pemilik token (nama dan metadata). Pakai saat perlu menyebut nama ruang kerja atau memverifikasi token menunjuk ke ruang kerja yang benar.",
    inputSchema: EMPTY,
    annotations: annotations("Baca profil ruang kerja", "read"),
  },
  {
    name: "update_business_profile",
    description:
      "Ubah nama ruang kerja. WAJIB konfirmasi ke pengguna sebelum memanggil. Hanya nama yang bisa diubah lewat tool ini.",
    inputSchema: object({ name: str("Nama ruang kerja baru. Maks 120 karakter, tidak boleh kosong.") }, ["name"]),
    annotations: annotations("Ubah nama ruang kerja", "idempotent"),
  },
  {
    name: "list_products",
    description:
      "Baca katalog produk ruang kerja (maks 50) beserta harga, stok, dan ambang stok rendah. Panggil ini sebelum create_order untuk memastikan nama produk cocok, dan sebelum update_product / delete_product untuk mendapatkan productId yang benar.",
    inputSchema: EMPTY,
    annotations: annotations("Daftar produk", "read"),
  },
  {
    name: "create_product",
    description:
      "Tambah produk baru ke katalog. WAJIB konfirmasi ke pengguna sebelum memanggil. Slug dibuat otomatis dari nama. Tool ini TIDAK idempoten — memanggil dua kali membuat dua produk; untuk mengubah produk yang sudah ada pakai update_product. Maksimal 50 produk per ruang kerja.",
    inputSchema: object(
      {
        name: str("Nama produk. Maks 120 karakter."),
        price: num("Harga satuan dalam rupiah, bilangan bulat >= 0."),
        stock: num("Stok awal, bilangan bulat >= 0."),
        lowStockThreshold: num("Ambang peringatan stok rendah, bilangan bulat >= 0."),
      },
      ["name", "price", "stock", "lowStockThreshold"],
    ),
    annotations: annotations("Tambah produk", "create"),
  },
  {
    name: "update_product",
    description:
      "Perbarui produk yang sudah ada. WAJIB konfirmasi ke pengguna sebelum memanggil. Semua field wajib dikirim — nilai yang tidak disebut pengguna diisi dengan nilai lama dari list_products, jangan dikosongkan. Pakai ini juga untuk koreksi stok manual (restock); create_order sudah mengurangi stok sendiri.",
    inputSchema: object(
      {
        productId: str(`ID produk. ${ID_HINT}`),
        name: str("Nama produk. Maks 120 karakter."),
        price: num("Harga satuan dalam rupiah, bilangan bulat >= 0."),
        stock: num("Stok setelah perubahan, bilangan bulat >= 0."),
        lowStockThreshold: num("Ambang peringatan stok rendah, bilangan bulat >= 0."),
      },
      ["productId", "name", "price", "stock", "lowStockThreshold"],
    ),
    annotations: annotations("Ubah produk", "idempotent"),
  },
  {
    name: "delete_product",
    description:
      "Hapus produk dari katalog secara permanen — tidak ada undo dan pesanan lama tetap menyimpan salinan barisnya. WAJIB konfirmasi eksplisit ke pengguna sebelum memanggil. Kalau maksudnya hanya menghabiskan stok, pakai update_product dengan stock 0.",
    inputSchema: object({ productId: str(`ID produk. ${ID_HINT}`) }, ["productId"]),
    annotations: annotations("Hapus produk", "destructive"),
  },
];

export const MCP_TOOL_NAMES = new Set(MCP_TOOLS.map((tool) => tool.name));
