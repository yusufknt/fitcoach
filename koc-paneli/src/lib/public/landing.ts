import { createClient } from '@/lib/supabase/server'
import type { Package, Profile } from '@/types'

export async function getCoachProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url, bio, created_at')
    .eq('role', 'coach')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  return data
}

export async function getActivePackages(): Promise<Package[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((pkg) => ({
    ...pkg,
    price: Number(pkg.price),
    features: pkg.features ?? [],
  }))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDuration(days: number): string {
  if (days >= 30 && days % 30 === 0) {
    const months = days / 30
    return months === 1 ? '1 ay' : `${months} ay`
  }
  return days === 1 ? '1 gün' : `${days} gün`
}
