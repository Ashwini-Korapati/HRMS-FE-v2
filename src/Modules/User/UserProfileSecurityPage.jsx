import React from 'react'
import { PageHeading, PlaceholderPanel } from './components'
import { Lock, Key, Fingerprint } from 'lucide-react'

export default function UserProfileSecurityPage() {
  return (
    <div>
      <PageHeading title="Security Center" subtitle="Manage credentials & protections" />
      <div className="grid md:grid-cols-2 gap-6">
        <PlaceholderPanel title="Password & MFA">
          <div className="text-xs space-y-2">
            <p>Form for changing password and enabling multi-factor auth.</p>
            <p className="text-neutral-500 dark:text-neutral-400">Patterns from multi-step form (buttons with states).</p>
          </div>
        </PlaceholderPanel>
        <PlaceholderPanel title="API / Personal Tokens">
          <div className="text-xs space-y-2">
            <p>Token list with revoke buttons & creation wizard.</p>
            <p className="text-neutral-500 dark:text-neutral-400">Will reuse badge + subtle panel styling.</p>
          </div>
        </PlaceholderPanel>
        <PlaceholderPanel title="Device Trust & Keys">
          <div className="text-xs space-y-2">
            <p>Public keys / devices with last seen timestamps.</p>
            <p className="text-neutral-500 dark:text-neutral-400">Future: table with status chips.</p>
          </div>
        </PlaceholderPanel>
      </div>
    </div>
  )
}
