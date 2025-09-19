import React from 'react'
import { PageHeading, PlaceholderPanel } from './components'
import { Shield, Globe2, Bell } from 'lucide-react'

export default function UserProfileSettingsPage() {
  return (
    <div>
      <PageHeading title="Profile Settings" subtitle="Update preferences & localization" />
      <div className="grid md:grid-cols-2 gap-6">
        <PlaceholderPanel title="Localization">
          <div className="text-xs space-y-2">
            <p>Locale & timezone controls will appear here.</p>
            <p className="text-neutral-500 dark:text-neutral-400">Designed similar to onboarding form select inputs.</p>
          </div>
        </PlaceholderPanel>
        <PlaceholderPanel title="Notifications">
          <div className="text-xs space-y-2">
            <p>Notification channel toggles & digest frequency.</p>
            <p className="text-neutral-500 dark:text-neutral-400">UI to mirror segmented buttons & badges.</p>
          </div>
        </PlaceholderPanel>
        <PlaceholderPanel title="Access & Sessions">
          <div className="text-xs space-y-2">
            <p>Recent sessions and device trust list.</p>
            <p className="text-neutral-500 dark:text-neutral-400">Will incorporate pill indicators with status colors.</p>
          </div>
        </PlaceholderPanel>
      </div>
    </div>
  )
}
