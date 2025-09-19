import React from 'react'
import { PageHeading, PlaceholderPanel } from './components'

export default function UserLeaveApplyPage() {
  return (
    <div>
      <PageHeading title="Apply Leave" subtitle="Submit a new leave request" />
      <PlaceholderPanel title="Leave Application Form">
        <div className="text-xs space-y-2">
          <p>Form fields (type, dates, reason) will be implemented using the input styling from onboarding.</p>
          <p className="text-neutral-500 dark:text-neutral-400">Future enhancement: dynamic balance validation & overlap detection.</p>
        </div>
      </PlaceholderPanel>
    </div>
  )
}
