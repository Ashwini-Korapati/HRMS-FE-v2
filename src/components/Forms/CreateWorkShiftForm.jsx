// import React, { useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { 
//   createWorkShift, 
//   selectWorkShiftCreating, 
//   selectWorkShiftCreateError,
//   clearErrors 
// } from '../../Redux/Public/WorkShiftsSlice'

// const CreateWorkShiftForm = ({ onSuccess, onCancel }) => {
//   const dispatch = useDispatch()
//   const creating = useSelector(selectWorkShiftCreating)
//   const createError = useSelector(selectWorkShiftCreateError)
  
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     defaultStart: '09:00',
//     defaultEnd: '18:00',
//     graceMinutes: 10,
//     breakMinutes: 60,
//     isDefault: false,
//     timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//     timings: Array.from({ length: 7 }, (_, i) => ({
//       dayOfWeek: i,
//       startTime: i < 5 ? '09:00' : i === 5 ? '09:00' : '',
//       endTime: i < 5 ? '18:00' : i === 5 ? '13:00' : '',
//       graceMinutes: 10,
//       breakMinutes: i < 5 ? 60 : 30,
//       isWorkingDay: i < 6 // Monday to Saturday working, Sunday off
//     }))
//   })

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     const result = await dispatch(createWorkShift(formData))
//     if (result.type === 'workShifts/create/fulfilled') {
//       if (onSuccess) onSuccess(result.payload)
//       // Reset form
//       setFormData({
//         name: '',
//         description: '',
//         defaultStart: '09:00',
//         defaultEnd: '18:00',
//         graceMinutes: 10,
//         breakMinutes: 60,
//         isDefault: false,
//         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//         timings: Array.from({ length: 7 }, (_, i) => ({
//           dayOfWeek: i,
//           startTime: i < 5 ? '09:00' : i === 5 ? '09:00' : '',
//           endTime: i < 5 ? '18:00' : i === 5 ? '13:00' : '',
//           graceMinutes: 10,
//           breakMinutes: i < 5 ? 60 : 30,
//           isWorkingDay: i < 6
//         }))
//       })
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
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Create Work Shift</h2>
//         <button
//           onClick={onCancel}
//           className="text-gray-500 hover:text-gray-700"
//         >
//           ✕
//         </button>
//       </div>

//       {createError && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
//           <p className="text-red-700 text-sm">{createError}</p>
//           <button
//             onClick={() => dispatch(clearErrors())}
//             className="text-red-600 hover:text-red-800 text-xs mt-1"
//           >
//             Dismiss
//           </button>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Basic Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Shift Name *
//             </label>
//             <input
//               type="text"
//               required
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="e.g., Regular Day Shift"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Time Zone
//             </label>
//             <select
//               value={formData.timeZone}
//               onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="Asia/Kolkata">Asia/Kolkata</option>
//               <option value="UTC">UTC</option>
//               <option value="America/New_York">America/New_York</option>
//               <option value="Europe/London">Europe/London</option>
//             </select>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Description
//           </label>
//           <textarea
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//             rows={3}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Describe the shift pattern..."
//           />
//         </div>

//         {/* Default Settings */}
//         <div className="border-t pt-4">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Default Settings</h3>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Start Time
//               </label>
//               <input
//                 type="time"
//                 value={formData.defaultStart}
//                 onChange={(e) => setFormData({ ...formData, defaultStart: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 End Time
//               </label>
//               <input
//                 type="time"
//                 value={formData.defaultEnd}
//                 onChange={(e) => setFormData({ ...formData, defaultEnd: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Grace Period (minutes)
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 max="60"
//                 value={formData.graceMinutes}
//                 onChange={(e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value) || 0 })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Break Time (minutes)
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 max="240"
//                 value={formData.breakMinutes}
//                 onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={applyToAllWeekdays}
//             className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
//           >
//             Apply to All Weekdays
//           </button>
//         </div>

//         {/* Daily Timings */}
//         <div className="border-t pt-4">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-medium text-gray-900">Daily Schedule</h3>
//             <div className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 id="isDefault"
//                 checked={formData.isDefault}
//                 onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
//                 className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//               />
//               <label htmlFor="isDefault" className="text-sm text-gray-700">
//                 Set as default shift
//               </label>
//             </div>
//           </div>

//           <div className="space-y-3">
//             {formData.timings.map((timing, index) => (
//               <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
//                 <div className="w-24">
//                   <label className="block text-sm font-medium text-gray-700">
//                     {dayNames[timing.dayOfWeek]}
//                   </label>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     checked={timing.isWorkingDay}
//                     onChange={(e) => handleTimingChange(index, 'isWorkingDay', e.target.checked)}
//                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
//                   <span className="text-sm text-gray-600">Working Day</span>
//                 </div>

