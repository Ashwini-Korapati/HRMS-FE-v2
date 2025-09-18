import React from 'react'
import SmartChallangeAuthForm from '../components/Forms/SmartChallangeAuthForm'
import { setUser, ROLES } from '../auth/auth'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()

  const handleSubmit = ({ email, password }) => {
    // Fake success check
    if (email && password) {
      // Assign role heuristically (emails containing 'it' get IT role else SUPER_ADMIN)
      const role = /it/i.test(email) ? ROLES.IT : ROLES.SUPER_ADMIN
      setUser({ email, role })
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="w-full flex justify-center p-4">
      <SmartChallangeAuthForm onSubmit={handleSubmit} className="max-w-3xl w-full" />
    </div>
  )
}
