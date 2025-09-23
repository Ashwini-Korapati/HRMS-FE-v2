import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  MenuItem,
  Typography
} from '@mui/material';
import {
  createDepartment,
  updateDepartment,
  selectDepartmentCreating,
  selectDepartmentCreateError,
  selectDepartmentUpdating,
  selectDepartmentUpdateError,
  clearDepartmentErrors
} from '../../Redux/Public/departmentSlice';

const DepartmentFormDialog = ({ open, onClose, department }) => {
  const dispatch = useDispatch();
  const creating = useSelector(selectDepartmentCreating);
  const createError = useSelector(selectDepartmentCreateError);
  const updating = useSelector(selectDepartmentUpdating);
  const updateError = useSelector(selectDepartmentUpdateError);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'ACTIVE',
  });

  const isUpdating = !!department;
  const loading = creating === 'loading' || updating === 'loading';
  const error = isUpdating ? updateError : createError;

  useEffect(() => {
    // When the dialog opens, populate the form with department data if in edit mode
    if (department) {
      setFormData({
        name: department.name || '',
        code: department.code || '',
        description: department.description || '',
        status: department.status || 'ACTIVE',
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        code: '',
        description: '',
        status: 'ACTIVE',
      });
    }
  }, [department, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isUpdating) {
      // Dispatch update thunk
      const resultAction = await dispatch(updateDepartment({ id: department.id, ...formData }));
      if (updateDepartment.fulfilled.match(resultAction)) {
        onClose(true); // Close and refresh list on success
      }
    } else {
      // Dispatch create thunk
      const resultAction = await dispatch(createDepartment(formData));
      if (createDepartment.fulfilled.match(resultAction)) {
        onClose(true); // Close and refresh list on success
      }
    }
  };

  const handleClose = () => {
    dispatch(clearDepartmentErrors());
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isUpdating ? 'Edit Department' : 'Create New Department'}</DialogTitle>
      <Box component="form" onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Department Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Department Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? (isUpdating ? 'Updating...' : 'Creating...') : (isUpdating ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default DepartmentFormDialog;