//                 {timing.isWorkingDay && (
//                   <>
//                     <input
//                       type="time"
//                       value={timing.startTime}
//                       onChange={(e) => handleTimingChange(index, 'startTime', e.target.value)}
//                       className="px-2 py-1 border border-gray-300 rounded text-sm"
//                     />
//                     <span className="text-gray-500">to</span>
//                     <input
//                       type="time"
//                       value={timing.endTime}
//                       onChange={(e) => handleTimingChange(index, 'endTime', e.target.value)}
//                       className="px-2 py-1 border border-gray-300 rounded text-sm"
//                     />
//                     <input
//                       type="number"
//                       min="0"
//                       max="60"
//                       value={timing.graceMinutes}
//                       onChange={(e) => handleTimingChange(index, 'graceMinutes', parseInt(e.target.value) || 0)}
//                       className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
//                       placeholder="Grace"
//                     />
//                     <input
//                       type="number"
//                       min="0"
//                       max="240"
//                       value={timing.breakMinutes}
//                       onChange={(e) => handleTimingChange(index, 'breakMinutes', parseInt(e.target.value) || 0)}
//                       className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
//                       placeholder="Break"
//                     />
//                   </>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Form Actions */}
//         <div className="flex justify-end space-x-3 pt-4 border-t">
//           <button
//             type="button"
//             onClick={onCancel}
//             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={creating === 'loading'}
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {creating === 'loading' ? 'Creating...' : 'Create Work Shift'}
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default CreateWorkShiftForm



import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  createWorkShift, 
  selectWorkShiftCreating, 
  selectWorkShiftCreateError,
  clearErrors 
} from '../../Redux/Public/WorkShiftsSlice'

