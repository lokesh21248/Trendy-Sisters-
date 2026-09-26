import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div
      className="min-h-[80vh] flex items-center justify-center py-12 px-4"
      style={{ backgroundColor: "var(--ivory)" }}
    >
      <SignUp routing="hash" signInUrl="/auth/login" />
    </div>
  )
}
