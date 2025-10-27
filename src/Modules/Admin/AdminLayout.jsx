import React, { useEffect } from 'react'
import SmartNavbar from '../../components/Cards/SmartNavbar'
import SmartSidebar from '../../components/Cards/SmartSidebar'
import BreadcrumbBar from '../../components/Cards/BreadcrumbBar'
import { useTheme } from '../../theme/ThemeProvider'
import { Outlet, useLocation } from 'react-router-dom'
import SmartTransition from '../../components/Prop/SmartTransition'
import { useSelector } from 'react-redux'
import { selectAuthUser } from '../../Redux/Public/authSlice'

function LayoutShell() {
  const { mode, effectiveMode, setMode } = useTheme()
  const user = useSelector(selectAuthUser)
  const location = useLocation()
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[AdminLayout] theme mode', { mode, effectiveMode })
  }, [mode, effectiveMode])
  return (
    <div className={`min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 text-neutral-900 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 dark:text-neutral-100 transition-colors`}>
      <SmartNavbar logo="Smart HR" userName={user?.name || user?.email || 'Admin'} themeMode={mode} onThemeChange={setMode} />
      {/* Offset for fixed navbar (48px). Left padding is controlled by --sidebar-padding set by SmartSidebar. */}
      <div className="flex min-h-0 pt-12" style={{ paddingLeft: 'var(--sidebar-padding, 0px)' }}>
        <SmartSidebar />
        <main className="flex-1 min-h-0 h-[calc(100vh-48px)] p-4 pl-12 lg:p-6 overflow-auto scroll-smooth">
          <BreadcrumbBar />
          <SmartTransition transitionKey={location.pathname}>
            <Outlet />
          </SmartTransition>
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout() { return <LayoutShell /> }
