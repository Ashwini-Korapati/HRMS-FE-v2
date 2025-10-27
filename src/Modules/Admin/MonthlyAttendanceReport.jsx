// MonthlyAttendance.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download, FileText, Table, Calendar, X } from 'lucide-react';
import {
  fetchMonthlyReport,
  selectMonthlyReport,
  selectMonthlyReportLoading,
  selectMonthlyReportError,
  clearMonthlyReportError,
} from '../../Redux/Public/attendanceSlice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export default function MonthlyAttendance({ onClose }) {
  const dispatch = useDispatch();
  const companyId = useSelector((s) => s.auth?.company?.id);
  
  // Monthly report state
  const monthlyReport = useSelector(selectMonthlyReport);
  const monthlyReportLoading = useSelector(selectMonthlyReportLoading);
  const monthlyReportError = useSelector(selectMonthlyReportError);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchMonthlyReport({ companyId, year: selectedYear, month: selectedMonth }));
    }
  }, [dispatch, companyId, selectedYear, selectedMonth]);

  useEffect(() => {
    if (monthlyReportError) {
      const t = setTimeout(() => dispatch(clearMonthlyReportError()), 5000);
      return () => clearTimeout(t);
    }
  }, [monthlyReportError, dispatch]);

  const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");
  const fmtTime = (v) =>
    v
      ? new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "—";

  const handleRefreshMonthlyReport = () => {
    if (companyId) {
      dispatch(fetchMonthlyReport({ companyId, year: selectedYear, month: selectedMonth }));
    }
  };

  const exportToPDF = async () => {
  const element = document.getElementById('monthly-attendance-report');
  if (!element) return;

  try {
    // Create a simple, clean version for PDF export
    const tableHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: white; color: black;">
        <h2 style="text-align: center; margin-bottom: 10px;">
          Monthly Attendance Report - ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}
        </h2>
        <p style="text-align: center; margin-bottom: 20px;">
          Generated on ${new Date().toLocaleDateString()}
        </p>
        ${monthlyReport ? `<p style="text-align: center;">Total Records: ${monthlyReport.data?.total || 0}</p>` : ''}
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              ${["Date", "Employee ID", "Check In", "Check Out", "Break (min)", "Total Hours", "Status", "IP Address", "Device", "Manual", "Last Updated"]
                .map(head => `<th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; font-weight: bold;">${head}</th>`)
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${monthlyReport?.data?.items?.map(record => `
              <tr>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${fmtDate(record.date)}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px; font-family: monospace;">${record.userId?.slice(0, 8)}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${fmtTime(record.checkInTime)}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${fmtTime(record.checkOutTime)}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${record.breakTime ?? "—"}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${record.totalHours ?? "—"}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${record.status || "—"}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${record.ipAddress || "—"}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${record.device || "—"}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${record.isManual ? "Yes" : "No"}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${fmtTime(record.updatedAt)}</td>
              </tr>
            `).join('') || `
              <tr>
                <td colspan="11" style="border: 1px solid #dee2e6; padding: 20px; text-align: center;">
                  No attendance records found for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `;

    // Create a temporary element for rendering
    const tempElement = document.createElement('div');
    tempElement.innerHTML = tableHtml;
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    tempElement.style.top = '0';
    tempElement.style.width = '1000px';
    document.body.appendChild(tempElement);

    const canvas = await html2canvas(tempElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`monthly-attendance-${selectedYear}-${selectedMonth}.pdf`);

    // Clean up
    document.body.removeChild(tempElement);
    
  } catch (error) {
    console.error('PDF export error:', error);
    alert('Error generating PDF. Please try again.');
  }
};

//   const exportToPDF = async () => {
//     const element = document.getElementById('monthly-attendance-report');
//     if (!element) return;

//     const canvas = await html2canvas(element, {
//       scale: 2,
//       useCORS: true,
//       logging: false,
//     });

//     const imgData = canvas.toDataURL('image/png');
//     const pdf = new jsPDF('landscape', 'mm', 'a4');
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

//     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//     pdf.save(`monthly-attendance-${selectedYear}-${selectedMonth}.pdf`);
//   };

  const exportToExcel = () => {
    if (!monthlyReport?.data?.items) return;

    const worksheet = XLSX.utils.json_to_sheet(
      monthlyReport.data.items.map(item => ({
        'Employee ID': item.userId,
        'Date': new Date(item.date).toLocaleDateString(),
        'Check In': item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString() : '—',
        'Check Out': item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString() : '—',
        'Break Time (min)': item.breakTime || '—',
        'Total Hours': item.totalHours || '—',
        'Status': item.status || '—',
        'IP Address': item.ipAddress || '—',
        'Device': item.device || '—',
        'Manual Entry': item.isManual ? 'Yes' : 'No',
        'Last Updated': item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Attendance');
    
    XLSX.writeFile(workbook, `monthly-attendance-${selectedYear}-${selectedMonth}.xlsx`);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Monthly Attendance Report</h2>
            <p className="text-sm text-gray-600">
              Generate and export monthly attendance reports
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Report Controls - Fixed */}
        <div className="flex-shrink-0 p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Year & Month
              </label>
              <div className="flex gap-3">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={exportToExcel}
                disabled={monthlyReportLoading === 'loading' || !monthlyReport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                <Table className="w-4 h-4" />
                Export Excel
              </button>
              <button
                onClick={exportToPDF}
                disabled={monthlyReportLoading === 'loading' || !monthlyReport}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg shadow hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={handleRefreshMonthlyReport}
                disabled={monthlyReportLoading === 'loading'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {monthlyReportLoading === 'loading' ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {monthlyReportError && (
          <div className="flex-shrink-0 p-3 mx-6 mt-4 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm font-medium">
            ❌ {monthlyReportError}
          </div>
        )}

        {/* Report Content - Scrollable Area */}
        <div className="flex-1 overflow-auto p-6" id="monthly-attendance-report">
          {/* Report Header for PDF */}
          <div className="mb-6 text-center border-b pb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Monthly Attendance Report - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </h3>
            <p className="text-sm text-gray-600">
              Generated on {new Date().toLocaleDateString()}
            </p>
            {monthlyReport && (
              <p className="text-sm text-gray-600 mt-1">
                Total Records: {monthlyReport.data?.total || 0}
              </p>
            )}
          </div>

          {monthlyReportLoading === 'loading' ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading monthly report...</p>
              </div>
            </div>
          ) : monthlyReport ? (
            <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-sm text-gray-900">
                <thead className="bg-gray-100 text-gray-800 sticky top-0">
                  <tr>
                    {[
                      "Date",
                      "Employee ID",
                      "Check In",
                      "Check Out",
                      "Break (min)",
                      "Total Hours",
                      "Status",
                      "IP Address",
                      "Device",
                      "Manual",
                      "Last Updated"
                    ].map((head) => (
                      <th key={head} className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monthlyReport.data?.items?.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">{fmtDate(record.date)}</td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {record.userId?.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmtTime(record.checkInTime)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmtTime(record.checkOutTime)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{record.breakTime ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{record.totalHours ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            record.status === "LATE"
                              ? "bg-orange-200 text-orange-800"
                              : record.status === "ONTIME"
                              ? "bg-green-200 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {record.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{record.ipAddress || "—"}</td>
                      <td
                        className="px-4 py-3 max-w-[200px] truncate"
                        title={record.device || ""}
                      >
                        {record.device || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{record.isManual ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmtTime(record.updatedAt)}</td>
                    </tr>
                  ))}
                  {(!monthlyReport.data?.items || monthlyReport.data.items.length === 0) && (
                    <tr>
                      <td
                        colSpan={11}
                        className="text-center py-8 text-gray-500 font-medium"
                      >
                        No attendance records found for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No report data available.</p>
                <p className="text-sm">Click "Refresh" to load data.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}