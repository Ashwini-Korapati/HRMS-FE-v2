import React from 'react'
import SmartNavbar from '../../components/Cards/SmartNavbar'
import SmartSidebar from '../../components/Cards/SmartSidebar'
import { useTheme } from '../../theme/ThemeProvider'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectAuthUser, selectBasePath } from '../../Redux/Public/authSlice'

function Shell() {
  const { mode, setMode } = useTheme()
  const user = useSelector(selectAuthUser)
  const basePath = useSelector(selectBasePath)
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100 text-neutral-900 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 dark:text-neutral-100 transition-colors">
      <SmartNavbar logo="IT Platform" userName={user?.name || user?.email} themeMode={mode} onThemeChange={setMode} />
      <div className="flex flex-1 min-h-0">
        <SmartSidebar basePath={basePath} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function ITPlatformLayout() { return <Shell /> }
