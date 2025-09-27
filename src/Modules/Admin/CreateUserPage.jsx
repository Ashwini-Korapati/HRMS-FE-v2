import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SmartEmployeeOnboardingForm from '../../components/Forms/SmartEmployeeOnboardingForm'
import { onboardEmployee, selectOnboardingStatus, selectOnboardingError, selectOnboardedEmployee, clearOnboardingState } from '../../Redux/Public/onboardinguserSlice'

export default function CreateUserPage() {
  const dispatch = useDispatch()
  const status = useSelector(selectOnboardingStatus)
  const error = useSelector(selectOnboardingError)
  const onboardedEmployee = useSelector(selectOnboardedEmployee)

  const handleSubmit = useCallback((formData) => {
    dispatch(onboardEmployee(formData))
  }, [dispatch])

  useEffect(() => {
    if (status === 'succeeded') {
      alert(`User ${onboardedEmployee.firstName} created successfully!`)
      dispatch(clearOnboardingState())
    } else if (status === 'failed') {
      alert(`Error creating user: ${error}`)
      dispatch(clearOnboardingState())
    }
  }, [status, onboardedEmployee, error, dispatch])

  // Clear state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearOnboardingState())
    }
  }, [dispatch])

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg font-semibold mb-4 bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Create User</h1>
      {status === 'loading' && <div className="text-center">Creating user...</div>}
      <div style={{ pointerEvents: status === 'loading' ? 'none' : 'auto', opacity: status === 'loading' ? 0.5 : 1 }}>
        <SmartEmployeeOnboardingForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
