import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  createDesignation,
  selectDesignationCreating,
  selectDesignationCreateError,
  selectLastCreatedDesignation,
  resetDesignationState
} from '../../Redux/Public/designationSlice'
import {
  Box,
  Button,
  Card,
  TextField,
  Alert,
  Typography,
  Stack,
  Divider,
  IconButton,
  Grid,
  Snackbar,
} from '@mui/material'
import { PageHeading } from './components'
import { 
  ToggleOn, 
  ToggleOff, 
  CheckCircle, 
  Cancel,
  Add,
  Visibility,
  LockOpen,
  Lock,
  Close
} from '@mui/icons-material'

const CreateDesignationPage = () => {
  const dispatch = useDispatch()
  const creating = useSelector(selectDesignationCreating)
  const error = useSelector(selectDesignationCreateError)
  const lastCreated = useSelector(selectLastCreatedDesignation)

  const [formData, setFormData] = useState({
    title: '',
    enabledRoutes: {
      Project: 'Inactive',
      Task: 'Inactive',
    },
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (creating === 'succeeded') {
      // Set success message with the created designation title
      const message = `Designation "${lastCreated?.title || formData.title}" created successfully!`
      setSuccessMessage(message)
      setShowSuccess(true)
      
      // Reset form
      setFormData({
        title: '',
        enabledRoutes: {
          Project: 'Inactive',
          Task: 'Inactive',       },
      })

      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false)
        dispatch(resetDesignationState())
      }, 5000)

      return () => clearTimeout(timer)
    }

    if (creating === 'failed' && error) {
      setShowSuccess(false)
    }

    return () => {
      // Cleanup on component unmount
      if (creating === 'succeeded') {
        dispatch(resetDesignationState())
      }
    }
  }, [creating, error, lastCreated, dispatch, formData.title])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleToggleChange = (route) => {
    setFormData(prev => ({
      ...prev,
      enabledRoutes: {
        ...prev.enabledRoutes,
        [route]: prev.enabledRoutes[route] === 'Active' ? 'Inactive' : 'Active',
      }
    }))
  }

  const handleToggleAll = (status) => {
    const newRoutes = Object.keys(formData.enabledRoutes).reduce((acc, route) => {
      acc[route] = status
      return acc
    }, {})
    setFormData(prev => ({
      ...prev,
      enabledRoutes: newRoutes
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    dispatch(createDesignation(formData))
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    dispatch(resetDesignationState())
  }

  const handleCloseError = () => {
    dispatch(resetDesignationState())
  }

  const isFormValid = formData.title.trim()
  const activeRoutesCount = Object.values(formData.enabledRoutes).filter(status => status === 'Active').length
  const totalRoutesCount = Object.keys(formData.enabledRoutes).length

  // CSS styles
  const styles = {
    container: {
      maxWidth: 800,
      mx: 'auto',
      mt: 4,
      p: 3,
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #eff6ff 100%)',
      minHeight: '100vh'
    },
    heading: {
      color: '#171717',
      fontWeight: 700,
      fontSize: '2rem',
      mb: 1,
      background: 'linear-gradient(45deg, #f97316, #ea580c)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    subheading: {
      color: '#525252',
      fontSize: '1.1rem',
      fontWeight: 400
    },
    card: {
      p: 4,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease'
    },
    sectionTitle: {
      color: '#171717',
      fontWeight: 600,
      fontSize: '1.25rem',
      mb: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 1
    },
    label: {
      color: '#404040',
      fontWeight: 600,
      mb: 2,
      fontSize: '0.95rem'
    },
    textField: {
      '& .MuiOutlinedInput-root': {
        background: '#ffffff',
        borderRadius: 2,
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#f97316'
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#f97316',
          borderWidth: 2
        }
      },
      '& .MuiInputLabel-root': {
        color: '#737373',
        '&.Mui-focused': {
          color: '#f97316'
        }
      }
    },
    routesHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
      p: 2,
      background: 'linear-gradient(90deg, #fff7ed, #ffedd5)',
      borderRadius: 2,
      border: '1px solid #fed7aa'
    },
    routesStats: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      color: '#c2410c',
      fontWeight: 600
    },
    bulkActions: {
      display: 'flex',
      gap: 1
    },
    bulkButton: {
      px: 2,
      py: 0.5,
      borderRadius: 1,
      fontSize: '0.8rem',
      fontWeight: 600,
      textTransform: 'none',
      transition: 'all 0.2s ease'
    },
    bulkActivate: {
      background: '#d1fae5',
      color: '#065f46',
      border: '1px solid #a7f3d0',
      '&:hover': {
        background: '#a7f3d0',
        transform: 'translateY(-1px)'
      }
    },
    bulkDeactivate: {
      background: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fde68a',
      '&:hover': {
        background: '#fde68a',
        transform: 'translateY(-1px)'
      }
    },
    routesGrid: {
      mt: 2
    },
    routeCard: {
      p: 2,
      border: '2px solid #e5e5e5',
      borderRadius: 2,
      background: '#fafafa',
      transition: 'all 0.3s ease',
      height: '100%',
      '&:hover': {
        borderColor: '#f97316',
        background: '#fff7ed',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }
    },
    routeCardActive: {
      borderColor: '#10b981',
      background: '#ecfdf5',
      '&:hover': {
        borderColor: '#059669',
        background: '#d1fae5'
      }
    },
    routeHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 2
    },
    routeName: {
      fontWeight: 600,
      color: '#404040',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: 1
    },
    routeIcon: {
      color: '#f97316',
      fontSize: 20
    },
    toggleButton: {
      p: 0.5,
      borderRadius: 1,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.1)',
        background: 'rgba(0, 0, 0, 0.04)'
      }
    },
    statusSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mt: 1
    },
    statusBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      px: 1.5,
      py: 0.5,
      borderRadius: 1,
      fontSize: '0.8rem',
      fontWeight: 600
    },
    statusActive: {
      background: '#d1fae5',
      color: '#065f46'
    },
    statusInactive: {
      background: '#fef3c7',
      color: '#92400e'
    },
    submitButton: {
      background: 'linear-gradient(45deg, #f97316, #ea580c)',
      color: 'white',
      fontWeight: 600,
      fontSize: '1rem',
      borderRadius: 2,
      py: 1.5,
      px: 4,
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'linear-gradient(45deg, #ea580c, #c2410c)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(249, 115, 22, 0.3)'
      },
      '&:disabled': {
        background: '#d4d4d4',
        color: '#737373',
        transform: 'none',
        boxShadow: 'none'
      }
    },
    previewCard: {
      p: 3,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      borderRadius: 3,
      mt: 3,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
    },
    previewTitle: {
      color: '#171717',
      fontWeight: 600,
      mb: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 1
    },
    previewText: {
      color: '#404040',
      mb: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 1
    },
    divider: {
      borderColor: 'rgba(0, 0, 0, 0.08)',
      my: 3
    },
    successAlert: {
      background: 'linear-gradient(45deg, #10b981, #059669)',
      color: 'white',
      '& .MuiAlert-icon': { color: 'white' },
      borderRadius: 2,
      fontSize: '1rem'
    },
    errorAlert: {
      background: 'linear-gradient(45deg, #f43f5e, #e11d48)',
      color: 'white',
      '& .MuiAlert-icon': { color: 'white' },
      borderRadius: 2
    },
    snackbarSuccess: {
      '& .MuiSnackbarContent-root': {
        background: 'linear-gradient(45deg, #10b981, #059669)',
        color: 'white',
        fontSize: '1rem',
        fontWeight: 500,
        borderRadius: 2
      }
    }
  }

  const getStatusIcon = (status) => {
    return status === 'Active' ? 
      <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} /> : 
      <Cancel sx={{ color: '#f59e0b', fontSize: 16 }} />
  }

  const getToggleIcon = (status) => {
    return status === 'Active' ? 
      <ToggleOn sx={{ color: '#10b981', fontSize: 40 }} /> : 
      <ToggleOff sx={{ color: '#d4d4d4', fontSize: 40 }} />
  }

  const getRouteIcon = (routeName) => {
    const icons = {
      Project: '📊',
      Task: '✅',
    }
    return icons[routeName] || '🔗'
  }

  return (
    <Box sx={styles.container}>
      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={styles.snackbarSuccess}
      >
        <Alert 
          severity="success" 
          sx={styles.successAlert}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSuccess}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ fontSize: 20 }} />
            {successMessage}
          </Box>
        </Alert>
      </Snackbar>

      <PageHeading
        title="Create Designation"
        subtitle="Add a new designation for your company"
      />
      
      <Card sx={styles.card}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" sx={styles.label}>
                Designation Title *
              </Typography>
              <TextField
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="e.g., Senior Developer, Project Manager"
                required
                fullWidth
                sx={styles.textField}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={styles.label}>
                Route Permissions
              </Typography>
              
              {/* Routes Header with Stats and Bulk Actions */}
              <Box sx={styles.routesHeader}>
                <Box sx={styles.routesStats}>
                  <LockOpen sx={{ fontSize: 20 }} />
                  {activeRoutesCount} of {totalRoutesCount} routes active
                </Box>
                <Box sx={styles.bulkActions}>
                  <Button 
                    onClick={() => handleToggleAll('Active')}
                    sx={{ ...styles.bulkButton, ...styles.bulkActivate }}
                    startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
                  >
                    Activate All
                  </Button>
                  <Button 
                    onClick={() => handleToggleAll('Inactive')}
                    sx={{ ...styles.bulkButton, ...styles.bulkDeactivate }}
                    startIcon={<Lock sx={{ fontSize: 16 }} />}
                  >
                    Deactivate All
                  </Button>
                </Box>
              </Box>

              {/* Routes Grid */}
              <Grid container spacing={2} sx={styles.routesGrid}>
                {Object.keys(formData.enabledRoutes).map(route => {
                  const isActive = formData.enabledRoutes[route] === 'Active'
                  return (
                    <Grid item xs={12} sm={6} md={4} key={route}>
                      <Box 
                        sx={{
                          ...styles.routeCard,
                          ...(isActive ? styles.routeCardActive : {})
                        }}
                      >
                        <Box sx={styles.routeHeader}>
                          <Typography sx={styles.routeName}>
                            <span style={styles.routeIcon}>{getRouteIcon(route)}</span>
                            {route}
                          </Typography>
                          <IconButton
                            onClick={() => handleToggleChange(route)}
                            sx={styles.toggleButton}
                            size="small"
                          >
                            {getToggleIcon(formData.enabledRoutes[route])}
                          </IconButton>
                        </Box>
                        
                        <Box sx={styles.statusSection}>
                          <Box sx={{
                            ...styles.statusBadge,
                            ...(isActive ? styles.statusActive : styles.statusInactive)
                          }}>
                            {getStatusIcon(formData.enabledRoutes[route])}
                            {formData.enabledRoutes[route]}
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={styles.errorAlert}
                onClose={handleCloseError}
              >
                {error}
              </Alert>
            )}

            <Divider sx={styles.divider} />
            
            <Button
              type="submit"
              variant="contained"
              disabled={!isFormValid || creating === 'loading'}
              sx={styles.submitButton}
              startIcon={creating === 'loading' ? null : <Add />}
            >
              {creating === 'loading' ? 'Creating...' : 'Create Designation'}
            </Button>
          </Stack>
        </form>
      </Card>

      {/* Preview Section */}
      <Card sx={styles.previewCard}>
        <Typography variant="h6" sx={styles.previewTitle}>
          <Visibility sx={{ color: '#f97316' }} />
          Preview
        </Typography>
        <Typography variant="body1" sx={styles.previewText}>
          <strong>Title:</strong> {formData.title || 'N/A'}
        </Typography>
        <Typography variant="body1" sx={{ ...styles.previewText, fontWeight: 600 }}>
          Route Permissions ({activeRoutesCount}/{totalRoutesCount} active):
        </Typography>
        <Grid container spacing={1}>
          {Object.entries(formData.enabledRoutes).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <Typography variant="body2" sx={styles.previewText}>
                {getStatusIcon(value)}
                <strong>{key}:</strong> {value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Box>
  )
}

export default CreateDesignationPage