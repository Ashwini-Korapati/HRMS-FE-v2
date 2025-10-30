import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  selectEmployees, 
  selectEmployeesStatus, 
  selectEmployeesError, 
  fetchEmployees 
} from '../../Redux/Public/onboardinguserSlice';

// Icons (using Lucide React icons)
import { 
  Users, 
  Search,
  Filter,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Calendar,
  IndianRupee,
  Building,
  BadgeCheck,
  AlertCircle,
  Download,
  Share2,
  Plus,
  FileText,
  Table
} from 'lucide-react';

// PDF Library
import jsPDF from 'jspdf';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Enhanced Search Bar
const SearchBar = ({ value, onChange, onFilter, onCreateEmployee }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3"
  >
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search employees by name, email, or department..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
      />
    </div>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onFilter}
      className="px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
    >
      <Filter className="w-5 h-5" />
      <span className="hidden sm:block">Filters</span>
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onCreateEmployee}
      className="px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 transition-all duration-200 flex items-center gap-2"
    >
      <Plus className="w-5 h-5" />
      <span className="hidden sm:block">Add Employee</span>
    </motion.button>
  </motion.div>
);

// Download Menu Component
const DownloadMenu = ({ onDownloadExcel, onDownloadPDF }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
      >
        <Download className="w-5 h-5" />
        <span className="hidden sm:block">Download</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          >
            <button
              onClick={() => {
                onDownloadExcel();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-200"
            >
              <Table className="w-4 h-4 text-green-600" />
              <div>
                <div className="font-medium">Excel Format</div>
                <div className="text-xs text-gray-500">.xlsx file</div>
              </div>
            </button>
            <button
              onClick={() => {
                onDownloadPDF();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-200"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <div>
                <div className="font-medium">PDF Format</div>
                <div className="text-xs text-gray-500">.pdf file</div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Table with avatar integration
const EmployeeTable = ({ employees, onViewProfile, companyId }) => {
  const [selectedRow, setSelectedRow] = useState(null);

  // Function to get complete avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    
    // If it's already a full URL, return as is
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    // If it starts with 'uploads/', prepend the API base URL with a slash
    if (avatarPath.startsWith('uploads/')) {
      return `${API_BASE_URL}/${avatarPath}`;
    }
    
    // If it's a relative path starting with '/', prepend the API base URL
    if (avatarPath.startsWith('/')) {
      return `${API_BASE_URL}${avatarPath}`;
    }
    
    // For any other case, assume it's relative to the uploads directory
    return `${API_BASE_URL}/uploads/avatars/${avatarPath}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/50 bg-gray-50/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role & Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            <AnimatePresence>
              {employees.map((employee, index) => {
                const avatarUrl = getAvatarUrl(employee.avatar);
                const placeholder = `${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
                
                return (
                  <motion.tr
                    key={employee.user_id || employee.email}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`hover:bg-gray-50/50 transition-all duration-200 ${
                      selectedRow === employee.user_id ? 'bg-orange-50/50' : ''
                    }`}
                    onMouseEnter={() => setSelectedRow(employee.user_id)}
                    onMouseLeave={() => setSelectedRow(null)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="relative"
                        >
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={`${employee.firstName} ${employee.lastName}`}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                // Hide the image and show placeholder on error
                                e.target.style.display = 'none';
                                const placeholderDiv = e.target.parentElement.querySelector('.avatar-placeholder');
                                if (placeholderDiv) {
                                  placeholderDiv.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className={`avatar-placeholder w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                              avatarUrl ? 'hidden' : 'flex'
                            }`}
                          >
                            {placeholder}
                          </div>
                          {employee.isVerified && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                            >
                              <BadgeCheck className="w-2 h-2 text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                          {employee.employeeId && (
                            <div className="text-xs text-gray-400">ID: {employee.employeeId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.role === 'ADMIN' ? 'Administrator' : 'User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.designation?.title || 'No designation'}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {employee.department?.name || 'No department'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          !employee.isActive
                            ? 'bg-red-100 text-red-800'
                            : employee.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {!employee.isActive ? 'Inactive' : employee.isVerified ? 'Verified' : 'Pending'}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {employee.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {employee.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {employee.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                      </div>
                      {employee.salary && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <IndianRupee className="w-4 h-4" />
                          {parseInt(employee.salary).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onViewProfile(employee)}
                          className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default function UsersListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(s => s.auth);
  const companyId = auth?.company?.id;
  const employees = useSelector(selectEmployees);
  const status = useSelector(selectEmployeesStatus);
  const error = useSelector(selectEmployeesError);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(employees)) {
      const filtered = employees.filter(employee =>
        employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [employees, searchTerm]);

  const handleRefresh = () => {
    dispatch(fetchEmployees());
  };

  const handleViewProfile = (employee) => {
    if (companyId && (employee.user_id || employee.id)) {
      navigate(`/${companyId}/users/list/${employee.user_id || employee.id}/profile`);
    }
  };

  const handleCreateEmployee = () => {
    if (companyId) {
      navigate(`/${companyId}/users/create`);
    }
  };

  // Download functionality - FIXED VERSION
  const handleDownloadExcel = () => {
    if (!filteredEmployees.length) {
      alert('No data to download');
      return;
    }

    try {
      // Prepare data for Excel download
      const excelData = filteredEmployees.map(employee => ({
        'Employee ID': employee.employeeId || 'N/A',
        'First Name': employee.firstName || 'N/A',
        'Last Name': employee.lastName || 'N/A',
        'Email': employee.email || 'N/A',
        'Phone': employee.phone || 'N/A',
        'Role': employee.role === 'ADMIN' ? 'Administrator' : 'User',
        'Designation': employee.designation?.title || 'N/A',
        'Department': employee.department?.name || 'N/A',
        'Status': employee.isActive ? (employee.isVerified ? 'Verified' : 'Pending') : 'Inactive',
        'Join Date': employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A',
        'Salary': employee.salary ? `₹${parseInt(employee.salary).toLocaleString()}` : 'N/A'
      }));

      // Create CSV content with proper formatting
      const headers = Object.keys(excelData[0]).join(',');
      const rows = excelData.map(row => 
        Object.values(row).map(value => {
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value).replace(/"/g, '""');
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  const handleDownloadPDF = () => {
    if (!filteredEmployees.length) {
      alert('No data to download');
      return;
    }

    try {
      // Create PDF document with better settings
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title with better styling
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22); // Orange color
      doc.text('Employee Directory', 15, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 28);
      doc.text(`Total Employees: ${filteredEmployees.length}`, 15, 34);
      
      // Prepare table data
      const tableData = filteredEmployees.map(employee => [
        employee.employeeId || 'N/A',
        `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'N/A',
        employee.email || 'N/A',
        employee.phone || 'N/A',
        employee.role === 'ADMIN' ? 'Administrator' : 'User',
        employee.department?.name || 'N/A',
        employee.designation?.title || 'N/A',
        employee.isActive ? (employee.isVerified ? 'Verified' : 'Pending') : 'Inactive',
        employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A',
        employee.salary ? `₹${parseInt(employee.salary).toLocaleString()}` : 'N/A'
      ]);

      // Define table columns
      const tableColumns = [
        'ID',
        'Name',
        'Email',
        'Phone',
        'Role',
        'Department',
        'Designation',
        'Status',
        'Join Date',
        'Salary'
      ];

      // Set starting position
      let yPosition = 45;
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const colWidth = (pageWidth - (margin * 2)) / tableColumns.length;
      const rowHeight = 8;

      // Table headers with better styling
      doc.setFillColor(249, 115, 22); // Orange color
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      
      tableColumns.forEach((column, index) => {
        const xPosition = margin + (index * colWidth);
        doc.rect(xPosition, yPosition, colWidth, rowHeight, 'F');
        // Center text in header cells
        const textWidth = doc.getTextWidth(column);
        doc.text(column, xPosition + (colWidth - textWidth) / 2, yPosition + 5);
      });
      
      yPosition += rowHeight;
      
      // Table rows with better styling
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      
      tableData.forEach((row, rowIndex) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
          
          // Redraw headers on new page
          doc.setFillColor(249, 115, 22);
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          
          tableColumns.forEach((column, index) => {
            const xPosition = margin + (index * colWidth);
            doc.rect(xPosition, yPosition, colWidth, rowHeight, 'F');
            const textWidth = doc.getTextWidth(column);
            doc.text(column, xPosition + (colWidth - textWidth) / 2, yPosition + 5);
          });
          
          yPosition += rowHeight;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(8);
        }
        
        // Alternate row colors
        if (rowIndex % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPosition, pageWidth - (margin * 2), rowHeight, 'F');
        }
        
        // Draw row data
        row.forEach((cell, cellIndex) => {
          const xPosition = margin + (cellIndex * colWidth);
          const cellText = String(cell);
          
          // Truncate long text and add ellipsis
          let displayText = cellText;
          const maxWidth = colWidth - 4;
          
          if (doc.getTextWidth(cellText) > maxWidth) {
            while (doc.getTextWidth(displayText + '...') > maxWidth && displayText.length > 1) {
              displayText = displayText.slice(0, -1);
            }
            displayText += '...';
          }
          
          doc.text(displayText, xPosition + 2, yPosition + 5);
        });
        
        yPosition += rowHeight;
      });

      // Add footer to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`employees_directory_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF file. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-rose-50/30 p-4 md:p-6 space-y-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-200 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.1, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-200 rounded-full blur-3xl"
        />
      </div>

      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent"
          >
           View All Users
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-sm mt-2"
          >
            Manage and view all employees in your organization
          </motion.p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={status === 'loading'}
            className="px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <Download className={`w-5 h-5 ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span className="hidden sm:block">Refresh</span>
          </motion.button>
          
          <DownloadMenu 
            onDownloadExcel={handleDownloadExcel}
            onDownloadPDF={handleDownloadPDF}
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:block">Share</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onFilter={() => console.log('Open filters')}
          onCreateEmployee={handleCreateEmployee}
        />
      </motion.div>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {/* Loading State */}
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-sm p-12 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4"
            />
            <div className="text-gray-700 text-lg font-semibold">Loading Team Members</div>
            <div className="text-gray-500 text-sm mt-2">Fetching the latest employee data...</div>
          </motion.div>
        )}

        {/* Error State */}
        {status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-red-200/50 bg-red-50/80 backdrop-blur-sm p-8"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"
              >
                <AlertCircle className="w-6 h-6 text-red-600" />
              </motion.div>
              <div className="flex-1">
                <div className="text-red-800 font-semibold text-lg">Failed to Load Employees</div>
                <div className="text-red-600 text-sm mt-1">{error || 'Unknown error occurred'}</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'succeeded' && (
          <>
            <div className="flex items-center justify-between">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-semibold text-gray-900"
              >
                Employee Directory
                <span className="text-gray-500 text-sm font-normal ml-2">
                  ({filteredEmployees.length} of {employees.length} employees)
                </span>
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-gray-500"
              >
                Sorted by: <span className="text-gray-700 font-medium">Latest Join Date</span>
              </motion.div>
            </div>

            {!Array.isArray(employees) || employees.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-sm p-12 text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Users className="w-10 h-10 text-gray-400" />
                </motion.div>
                <div className="text-gray-700 text-xl font-semibold mb-2">No Employees Found</div>
                <div className="text-gray-500 text-sm max-w-md mx-auto">
                  Start building your team by onboarding new members to your organization. 
                  Click the "Add Employee" button to get started.
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateEmployee}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all duration-200 font-medium flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Add First Employee
                </motion.button>
              </motion.div>
            ) : (
              <EmployeeTable
                employees={filteredEmployees}
                onViewProfile={handleViewProfile}
                companyId={companyId}
              />
            )}
          </>
        )}

        {/* Idle State */}
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-sm p-12 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Users className="w-10 h-10 text-orange-500" />
            </motion.div>
            <div className="text-gray-700 text-xl font-semibold mb-2">Ready to Explore</div>
            <div className="text-gray-500 text-sm">
              Click the refresh button to load your team members and start managing your organization.
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}