// import React, { useEffect, useState, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { RefreshCw, Plus, Search } from "lucide-react";
// import {
//   fetchWorkShifts,
//   deleteWorkShift,
//   selectWorkShifts,
//   selectWorkShiftsListLoading,
//   selectWorkShiftsListError,
//   selectWorkShiftDeleting,
//   selectWorkShiftSuccessMessage,
//   clearErrors,
//   clearSuccessMessage,
// } from "../../Redux/Public/WorkShiftsSlice";
// import CreateWorkShiftForm from "../../components/Forms/CreateWorkShiftForm";
// import EditWorkShiftForm from "../../components/Forms/EditWorkShiftForm";
// import {
//   fetchAttendance,
//   selectAttendanceItems,
// } from "../../Redux/Public/attendanceSlice";
 
// export default function WorkShiftsPage() {
//   const dispatch = useDispatch();
//   const companyId = useSelector((s) => s.auth?.company?.id);
//   const items = useSelector(selectAttendanceItems);
//   const shifts = useSelector(selectWorkShifts);
//   const loading = useSelector(selectWorkShiftsListLoading);
//   const error = useSelector(selectWorkShiftsListError);
//   const deleting = useSelector(selectWorkShiftDeleting);
//   const successMessage = useSelector(selectWorkShiftSuccessMessage);
//   const [query, setQuery] = useState("");
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [editingShift, setEditingShift] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);
//   const [showSuccess, setShowSuccess] = useState(false);
 
//   useEffect(() => {
//     if (companyId) dispatch(fetchAttendance({ companyId }));
//     dispatch(fetchWorkShifts());
//   }, [dispatch, companyId]);
 
//   const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");
//   const fmtTime = (v) =>
//     v
//       ? new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//       : "—";
 
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return items;
//     return items.filter(
//       (r) =>
//         (r.userId || "").toLowerCase().includes(q) ||
//         (r.status || "").toLowerCase().includes(q) ||
//         (r.ipAddress || "").toLowerCase().includes(q)
//     );
//   }, [items, query]);
 
//   useEffect(() => {
//     if (successMessage) {
//       setShowSuccess(true);
//       const t = setTimeout(() => {
//         setShowSuccess(false);
//         dispatch(clearSuccessMessage());
//       }, 4000);
//       return () => clearTimeout(t);
//     }
//   }, [successMessage, dispatch]);
 
//   useEffect(() => {
//     if (error) {
//       const t = setTimeout(() => dispatch(clearErrors()), 5000);
//       return () => clearTimeout(t);
//     }
//   }, [error, dispatch]);
 
//   const handleDelete = async (shiftId) => {
//     if (window.confirm("Delete this work shift?")) {
//       setDeletingId(shiftId);
//       await dispatch(deleteWorkShift(shiftId));
//       setDeletingId(null);
//     }
//   };
 
//   const handleEdit = (shift) => setEditingShift(shift);
//   const handleCloseForm = () => {
//     setShowCreateForm(false);
//     setEditingShift(null);
//   };
 
//   return (
//     <div className="min-h-screen  p-6">
//       <div className="max-w-7xl mx-auto space-y-10">
//         {/* ============== ATTENDANCE TABLE ============== */}
//         <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
//           <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
//             <div>
//               <h1 className="text-xl font-semibold text-gray-900">Attendance</h1>
//               <p className="text-sm text-gray-600">
//                 Overview of employee daily check-ins and check-outs
//               </p>
//             </div>
//             <div className="flex items-center gap-3 mt-4 sm:mt-0">
//               <div className="relative">
//                 <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
//                 <input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Search user, status, IP..."
//                   className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm text-gray-900 bg-white shadow-sm"
//                 />
//               </div>
//               <button
//                 onClick={() => companyId && dispatch(fetchAttendance({ companyId }))}
//                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white font-medium rounded-lg shadow hover:scale-105 transition-all duration-200"
//               >
//                 <RefreshCw className="w-4 h-4" /> Refresh
//               </button>
//             </div>
//           </div>
 
