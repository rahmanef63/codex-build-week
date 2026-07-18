"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { formatDate, formatDateTime, formatRupiah, formatStatus } from "@/lib/format";

type StarterProduct = { name: string; price: string; stock: string };
type OrderItem = { productName: string; quantity: number };
type DashboardData = {
  business: { name: string } | null;
  summary: {
    date: string;
    orderCount: number;
    recordedRevenue: number;
    unpaidOrderCount: number;
    pendingOrderCount: number;
  };
  orders: Array<{
    _id: string;
    customerName: string;
    total: number;
    paymentStatus: string;
    fulfillmentStatus: string;
    pickupTime: string | number;
    items: OrderItem[];
  }>;
  lowStock: Array<{
    _id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
  }>;
  activity: Array<{
    _id: string;
    action: string;
    inputSummary: string;
    outputSummary: string;
    requiresVerification: boolean;
    createdAt: string | number;
  }>;
};

const emptyProduct = (): StarterProduct => ({ name: "", price: "", stock: "" });

// Hand-rolled theme switch: flips the .light class on the .dash-root container
// and persists the choice; app/dashboard/page.tsx replays it before paint.
function toggleTheme() {
  const root = document.getElementById("dash-root");
  if (!root) return;
  const light = root.classList.toggle("light");
  try {
    localStorage.setItem("dash-theme", light ? "light" : "dark");
  } catch {
    // Penyimpanan lokal tidak tersedia; tema tetap berlaku untuk sesi ini.
  }
}

export function DashboardApp() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const data = useQuery(api.real.dashboard, isAuthenticated ? {} : "skip") as
    | DashboardData
    | null
    | undefined;

  if (isLoading || (isAuthenticated && data === undefined)) return <DashboardSkeleton />;
  if (!isAuthenticated) return <AuthCard />;
  if (!data || data.business === null) return <OnboardingCard />;

  return <ConnectedDashboard data={data} onSignOut={() => void signOut()} />;
}

