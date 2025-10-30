import React from 'react'
import SmartNavbar from '../../components/Cards/SmartNavbar'
import SmartSidebar from '../../components/Cards/SmartSidebar'
import { useTheme } from '../../theme/ThemeProvider'
import { Outlet, useLocation } from 'react-router-dom'
import SmartTransition from '../../components/Prop/SmartTransition'
import { useSelector } from 'react-redux'
import { selectAuthUser, selectBasePath } from '../../Redux/Public/authSlice'

function Shell() {
  const { mode, setMode } = useTheme()
  const user = useSelector(selectAuthUser)
  const basePath = useSelector(selectBasePath)
  const location = useLocation()
  return (
  <div className="min-h-screen bg-white text-neutral-900 dark:bg-black dark:text-neutral-50 transition-colors">
      <SmartNavbar logo="IT Platform" userName={user?.name || user?.email} themeMode={mode} onThemeChange={setMode} />
      {/* Offset for fixed navbar (48px). Left padding is controlled by --sidebar-padding set by SmartSidebar. */}
      <div className="flex min-h-0 pt-12" style={{ paddingLeft: 'var(--sidebar-padding, 0px)' }}>
        <SmartSidebar basePath={basePath} />
        <main className="flex-1 min-h-0 h-[calc(100vh-48px)] p-4 lg:p-6 overflow-auto scroll-smooth">
          <SmartTransition transitionKey={location.pathname}>
            <Outlet />
          </SmartTransition>
        </main>
      </div>
    </div>
  )
}

export default function ITPlatformLayout() { return <Shell /> }
