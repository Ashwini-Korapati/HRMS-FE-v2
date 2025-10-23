// Generates hrmsworkflow.xlsx documenting routes, modules, and Redux endpoints
// Run with: node scripts/generate-hrmsworkflow.js

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Sheet 1: Routes extracted from src/App.js (manually curated from repository)
const routes = [
  // Public
  { role: 'PUBLIC', base: '', path: '/', component: 'components/Pages/SmartLandingPage.jsx' },
  { role: 'PUBLIC', base: '', path: '/login', component: 'components/Forms/SmartChallangeAuthForm.jsx' },
  { role: 'PUBLIC', base: '', path: '/platform/login', component: 'components/Forms/SmartAuthForm.jsx' },
  { role: 'PUBLIC', base: '', path: '/uas', component: 'App.js:UAS inline' },
  { role: 'PUBLIC', base: '', path: '/uas/portal/auth/login', component: 'components/Forms/SmartChallangeAuthForm.jsx' },
  { role: 'PUBLIC', base: '', path: '/overview (redirect)', component: 'Redirect' },
  { role: 'PUBLIC', base: '', path: '/dashboard (redirect)', component: 'Redirect' },

  // ADMIN protected under :companyUuid
  { role: 'ADMIN', base: ':companyUuid', path: 'profile', component: 'Modules/Admin/AdminSelfProfilePage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'overview', component: 'Modules/Admin/OverviewPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'users', component: 'Modules/Admin/UsersPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'users/list', component: 'Modules/Admin/UsersListPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'users/list/:userId/profile', component: 'Modules/Admin/AdminUserProfilePage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'users/create', component: 'Modules/Admin/CreateUserPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'users/import', component: 'Modules/Admin/ImportUsersPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'departments', component: 'Modules/Admin/DepartmentsPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'departments/list', component: 'Modules/Admin/DepartmentsListPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'departments/create', component: 'Modules/Admin/CreateDepartmentPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'designations', component: 'Modules/Admin/DesignationsPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'designations/list', component: 'Modules/Admin/DesignationsListPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'designations/create', component: 'Modules/Admin/CreateDesignationPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'projects/teams', component: 'Modules/Admin/MyAdminDesignationTeam.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'projects/teams/:designationId', component: 'Modules/Admin/MyAdminDesignationTeam.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'projects/members-list', component: 'Modules/Admin/MyTeamArchitecture.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'leaves', component: 'Modules/Admin/LeavesPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'attendance', component: 'Modules/Admin/AttendancePage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'payroll', component: 'Modules/Admin/PayrollPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'projects', component: 'Modules/Admin/ProjectsPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'projects/list', component: 'Modules/Admin/ProjectsListPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'projects/list/:projectId', component: 'Modules/Admin/ProjectsListPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'projects/list/:projectId/folders/:urn', component: 'Modules/Admin/ProjectsListPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'projects/create', component: 'Modules/Admin/CreateProjectPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'projects/add-member', component: 'Modules/Admin/AdminAddProjectMember.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'projects/add-member/:projectId', component: 'Modules/Admin/AdminAddProjectMember.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'tasks', component: 'Modules/Admin/TasksPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'tasks/assigned', component: 'Modules/Admin/TasksAssignedPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'tasks/create', component: 'Modules/Admin/CreateTaskPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'holidays', component: 'Modules/Admin/HolidaysPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'announcements', component: 'Modules/Admin/AnnouncementsPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'tasks/completed', component: 'Modules/Admin/completedTasks.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'reports', component: 'Modules/Admin/ReportsPage.jsx' },
  { role: 'ADMIN', base: ':companyUuid', path: 'analytics', component: 'Modules/Admin/AnalyticsPage.jsx' },

  // SUPER_ADMIN platform
  { role: 'SUPER_ADMIN', base: ':platformId/supeadmin/:userId', path: 'overview', component: 'Modules/Superadmin/PlatformOverviewPage.jsx' },
  { role: 'SUPER_ADMIN', base: ':platformId/supeadmin/:userId', path: 'companies', component: 'Modules/Superadmin/PlatformCompaniesPage.jsx' },
  { role: 'SUPER_ADMIN', base: ':platformId/supeadmin/:userId', path: 'system-admin', component: 'Modules/Superadmin/PlatformSystemAdminPage.jsx' },
  { role: 'SUPER_ADMIN', base: ':platformId/supeadmin/:userId', path: 'subscriptions', component: 'Modules/Superadmin/PlatformSubscriptionsPage.jsx' },

  // IT platform
  { role: 'IT', base: ':platformId/it/:userId', path: 'overview', component: 'Modules/IT/ITOverviewPage.jsx' },
  { role: 'IT', base: ':platformId/it/:userId', path: 'companies', component: 'Modules/IT/ITCompaniesPage.jsx' },
  { role: 'IT', base: ':platformId/it/:userId', path: 'system-admin', component: 'Modules/IT/ITSystemAdminPage.jsx' },
  { role: 'IT', base: ':platformId/it/:userId', path: 'subscriptions', component: 'Modules/IT/ITSubscriptionsPage.jsx' },

  // USER protected under :companyUuid/auth/:userId
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'overview', component: 'Modules/User/UserOverviewPage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'attendance', component: 'Modules/User/UserAttendancePage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'payroll', component: 'Modules/User/UserPayrollPage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'team', component: 'Modules/User/UserTeamPage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'tasks', component: 'Modules/User/UserTasksPage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'tasks/assigned', component: 'Modules/User/UserTasksAssignedPage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'profile', component: 'Modules/User/UserProfilePage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'profile/settings', component: 'Modules/User/UserProfileSettingsPage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'profile/security', component: 'Modules/User/UserProfileSecurityPage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'leaves', component: 'Modules/User/UserLeavesPage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'leaves/history', component: 'Modules/User/UserLeavesHistoryPage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'leaves/apply', component: 'Modules/User/UserLeaveApplyPage.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'projects', component: 'Modules/User/UserProject.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'projects/list', component: 'Modules/User/UserProjectList.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'projects/list/:projectId', component: 'Modules/User/UserProjectList.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'projects/list/:projectId/folders/:urn', component: 'Modules/User/UserProjectList.jsx' },
  { role: 'USER', base: ':companyUuid/auth/:userId', path: 'projects/create', component: 'Modules/User/UserCreateProject.jsx' },
];

