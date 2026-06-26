'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileTab } from './profile-tab'
import { WebsiteTab } from './website-tab'
import { NotificationsTab } from './notifications-tab'
import { User, Globe, Bell } from 'lucide-react'
import type { CoachProfile, NotificationPreferences } from '@/lib/coach/types'
import { CoachPageHeader } from '@/components/coach/page-header'

type SettingsLayoutProps = {
  profile: CoachProfile
  notificationPreferences: NotificationPreferences
}

export function SettingsLayout({ profile, notificationPreferences }: SettingsLayoutProps) {
  return (
    <div className="space-y-8">
      <CoachPageHeader
        title="Ayarlar"
        description="Profil, website ve bildirim tercihlerinizi yönetin."
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="coach-tab-list">
          <TabsTrigger
            value="profile"
            className="coach-tab-trigger flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger
            value="website"
            className="coach-tab-trigger flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Website
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="coach-tab-trigger flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Bildirimler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab profile={profile} />
        </TabsContent>

        <TabsContent value="website">
          <WebsiteTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab initialPreferences={notificationPreferences} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
