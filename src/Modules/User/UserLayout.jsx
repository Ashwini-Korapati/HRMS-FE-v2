import React, { useEffect } from 'react'
import SmartNavbar from '../../components/Cards/SmartNavbar'
import SmartSidebar from '../../components/Cards/SmartSidebar'
import { useTheme } from '../../theme/ThemeProvider'
import { Outlet } from 'react-router-dom'
import BreadcrumbBar from '../../components/Cards/BreadcrumbBar'
import { useSelector } from 'react-redux'
import { selectAuthUser, selectBasePath } from '../../Redux/Public/authSlice'

function LayoutShell() {
  const { mode, effectiveMode, setMode } = useTheme()
  const user = useSelector(selectAuthUser)
  const basePath = useSelector(selectBasePath)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[UserLayout] theme mode', { mode, effectiveMode })
  }, [mode, effectiveMode])
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100 text-neutral-900 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 dark:text-neutral-100 transition-colors">
      <SmartNavbar logo="Smart HR" userName={user?.name || user?.email || 'User'} themeMode={mode} onThemeChange={setMode} />
      <div className="flex flex-1 min-h-0">
        <SmartSidebar basePath={basePath} />
        <main className="flex-1 p-6 overflow-auto">
          <BreadcrumbBar />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function UserLayout() { return <LayoutShell /> }
