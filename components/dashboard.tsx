"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useQuery } from "convex/react";
import Image from "next/image";

import { api } from "@/convex/_generated/api";
import { formatDate, formatDateTime, formatRupiah, formatStatus } from "@/lib/format";

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

const tabs = [
  { id: "today", label: "Hari ini" },
  { id: "orders", label: "Pesanan" },
  { id: "activity", label: "Aktivitas AI" },
] as const;

type Tab = (typeof tabs)[number]["id"];

export function Dashboard() {
  const data = useQuery(api.business.dashboard) as DashboardData | null | undefined;
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (data === undefined) return <LoadingDashboard />;
  if (data === null || data.business === null) return <UnseededDashboard />;

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    setActiveTab(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <Image
            alt=""
            aria-hidden="true"
            className="brand-mark"
            height={72}
            priority
            src="/assets/brand/temanusaha-mark.png"
            width={72}
          />
          <div>
            <span className="eyebrow">TemanUsaha AI</span>
            <h1>{data.business.name}</h1>
          </div>
        </div>
        <div className="header-art">
          <Image
            alt="Nasi ayam dan es teh di meja Warung Nasi Bu Sari"
            className="header-art-image"
            fill
            priority
            sizes="(max-width: 560px) calc(100vw - 24px), 430px"
            src="/assets/illustrations/warung-dashboard-banner.png"
          />
          <div className="live-badge">
            <span aria-hidden="true" />
            Data langsung dari Convex
          </div>
        </div>
      </header>

      <nav
        aria-label="Bagian dashboard"
        aria-orientation="horizontal"
        className="tabs"
        role="tablist"
      >
        {tabs.map((tab, index) => (
          <button
            aria-controls={"panel-" + tab.id}
            aria-selected={activeTab === tab.id}
            id={"tab-" + tab.id}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            role="tab"
            tabIndex={activeTab === tab.id ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <TodayPanel data={data} hidden={activeTab !== "today"} />
      <OrdersPanel hidden={activeTab !== "orders"} orders={data.orders} />
      <ActivityPanel activity={data.activity} hidden={activeTab !== "activity"} />
    </main>
  );
}

function TodayPanel({ data, hidden }: { data: DashboardData; hidden: boolean }) {
  const metrics = [
    ["Pesanan", data.summary.orderCount],
    ["Omzet tercatat", formatRupiah(data.summary.recordedRevenue)],
    ["Belum selesai", data.summary.pendingOrderCount],
    ["Belum dibayar", data.summary.unpaidOrderCount],
  ];

  return (
    <section
      aria-labelledby="tab-today"
      className="panel"
      hidden={hidden}
      id="panel-today"
      role="tabpanel"
      tabIndex={0}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Ringkasan</span>
          <h2>{formatDate(data.summary.date)}</h2>
        </div>
        <p>Angka operasional hari ini, siap diperiksa.</p>
      </div>
      <div className="metric-grid">
        {metrics.map(([label, value]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <section className="content-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">Perlu perhatian</span>
            <h3>Stok menipis</h3>
          </div>
          <span className="count-badge">{data.lowStock.length}</span>
        </div>
        {data.lowStock.length ? (
          <ul className="stock-list">
            {data.lowStock.map((product) => (
              <li key={product._id}>
                <div>
                  <strong>{product.name}</strong>
                  <span>Batas aman {product.lowStockThreshold}</span>
                </div>
                <span className="stock-value">Sisa {product.stock}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState text="Semua stok masih di atas batas aman." />
        )}
      </section>
    </section>
  );
}

function OrdersPanel({ hidden, orders }: { hidden: boolean; orders: DashboardData["orders"] }) {
  return (
    <section
      aria-labelledby="tab-orders"
      className="panel"
      hidden={hidden}
      id="panel-orders"
      role="tabpanel"
      tabIndex={0}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Operasional</span>
          <h2>Pesanan</h2>
        </div>
        <p>{orders.length} pesanan terbaru</p>
      </div>
      <div className="table-card">
        {orders.length ? (
          <div className="table-scroll">
            <table>
              <caption className="sr-only">Daftar pesanan terbaru</caption>
              <thead>
                <tr>
                  <th scope="col">Pelanggan</th>
                  <th scope="col">Item</th>
                  <th scope="col">Ambil</th>
                  <th scope="col">Pembayaran</th>
                  <th scope="col">Status</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <th scope="row">{order.customerName}</th>
                    <td>
                      {order.items
                        .map((item) => item.quantity + " x " + item.productName)
                        .join(", ")}
                    </td>
                    <td>{formatDateTime(order.pickupTime)}</td>
                    <td><StatusBadge status={order.paymentStatus} /></td>
                    <td><StatusBadge status={order.fulfillmentStatus} /></td>
                    <td className="money">{formatRupiah(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState text="Belum ada pesanan hari ini." />
        )}
      </div>
    </section>
  );
}

function ActivityPanel({
  activity,
  hidden,
}: {
  activity: DashboardData["activity"];
  hidden: boolean;
}) {
  return (
    <section
      aria-labelledby="tab-activity"
      className="panel"
      hidden={hidden}
      id="panel-activity"
      role="tabpanel"
      tabIndex={0}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Jejak tindakan</span>
          <h2>Aktivitas AI</h2>
        </div>
        <p>Setiap perubahan dapat dilihat dan diperiksa.</p>
      </div>
      {activity.length ? (
        <ol className="activity-list">
          {activity.map((item) => (
            <li className="activity-card" key={item._id}>
              <div className="activity-meta">
                <strong>{formatAction(item.action)}</strong>
                <time dateTime={new Date(item.createdAt).toISOString()}>
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
              {item.requiresVerification && (
                <span className="verify-badge">Perlu diperiksa</span>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <div className="content-card">
          <EmptyState text="Belum ada aktivitas AI." />
        </div>
      )}
    </section>
  );
}

function LoadingDashboard() {
  return (
    <main aria-busy="true" aria-live="polite" className="dashboard-shell">
      <span className="sr-only">Memuat dashboard</span>
      <div className="loading-line wide" />
      <div className="loading-line" />
      <div className="metric-grid loading-grid">
        {[0, 1, 2, 3].map((item) => <div className="loading-card" key={item} />)}
      </div>
    </main>
  );
}

function UnseededDashboard() {
  return (
    <main className="setup-shell">
      <section aria-live="polite" className="setup-card">
        <span className="eyebrow">Data belum tersedia</span>
        <h1>Data demo belum di-seed</h1>
        <p>
          Jalankan reset seed Convex dengan <code>DEMO_RESET_KEY</code> yang sudah
          dikonfigurasi. Dashboard akan memperbarui data secara otomatis.
        </p>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={"status status-" + status.toLowerCase()}>{formatStatus(status)}</span>;
}

function EmptyState({ text }: { text: string }) {
  return <p className="empty-state">{text}</p>;
}

function formatAction(action: string) {
  return action.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
