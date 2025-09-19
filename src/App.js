import React from 'react'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SmartLandingPage from './components/Pages/SmartLandingPage'
import SmartChallangeAuthForm from './components/Forms/SmartChallangeAuthForm'
import { useSelector } from 'react-redux'
import { selectAuthChallengeState } from './Redux/Public/authChallengeSlice'
import UserLayout from './Modules/User/UserLayout'
import UserOverviewPage from './Modules/User/UserOverviewPage'
import UserAttendancePage from './Modules/User/UserAttendancePage'
import UserPayrollPage from './Modules/User/UserPayrollPage'
import UserTeamPage from './Modules/User/UserTeamPage'
import UserTasksPage from './Modules/User/UserTasksPage'
import UserProfilePage from './Modules/User/UserProfilePage'
import UserLeavesPage from './Modules/User/UserLeavesPage'
import UserProfileSettingsPage from './Modules/User/UserProfileSettingsPage'
import UserProfileSecurityPage from './Modules/User/UserProfileSecurityPage'
import UserLeavesHistoryPage from './Modules/User/UserLeavesHistoryPage'
import UserLeaveApplyPage from './Modules/User/UserLeaveApplyPage'
import UserTasksAssignedPage from './Modules/User/UserTasksAssignedPage'
import PlatformOverviewPage from './Modules/Superadmin/PlatformOverviewPage'
import PlatformCompaniesPage from './Modules/Superadmin/PlatformCompaniesPage'
import PlatformSystemAdminPage from './Modules/Superadmin/PlatformSystemAdminPage'
import PlatformSubscriptionsPage from './Modules/Superadmin/PlatformSubscriptionsPage'
import SuperAdminPlatformLayout from './Modules/Superadmin/SuperAdminPlatformLayout'
import ITPlatformLayout from './Modules/IT/ITPlatformLayout'
import ITOverviewPage from './Modules/IT/ITOverviewPage'
import ITCompaniesPage from './Modules/IT/ITCompaniesPage'
import ITSystemAdminPage from './Modules/IT/ITSystemAdminPage'
import ITSubscriptionsPage from './Modules/IT/ITSubscriptionsPage'
import AdminLayout from './Modules/Admin/AdminLayout'
import OverviewPage from './Modules/Admin/OverviewPage'
import UsersPage from './Modules/Admin/UsersPage'
import DepartmentsPage from './Modules/Admin/DepartmentsPage'
import DesignationsPage from './Modules/Admin/DesignationsPage'
import LeavesPage from './Modules/Admin/LeavesPage'
import AttendancePage from './Modules/Admin/AttendancePage'
import PayrollPage from './Modules/Admin/PayrollPage'
import ProjectsPage from './Modules/Admin/ProjectsPage'
import TasksPage from './Modules/Admin/TasksPage'
import UsersListPage from './Modules/Admin/UsersListPage'
import CreateUserPage from './Modules/Admin/CreateUserPage'
import ImportUsersPage from './Modules/Admin/ImportUsersPage'
import DepartmentsListPage from './Modules/Admin/DepartmentsListPage'
import CreateDepartmentPage from './Modules/Admin/CreateDepartmentPage'
import DesignationsListPage from './Modules/Admin/DesignationsListPage'
import CreateDesignationPage from './Modules/Admin/CreateDesignationPage'
import ProjectsListPage from './Modules/Admin/ProjectsListPage'
import CreateProjectPage from './Modules/Admin/CreateProjectPage'
import TasksAssignedPage from './Modules/Admin/TasksAssignedPage'
import CreateTaskPage from './Modules/Admin/CreateTaskPage'
import HolidaysPage from './Modules/Admin/HolidaysPage'
import AnnouncementsPage from './Modules/Admin/AnnouncementsPage'
import ReportsPage from './Modules/Admin/ReportsPage'
import AnalyticsPage from './Modules/Admin/AnalyticsPage'
import ProtectedRoute from './auth/ProtectedRoute'
import { ROLES, isAuthenticated } from './auth/auth'
import { selectBasePath } from './Redux/Public/authSlice'
import SmartAuthForm from './components/Forms/SmartAuthForm'
import { useDispatch } from 'react-redux'
import { platformLogin } from './Redux/Public/authSlice'
import { ThemeProvider } from './theme/ThemeProvider'

function UAS() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-200 p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-xl font-semibold mb-2">Unauthorized</h1>
        <p className="text-sm text-neutral-400 mb-4">You do not have permission to access this resource.</p>
        <a href="/" className="text-orange-400 hover:underline text-sm">Return Home</a>
      </div>
    </div>
  )
}

function PublicAuthLayout({ children }) {
  return <div className="auth-public-root flex items-center justify-center p-6">{children}</div>
}