// Sheet 2: Redux endpoints (slice, action, method, endpoint pattern)
const endpoints = [
  // attendanceSlice
  { slice: 'attendance', action: 'fetchAttendance', method: 'GET', path: ':companyId/attendance' },
  { slice: 'attendance', action: 'checkIn (first)', method: 'POST', path: '(:admin? :companyId/attendance | :user? :companyId/auth/:userId/attendance)/check-in' },
  { slice: 'attendance', action: 'checkIn (status)', method: 'GET', path: '(:admin? :companyId/attendance | :user? :companyId/auth/:userId/attendance)/:attendanceId/check-in' },
  { slice: 'attendance', action: 'checkOut (first)', method: 'POST', path: '(:admin? :companyId/attendance | :user? :companyId/auth/:userId/attendance)/check-out' },
  { slice: 'attendance', action: 'checkOut (status)', method: 'GET', path: '(:admin? :companyId/attendance | :user? :companyId/auth/:userId/attendance)/:attendanceId/check-out' },

  // UserleaveSlice
  { slice: 'userleave', action: 'createLeave', method: 'POST', path: ':companyId/auth/:userId/leaves' },
  { slice: 'userleave', action: 'fetchLeaves', method: 'GET', path: ':companyId/auth/:userId/leaves/my-leaves' },
  { slice: 'userleave', action: 'fetchUserLeaveTypes', method: 'GET', path: ':companyId/auth/:userId/leaves/my-leave-types' },
  { slice: 'userleave', action: 'fetchLeaveById', method: 'GET', path: ':companyId/auth/:userId/leaves/:leaveId' },
  { slice: 'userleave', action: 'updateLeave', method: 'PATCH', path: ':companyId/auth/:userId/leaves/:leaveId' },
  { slice: 'userleave', action: 'deleteLeave', method: 'DELETE', path: ':companyId/auth/:userId/leaves/:leaveId' },
  { slice: 'userleave', action: 'fetchLeaveBalance', method: 'GET', path: ':companyId/auth/:userId/leave-balance' },

  // leaveTypesSlice (ADMIN)
  { slice: 'leaveTypes', action: 'createLeaveType', method: 'POST', path: ':companyId/leaves/types' },
  { slice: 'leaveTypes', action: 'fetchLeaveTypes', method: 'GET', path: ':companyId/leaves/types/list' },
  { slice: 'leaveTypes', action: 'fetchLeaveTypeById', method: 'GET', path: ':companyId/leaves/types/:typeId' },
  { slice: 'leaveTypes', action: 'updateLeaveType', method: 'PATCH', path: ':companyId/leaves/types/:typeId' },
  { slice: 'leaveTypes', action: 'deleteLeaveType', method: 'DELETE', path: ':companyId/leaves/types/:typeId' },
  { slice: 'leaveTypes', action: 'deleteLeaveTypesBulk', method: 'DELETE', path: ':companyId/leaves/types?ids=1,2,3' },

  // leaveApprovalsSlice
  { slice: 'leaveApprovals', action: 'fetchPendingApprovals', method: 'GET', path: ':companyId/auth/:userId/leaves/approvals/designation/:designationId/pending' },
  { slice: 'leaveApprovals', action: 'approveLeave', method: 'PATCH', path: ':companyId/auth/:userId/leaves/approvals/designation/:designationId/:leaveId/approve' },
  { slice: 'leaveApprovals', action: 'rejectLeave', method: 'PATCH', path: ':companyId/auth/:userId/leaves/approvals/designation/:designationId/:leaveId/reject' },

  // projectsSlice (admin vs user context varies)
  { slice: 'projects', action: 'createProject', method: 'POST', path: ':companyId/(project|auth/:userId/project)' },
  { slice: 'projects', action: 'fetchProjects', method: 'GET', path: ':companyId/auth/:userId/projects' },
  { slice: 'projects', action: 'fetchProjectById', method: 'GET', path: ':companyId/(project|auth/:userId/project)/:projectId' },
  { slice: 'projects', action: 'deleteProject', method: 'DELETE', path: ':companyId/(project|auth/:userId/project)/:projectId' },
  { slice: 'projects', action: 'deleteProjectsBulk', method: 'DELETE', path: ':companyId/(projects|auth/:userId/projects)?ids=...' },
  { slice: 'projects', action: 'fetchProjectsInsights', method: 'GET', path: ':companyId/(projects|auth/:userId/projects)/insights' },

  // departments
  { slice: 'departments', action: 'createDepartment', method: 'POST', path: ':companyId/(departments|auth/:userId/departments)' },
  { slice: 'departments', action: 'fetchDepartments', method: 'GET', path: ':companyId/(departments|auth/:userId/departments)' },
  { slice: 'departments', action: 'fetchDepartmentById', method: 'GET', path: ':companyId/(departmentS|auth/:userId/departmentS)/:departmentId' },
  { slice: 'departments', action: 'updateDepartment', method: 'PATCH', path: ':companyId/(departments|auth/:userId/departments)/:departmentId' },
  { slice: 'departments', action: 'deleteDepartment', method: 'DELETE', path: ':companyId/(departments|auth/:userId/departments)/:departmentId' },
  { slice: 'departments', action: 'deleteDepartmentsBulk', method: 'DELETE', path: ':companyId/(departments|auth/:userId/departments)?ids=...' },

  // designation
  { slice: 'designations', action: 'createDesignation', method: 'POST', path: ':companyId/(designations|auth/:userId/designations)' },
  { slice: 'designations', action: 'fetchDesignations', method: 'GET', path: ':companyId/(designations|auth/:userId/designations)' },
  { slice: 'designations', action: 'fetchDesignationsFlow', method: 'GET', path: ':companyId/(designations|auth/:userId/designations)/architecture-flow' },

  // designation monitoring
  { slice: 'designationMonitoring', action: 'fetchDesignationMonitoringSnapshot', method: 'GET', path: ':companyId/attendance/monitoring/designations/:designationId' },

  // employees
  { slice: 'employees', action: 'fetchCompanyEmployees', method: 'GET', path: 'companies/:companyId/employees' },
  { slice: 'employees', action: 'assignEmployeesToProject', method: 'POST', path: ':companyId/projects/:projectId/members' },

  // folders
  { slice: 'folders', action: 'fetchProjectFolderTree', method: 'GET', path: ':companyId/(project|auth/:userId/projects)/:projectId/folders/tree' },
  { slice: 'folders', action: 'fetchFolderContent', method: 'GET', path: ':companyId/(projects|auth/:userId/projects)/:projectId/folders/:urn' },
  { slice: 'folders', action: 'fetchFolderDocuments', method: 'GET', path: ':companyId/(projects|auth/:userId/projects)/:projectId/folders/:urn/documents' },
  { slice: 'folders', action: 'uploadFolderDocuments', method: 'POST', path: ':companyId/(projects|auth/:userId/projects)/:projectId/folders/:urn/documents' },

  // notifications
  { slice: 'notifications', action: 'fetchUnreadCount', method: 'GET', path: ':companyId/(notifications|auth/:userId/profile/notifications/unread-count)' },
  { slice: 'notifications', action: 'fetchFeed', method: 'GET', path: ':companyId/(notifications|auth/:userId/profile/notifications/feed)' },
  { slice: 'notifications', action: 'markAsRead', method: 'PATCH', path: ':companyId/(notifications/:id/read|auth/:userId/profile/notifications/:id/read)' },
  { slice: 'notifications', action: 'markAllAsRead', method: 'PATCH', path: ':companyId/(notifications/read-all|auth/:userId/profile/notifications/read-all)' },

  // work shifts (ADMIN)
  { slice: 'workShifts', action: 'createWorkShift', method: 'POST', path: ':companyId/work-shifts' },
  { slice: 'workShifts', action: 'fetchWorkShifts', method: 'GET', path: ':companyId/work-shifts?projectId=:projectId' },
  { slice: 'workShifts', action: 'updateWorkShift', method: 'PUT', path: ':companyId/work-shifts/:shiftId' },
  { slice: 'workShifts', action: 'deleteWorkShift', method: 'DELETE', path: ':companyId/work-shifts/:shiftId' },

  // admin user profile
  { slice: 'adminUserProfile', action: 'fetchProfile', method: 'GET', path: ':companyId/auth/:userId/profile' },
  { slice: 'adminUserProfile', action: 'updateProfile', method: 'PATCH', path: ':companyId/auth/:userId/profile' },
  { slice: 'adminUserProfile', action: 'uploadAvatar', method: 'POST', path: ':companyId/auth/:userId/profile/avatar' },
  { slice: 'adminUserProfile', action: 'deleteAvatar', method: 'DELETE', path: ':companyId/auth/:userId/profile/avatar' },
  { slice: 'adminUserProfile', action: 'changePassword', method: 'POST', path: ':companyId/auth/:userId/profile/changePassword' },
  { slice: 'adminUserProfile', action: 'fetchPrivacySettings', method: 'GET', path: ':companyId/auth/:userId/profile/privacy-settings' },
  { slice: 'adminUserProfile', action: 'updatePrivacySettings', method: 'PATCH', path: ':companyId/auth/:userId/profile/privacy-settings' },
  { slice: 'adminUserProfile', action: 'fetchNotificationsSettings', method: 'GET', path: ':companyId/auth/:userId/profile/notifications' },
  { slice: 'adminUserProfile', action: 'updateNotificationsSettings', method: 'PATCH', path: ':companyId/auth/:userId/profile/notifications' },
  { slice: 'adminUserProfile', action: 'fetchDocuments', method: 'GET', path: ':companyId/auth/:userId/profile/documents' },
  { slice: 'adminUserProfile', action: 'uploadDocument', method: 'POST', path: ':companyId/auth/:userId/profile/documents' },
  { slice: 'adminUserProfile', action: 'deleteDocument', method: 'DELETE', path: ':companyId/auth/:userId/profile/documents/:documentId' },
  { slice: 'adminUserProfile', action: 'fetchEmergencyContacts', method: 'GET', path: ':companyId/auth/:userId/profile/emergency-contacts' },
  { slice: 'adminUserProfile', action: 'upsertEmergencyContact', method: 'POST|PATCH', path: ':companyId/auth/:userId/profile/emergency-contacts(/:contactId)' },
  { slice: 'adminUserProfile', action: 'deleteEmergencyContact', method: 'DELETE', path: ':companyId/auth/:userId/profile/emergency-contacts/:contactId' },
  { slice: 'adminUserProfile', action: 'fetchBank', method: 'GET', path: ':companyId/auth/:userId/profile/bank' },
  { slice: 'adminUserProfile', action: 'updateBank', method: 'PATCH', path: ':companyId/auth/:userId/profile/bank' },

  // auth
  { slice: 'auth', action: 'loginWithPassword', method: 'POST', path: 'uas/auth/login' },
  { slice: 'auth', action: 'platformLogin', method: 'POST', path: 'auth/platform/login' },
  { slice: 'auth', action: 'exchangeToken', method: 'POST', path: 'uas/auth/token' },
  { slice: 'auth', action: 'refreshAccessToken', method: 'POST', path: 'uas/auth/token' },

  // plans
  { slice: 'plans', action: 'fetchPlans', method: 'GET', path: 'subscriptions/plans?isActive=true' },
];