//           <div className="overflow-auto rounded-xl border border-gray-200">
//             <table className="min-w-full text-sm text-gray-900">
//               <thead className="bg-gray-100 text-gray-800">
//                 <tr>
//                   {[
//                     "Date",
//                     "User",
//                     "Check In",
//                     "Check Out",
//                     "Break",
//                     "Total",
//                     "Status",
//                     "IP",
//                     "Device",
//                     "Manual",
//                     "Updated",
//                   ].map((head) => (
//                     <th key={head} className="px-3 py-3 text-left font-semibold">
//                       {head}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((r) => (
//                   <tr
//                     key={r.id}
//                     className="border-t border-gray-100 hover:bg-orange-50 transition"
//                   >
//                     <td className="px-3 py-2">{fmtDate(r.date)}</td>
//                     <td className="px-3 py-2 font-mono text-xs">{r.userId?.slice(0, 8)}</td>
//                     <td className="px-3 py-2">{fmtTime(r.checkInTime)}</td>
//                     <td className="px-3 py-2">{fmtTime(r.checkOutTime)}</td>
//                     <td className="px-3 py-2">{r.breakTime ?? "—"}</td>
//                     <td className="px-3 py-2">{r.totalHours ?? "—"}</td>
//                     <td className="px-3 py-2">
//                       <span
//                         className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
//                           r.status === "LATE"
//                             ? "bg-orange-200 text-orange-800"
//                             : r.status === "ONTIME"
//                             ? "bg-green-200 text-green-800"
//                             : "bg-gray-100 text-gray-700"
//                         }`}
//                       >
//                         {r.status || "—"}
//                       </span>
//                     </td>
//                     <td className="px-3 py-2">{r.ipAddress || "—"}</td>
//                     <td
//                       className="px-3 py-2 truncate max-w-[140px]"
//                       title={r.device || ""}
//                     >
//                       {r.device || "—"}
//                     </td>
//                     <td className="px-3 py-2">{r.isManual ? "Yes" : "No"}</td>
//                     <td className="px-3 py-2">{fmtTime(r.updatedAt)}</td>
//                   </tr>
//                 ))}
//                 {filtered.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan={11}
//                       className="text-center py-6 text-gray-500 font-medium"
//                     >
//                       No attendance records found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
 
//         {/* ============== WORK SHIFTS CARDS ============== */}
//         <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
//           <div className="flex justify-between items-center mb-5">
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900">Work Shifts</h2>
//               <p className="text-sm text-gray-600">
//                 Manage employee work shift schedules
//               </p>
//             </div>
//             <button
//               onClick={() => setShowCreateForm(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white rounded-lg hover:shadow-md transition-all hover:scale-105 font-medium"
//             >
//               <Plus className="w-4 h-4" /> Create Shift
//             </button>
//           </div>
 
//           {showSuccess && successMessage && (
//             <div className="p-3 mb-4 rounded-lg bg-green-100 border border-green-300 text-green-800 text-sm font-medium">
//               ✅ {successMessage}
//             </div>
//           )}
//           {error && (
//             <div className="p-3 mb-4 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm font-medium">
//               ❌ {error}
//             </div>
//           )}
 
//           {showCreateForm && (
//             <CreateWorkShiftForm onSuccess={handleCloseForm} onCancel={handleCloseForm} />
//           )}
//           {editingShift && (
//             <EditWorkShiftForm
//               shift={editingShift}
//               onSuccess={handleCloseForm}
//               onCancel={handleCloseForm}
//             />
//           )}
 
//           {!showCreateForm && !editingShift && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//               {shifts.map((shift) => (
//                 <div
//                   key={shift.id}
//                   className="bg-gradient-to-br from-orange-50 via-white to-orange-100 border border-gray-200 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition-transform duration-200 p-5"
//                 >
//                   <div className="flex justify-between items-start mb-2">
//                     <h3 className="font-semibold text-gray-900 text-sm flex items-center">
//                       {shift.name}
//                       {shift.isDefault && (
//                         <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
//                           Default
//                         </span>
//                       )}
//                     </h3>
//                     <div className="text-xs text-gray-500">{shift.timeZone}</div>
//                   </div>
//                   <p className="text-xs text-gray-600 mb-3">{shift.description}</p>
 
