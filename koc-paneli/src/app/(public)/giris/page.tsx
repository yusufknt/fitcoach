import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#ABD600]/8 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#C3F400]/4 blur-[120px]" />
      
      {/* Subtle radial grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <LoginForm />
    </div>
  )
}
