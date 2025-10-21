// import React, { useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { 
//   updateWorkShift, 
//   selectWorkShiftUpdating, 
//   selectWorkShiftUpdateError,
//   clearErrors 
// } from '../../Redux/Public/WorkShiftsSlice'

// const EditWorkShiftForm = ({ shift, onSuccess, onCancel }) => {
//   const dispatch = useDispatch()
//   const updating = useSelector(selectWorkShiftUpdating)
//   const updateError = useSelector(selectWorkShiftUpdateError)
  
//   const [formData, setFormData] = useState({
//     name: shift.name || '',
//     description: shift.description || '',
//     defaultStart: shift.defaultStart || '09:00',
//     defaultEnd: shift.defaultEnd || '18:00',
//     graceMinutes: shift.graceMinutes || 10,
//     breakMinutes: shift.breakMinutes || 60,
//     isDefault: shift.isDefault || false,
//     timeZone: shift.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
//     timings: shift.timings || Array.from({ length: 7 }, (_, i) => ({
//       dayOfWeek: i,
//       startTime: i < 5 ? '09:00' : i === 5 ? '09:00' : '',
//       endTime: i < 5 ? '18:00' : i === 5 ? '13:00' : '',
//       graceMinutes: 10,
//       breakMinutes: i < 5 ? 60 : 30,
//       isWorkingDay: i < 6
//     }))
//   })

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     const result = await dispatch(updateWorkShift({ 
//       shiftId: shift.id, 
//       payload: formData 
//     }))
//     if (result.type === 'workShifts/updateOne/fulfilled') {
//       if (onSuccess) onSuccess()
//     }
//   }

//   const handleTimingChange = (index, field, value) => {
//     const newTimings = [...formData.timings]
//     newTimings[index] = { ...newTimings[index], [field]: value }
//     setFormData({ ...formData, timings: newTimings })
//   }

//   const applyToAllWeekdays = () => {
//     const newTimings = formData.timings.map((timing, index) => {
//       if (index < 5) { // Monday to Friday
//         return {
//           ...timing,
//           startTime: formData.defaultStart,
//           endTime: formData.defaultEnd,
//           graceMinutes: formData.graceMinutes,
//           breakMinutes: formData.breakMinutes,
//           isWorkingDay: true
//         }
//       }
//       return timing
//     })
//     setFormData({ ...formData, timings: newTimings })
//   }

//   const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-100 animate-in slide-in-from-top duration-300">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Edit Work Shift</h2>
//           <p className="text-gray-600 text-sm mt-1">Update shift details and schedule</p>
//         </div>
//         <button
//           onClick={onCancel}
//           className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
//         >
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>
//       </div>

//       {updateError && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in duration-300">
//           <div className="flex items-center">
//             <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//             </svg>
//             <p className="text-red-700 text-sm flex-1">{updateError}</p>
//             <button
//               onClick={() => dispatch(clearErrors())}
//               className="text-red-600 hover:text-red-800 text-sm"
//             >
//               Dismiss
//             </button>
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Basic Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Shift Name *
//             </label>
//             <input
//               type="text"
//               required
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//               placeholder="e.g., Regular Day Shift"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Time Zone
//             </label>
//             <select
//               value={formData.timeZone}
//               onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//             >
//               <option value="Asia/Kolkata">Asia/Kolkata</option>
//               <option value="UTC">UTC</option>
//               <option value="America/New_York">America/New_York</option>
//               <option value="Europe/London">Europe/London</option>
//             </select>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Description
//           </label>
//           <textarea
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//             rows={3}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//             placeholder="Describe the shift pattern..."
//           />
//         </div>

//         {/* Default Settings */}
//         <div className="border-t pt-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Settings</h3>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Start Time
//               </label>
//               <input
//                 type="time"
//                 value={formData.defaultStart}
//                 onChange={(e) => setFormData({ ...formData, defaultStart: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 End Time
//               </label>
//               <input
//                 type="time"
//                 value={formData.defaultEnd}
//                 onChange={(e) => setFormData({ ...formData, defaultEnd: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Grace Period (minutes)
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 max="60"
//                 value={formData.graceMinutes}
//                 onChange={(e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value) || 0 })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Break Time (minutes)
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 max="240"
//                 value={formData.breakMinutes}
//                 onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={applyToAllWeekdays}
//             className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
//           >
//             Apply to All Weekdays
//           </button>
//         </div>

//         {/* Daily Timings */}
//         <div className="border-t pt-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-900">Daily Schedule</h3>
//             <div className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 id="isDefault"
//                 checked={formData.isDefault}
//                 onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
//                 className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//               />
//               <label htmlFor="isDefault" className="text-sm text-gray-700 font-medium">
//                 Set as default shift
//               </label>
//             </div>
//           </div>

//           <div className="space-y-3">
//             {formData.timings.map((timing, index) => (
//               <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                 <div className="w-28">
//                   <label className="block text-sm font-medium text-gray-700">
//                     {dayNames[timing.dayOfWeek]}
//                   </label>
//                 </div>

//                 <div className="flex items-center space-x-3">
//                   <input
//                     type="checkbox"
//                     checked={timing.isWorkingDay}
//                     onChange={(e) => handleTimingChange(index, 'isWorkingDay', e.target.checked)}
//                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
//                   <span className="text-sm text-gray-600 font-medium">Working Day</span>
//                 </div>

//                 {timing.isWorkingDay && (
//                   <div className="flex items-center space-x-3 flex-1">
//                     <input
//                       type="time"
//                       value={timing.startTime}
//                       onChange={(e) => handleTimingChange(index, 'startTime', e.target.value)}
//                       className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                     />
//                     <span className="text-gray-500 text-sm">to</span>
//                     <input
//                       type="time"
//                       value={timing.endTime}
//                       onChange={(e) => handleTimingChange(index, 'endTime', e.target.value)}
//                       className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                     />
//                     <input
//                       type="number"
//                       min="0"
//                       max="60"
//                       value={timing.graceMinutes}
//                       onChange={(e) => handleTimingChange(index, 'graceMinutes', parseInt(e.target.value) || 0)}
//                       className="w-20 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       placeholder="Grace"
//                     />
//                     <input
//                       type="number"
//                       min="0"
//                       max="240"
//                       value={timing.breakMinutes}
//                       onChange={(e) => handleTimingChange(index, 'breakMinutes', parseInt(e.target.value) || 0)}
//                       className="w-20 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       placeholder="Break"
//                     />
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Form Actions */}
//         <div className="flex justify-end space-x-3 pt-6 border-t">
//           <button
//             type="button"
//             onClick={onCancel}
//             className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={updating === 'loading'}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center space-x-2"
//           >
//             {updating === 'loading' ? (
//               <>
//                 <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 <span>Updating...</span>
//               </>
//             ) : (
//               'Update Work Shift'
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default EditWorkShiftForm


import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  updateWorkShift, 
  selectWorkShiftUpdating, 
  selectWorkShiftUpdateError,
  clearErrors 
} from '../../Redux/Public/WorkShiftsSlice'

const EditWorkShiftForm = ({ shift, onSuccess, onCancel }) => {
  const dispatch = useDispatch()
  const updating = useSelector(selectWorkShiftUpdating)
  const updateError = useSelector(selectWorkShiftUpdateError)
  
  const [formData, setFormData] = useState({
    name: shift.name || '',
    description: shift.description || '',
    defaultStart: shift.defaultStart || '09:00',
    defaultEnd: shift.defaultEnd || '18:00',
    graceMinutes: shift.graceMinutes || 10,
    breakMinutes: shift.breakMinutes || 60,
    isDefault: shift.isDefault || false,
    timeZone: shift.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    timings: shift.timings || Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: i < 5 ? '09:00' : i === 5 ? '09:00' : '',
      endTime: i < 5 ? '18:00' : i === 5 ? '13:00' : '',
      graceMinutes: 10,
      breakMinutes: i < 5 ? 60 : 30,
      isWorkingDay: i < 6
    }))
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await dispatch(updateWorkShift({ 
      shiftId: shift.id, 
      payload: formData 
    }))
    setIsSubmitting(false)
    if (result.type === 'workShifts/updateOne/fulfilled') {
      if (onSuccess) onSuccess()
    }
  }

  const handleTimingChange = (index, field, value) => {
    const newTimings = [...formData.timings]
    newTimings[index] = { ...newTimings[index], [field]: value }
    setFormData({ ...formData, timings: newTimings })
  }

  const applyToAllWeekdays = () => {
    const newTimings = formData.timings.map((timing, index) => {
      if (index < 5) {
        return {
          ...timing,
          startTime: formData.defaultStart,
          endTime: formData.defaultEnd,
          graceMinutes: formData.graceMinutes,
          breakMinutes: formData.breakMinutes,
          isWorkingDay: true
        }
      }
      return timing
    })
    setFormData({ ...formData, timings: newTimings })
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-xl shadow-lg border border-orange-100 animate-in slide-in-from-top duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#CA3500] to-[#FF6900] rounded-t-xl -mx-4 -mt-4 p-4 mb-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Edit Work Shift</h2>
            <p className="text-orange-100 text-xs mt-0.5">Update shift details</p>
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:bg-white/20 p-1 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {updateError && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-[#CA3500] rounded-lg animate-shake">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-[#CA3500] mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm font-medium flex-1">{updateError}</p>
            <button
              onClick={() => dispatch(clearErrors())}
              className="text-[#CA3500] hover:text-[#FF6900] text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="transform transition-all duration-300 hover:translate-x-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-[#FF6900] rounded-full mr-1.5"></span>
                Shift Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6900] focus:ring-1 focus:ring-orange-100 transition-all duration-200 bg-white text-sm"
                placeholder="e.g., Regular Day Shift"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-[#FF6900] rounded-full mr-1.5"></span>
                Time Zone
              </label>
              <select
                value={formData.timeZone}
                onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6900] focus:ring-1 focus:ring-orange-100 transition-all duration-200 bg-white text-sm appearance-none cursor-pointer"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
              <span className="w-1.5 h-1.5 bg-[#FF6900] rounded-full mr-1.5"></span>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6900] focus:ring-1 focus:ring-orange-100 transition-all duration-200 bg-white text-sm resize-none"
              placeholder="Describe the shift pattern..."
            />
          </div>
        </div>

        {/* Default Settings */}
        <div className="border-t border-gray-100 pt-3 transform transition-all duration-300 hover:translate-x-1">
          <div className="flex items-center mb-3">
            <div className="w-1 h-6 bg-gradient-to-b from-[#CA3500] to-[#FF6900] rounded-full mr-2"></div>
            <h3 className="text-sm font-bold text-gray-900">Default Settings</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Start Time", value: formData.defaultStart, onChange: (e) => setFormData({ ...formData, defaultStart: e.target.value }), type: "time" },
              { label: "End Time", value: formData.defaultEnd, onChange: (e) => setFormData({ ...formData, defaultEnd: e.target.value }), type: "time" },
              { label: "Grace (min)", value: formData.graceMinutes, onChange: (e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value) || 0 }), type: "number", min: 0, max: 60 },
              { label: "Break (min)", value: formData.breakMinutes, onChange: (e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 }), type: "number", min: 0, max: 240 }
            ].map((field, index) => (
              <div key={index} className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  min={field.min}
                  max={field.max}
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6900] transition-all duration-200 bg-white text-sm"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={applyToAllWeekdays}
            className="mt-2 px-3 py-1.5 bg-gradient-to-r from-[#FF6900] to-[#CA3500] text-white rounded-lg hover:shadow transform hover:scale-105 transition-all duration-200 text-xs font-medium"
          >
            Apply to Weekdays
          </button>
        </div>

        {/* Daily Timings */}
        <div className="border-t border-gray-100 pt-3 transform transition-all duration-300 hover:translate-x-1">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-[#CA3500] to-[#FF6900] rounded-full mr-2"></div>
              <h3 className="text-sm font-bold text-gray-900">Daily Schedule</h3>
            </div>
            <div className="flex items-center space-x-1 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300 text-[#CA3500] focus:ring-[#CA3500] transform scale-110 transition-all duration-200"
              />
              <label htmlFor="isDefault" className="text-xs font-medium text-gray-700">
                Default shift
              </label>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {formData.timings.map((timing, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-2 p-2 rounded-lg border transition-all duration-300 transform hover:scale-[1.02] ${
                  timing.isWorkingDay 
                    ? 'bg-gradient-to-r from-orange-50 to-white border-orange-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="w-14">
                  <label className={`block text-xs font-semibold ${
                    timing.isWorkingDay ? 'text-[#CA3500]' : 'text-gray-500'
                  }`}>
                    {dayNames[timing.dayOfWeek]}
                  </label>
                </div>

                <div className="flex items-center space-x-1">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={timing.isWorkingDay}
                      onChange={(e) => handleTimingChange(index, 'isWorkingDay', e.target.checked)}
                      className="sr-only"
                    />
                    <div 
                      className={`w-8 h-4 rounded-full transition-all duration-300 ${
                        timing.isWorkingDay ? 'bg-[#FF6900]' : 'bg-gray-300'
                      }`}
                      onClick={() => handleTimingChange(index, 'isWorkingDay', !timing.isWorkingDay)}
                    >
                      <div 
                        className={`bg-white w-3 h-3 rounded-full transform transition-all duration-300 ${
                          timing.isWorkingDay ? 'translate-x-4' : 'translate-x-0.5'
                        } mt-0.5 shadow-sm`}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Work</span>
                </div>

                {timing.isWorkingDay && (
                  <div className="flex items-center space-x-1 flex-1">
                    <input
                      type="time"
                      value={timing.startTime}
                      onChange={(e) => handleTimingChange(index, 'startTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:border-[#FF6900] transition-all duration-200 bg-white text-xs w-20"
                    />
                    <span className="text-gray-500 text-xs">to</span>
                    <input
                      type="time"
                      value={timing.endTime}
                      onChange={(e) => handleTimingChange(index, 'endTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:border-[#FF6900] transition-all duration-200 bg-white text-xs w-20"
                    />
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={timing.graceMinutes}
                      onChange={(e) => handleTimingChange(index, 'graceMinutes', parseInt(e.target.value) || 0)}
                      className="w-16 px-1 py-1 border border-gray-300 rounded focus:border-[#FF6900] transition-all duration-200 bg-white text-xs"
                      placeholder="Grace"
                    />
                    <input
                      type="number"
                      min="0"
                      max="240"
                      value={timing.breakMinutes}
                      onChange={(e) => handleTimingChange(index, 'breakMinutes', parseInt(e.target.value) || 0)}
                      className="w-16 px-1 py-1 border border-gray-300 rounded focus:border-[#FF6900] transition-all duration-200 bg-white text-xs"
                      placeholder="Break"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updating === 'loading' || isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-[#CA3500] to-[#FF6900] text-white rounded-lg hover:shadow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 text-sm font-bold relative overflow-hidden group"
          >
            
            <span className="relative z-10">
              {updating === 'loading' || isSubmitting ? (
                <span className="flex items-center space-x-1">
                  <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </span>
              ) : (
                'Update Shift'
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6900] to-[#CA3500] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        </div>
      </form>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #FF6900, #CA3500);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #CA3500, #FF6900);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default EditWorkShiftForm