//                   <div className="grid grid-cols-2 gap-2 text-xs text-gray-800">
//                     <div className="flex justify-between">
//                       <span>Time</span>
//                       <span className="font-medium">
//                         {shift.defaultStart} - {shift.defaultEnd}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Grace</span>
//                       <span className="font-medium">{shift.graceMinutes}m</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Break</span>
//                       <span className="font-medium">{shift.breakMinutes}m</span>
//                     </div>
//                   </div>
 
//                   <div className="mt-4 flex justify-between items-center pt-2 border-t border-gray-100">
//                     <button
//                       onClick={() => handleEdit(shift)}
//                       className="text-orange-700 hover:text-orange-900 text-xs font-medium"
//                     >
//                       ✏️ Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(shift.id)}
//                       disabled={deleting === "loading" && deletingId === shift.id}
//                       className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
//                     >
//                       {deleting === "loading" && deletingId === shift.id
//                         ? "Deleting..."
//                         : "🗑 Delete"}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {shifts.length === 0 && (
//                 <div className="text-center text-gray-500 py-10 col-span-full">
//                   No work shifts found.
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Plus, Search, Calendar } from "lucide-react";
import {
  fetchWorkShifts,
  deleteWorkShift,
  selectWorkShifts,
  selectWorkShiftsListLoading,
  selectWorkShiftsListError,
  selectWorkShiftDeleting,
  selectWorkShiftSuccessMessage,
  clearErrors,
  clearSuccessMessage,
} from "../../Redux/Public/WorkShiftsSlice";
import CreateWorkShiftForm from "../../components/Forms/CreateWorkShiftForm";
import EditWorkShiftForm from "../../components/Forms/EditWorkShiftForm";
import {
  fetchAttendance,
  selectAttendanceItems,
} from "../../Redux/Public/attendanceSlice";
import MonthlyAttendance from './MonthlyAttendanceReport'

