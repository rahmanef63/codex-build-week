const slideDeck = [
  ["index.html", "TemanUsaha AI"],
  ["01-masalah.html", "Masalah operasional UMKM"],
  ["02-solusi.html", "Alur TemanUsaha"],
  ["03-demo.html", "Demo Bu Rina"],
  ["04-bukti.html", "Enam Action aktif"],
  ["05-arsitektur.html", "Arsitektur"],
  ["06-kepercayaan.html", "Kepercayaan"],
  ["07-build.html", "Dashboard usaha"],
  ["08-penutup.html", "Penutup"],
];
const slides = slideDeck.map(([file]) => file);
const exportNames = ["00-cover", "01-masalah", "02-solusi", "03-demo", "04-bukti", "05-arsitektur", "06-kepercayaan", "07-build", "08-penutup"];
const deploymentBaseUrl = "https://codex-build-week.vercel.app";
const deployedDemoUrl = new URL("/demo", deploymentBaseUrl).href;
const deployedRealUrl = new URL("/dashboard", deploymentBaseUrl).href;
const gptUrl = "https://chatgpt.com/g/g-6a5b0a5ef31c819181f8a68b5536d33e-temanusaha-ai-warung-bu-sari";

const current = Math.max(0, Math.min(slides.length - 1, Number(document.body.dataset.slide || 0)));
document.title = `${slideDeck[current][1]} — TemanUsaha AI`;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const exportMode = new URLSearchParams(location.search).has("export");
if (exportMode) document.body.classList.add("export-mode");

document.querySelectorAll("[data-current]").forEach((node) => node.textContent = String(current + 1).padStart(2, "0"));
document.querySelectorAll("[data-total]").forEach((node) => node.textContent = String(slides.length).padStart(2, "0"));
document.querySelectorAll("[data-progress]").forEach((node) => node.style.setProperty("--progress", `${((current + 1) / slides.length) * 100}%`));

document.querySelectorAll(".deck-nav").forEach((nav) => {
  const name = `temanusaha-ai-${exportNames[current]}`;
  const menu = document.createElement("details");
  menu.className = "download-menu";
  menu.innerHTML = `
    <summary aria-label="Unduh presentasi" title="Unduh presentasi">↓</summary>
    <div class="download-options">
      <strong>Unduh slide ${String(current + 1).padStart(2, "0")}</strong>
      <a download href="exports/${name}.jpg">JPEG · 1600 × 900</a>
      <a download href="exports/${name}.pdf">PDF · satu slide</a>
      <span></span>
      <a download href="exports/temanusaha-ai-presentation.pdf">PDF lengkap · 9 slide</a>
      <a download href="exports/temanusaha-ai-presentation-jpeg.zip">Semua JPEG · ZIP</a>
    </div>`;
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) menu.open = false;
  });
  nav.prepend(menu);
});

const qrCard = document.querySelector("[data-qr-card]");
const gptCard = document.querySelector("[data-gpt-card]");
document.querySelectorAll("[data-demo-link]").forEach((link) => link.href = deployedDemoUrl);
document.querySelectorAll("[data-real-link]").forEach((link) => link.href = deployedRealUrl);
document.querySelectorAll("[data-gpt-link]").forEach((link) => link.href = gptUrl);
if (qrCard) {
  qrCard.hidden = false;
  qrCard.querySelector("[data-qr-domain]").textContent = new URL(deploymentBaseUrl).host;
}
if (gptCard) {
  gptCard.hidden = false;
  gptCard.querySelector("[data-gpt-domain]").textContent = new URL(gptUrl).host;
}

const qrDialog = document.querySelector("[data-qr-dialog]");
document.querySelector("[data-qr-open]")?.addEventListener("click", () => qrDialog.showModal());
document.querySelector("[data-qr-close]")?.addEventListener("click", () => qrDialog.close());
qrDialog?.addEventListener("click", (event) => {
  if (event.target === qrDialog) qrDialog.close();
});

const gptDialog = document.querySelector("[data-gpt-dialog]");
document.querySelector("[data-gpt-open]")?.addEventListener("click", () => gptDialog.showModal());
document.querySelector("[data-gpt-close]")?.addEventListener("click", () => gptDialog.close());
gptDialog?.addEventListener("click", (event) => {
  if (event.target === gptDialog) gptDialog.close();
});

function setNav(selector, target) {
  document.querySelectorAll(selector).forEach((link) => {
    if (target < 0 || target >= slides.length) {
      link.setAttribute("aria-disabled", "true");
      link.removeAttribute("href");
    } else {
      link.setAttribute("href", slides[target]);
    }
  });
}

setNav("[data-prev]", current - 1);
setNav("[data-next]", current + 1);
requestAnimationFrame(() => document.body.classList.add("ready"));

function go(index) {
  if (index < 0 || index >= slides.length) return;
  location.href = slides[index];
}

document.addEventListener("keydown", (event) => {
  const interactive = event.target.closest("button, a, input, textarea, select");
  if (!interactive && ["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    go(current + 1);
  } else if (!interactive && ["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    go(current - 1);
  } else if (!interactive && event.key === "Home") {
    event.preventDefault();
    go(0);
  } else if (!interactive && event.key === "End") {
    event.preventDefault();
    go(slides.length - 1);
  } else if (event.key.toLowerCase() === "p") {
    document.body.classList.toggle("notes-open");
  } else if (event.key.toLowerCase() === "f") {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }
});

let touchStart = 0;
document.addEventListener("touchstart", (event) => touchStart = event.changedTouches[0].clientX, { passive: true });
document.addEventListener("touchend", (event) => {
  const distance = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(distance) > 70) go(current + (distance < 0 ? 1 : -1));
}, { passive: true });

// Cursor-tilt parallax removed — decorative motion; the deck stays calm to match the product.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, reduceMotion ? 20 : ms));

const archDetail = document.querySelector("[data-arch-detail]");
document.querySelectorAll("[data-arch]").forEach((node) => {
  node.addEventListener("click", () => {
    document.querySelectorAll("[data-arch]").forEach((item) => item.classList.remove("is-active"));
    node.classList.add("is-active");
    if (archDetail) archDetail.textContent = node.dataset.detail;
  });
});
