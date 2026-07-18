function setupOnboardingDemo() {
  const play = document.querySelector("[data-interview-play]");
  if (!play) return;

  const card = play.closest(".interview-card");
  const icon = play.querySelector("[data-interview-icon]");
  const label = play.querySelector("[data-interview-label]");
  const transcript = document.querySelector("[data-interview-transcript]");
  const stages = [...document.querySelectorAll("[data-interview-stage]")];
  const draft = document.querySelector(".product-draft");
  const accept = document.querySelector("[data-accept-draft]");
  const success = document.querySelector("[data-onboarding-success]");
  let run = 0;

  play.addEventListener("click", async () => {
    const token = ++run;
    transcript.hidden = true;
    stages.forEach((stage) => stage.hidden = true);
    success.hidden = true;
    play.disabled = true;
    play.setAttribute("aria-expanded", "false");
    card.classList.remove("is-playing");
    void card.offsetWidth;
    card.classList.add("is-playing");
    icon.textContent = "■";
    label.textContent = "Mendengarkan contoh…";

    await wait(420);
    if (token !== run) return;
    transcript.hidden = false;
    play.setAttribute("aria-expanded", "true");

    await wait(780);
    if (token !== run) return;
    stages.forEach((stage) => stage.hidden = false);
    card.classList.remove("is-playing");
    icon.textContent = "↻";
    label.textContent = "Putar ulang simulasi";
    play.disabled = false;
    draft.focus({ preventScroll: true });
  });

  accept.addEventListener("click", () => {
    success.hidden = false;
    success.focus({ preventScroll: true });
  });
}

setupOnboardingDemo();
