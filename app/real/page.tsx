import { redirect } from "next/navigation";

// Mode Real kini tinggal di /dashboard; tautan lama /real tetap berfungsi.
export default function RealPage() {
  redirect("/dashboard");
}
