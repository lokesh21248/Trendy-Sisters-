import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params

  switch (slug) {
    case "wedding-edit":
      redirect("/shop?occasion=Wedding")
    case "festive-luxe":
      redirect("/shop?occasion=Festive")
    case "heritage-weaves":
      redirect("/shop?filter=bestseller")
    case "new-arrivals":
      redirect("/shop?filter=new")
    default:
      redirect("/shop")
  }
}
