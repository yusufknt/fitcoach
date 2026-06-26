'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'
import { updateNotificationPreferences } from '@/lib/coach/settings.client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast-provider'
import type { NotificationPreferences } from '@/lib/coach/types'

type NotificationsTabProps = {
  initialPreferences: NotificationPreferences
}

type ToggleProps = {
  enabled: boolean
  onChange: (val: boolean) => void
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        enabled ? 'bg-[#C3F400]' : 'bg-[#353437]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export function NotificationsTab({ initialPreferences }: NotificationsTabProps) {
  const { showToast } = useToast()
  const [prefs, setPrefs] = useState<NotificationPreferences>(initialPreferences)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const ok = await updateNotificationPreferences(prefs)
    if (ok) {
      showToast('success', 'Bildirim tercihleri kaydedildi!')
    } else {
      showToast('error', 'Tercihler kaydedilemedi.')
    }
    setSaving(false)
  }

  const toggleItems = [
    {
      key: 'emailOnMessage' as const,
      title: 'Yeni Mesaj Bildirimi',
      description: 'Yeni bir mesaj geldiğinde email ile bildirim al.',
    },
    {
      key: 'emailOnNewStudent' as const,
      title: 'Yeni Öğrenci Bildirimi',
      description: 'Yeni bir öğrenci kaydolduğunda email ile bildirim al.',
    },
    {
      key: 'emailReminderBefore24h' as const,
      title: 'Randevu Hatırlatması',
      description: 'Randevu başlamadan 24 saat önce email ile hatırlatma.',
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="coach-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#E5E1E4]">
            <Bell className="h-4 w-4 text-[#ABD600]" />
            Email Bildirimleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {toggleItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#E5E1E4]">{item.title}</p>
                <p className="text-xs text-[#C4C9AC]">{item.description}</p>
              </div>
              <Toggle
                enabled={prefs[item.key]}
                onChange={(val) =>
                  setPrefs((prev) => ({ ...prev, [item.key]: val }))
                }
              />
            </div>
          ))}

          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]">
              {saving ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
