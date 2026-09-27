import { redirect } from "next/navigation"

export default async function SignInPage(props: {
  searchParams: Promise<{ redirect_url?: string }>
}) {
  const params = await props.searchParams
  const redirectUrl = params?.redirect_url
  if (redirectUrl) {
    redirect(`/auth/login?redirect_url=${encodeURIComponent(redirectUrl)}`)
  }
  redirect("/auth/login")
}
