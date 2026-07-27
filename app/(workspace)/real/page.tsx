import { permanentRedirect } from "next/navigation";

// Mode Real kini tinggal di /dashboard; tautan lama /real tetap berfungsi.
// permanentRedirect issues a 308 so it matches the "permanent redirect" spec in
// AGENTS.md (plain redirect() is only a 307 temporary).
export default function RealPage() {
  permanentRedirect("/dashboard");
}