const CreateWorkShiftForm = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch()
  const creating = useSelector(selectWorkShiftCreating)
  const createError = useSelector(selectWorkShiftCreateError)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultStart: '09:00',
    defaultEnd: '18:00',
    graceMinutes: 10,
    breakMinutes: 60,
    isDefault: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timings: Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: i < 5 ? '09:00' : i === 5 ? '09:00' : '',
      endTime: i < 5 ? '18:00' : i === 5 ? '13:00' : '',
      graceMinutes: 10,
      breakMinutes: i < 5 ? 60 : 30,
      isWorkingDay: i < 6 // Monday to Saturday working, Sunday off
    }))
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const result = await dispatch(createWorkShift(formData))
    
    if (result.type === 'workShifts/create/fulfilled') {
      if (onSuccess) onSuccess(result.payload)
      // Reset form with animation
      setTimeout(() => {
        setFormData({
          name: '',
          description: '',
          defaultStart: '09:00',
          defaultEnd: '18:00',
          graceMinutes: 10,
          breakMinutes: 60,
          isDefault: false,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timings: Array.from({ length: 7 }, (_, i) => ({
            dayOfWeek: i,
            startTime: i < 5 ? '09:00' : i === 5 ? '09:00' : '',
            endTime: i < 5 ? '18:00' : i === 5 ? '13:00' : '',
            graceMinutes: 10,
            breakMinutes: i < 5 ? 60 : 30,
            isWorkingDay: i < 6
          }))
        })
        setIsSubmitting(false)
      }, 500)
    } else {
      setIsSubmitting(false)
    }
  }

  const handleTimingChange = (index, field, value) => {
    const newTimings = [...formData.timings]
    newTimings[index] = { ...newTimings[index], [field]: value }
    setFormData({ ...formData, timings: newTimings })
  }

  const applyToAllWeekdays = () => {
    const newTimings = formData.timings.map((timing, index) => {
      if (index < 5) { // Monday to Friday
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

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-2xl border border-orange-100">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#CA3500] to-[#FF6900] rounded-t-2xl -mx-6 -mt-6 p-6 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Create Work Shift</h2>
            <p className="text-orange-100 mt-1">Define your team's working schedule</p>
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {createError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#CA3500] rounded-lg animate-shake">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-[#CA3500] mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 font-medium">{createError}</p>
          </div>
          <button
            onClick={() => dispatch(clearErrors())}
            className="text-[#CA3500] hover:text-[#FF6900] text-sm mt-2 font-medium transition-colors duration-200"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="transform transition-all duration-300 hover:translate-x-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-[#FF6900] rounded-full mr-2"></span>
                Shift Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6900] focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white"
                placeholder="e.g., Regular Day Shift"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-[#FF6900] rounded-full mr-2"></span>
                Time Zone
              </label>
              <select
                value={formData.timeZone}
                onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6900] focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white appearance-none cursor-pointer"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-[#FF6900] rounded-full mr-2"></span>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6900] focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white resize-none"
              placeholder="Describe the shift pattern..."
            />
          </div>
        </div>

        {/* Default Settings */}
        <div className="border-t border-gray-100 pt-6 transform transition-all duration-300 hover:translate-x-2">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-[#CA3500] to-[#FF6900] rounded-full mr-3"></div>
            <h3 className="text-lg font-bold text-gray-900">Default Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Start Time", value: formData.defaultStart, onChange: (e) => setFormData({ ...formData, defaultStart: e.target.value }), type: "time" },
              { label: "End Time", value: formData.defaultEnd, onChange: (e) => setFormData({ ...formData, defaultEnd: e.target.value }), type: "time" },
              { label: "Grace Period (minutes)", value: formData.graceMinutes, onChange: (e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value) || 0 }), type: "number", min: 0, max: 60 },
              { label: "Break Time (minutes)", value: formData.breakMinutes, onChange: (e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 }), type: "number", min: 0, max: 240 }
            ].map((field, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  min={field.min}
                  max={field.max}
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6900] transition-all duration-200 bg-white"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={applyToAllWeekdays}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#FF6900] to-[#CA3500] text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium text-sm"
          >
            Apply to All Weekdays
          </button>
        </div>

        {/* Daily Timings */}
        <div className="border-t border-gray-100 pt-6 transform transition-all duration-300 hover:translate-x-2">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-[#CA3500] to-[#FF6900] rounded-full mr-3"></div>
              <h3 className="text-lg font-bold text-gray-900">Daily Schedule</h3>
            </div>
            <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300 text-[#CA3500] focus:ring-[#CA3500] transform scale-110 transition-all duration-200"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                Set as default shift
              </label>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {formData.timings.map((timing, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                  timing.isWorkingDay 
                    ? 'bg-gradient-to-r from-orange-50 to-white border-orange-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="w-28">
                  <label className={`block text-sm font-semibold ${
                    timing.isWorkingDay ? 'text-[#CA3500]' : 'text-gray-500'
                  }`}>
                    {dayNames[timing.dayOfWeek]}
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={timing.isWorkingDay}
                      onChange={(e) => handleTimingChange(index, 'isWorkingDay', e.target.checked)}
                      className="sr-only"
                    />
                    <div 
                      className={`w-12 h-6 rounded-full transition-all duration-300 ${
                        timing.isWorkingDay ? 'bg-[#FF6900]' : 'bg-gray-300'
                      }`}
                      onClick={() => handleTimingChange(index, 'isWorkingDay', !timing.isWorkingDay)}
                    >
                      <div 
                        className={`bg-white w-5 h-5 rounded-full transform transition-all duration-300 ${
                          timing.isWorkingDay ? 'translate-x-7' : 'translate-x-1'
                        } mt-0.5 shadow-md`}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Working Day</span>
                </div>

                {timing.isWorkingDay && (
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                      type="time"
                      value={timing.startTime}
                      onChange={(e) => handleTimingChange(index, 'startTime', e.target.value)}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#FF6900] transition-all duration-200 bg-white text-sm"
                    />
                    <span className="text-gray-500 font-medium">to</span>
                    <input
                      type="time"
                      value={timing.endTime}
                      onChange={(e) => handleTimingChange(index, 'endTime', e.target.value)}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#FF6900] transition-all duration-200 bg-white text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={timing.graceMinutes}
                      onChange={(e) => handleTimingChange(index, 'graceMinutes', parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#FF6900] transition-all duration-200 bg-white text-sm"
                      placeholder="Grace mins"
                    />
                    <input
                      type="number"
                      min="0"
                      max="240"
                      value={timing.breakMinutes}
                      onChange={(e) => handleTimingChange(index, 'breakMinutes', parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#FF6900] transition-all duration-200 bg-white text-sm"
                      placeholder="Break mins"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating === 'loading' || isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-[#CA3500] to-[#FF6900] text-white rounded-xl hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 font-bold relative overflow-hidden group"
          >
            <span className="relative z-10">
              {creating === 'loading' || isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Work Shift'
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6900] to-[#CA3500] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        </div>
      </form>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #FF6900, #CA3500);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #CA3500, #FF6900);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default CreateWorkShiftForm