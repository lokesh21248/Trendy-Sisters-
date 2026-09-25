import type { Metadata } from "next"
import { ShopPage } from "@/components/shop/ShopPage"

export const metadata: Metadata = {
  title: "Shop All Sarees",
  description: "Browse our complete collection of premium Indian sarees — silk, cotton, Banarasi, designer and more.",
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  return <ShopPage searchParams={searchParams} />
}