// Sheet 3: Modules/submodules (from src/Modules folder)
const modules = [
  // Admin
  'Modules/Admin/AdminLayout.jsx',
  'Modules/Admin/AdminSelfProfilePage.jsx',
  'Modules/Admin/AdminUserProfilePage.jsx',
  'Modules/Admin/OverviewPage.jsx',
  'Modules/Admin/UsersPage.jsx',
  'Modules/Admin/UsersListPage.jsx',
  'Modules/Admin/CreateUserPage.jsx',
  'Modules/Admin/ImportUsersPage.jsx',
  'Modules/Admin/DepartmentsPage.jsx',
  'Modules/Admin/DepartmentsListPage.jsx',
  'Modules/Admin/CreateDepartmentPage.jsx',
  'Modules/Admin/DesignationsPage.jsx',
  'Modules/Admin/DesignationsListPage.jsx',
  'Modules/Admin/CreateDesignationPage.jsx',
  'Modules/Admin/MyAdminDesignationTeam.jsx',
  'Modules/Admin/MyTeamArchitecture.jsx',
  'Modules/Admin/LeavesPage.jsx',
  'Modules/Admin/AttendancePage.jsx',
  'Modules/Admin/PayrollPage.jsx',
  'Modules/Admin/ProjectsPage.jsx',
  'Modules/Admin/ProjectsListPage.jsx',
  'Modules/Admin/CreateProjectPage.jsx',
  'Modules/Admin/AdminAddProjectMember.jsx',
  'Modules/Admin/TasksPage.jsx',
  'Modules/Admin/TasksAssignedPage.jsx',
  'Modules/Admin/CreateTaskPage.jsx',
  'Modules/Admin/HolidaysPage.jsx',
  'Modules/Admin/AnnouncementsPage.jsx',
  'Modules/Admin/completedTasks.jsx',
  'Modules/Admin/ReportsPage.jsx',
  'Modules/Admin/AnalyticsPage.jsx',

  // User
  'Modules/User/UserLayout.jsx',
  'Modules/User/UserOverviewPage.jsx',
  'Modules/User/UserAttendancePage.jsx',
  'Modules/User/UserPayrollPage.jsx',
  'Modules/User/UserTeamPage.jsx',
  'Modules/User/UserTasksPage.jsx',
  'Modules/User/UserTasksAssignedPage.jsx',
  'Modules/User/UserProfilePage.jsx',
  'Modules/User/UserProfileSettingsPage.jsx',
  'Modules/User/UserProfileSecurityPage.jsx',
  'Modules/User/UserLeavesPage.jsx',
  'Modules/User/UserLeavesHistoryPage.jsx',
  'Modules/User/UserLeaveApplyPage.jsx',
  'Modules/User/UserProject.jsx',
  'Modules/User/UserProjectList.jsx',
  'Modules/User/UserCreateProject.jsx',

  // Platform (Superadmin/IT)
  'Modules/Superadmin/SuperAdminPlatformLayout.jsx',
  'Modules/Superadmin/PlatformOverviewPage.jsx',
  'Modules/Superadmin/PlatformCompaniesPage.jsx',
  'Modules/Superadmin/PlatformSystemAdminPage.jsx',
  'Modules/Superadmin/PlatformSubscriptionsPage.jsx',
  'Modules/IT/ITPlatformLayout.jsx',
  'Modules/IT/ITOverviewPage.jsx',
  'Modules/IT/ITCompaniesPage.jsx',
  'Modules/IT/ITSystemAdminPage.jsx',
  'Modules/IT/ITSubscriptionsPage.jsx',
];

