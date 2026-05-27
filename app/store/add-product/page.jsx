import { redirect } from "next/navigation";

export default function StoreAddProductRedirect() {
  redirect("/admin/add-product");
}
