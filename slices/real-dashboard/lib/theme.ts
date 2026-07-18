// Single source of truth for Mode Real's no-flash dark/light theme contract:
// the .dash-root container id/class and the localStorage key that persists
// the user's choice across app/dashboard/page.tsx and DashboardApp.

export const DASH_ROOT_ID = "dash-root";
const LIGHT_CLASS = "light";
const THEME_STORAGE_KEY = "dash-theme";

// No-flash theme: dark adalah default; preferensi "light" yang tersimpan
// diterapkan sebelum paint. Runs as the container's first child so the
// element already exists — no next-themes, no hydration flash.
export const themeScript =
  `try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="${LIGHT_CLASS}"){document.currentScript.parentElement.classList.add("${LIGHT_CLASS}")}}catch(e){}`;

// Hand-rolled theme switch: flips the .light class on the .dash-root container
// and persists the choice; app/dashboard/page.tsx replays it before paint.
export function toggleTheme() {
  const root = document.getElementById(DASH_ROOT_ID);
  if (!root) return;
  const light = root.classList.toggle(LIGHT_CLASS);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, light ? LIGHT_CLASS : "dark");
  } catch {
    // Penyimpanan lokal tidak tersedia; tema tetap berlaku untuk sesi ini.
  }
}
