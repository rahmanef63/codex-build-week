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