function AppRoutes() {
  const challenge = useSelector(selectAuthChallengeState)
  const rawBasePath = useSelector(selectBasePath)
  const dispatch = useDispatch()
  const authState = useSelector(s => s.auth)
  // normalize basePath (ensure leading slash, no trailing slash)
  const basePath = React.useMemo(() => {
    if (!rawBasePath) return ''
    const lead = rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`
    return lead.replace(/\/$/, '')
  }, [rawBasePath])

  return (
    <Routes>
      <Route path="/" element={<SmartLandingPage />} />
      {/* Public login route: show challenge form unless already authenticated */}
      <Route
        path="/login"
        element={
          isAuthenticated()
            ? <Navigate to={`${basePath || ''}/overview`} replace />
            : <PublicAuthLayout><SmartChallangeAuthForm /></PublicAuthLayout>
        }
      />
      {/* Platform (SUPER_ADMIN / IT) dedicated login */}
      <Route path="/platform/login" element={
        authState.user?.role === 'SUPER_ADMIN' || authState.user?.role === 'IT'
          ? <Navigate to={`${basePath || ''}/overview`} replace />
          : (
            <PublicAuthLayout>
              <SmartAuthForm onSignIn={(vals) => {
                dispatch(platformLogin({ email: vals.email, password: vals.password, rememberMe: vals.remember }))
                  .unwrap()
                  .then(() => {
                    // After login, recompute target path from updated store
                    const state = store.getState()
                    const fbRaw = selectBasePath(state) || ''
                    const fbNorm = fbRaw
                      ? `${fbRaw.startsWith('/') ? fbRaw : '/' + fbRaw}`.replace(/\/$/, '')
                      : ''
                    window.history.replaceState(null, '', `${fbNorm}/overview`)
                  })
                  .catch(() => {/* silent for now */})
              }} />
            </PublicAuthLayout>
          )
      } />
      <Route path="/uas" element={<UAS />} />
      <Route path="/uas/portal/auth/login" element={<PublicAuthLayout><SmartChallangeAuthForm passwordOnly initialEmail={challenge.email || ''} company={challenge.company?.name} /></PublicAuthLayout>} />
      {/** IMPORTANT: Place ADMIN dynamic company route BEFORE platform route to avoid :platform matching companyUuid */}
      {/* ADMIN pattern with nested pages */}
      <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}> 
        <Route path=":companyUuid" element={<AdminLayout />}> 
          <Route path="overview" element={<OverviewPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/list" element={<UsersListPage />} />
          <Route path="users/create" element={<CreateUserPage />} />
          <Route path="users/import" element={<ImportUsersPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="departments/list" element={<DepartmentsListPage />} />
          <Route path="departments/create" element={<CreateDepartmentPage />} />
          <Route path="designations" element={<DesignationsPage />} />
          <Route path="designations/list" element={<DesignationsListPage />} />
          <Route path="designations/create" element={<CreateDesignationPage />} />
          <Route path="leaves" element={<LeavesPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/list" element={<ProjectsListPage />} />
          <Route path="projects/create" element={<CreateProjectPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/assigned" element={<TasksAssignedPage />} />
          <Route path="tasks/create" element={<CreateTaskPage />} />
          <Route path="holidays" element={<HolidaysPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route index element={<OverviewPage />} />
        </Route>
      </Route>
      {/* SUPER ADMIN / IT dynamic platform layout */}
      <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.IT]} />}> 
        <Route path=":platformId/supeadmin/:userId" element={<SuperAdminPlatformLayout />}> 
          <Route path="overview" element={<PlatformOverviewPage />} />
          <Route path="companies" element={<PlatformCompaniesPage />} />
          <Route path="system-admin" element={<PlatformSystemAdminPage />} />
          <Route path="subscriptions" element={<PlatformSubscriptionsPage />} />
          <Route index element={<PlatformOverviewPage />} />
        </Route>
        <Route path=":platformId/it/:userId" element={<ITPlatformLayout />}> 
          <Route path="overview" element={<ITOverviewPage />} />
          <Route path="companies" element={<ITCompaniesPage />} />
          <Route path="system-admin" element={<ITSystemAdminPage />} />
          <Route path="subscriptions" element={<ITSubscriptionsPage />} />
          <Route index element={<ITOverviewPage />} />
        </Route>
      </Route>
      {/* USER pattern nested */}
      <Route element={<ProtectedRoute roles={[ROLES.USER]} />}> 
        <Route path=":companyUuid/auth/:userId" element={<UserLayout />}>
          <Route path="overview" element={<UserOverviewPage />} />
          <Route path="attendance" element={<UserAttendancePage />} />
          <Route path="payroll" element={<UserPayrollPage />} />
          <Route path="team" element={<UserTeamPage />} />
          <Route path="tasks" element={<UserTasksPage />} />
          <Route path="tasks/assigned" element={<UserTasksAssignedPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="profile/settings" element={<UserProfileSettingsPage />} />
          <Route path="profile/security" element={<UserProfileSecurityPage />} />
          <Route path="leaves" element={<UserLeavesPage />} />
          <Route path="leaves/history" element={<UserLeavesHistoryPage />} />
          <Route path="leaves/apply" element={<UserLeaveApplyPage />} />
          <Route index element={<UserOverviewPage />} />
        </Route>
      </Route>
      {/* Backward compatibility & convenience redirect if someone hits /overview */}
      <Route path="/overview" element={basePath ? <Navigate to={`${basePath}/overview`} replace /> : <Navigate to="/" replace />} />
      {/* Legacy /dashboard redirect */}
      <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
