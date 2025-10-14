import React, { useCallback, useEffect, useMemo } from 'react'
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
    if (status === 'succeeded' && onboardedEmployee) {
      alert(`User ${onboardedEmployee.firstName} created successfully!`)
      dispatch(clearOnboardingState())
    } else if (status === 'failed' && error) {
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

  // Memoize the wrapper style to prevent re-creation on every render
  const wrapperStyle = useMemo(() => ({
    pointerEvents: status === 'loading' ? 'none' : 'auto',
    opacity: status === 'loading' ? 0.5 : 1
  }), [status])

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg font-semibold mb-4 bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Create User</h1>
      {status === 'loading' && <div className="text-center">Creating user...</div>}
      <div style={wrapperStyle}>
        <SmartEmployeeOnboardingForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
