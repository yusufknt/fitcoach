'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Save, Lock } from 'lucide-react'
import { updateProfile, uploadAvatar, changePassword } from '@/lib/coach/settings.client'
import { useToast } from '@/components/ui/toast-provider'
import type { CoachProfile } from '@/lib/coach/types'

type ProfileTabProps = {
  profile: CoachProfile
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const { showToast } = useToast()
  const [fullName, setFullName] = useState(profile.fullName)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadAvatar(file)
    if (url) {
      setAvatarUrl(url)
      showToast('success', 'Profil fotoğrafı güncellendi!')
    } else {
      showToast('error', 'Fotoğraf yüklenemedi.')
    }
    setUploading(false)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    const ok = await updateProfile({ fullName, bio })
    if (ok) {
      showToast('success', 'Profil kaydedildi!')
    } else {
      showToast('error', 'Profil kaydedilemedi.')
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('error', 'Yeni şifreler eşleşmiyor.')
      return
    }
    if (newPassword.length < 6) {
      showToast('error', 'Şifre en az 6 karakter olmalı.')
      return
    }
    setChangingPassword(true)
    const result = await changePassword(currentPassword, newPassword)
    if (result.success) {
      showToast('success', 'Şifre başarıyla değiştirildi!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      showToast('error', result.error ?? 'Şifre değiştirilemedi.')
    }
    setChangingPassword(false)
  }

  return (
    <div className="space-y-6">
      {/* Avatar + Profile */}
      <Card className="coach-card">
        <CardHeader>
          <CardTitle className="text-base text-[#E5E1E4]">Profil Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-[#444933]">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-[#353437] text-2xl text-[#E5E1E4]">
                  {fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 rounded-full border border-[#444933] bg-[#201F22] p-1.5 text-[#C4C9AC] transition hover:bg-[#C3F400] hover:text-[#283500]"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <p className="font-medium text-[#E5E1E4]">{fullName}</p>
              <p className="text-sm text-[#C4C9AC]">{profile.email}</p>
            </div>
          </div>

          {/* Form */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="profile-name" className="text-[#C4C9AC]">Ad Soyad</Label>
              <Input
                id="profile-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="coach-input mt-1.5"
              />
            </div>
            <div>
              <Label className="text-[#C4C9AC]">Email</Label>
              <Input
                value={profile.email ?? ''}
                disabled
                className="coach-input mt-1.5 opacity-50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="profile-bio" className="text-[#C4C9AC]">Biyografi</Label>
            <Textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Kendinizi tanıtın..."
              className="coach-input mt-1.5 min-h-[100px] resize-none"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="bg-[#C3F400] text-[#283500] hover:bg-[#ABD600]">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Kaydediliyor...' : 'Profili Kaydet'}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="coach-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#E5E1E4]">
            <Lock className="h-4 w-4 text-[#ABD600]" />
            Şifre Değiştir
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-pw" className="text-[#C4C9AC]">Mevcut Şifre</Label>
            <Input
              id="current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="coach-input mt-1.5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="new-pw" className="text-[#C4C9AC]">Yeni Şifre</Label>
              <Input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="coach-input mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="confirm-pw" className="text-[#C4C9AC]">Yeni Şifre (Tekrar)</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="coach-input mt-1.5"
              />
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline" className="border-[#444933] text-[#E5E1E4] hover:bg-[#2A2A2C]">
            {changingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