function toSheet(data, headerMap) {
  const rows = data.map(item => {
    const row = {};
    for (const [key, title] of Object.entries(headerMap)) {
      row[title] = item[key] ?? '';
    }
    return row;
  });
  const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });
  // Set header order
  const headers = Object.values(headerMap);
  const range = XLSX.utils.decode_range(ws['!ref']);
  // Overwrite first row with our headers in order
  headers.forEach((h, idx) => {
    const cell = XLSX.utils.encode_cell({ r: 0, c: idx });
    ws[cell] = { t: 's', v: h };
  });
  return ws;
}

function main() {
  const wb = XLSX.utils.book_new();

  const routesSheet = toSheet(routes, {
    role: 'Role',
    base: 'Base Path',
    path: 'Route Path',
    component: 'Component',
  });
  XLSX.utils.book_append_sheet(wb, routesSheet, 'Routes');

  const endpointsSheet = toSheet(endpoints, {
    slice: 'Slice',
    action: 'Action',
    method: 'Method',
    path: 'Endpoint Pattern',
  });
  XLSX.utils.book_append_sheet(wb, endpointsSheet, 'Redux Endpoints');

  const modulesSheet = toSheet(modules.map(m => ({ module: m })), {
    module: 'Module Component',
  });
  XLSX.utils.book_append_sheet(wb, modulesSheet, 'Modules');

  const outPath = path.resolve(process.cwd(), 'hrmsworkflow.xlsx');
  XLSX.writeFile(wb, outPath);
  console.log('Generated', outPath);
}

if (require.main === module) {
  main();
}
