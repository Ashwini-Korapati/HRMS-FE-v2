// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   selectDepartments,
//   selectDepartmentsListLoading,
//   selectDepartmentsListError,
//   selectDepartmentDeleting,
//   selectDepartmentDeleteError,
//   fetchDepartments,
//   deleteDepartment,
//   deleteDepartmentsBulk,
//   clearDepartmentErrors
// } from '../../Redux/Public/departmentSlice';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Button,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Box,
//   Typography,
//   Chip,
//   CircularProgress,
//   Alert,
//   Checkbox,
//   FormControlLabel
// } from '@mui/material';
// import {
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Add as AddIcon,
//   Refresh as RefreshIcon
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';

// const DepartmentListPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const departments = useSelector(selectDepartments);
//   const loading = useSelector(selectDepartmentsListLoading);
//   const error = useSelector(selectDepartmentsListError);
//   const deleting = useSelector(selectDepartmentDeleting);
//   const deleteError = useSelector(selectDepartmentDeleteError);

//   const [selectedDepartments, setSelectedDepartments] = useState([]);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [departmentToDelete, setDepartmentToDelete] = useState(null);
//   const [bulkDelete, setBulkDelete] = useState(false);

//   useEffect(() => {
//     dispatch(fetchDepartments());
//   }, [dispatch]);

//   useEffect(() => {
//     if (deleting === 'succeeded') {
//       setDeleteDialogOpen(false);
//       setDepartmentToDelete(null);
//       setSelectedDepartments([]);
//       dispatch(fetchDepartments());
//     }
//   }, [deleting, dispatch]);

//   const handleDeleteClick = (department) => {
//     setDepartmentToDelete(department);
//     setBulkDelete(false);
//     setDeleteDialogOpen(true);
//   };

//   const handleBulkDeleteClick = () => {
//     if (selectedDepartments.length > 0) {
//       setBulkDelete(true);
//       setDeleteDialogOpen(true);
//     }
//   };

//   const handleDeleteConfirm = () => {
//     if (bulkDelete) {
//       dispatch(deleteDepartmentsBulk(selectedDepartments));
//     } else if (departmentToDelete) {
//       dispatch(deleteDepartment(departmentToDelete.id));
//     }
//   };

//   const handleSelectDepartment = (departmentId) => {
//     setSelectedDepartments(prev =>
//       prev.includes(departmentId)
//         ? prev.filter(id => id !== departmentId)
//         : [...prev, departmentId]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedDepartments.length === departments.length) {
//       setSelectedDepartments([]);
//     } else {
//       setSelectedDepartments(departments.map(dept => dept.id));
//     }
//   };

//   const handleEdit = (departmentId) => {
//     navigate(`/departments/edit/${departmentId}`);
//   };

//   const handleCreateNew = () => {
//     navigate('/departments/create-only');
//   };

//   if (loading === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{
//         p: { xs: 2, md: 3 }, // Corresponds to p-4 and md:p-6
//         display: 'flex',
//         flexDirection: 'column',
//         gap: { xs: 2, md: 3 }, // Corresponds to space-y-4 and md:space-y-6
//         minHeight: '100vh',
//         background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)', // This background remains from the previous version
//       }}
//     >
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//         <Typography
//           variant="h4"
//           sx={{
//             fontSize: { xs: '1.125rem', md: '1.5rem' }, // Corresponds to text-lg
//             fontWeight: 600, // Corresponds to font-semibold
//             background: 'linear-gradient(to right, #fb923c, #f43f5e, #e879f9)', // New gradient pattern
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             backgroundClip: 'text',
//             color: 'transparent',
//           }}
//         >
//           Departments List
//         </Typography>
//         <Box>
//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={handleCreateNew}
//             sx={{ mr: 2 }}
//           >
//             Create Department
//           </Button>
//           <Button
//             variant="outlined"
//             startIcon={<RefreshIcon />}
//             onClick={() => dispatch(fetchDepartments())}
//           >
//             Refresh
//           </Button>
//         </Box>
//       </Box>

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearDepartmentErrors())}>
//           {error}
//         </Alert>
//       )}

