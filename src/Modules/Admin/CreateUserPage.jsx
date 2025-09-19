import React, { useCallback } from 'react'
import SmartEmployeeOnboardingForm from '../../components/Forms/SmartEmployeeOnboardingForm'

export default function CreateUserPage() {
  const handleSubmit = useCallback((formData) => {
    // TODO: Replace with real API integration (e.g., dispatch thunk to create user)
    console.log('[CreateUserPage] Submit employee onboarding form payload:', formData)
  }, [])

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg font-semibold mb-4 bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Create User</h1>
      <SmartEmployeeOnboardingForm onSubmit={handleSubmit} />
    </div>
  )
}
