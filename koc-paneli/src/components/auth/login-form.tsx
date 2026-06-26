'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { getDashboardPath, resolveUserRole } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setErrorMessage(null)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setErrorMessage(error.message)
      return
    }

    if (!data.user) {
      setErrorMessage('Giriş başarısız. Lütfen tekrar deneyin.')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const role = resolveUserRole(profile?.role, data.user.user_metadata?.role)

    if (profileError || !role) {
      setErrorMessage(
        'Profil rolü bulunamadı. Supabase\'de kullanıcı metadata\'sına role: "coach" veya "student" ekleyin.'
      )
      return
    }

    const destination = getDashboardPath(role)
    router.push(destination)
    router.refresh()
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-[#E5E1E4]">
          Kinetic Performance
        </h1>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ABD600] mt-1">
          Elite Coaching Dashboard
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Giriş Yap</CardTitle>
          <CardDescription className="text-sm text-[#C4C9AC]">
            Email ve şifrenizle hesabınıza giriş yapın.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#C4C9AC]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@kinetic.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[#C4C9AC]">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            <Button type="submit" className="w-full mt-2 btn-primary-glow" disabled={isSubmitting}>
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
