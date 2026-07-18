const slides = [
  "index.html",
  "01-masalah.html",
  "02-solusi.html",
  "03-demo.html",
  "04-bukti.html",
  "05-arsitektur.html",
  "06-kepercayaan.html",
  "07-build.html",
  "08-penutup.html",
];

const current = Math.max(0, Math.min(slides.length - 1, Number(document.body.dataset.slide || 0)));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-current]").forEach((node) => node.textContent = String(current + 1).padStart(2, "0"));
document.querySelectorAll("[data-total]").forEach((node) => node.textContent = String(slides.length).padStart(2, "0"));
document.querySelectorAll("[data-progress]").forEach((node) => node.style.setProperty("--progress", `${((current + 1) / slides.length) * 100}%`));

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

if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
  document.addEventListener("pointermove", (event) => {
    const x = (event.clientX / innerWidth - .5) * 2;
    const y = (event.clientY / innerHeight - .5) * 2;
    document.querySelectorAll("[data-tilt]").forEach((node) => {
      node.style.translate = `${x * 7}px ${y * 5}px`;
    });
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, reduceMotion ? 20 : ms));

async function runDemo(button) {
  const hidden = [...document.querySelectorAll("[data-demo-stage]")];
  const metrics = [...document.querySelectorAll("[data-after]")];
  hidden.forEach((node) => node.classList.remove("is-visible"));
  metrics.forEach((node) => {
    node.textContent = node.dataset.before;
    node.closest(".metric, .stock-row")?.classList.remove("is-updated");
  });
  button.disabled = true;
  button.textContent = "Memahami pesanan…";
  await wait(450);
  hidden.filter((node) => node.dataset.demoStage === "1").forEach((node) => node.classList.add("is-visible"));
  button.textContent = "Menunggu konfirmasi…";
  await wait(900);
  hidden.filter((node) => node.dataset.demoStage === "2").forEach((node) => node.classList.add("is-visible"));
  button.textContent = "Menjalankan GPT Action…";
  await wait(850);
  metrics.forEach((node) => {
    node.textContent = node.dataset.after;
    node.closest(".metric, .stock-row")?.classList.add("is-updated");
  });
  document.querySelectorAll("[data-demo-typing]").forEach((node) => node.classList.remove("is-visible"));
  hidden.filter((node) => node.dataset.demoStage === "3").forEach((node) => node.classList.add("is-visible"));
  button.textContent = "Order tercatat ✓";
  await wait(650);
  hidden.filter((node) => node.dataset.demoStage === "4").forEach((node) => node.classList.add("is-visible"));
  button.disabled = false;
  button.textContent = "Ulangi demo";
}

document.querySelectorAll("[data-demo-run]").forEach((button) => button.addEventListener("click", () => runDemo(button)));

const archDetail = document.querySelector("[data-arch-detail]");
document.querySelectorAll("[data-arch]").forEach((node) => {
  node.addEventListener("click", () => {
    document.querySelectorAll("[data-arch]").forEach((item) => item.classList.remove("is-active"));
    node.classList.add("is-active");
    if (archDetail) archDetail.textContent = node.dataset.detail;
  });
});