function AuthCard() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signUp");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="dash-center">
      <section aria-labelledby="dash-auth-title" className="dash-card dash-auth">
        <span className="dash-eyebrow">Mode Real · Akun pemilik</span>
        <h1 id="dash-auth-title">
          {flow === "signUp" ? "Buat akun usaha Anda" : "Masuk ke usaha Anda"}
        </h1>
        <p className="dash-muted">
          Data usaha Anda tersimpan terpisah dari demo dan hanya bisa diakses oleh
          akun Anda.
        </p>
        <form
          className="dash-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(null);
            const formData = new FormData(event.currentTarget);
            formData.set("flow", flow);
            try {
              await signIn("password", formData);
            } catch {
              setError(
                flow === "signUp"
                  ? "Pendaftaran gagal. Gunakan email valid dan kata sandi minimal 8 karakter."
                  : "Email atau kata sandi salah.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="dash-label">
            Email
            <input
              autoComplete="email"
              className="dash-input"
              name="email"
              placeholder="nama@usaha.id"
              required
              type="email"
            />
          </label>
          <label className="dash-label">
            Kata sandi
            <input
              autoComplete={flow === "signUp" ? "new-password" : "current-password"}
              className="dash-input"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
          {error ? (
            <p className="dash-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="dash-btn-primary" disabled={busy} type="submit">
            {busy ? "Memproses…" : flow === "signUp" ? "Daftar" : "Masuk"}
          </button>
        </form>
        <button
          className="dash-link"
          onClick={() => setFlow(flow === "signUp" ? "signIn" : "signUp")}
          type="button"
        >
          {flow === "signUp" ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
        </button>
      </section>
    </div>
  );
}

function OnboardingCard() {
  const createBusiness = useMutation(api.real.createBusiness);
  const [name, setName] = useState("");
  const [products, setProducts] = useState<StarterProduct[]>([emptyProduct()]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const updateProduct = (index: number, patch: Partial<StarterProduct>) =>
    setProducts((current) =>
      current.map((product, i) => (i === index ? { ...product, ...patch } : product)),
    );

  return (
    <div className="dash-center">
      <section aria-labelledby="dash-onboarding-title" className="dash-card dash-onboarding">
        <span className="dash-eyebrow">Mode Real · Onboarding</span>
        <h1 id="dash-onboarding-title">Kenalkan usaha Anda</h1>
        <p className="dash-muted">
          Data ini tersimpan terpisah dari demo dan hanya terlihat oleh akun Anda.
        </p>
        <form
          className="dash-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(null);
            try {
              await createBusiness({
                name,
                products: products
                  .filter((product) => product.name.trim())
                  .map((product) => ({
                    name: product.name,
                    price: Number(product.price) || 0,
                    stock: Number(product.stock) || 0,
                  })),
              });
            } catch {
              setError("Gagal menyimpan. Periksa isian lalu coba lagi.");
              setBusy(false);
            }
          }}
        >
          <label className="dash-label">
            Nama usaha
            <input
              className="dash-input"
              onChange={(event) => setName(event.target.value)}
              placeholder="mis. Warung Nasi Berkah"
              required
              value={name}
            />
          </label>
          <fieldset className="dash-fieldset">
            <legend>Produk awal (opsional)</legend>
            {products.map((product, index) => (
              <div className="dash-product-row" key={index}>
                <input
                  aria-label={`Nama produk ${index + 1}`}
                  className="dash-input"
                  onChange={(event) => updateProduct(index, { name: event.target.value })}
                  placeholder="Nama produk"
                  value={product.name}
                />
                <input
                  aria-label={`Harga produk ${index + 1}`}
                  className="dash-input"
                  inputMode="numeric"
                  min={0}
                  onChange={(event) => updateProduct(index, { price: event.target.value })}
                  placeholder="Harga (Rp)"
                  type="number"
                  value={product.price}
                />
                <input
                  aria-label={`Stok produk ${index + 1}`}
                  className="dash-input"
                  inputMode="numeric"
                  min={0}
                  onChange={(event) => updateProduct(index, { stock: event.target.value })}
                  placeholder="Stok"
                  type="number"
                  value={product.stock}
                />
              </div>
            ))}
            {products.length < 5 ? (
              <button
                className="dash-link"
                onClick={() => setProducts((current) => [...current, emptyProduct()])}
                type="button"
              >
                + Tambah produk
              </button>
            ) : null}
          </fieldset>
          {error ? (
            <p className="dash-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="dash-btn-primary" disabled={busy} type="submit">
            {busy ? "Menyimpan…" : "Buka dashboard saya"}
          </button>
        </form>
      </section>
    </div>
  );
}

function ConnectedDashboard({
  data,
  onSignOut,
}: {
  data: DashboardData;
  onSignOut: () => void;
}) {
  const stats: Array<[string, string | number]> = [
    ["Pesanan hari ini", data.summary.orderCount],
    ["Omzet tercatat", formatRupiah(data.summary.recordedRevenue)],
    ["Belum dibayar", data.summary.unpaidOrderCount],
    ["Belum selesai", data.summary.pendingOrderCount],
  ];

  return (
    <div className="dash-shell">
      <header className="dash-topbar">
        <div>
          <span className="dash-eyebrow">TemanUsaha AI · Mode Real</span>
          <h1>{data.business?.name}</h1>
          <p className="dash-date dash-muted">{formatDate(data.summary.date)}</p>
        </div>
        <div className="dash-topbar-actions">
          <button className="dash-btn-ghost" onClick={toggleTheme} type="button">
            Ganti tema
          </button>
          <button className="dash-btn-ghost" onClick={onSignOut} type="button">
            Keluar
          </button>
        </div>
      </header>

      <section aria-label="Ringkasan hari ini" className="dash-stat-grid">
        {stats.map(([label, value]) => (
          <article className="dash-card dash-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section aria-labelledby="dash-orders-title" className="dash-card">
        <div className="dash-card-head">
          <h2 id="dash-orders-title">Pesanan</h2>
          <span className="dash-badge">{data.orders.length} terbaru</span>
        </div>
        {data.orders.length ? (
          <div className="dash-table-scroll">
            <table className="dash-table">
              <caption className="sr-only">Daftar pesanan terbaru</caption>
              <thead>
                <tr>
                  <th scope="col">Pelanggan</th>
                  <th scope="col">Item</th>
                  <th scope="col">Ambil</th>
                  <th scope="col">Pembayaran</th>
                  <th scope="col">Status</th>
                  <th className="dash-money" scope="col">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order._id}>
                    <th scope="row">{order.customerName}</th>
                    <td>
                      <ul className="dash-order-items">
                        {order.items.map((item) => (
                          <li key={item.productName}>
                            <strong>{item.quantity}×</strong> {item.productName}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>{formatDateTime(order.pickupTime)}</td>
                    <td>
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td>
                      <StatusBadge status={order.fulfillmentStatus} />
                    </td>
                    <td className="dash-money">{formatRupiah(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dash-muted">Belum ada pesanan hari ini.</p>
        )}
      </section>

      <div className="dash-card-grid">
        <section aria-labelledby="dash-stock-title" className="dash-card">
          <div className="dash-card-head">
            <h2 id="dash-stock-title">Stok menipis</h2>
            <span className="dash-badge">{data.lowStock.length}</span>
          </div>
          {data.lowStock.length ? (
            <ul className="dash-list">
              {data.lowStock.map((product) => (
                <li key={product._id}>
                  <div className="dash-item-copy">
                    <strong>{product.name}</strong>
                    <span className="dash-muted dash-small">
                      Batas aman {product.lowStockThreshold}
                    </span>
                  </div>
                  <span className="dash-badge dash-badge-danger">Sisa {product.stock}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dash-muted">Semua stok masih di atas batas aman.</p>
          )}
        </section>

        <section aria-labelledby="dash-activity-title" className="dash-card">
          <div className="dash-card-head">
            <h2 id="dash-activity-title">Aktivitas AI</h2>
            <span className="dash-badge">{data.activity.length}</span>
          </div>
          {data.activity.length ? (
            <ol className="dash-list dash-activity">
              {data.activity.map((item) => (
                <li key={item._id}>
                  <div className="dash-activity-meta">
                    <strong>{formatAction(item.action)}</strong>
                    <time
                      className="dash-muted dash-small"
                      dateTime={new Date(item.createdAt).toISOString()}
                    >
                      {formatDateTime(item.createdAt)}
                    </time>
                  </div>
                  <dl>
                    <div>
                      <dt>Dipahami</dt>
                      <dd>{item.inputSummary}</dd>
                    </div>
                    <div>
                      <dt>Dilakukan</dt>
                      <dd>{item.outputSummary}</dd>
                    </div>
                  </dl>
                  {item.requiresVerification ? (
                    <span className="dash-badge dash-badge-danger">Perlu diperiksa</span>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="dash-muted">Belum ada aktivitas AI.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const danger = status === "UNPAID";
  return (
    <span className={danger ? "dash-badge dash-badge-danger" : "dash-badge"}>
      {formatStatus(status)}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="dash-shell">
      <span className="sr-only">Memuat dashboard…</span>
      <div className="dash-topbar">
        <div style={{ display: "grid", gap: 10 }}>
          <div className="dash-skeleton" style={{ height: 22, width: 150 }} />
          <div className="dash-skeleton" style={{ height: 28, width: 230 }} />
        </div>
        <div className="dash-skeleton" style={{ height: 36, width: 190 }} />
      </div>
      <div className="dash-stat-grid">
        {[0, 1, 2, 3].map((item) => (
          <div className="dash-skeleton" key={item} style={{ height: 96 }} />
        ))}
      </div>
      <div className="dash-skeleton" style={{ height: 230 }} />
    </div>
  );
}

function formatAction(action: string) {
  return action.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
