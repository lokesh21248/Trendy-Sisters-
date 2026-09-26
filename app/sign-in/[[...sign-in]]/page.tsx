import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div
      className="min-h-[80vh] flex items-center justify-center py-12 px-4"
      style={{ backgroundColor: "var(--ivory)" }}
    >
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  )
}
