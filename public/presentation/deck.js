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
const deploymentBaseUrl = "https://codex-build-week.vercel.app";
const deployedDemoUrl = new URL("/demo", deploymentBaseUrl).href;

const current = Math.max(0, Math.min(slides.length - 1, Number(document.body.dataset.slide || 0)));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-current]").forEach((node) => node.textContent = String(current + 1).padStart(2, "0"));
document.querySelectorAll("[data-total]").forEach((node) => node.textContent = String(slides.length).padStart(2, "0"));
document.querySelectorAll("[data-progress]").forEach((node) => node.style.setProperty("--progress", `${((current + 1) / slides.length) * 100}%`));

const qrCard = document.querySelector("[data-qr-card]");
if (qrCard) {
  qrCard.href = deployedDemoUrl;
  qrCard.hidden = false;
  qrCard.querySelector("[data-qr-domain]").textContent = new URL(deploymentBaseUrl).host;
}

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

function setupInteractiveDemo() {
  const shell = document.querySelector("[data-demo-shell]");
  if (!shell) return;

  const send = shell.querySelector("[data-chat-send]");
  const typing = shell.querySelector("[data-ai-typing]");
  const confirmCard = shell.querySelector("[data-confirm-card]");
  const confirm = shell.querySelector("[data-confirm-order]");
  const confirmBubble = shell.querySelector("[data-confirm-bubble]");
  const successCard = shell.querySelector("[data-success-card]");
  const liveWorkspace = shell.querySelector("[data-live-workspace]");
  const recentOrder = shell.querySelector("[data-recent-order]");
  const activityLog = shell.querySelector("[data-activity-log]");
  const process = shell.querySelector("[data-order-process]");
  const processState = shell.querySelector("[data-process-state]");
  const processBar = shell.querySelector("[data-process-bar]");
  const showActivity = shell.querySelector("[data-show-activity]");
  const steps = [...shell.querySelectorAll("[data-process-step]")];
  const dashboardMetrics = [...shell.querySelectorAll(".metric [data-after]")];
  const stockValues = [...shell.querySelectorAll(".stock-row [data-after]")];
  const stockBars = [...shell.querySelectorAll("[data-stock-bar]")];
  let run = 0;

  const show = (node, visible = true) => node?.classList.toggle("is-visible", visible);

  function reset() {
    run++;
    shell.classList.remove("is-split");
    liveWorkspace.setAttribute("aria-hidden", "true");
    send.disabled = false;
    send.classList.remove("is-sent");
    confirm.disabled = false;
    [typing, confirmCard, confirmBubble, successCard, recentOrder, activityLog].forEach((node) => show(node, false));
    [...dashboardMetrics, ...stockValues].forEach((node) => {
      node.textContent = node.dataset.before;
      node.closest(".metric, .stock-row")?.classList.remove("is-updated");
    });
    stockBars.forEach((bar, index) => bar.style.setProperty("--stock", index ? "90%" : "80%"));
    steps.forEach((step, index) => {
      step.classList.remove("is-running", "is-done");
      step.querySelector(".process-dot").textContent = String(index + 1);
      step.querySelector("em").textContent = "Menunggu";
    });
    processState.textContent = "Menunggu konfirmasi";
    processState.classList.remove("is-running", "is-done");
    processBar.style.width = "0";
  }

  send.addEventListener("click", async () => {
    const token = ++run;
    send.disabled = true;
    send.classList.add("is-sent");
    show(typing);
    await wait(520);
    if (token !== run) return;
    show(typing, false);
    show(confirmCard);
    confirm.focus();
  });

  shell.querySelector("[data-cancel-order]").addEventListener("click", () => {
    reset();
    send.focus();
  });

  confirm.addEventListener("click", async () => {
    const token = ++run;
    confirm.disabled = true;
    show(confirmCard, false);
    show(confirmBubble);
    show(typing);
    shell.classList.add("is-split");
    liveWorkspace.setAttribute("aria-hidden", "false");
    processState.textContent = "Memproses order";
    processState.classList.add("is-running");
    process.focus({ preventScroll: true });

    for (const [index, step] of steps.entries()) {
      if (token !== run) return;
      step.classList.add("is-running");
      step.querySelector("em").textContent = "Diproses";
      processBar.style.width = `${(index / steps.length) * 100}%`;
      await wait(430);
      if (token !== run) return;
      step.classList.remove("is-running");
      step.classList.add("is-done");
      step.querySelector(".process-dot").textContent = "✓";
      step.querySelector("em").textContent = "Selesai";
      processBar.style.width = `${((index + 1) / steps.length) * 100}%`;

      if (index === 2) {
        show(recentOrder);
        dashboardMetrics.forEach((node) => {
          node.textContent = node.dataset.after;
          node.closest(".metric")?.classList.add("is-updated");
        });
      } else if (index === 3) {
        stockValues.forEach((node) => {
          node.textContent = node.dataset.after;
          node.closest(".stock-row")?.classList.add("is-updated");
        });
        stockBars.forEach((bar, barIndex) => bar.style.setProperty("--stock", barIndex ? "80%" : "60%"));
      } else if (index === 4) {
        show(activityLog);
      }
    }

    show(typing, false);
    show(successCard);
    processState.textContent = "Pesanan tercatat ✓";
    processState.classList.remove("is-running");
    processState.classList.add("is-done");
    showActivity.focus({ preventScroll: true });
  });

  showActivity.addEventListener("click", () => {
    process.classList.remove("is-highlighted");
    requestAnimationFrame(() => process.classList.add("is-highlighted"));
    process.focus();
  });
  shell.querySelector("[data-reset-demo]").addEventListener("click", () => {
    reset();
    send.focus();
  });

  reset();
}

setupInteractiveDemo();

const archDetail = document.querySelector("[data-arch-detail]");
document.querySelectorAll("[data-arch]").forEach((node) => {
  node.addEventListener("click", () => {
    document.querySelectorAll("[data-arch]").forEach((item) => item.classList.remove("is-active"));
    node.classList.add("is-active");
    if (archDetail) archDetail.textContent = node.dataset.detail;
  });
});
