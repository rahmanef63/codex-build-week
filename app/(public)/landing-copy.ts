export const locales = ["id", "en", "fr", "ja"] as const;
export type Locale = (typeof locales)[number];

export const languageNames: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
  fr: "Français",
  ja: "日本語",
};

// The locale served when nothing else resolves. Exported so proxy.ts and
// shared/lib/geo-locale.ts fall back to the same value instead of each keeping
// its own copy of the string "id".
export const defaultLocale: Locale = "en";

export function isLocale(value?: string | null): value is Locale {
  return locales.includes(value as Locale);
}

// `fallback` is additive: existing callers pass only `value` and keep today's
// behaviour exactly (an unknown or missing `?lang=` resolves to English).
export function getLocale(value?: string, fallback: Locale = defaultLocale): Locale {
  return isLocale(value) ? value : fallback;
}

// The product name is a proper noun: it stays "Asisten Pribadi AI" in every
// locale, only the sentence around it is translated.
export const productName = "Asisten Pribadi AI";

// Rendered verbatim inside the hero architecture panel — a route path, not copy,
// so it is intentionally shared by all locales instead of duplicated per locale.
export const agentRoutePath = "/api/agent/*";

export const landingCopy = {
  id: {
    signIn: "Masuk",
    language: "Bahasa",
    eyebrow: "Reference build — GPTs sebagai agent",
    title: "Ubah Custom GPT jadi agent sungguhan.",
    description: "Satu backend Convex, satu set Actions. Custom GPT, agent harness (Claude Code), atau dashboard — ketiganya menulis ke workspace yang sama.",
    demoCta: "Coba demo",
    dashboardCta: "Buka dashboard",
    deployCta: "Deploy sendiri",
    separation: "Data demo dan data Anda berada di tenant terpisah.",
    architectureLabel: "Tiga klien, satu backend",
    clients: [
      ["Custom GPT", "Actions lewat HTTPS"],
      ["Agent harness", "Skill Claude Code"],
      ["Dashboard", "Antarmuka Next.js"],
    ],
    optionalTag: "opsional",
    routeNote: "dibatasi token",
    backendLabel: "Deployment Convex",
    dataLabels: ["baca", "tulis", "log aktivitas"],
    examplePointer: "Lihat contoh kasus lengkapnya di demo",
    workflow: "Satu backend, tiga klien",
    benefitsTitle: "Pola yang bisa Anda pakai ulang.",
    benefitsIntro: "Mulai dari tenant demo bersama, lalu deploy milik Anda sendiri dan arahkan GPT ke sana.",
    benefits: [
      ["Actions yang sama dari setiap klien", "GPT, Claude Code, dan dashboard memanggil route /api/agent/* yang sama. Tidak ada backend khusus per klien."],
      ["Tenant dibatasi token", "Satu token hanya memetakan ke satu business id, jadi token tidak bisa membaca atau menulis data tenant lain."],
      ["Setiap penulisan tercatat", "Baca dan tulis masuk ke log aktivitas beserta nama action, sehingga tindakan agent bisa diperiksa ulang."],
    ],
    facts: ["Action baca dan tulis berbagi satu permukaan HTTPS", "Backend berjalan tanpa antarmuka — dashboard opsional", "Token disimpan sebagai hash dan ditampilkan sekali"],
  },
  en: {
    signIn: "Sign in",
    language: "Language",
    eyebrow: "Reference build — GPTs as your agent",
    title: "Turn a Custom GPT into a real agent.",
    description: "One Convex backend, one set of Actions. A Custom GPT, an agent harness (Claude Code), or the dashboard — all three write into the same workspace.",
    demoCta: "Try the demo",
    dashboardCta: "Open dashboard",
    deployCta: "Deploy your own",
    separation: "Demo data and your own data live in separate tenants.",
    architectureLabel: "Three clients, one backend",
    clients: [
      ["Custom GPT", "Actions over HTTPS"],
      ["Agent harness", "Claude Code skill"],
      ["Dashboard", "Next.js interface"],
    ],
    optionalTag: "optional",
    routeNote: "token-scoped",
    backendLabel: "Convex deployment",
    dataLabels: ["read", "write", "activity log"],
    examplePointer: "See the full worked example in the demo",
    workflow: "One backend, three clients",
    benefitsTitle: "A pattern you can lift.",
    benefitsIntro: "Start on the shared demo tenant, then deploy your own and point your GPT at it.",
    benefits: [
      ["Same Actions from every client", "The GPT, Claude Code, and the dashboard all call the same /api/agent/* routes. No client-specific backend."],
      ["Token-scoped tenants", "One token resolves to exactly one business id, so it can never read or write another tenant's rows."],
      ["Every write is logged", "Reads and writes land in the activity log with the action name, so agent behaviour stays auditable."],
    ],
    facts: ["Read and write Actions share one HTTPS surface", "The backend runs headless — the dashboard is optional", "Tokens are stored hashed and shown once"],
  },
  fr: {
    signIn: "Se connecter",
    language: "Langue",
    eyebrow: "Implémentation de référence — les GPTs comme agent",
    title: "Transformez un GPT personnalisé en véritable agent.",
    description: "Un seul backend Convex, un seul jeu d’Actions. Un GPT personnalisé, un harnais d’agent (Claude Code) ou le tableau de bord — les trois écrivent dans le même espace de travail.",
    demoCta: "Essayer la démo",
    dashboardCta: "Ouvrir le tableau de bord",
    deployCta: "Déployer votre version",
    separation: "Les données de démo et les vôtres vivent dans des tenants distincts.",
    architectureLabel: "Trois clients, un seul backend",
    clients: [
      ["GPT personnalisé", "Actions via HTTPS"],
      ["Harnais d’agent", "Skill Claude Code"],
      ["Tableau de bord", "Interface Next.js"],
    ],
    optionalTag: "optionnel",
    routeNote: "limité par jeton",
    backendLabel: "Déploiement Convex",
    dataLabels: ["lecture", "écriture", "journal d’activité"],
    examplePointer: "Voir l’exemple complet dans la démo",
    workflow: "Un backend, trois clients",
    benefitsTitle: "Un montage directement réutilisable.",
    benefitsIntro: "Commencez sur le tenant de démo partagé, puis déployez le vôtre et pointez-y votre GPT.",
    benefits: [
      ["Les mêmes Actions depuis chaque client", "Le GPT, Claude Code et le tableau de bord appellent les mêmes routes /api/agent/*. Aucun backend dédié à un client."],
      ["Tenants cloisonnés par jeton", "Un jeton correspond à un seul business id : impossible de lire ou d’écrire chez un autre tenant."],
      ["Chaque écriture est journalisée", "Lectures et écritures rejoignent le journal d’activité avec le nom de l’action, ce qui rend le comportement de l’agent vérifiable."],
    ],
    facts: ["Les Actions de lecture et d’écriture partagent une seule surface HTTPS", "Le backend fonctionne sans interface — le tableau de bord est optionnel", "Les jetons sont stockés hachés et affichés une seule fois"],
  },
  ja: {
    signIn: "ログイン",
    language: "言語",
    eyebrow: "リファレンス実装 — GPTs をエージェントとして使う",
    title: "カスタム GPT を、実際に動くエージェントに。",
    description: "Convex バックエンドはひとつ、Actions もひと揃い。カスタム GPT、エージェントハーネス（Claude Code）、ダッシュボード — この3つが同じワークスペースに書き込みます。",
    demoCta: "デモを試す",
    dashboardCta: "ダッシュボードを開く",
    deployCta: "自分用にデプロイ",
    separation: "デモのデータとご自身のデータは、別々のテナントに保存されます。",
    architectureLabel: "3つのクライアント、ひとつのバックエンド",
    clients: [
      ["カスタム GPT", "HTTPS 経由の Actions"],
      ["エージェントハーネス", "Claude Code スキル"],
      ["ダッシュボード", "Next.js の画面"],
    ],
    optionalTag: "任意",
    routeNote: "トークンで範囲を限定",
    backendLabel: "Convex デプロイメント",
    dataLabels: ["読み取り", "書き込み", "操作履歴"],
    examplePointer: "詳しい実例はデモで確認できます",
    workflow: "ひとつのバックエンド、3つのクライアント",
    benefitsTitle: "そのまま流用できる構成。",
    benefitsIntro: "まずは共有のデモテナントで試し、次に自分用にデプロイして GPT を向けてください。",
    benefits: [
      ["どのクライアントからも同じ Actions", "GPT も Claude Code もダッシュボードも、同じ /api/agent/* を呼びます。クライアント専用のバックエンドはありません。"],
      ["トークン単位のテナント分離", "1つのトークンは1つの business id にのみ対応し、他テナントのデータは読み書きできません。"],
      ["すべての書き込みを記録", "読み取りも書き込みも action 名とともに操作履歴に残るため、エージェントの挙動をあとから検証できます。"],
    ],
    facts: ["読み取りと書き込みの Action が同じ HTTPS 面を共有", "バックエンドは単体で動作 — ダッシュボードは任意", "トークンはハッシュ化して保存し、表示は一度だけ"],
  },
} as const;