export default function WorkShiftsPage() {
  const dispatch = useDispatch();
  const companyId = useSelector((s) => s.auth?.company?.id);
  const items = useSelector(selectAttendanceItems);
  const shifts = useSelector(selectWorkShifts);
  const loading = useSelector(selectWorkShiftsListLoading);
  const error = useSelector(selectWorkShiftsListError);
  const deleting = useSelector(selectWorkShiftDeleting);
  const successMessage = useSelector(selectWorkShiftSuccessMessage);
  const [query, setQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);

  useEffect(() => {
    if (companyId) dispatch(fetchAttendance({ companyId }));
    dispatch(fetchWorkShifts());
  }, [dispatch, companyId]);

  const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");
  const fmtTime = (v) =>
    v
      ? new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "—";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (r) =>
        (r.userId || "").toLowerCase().includes(q) ||
        (r.status || "").toLowerCase().includes(q) ||
        (r.ipAddress || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    if (successMessage) {
      setShowSuccess(true);
      const t = setTimeout(() => {
        setShowSuccess(false);
        dispatch(clearSuccessMessage());
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearErrors()), 5000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const handleDelete = async (shiftId) => {
    if (window.confirm("Delete this work shift?")) {
      setDeletingId(shiftId);
      await dispatch(deleteWorkShift(shiftId));
      setDeletingId(null);
    }
  };

  const handleEdit = (shift) => setEditingShift(shift);
  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingShift(null);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* ============== ATTENDANCE TABLE ============== */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Attendance</h1>
              <p className="text-sm text-gray-600">
                Overview of employee daily check-ins and check-outs
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search user, status, IP..."
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm text-gray-900 bg-white shadow-sm"
                />
              </div>
              <button
                onClick={() => companyId && dispatch(fetchAttendance({ companyId }))}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white font-medium rounded-lg shadow hover:scale-105 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>

          <div className="overflow-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm text-gray-900">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  {[
                    "Date",
                    "User",
                    "Check In",
                    "Check Out",
                    "Break",
                    "Total",
                    "Status",
                    "IP",
                    "Device",
                    "Manual",
                    "Updated",
                  ].map((head) => (
                    <th key={head} className="px-3 py-3 text-left font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-100 hover:bg-orange-50 transition"
                  >
                    <td className="px-3 py-2">{fmtDate(r.date)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.userId?.slice(0, 8)}</td>
                    <td className="px-3 py-2">{fmtTime(r.checkInTime)}</td>
                    <td className="px-3 py-2">{fmtTime(r.checkOutTime)}</td>
                    <td className="px-3 py-2">{r.breakTime ?? "—"}</td>
                    <td className="px-3 py-2">{r.totalHours ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          r.status === "LATE"
                            ? "bg-orange-200 text-orange-800"
                            : r.status === "ONTIME"
                            ? "bg-green-200 text-green-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {r.status || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{r.ipAddress || "—"}</td>
                    <td
                      className="px-3 py-2 truncate max-w-[140px]"
                      title={r.device || ""}
                    >
                      {r.device || "—"}
                    </td>
                    <td className="px-3 py-2">{r.isManual ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">{fmtTime(r.updatedAt)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      className="text-center py-6 text-gray-500 font-medium"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============== WORK SHIFTS CARDS ============== */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Work Shifts</h2>
              <p className="text-sm text-gray-600">
                Manage employee work shift schedules
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Monthly Report Button */}
              <button
                onClick={() => setShowMonthlyReport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-medium rounded-lg shadow hover:scale-105 transition-all duration-200"
              >
                <Calendar className="w-4 h-4" /> Monthly Report
              </button>
              {/* Create Shift Button */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white rounded-lg hover:shadow-md transition-all hover:scale-105 font-medium"
              >
                <Plus className="w-4 h-4" /> Create Shift
              </button>
            </div>
          </div>

          {showSuccess && successMessage && (
            <div className="p-3 mb-4 rounded-lg bg-green-100 border border-green-300 text-green-800 text-sm font-medium">
              ✅ {successMessage}
            </div>
          )}
          {error && (
            <div className="p-3 mb-4 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm font-medium">
              ❌ {error}
            </div>
          )}

          {showCreateForm && (
            <CreateWorkShiftForm onSuccess={handleCloseForm} onCancel={handleCloseForm} />
          )}
          {editingShift && (
            <EditWorkShiftForm
              shift={editingShift}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          )}

          {/* Show Work Shifts Cards */}
          {!showCreateForm && !editingShift && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-gradient-to-br from-orange-50 via-white to-orange-100 border border-gray-200 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition-transform duration-200 p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center">
                      {shift.name}
                      {shift.isDefault && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-gray-500">{shift.timeZone}</div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{shift.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-800">
                    <div className="flex justify-between">
                      <span>Time</span>
                      <span className="font-medium">
                        {shift.defaultStart} - {shift.defaultEnd}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grace</span>
                      <span className="font-medium">{shift.graceMinutes}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Break</span>
                      <span className="font-medium">{shift.breakMinutes}m</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(shift)}
                      className="text-orange-700 hover:text-orange-900 text-xs font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(shift.id)}
                      disabled={deleting === "loading" && deletingId === shift.id}
                      className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                    >
                      {deleting === "loading" && deletingId === shift.id
                        ? "Deleting..."
                        : "🗑 Delete"}
                    </button>
                  </div>
                </div>
              ))}
              {shifts.length === 0 && (
                <div className="text-center text-gray-500 py-10 col-span-full">
                  No work shifts found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Report Popup Modal */}
      {/* {showMonthlyReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[80vh] overflow-hidden">
            <MonthlyAttendance onClose={() => setShowMonthlyReport(false)} />
          </div>
        </div>
      )} */}
{/* Monthly Report Popup Modal - Centered but Higher */}
{showMonthlyReport && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center p-4 z-50 pt-8">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
      <MonthlyAttendance onClose={() => setShowMonthlyReport(false)} />
    </div>
  </div>
)}
      
    </div>
  );
}