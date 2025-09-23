
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  createDepartment,
  selectDepartmentCreating,
  selectDepartmentCreateError,
  resetDepartmentState
} from '../../Redux/Public/departmentSlice';
import {
  Box,
  Button,
  Card,
  TextField,
  Alert,
  Typography,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material';
import { PageHeading } from './components';

const CreateDepartmentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const creating = useSelector(selectDepartmentCreating);
  const error = useSelector(selectDepartmentCreateError);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (creating === 'succeeded') {
      setFormData({ name: '', description: '' });
      setShowSuccess(true);
      
      const timer = setTimeout(() => {
        setShowSuccess(false);
        dispatch(resetDepartmentState());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [creating, dispatch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(false);
    dispatch(createDepartment(formData));
  };

  const handleBackToList = () => {
    navigate('/departments/list');
  };

  const handleCreateAnother = () => {
    setFormData({ name: '', description: '' });
    setShowSuccess(false);
    dispatch(resetDepartmentState());
  };

  const isFormValid = formData.name.trim();

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
      minHeight: '100vh',
      p: 4,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Card
        variant="outlined"
        sx={{
          p: 3,
          maxWidth: 500,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)'
        }}
      >
        <PageHeading
          title="Create Department"
          subtitle="Add a new department to your organization"
        />
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            
            <TextField
              label="Department Name"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              required
              fullWidth
              size="small"
              disabled={creating === 'loading'}
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
              disabled={creating === 'loading'}
            />
            
            {error && (
              <Alert severity="error" onClose={() => dispatch(resetDepartmentState())}>
                {error}
              </Alert>
            )}
            
            {showSuccess && (
              <Alert severity="success">
                Department created successfully!
              </Alert>
            )}
            
            <Divider />
            
            <Stack direction="row" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                  color: '#9a3412',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #fef08a, #fcd34d)',
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(255, 255, 255, 0.5)',
                    color: 'rgba(0, 0, 0, 0.3)',
                  }
                }}
                disabled={!isFormValid || creating === 'loading'}
                startIcon={creating === 'loading' ? <CircularProgress size={16} sx={{ color: '#9a3412' }} /> : null}
              >
                {creating === 'loading' ? 'Creating...' : 'Create'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleBackToList}
                disabled={creating === 'loading'}
              >
                Back to List
              </Button>
              
              <Button
                variant="text"
                onClick={handleCreateAnother}
                disabled={creating === 'loading'}
              >
                Create Another
              </Button>
            </Stack>
          </Stack>
        </form>
      </Card>
    </Box>
  );
};

export default CreateDepartmentPage;