//       {deleteError && (
//         <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearDepartmentErrors())}>
//           {deleteError}
//         </Alert>
//       )}

//       {departments.length === 0 ? (
//         <Paper
//           sx={{
//             p: 3,
//             textAlign: 'center',
//             borderRadius: '12px', // Corresponds to rounded-xl
//             border: '1px solid rgba(255, 255, 255, 0.1)', // New border style
//             background: 'rgba(255, 255, 255, 0.05)', // New background style
//             color: '#d4d4d4', // New text color
//             backdropFilter: 'blur(12px)',
//             WebkitBackdropFilter: 'blur(12px)',
//             boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)',
//           }}
//         >
//           <Typography variant="h6" color="textSecondary" gutterBottom>
//             No departments found
//           </Typography>
//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={handleCreateNew}
//           >
//             Create First Department
//           </Button>
//         </Paper>
//       ) : (
//         <Paper
//           sx={{
//             borderRadius: '12px', // Corresponds to rounded-xl
//             border: '1px solid rgba(255, 255, 255, 0.1)', // New border style
//             background: 'rgba(255, 255, 255, 0.05)', // New background style
//             color: '#d4d4d4', // New text color
//             backdropFilter: 'blur(12px)',
//             WebkitBackdropFilter: 'blur(12px)',
//             boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)',
//           }}
//         >
//           <Box p={2} display="flex" alignItems="center">
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={selectedDepartments.length === departments.length}
//                   indeterminate={selectedDepartments.length > 0 && selectedDepartments.length < departments.length}
//                   onChange={handleSelectAll}
//                 />
//               }
//               label="Select all"
//             />
//             {selectedDepartments.length > 0 && (
//               <Button
//                 variant="outlined"
//                 color="error"
//                 startIcon={<DeleteIcon />}
//                 onClick={handleBulkDeleteClick}
//                 disabled={deleting === 'loading'}
//                 sx={{ ml: 2 }}
//               >
//                 Delete Selected ({selectedDepartments.length})
//               </Button>
//             )}
//           </Box>

//           <TableContainer>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell padding="checkbox"></TableCell>
//                   <TableCell>Name</TableCell>
//                   <TableCell>Code</TableCell>
//                   <TableCell>Description</TableCell>
//                   <TableCell>Status</TableCell>
//                   <TableCell>Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {departments.map((department) => (
//                   <TableRow key={department.id} hover>
//                     <TableCell padding="checkbox">
//                       <Checkbox
//                         checked={selectedDepartments.includes(department.id)}
//                         onChange={() => handleSelectDepartment(department.id)}
//                       />
//                     </TableCell>
//                     <TableCell>{department.name}</TableCell>
//                     <TableCell>{department.code}</TableCell>
//                     <TableCell>{department.description || '-'}</TableCell>
//                     <TableCell>
//                       <Chip
//                         label={department.status || 'ACTIVE'}
//                         color={department.status === 'ACTIVE' ? 'success' : 'default'}
//                         size="small"
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <IconButton
//                         color="primary"
//                         onClick={() => handleEdit(department.id)}
//                         size="small"
//                       >
//                         <EditIcon />
//                       </IconButton>
//                       <IconButton
//                         color="error"
//                         onClick={() => handleDeleteClick(department)}
//                         disabled={deleting === 'loading'}
//                         size="small"
//                       >
//                         <DeleteIcon />
//                       </IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </Paper>
//       )}

//       <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
//         <DialogTitle>
//           {bulkDelete ? 'Delete Selected Departments' : 'Delete Department'}
//         </DialogTitle>
//         <DialogContent>
//           <Typography>
//             {bulkDelete
//               ? `Are you sure you want to delete ${selectedDepartments.length} department(s)? This action cannot be undone.`
//               : `Are you sure you want to delete department "${departmentToDelete?.name}"? This action cannot be undone.`
//             }
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
//           <Button
//             onClick={handleDeleteConfirm}
//             color="error"
//             disabled={deleting === 'loading'}
//             startIcon={deleting === 'loading' ? <CircularProgress size={16} /> : null}
//           >
//             {deleting === 'loading' ? 'Deleting...' : 'Delete'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default DepartmentListPage;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDepartments,
  selectDepartmentsListLoading,
  selectDepartmentsListError,
  selectDepartmentDeleting,
  selectDepartmentDeleteError,
  fetchDepartments,
  deleteDepartment,
  deleteDepartmentsBulk,
  clearDepartmentErrors
} from '../../Redux/Public/departmentSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DepartmentFormDialog from './DepartmentFormDialog'; // Import the new dialog component

const DepartmentListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectDepartmentsListLoading);
  const error = useSelector(selectDepartmentsListError);
  const deleting = useSelector(selectDepartmentDeleting);
  const deleteError = useSelector(selectDepartmentDeleteError);

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [bulkDelete, setBulkDelete] = useState(false);

  // New state for the form pop-up
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (deleting === 'succeeded') {
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      setSelectedDepartments([]);
      dispatch(fetchDepartments());
    }
  }, [deleting, dispatch]);

  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setBulkDelete(false);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedDepartments.length > 0) {
      setBulkDelete(true);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (bulkDelete) {
      dispatch(deleteDepartmentsBulk(selectedDepartments));
    } else if (departmentToDelete) {
      dispatch(deleteDepartment(departmentToDelete.id));
    }
  };

  const handleSelectDepartment = (departmentId) => {
    setSelectedDepartments(prev =>
      prev.includes(departmentId)
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDepartments.length === departments.length) {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments(departments.map(dept => dept.id));
    }
  };

  // Modified function to open the form dialog for editing
  const handleEdit = (department) => {
    setCurrentDepartment(department);
    setFormDialogOpen(true);
  };

  // Modified function to open the form dialog for creating
  const handleCreateNew = () => {
    setCurrentDepartment(null); // Clear any previous department data
    setFormDialogOpen(true);
  };

  // Function to close the form dialog and refresh the list
  const handleFormClose = (refresh) => {
    setFormDialogOpen(false);
    setCurrentDepartment(null);
    if (refresh) {
      dispatch(fetchDepartments());
    }
  };

  if (loading === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, md: 3 },
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.125rem', md: '1.5rem' },
            fontWeight: 600,
            background: 'linear-gradient(to right, #fb923c, #f43f5e, #e879f9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Departments List
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{ mr: 2 }}
          >
            Create Department
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => dispatch(fetchDepartments())}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearDepartmentErrors())}>
          {error}
        </Alert>
      )}

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearDepartmentErrors())}>
          {deleteError}
        </Alert>
      )}

      {departments.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#d4d4d4',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)',
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No departments found
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Create First Department
          </Button>
        </Paper>
      ) : (
        <Paper
          sx={{
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#d4d4d4',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)',
          }}
        >
          <Box p={2} display="flex" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedDepartments.length === departments.length}
                  indeterminate={selectedDepartments.length > 0 && selectedDepartments.length < departments.length}
                  onChange={handleSelectAll}
                />
              }
              label="Select all"
            />
            {selectedDepartments.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDeleteClick}
                disabled={deleting === 'loading'}
                sx={{ ml: 2 }}
              >
                Delete Selected ({selectedDepartments.length})
              </Button>
            )}
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedDepartments.includes(department.id)}
                        onChange={() => handleSelectDepartment(department.id)}
                      />
                    </TableCell>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.code}</TableCell>
                    <TableCell>{department.description || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={department.status || 'ACTIVE'}
                        color={department.status === 'ACTIVE' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(department)} // Pass the whole department object
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(department)}
                        disabled={deleting === 'loading'}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          {bulkDelete ? 'Delete Selected Departments' : 'Delete Department'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {bulkDelete
              ? `Are you sure you want to delete ${selectedDepartments.length} department(s)? This action cannot be undone.`
              : `Are you sure you want to delete department "${departmentToDelete?.name}"? This action cannot be undone.`
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting === 'loading'}
            startIcon={deleting === 'loading' ? <CircularProgress size={16} /> : null}
          >
            {deleting === 'loading' ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* The new form dialog component */}
      <DepartmentFormDialog
        open={formDialogOpen}
        onClose={handleFormClose}
        department={currentDepartment}
      />

    </Box>
  );
};

export default DepartmentListPage;