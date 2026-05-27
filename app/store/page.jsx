import { redirect } from "next/navigation";

export default function StoreDashboardRedirect() {
  redirect("/admin");
}
