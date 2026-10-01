import { redirect } from "next/navigation"

export default function NewArrivalsPage() {
  redirect("/shop?filter=new")
}
