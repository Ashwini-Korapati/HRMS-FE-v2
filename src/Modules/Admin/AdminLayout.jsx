import React, { useEffect } from 'react'
import SmartNavbar from '../../components/Cards/SmartNavbar'
import SmartSidebar from '../../components/Cards/SmartSidebar'
import BreadcrumbBar from '../../components/Cards/BreadcrumbBar'
import { useTheme } from '../../theme/ThemeProvider'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectAuthUser } from '../../Redux/Public/authSlice'

function LayoutShell() {
  const { mode, effectiveMode, setMode } = useTheme()
  const user = useSelector(selectAuthUser)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[AdminLayout] theme mode', { mode, effectiveMode })
  }, [mode, effectiveMode])
  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100 text-neutral-900 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 dark:text-neutral-100 transition-colors`}>
      <SmartNavbar logo="Smart HR" userName={user?.name || user?.email || 'Admin'} themeMode={mode} onThemeChange={setMode} />
      <div className="flex flex-1 min-h-0">
        <SmartSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <BreadcrumbBar />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout() { return <LayoutShell /> }
