import React from 'react'
import { PageHeading, PlaceholderPanel } from './components'

export default function UserProfilePage() {
  return (
    <div>
      <PageHeading title="My Profile" subtitle="Personal details and settings" />
      <div className="grid md:grid-cols-2 gap-6">
        <PlaceholderPanel title="Basic Info">Profile form placeholder.</PlaceholderPanel>
        <PlaceholderPanel title="Preferences">Preferences form placeholder.</PlaceholderPanel>
      </div>
    </div>
  )
}
