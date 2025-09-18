import React from 'react'
import SmartNavbar from '../components/Cards/SmartNavbar'
import SmartSidebar from '../components/Cards/SmartSidebar'
import AnalogClock from '../components/Prop/AnalogClock'
import { useTheme } from '../theme/ThemeProvider'

function DashboardShell() {
	const { mode, setMode } = useTheme()
	return (
		<div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
			<SmartNavbar logo="Smart HR" userName="Admin" themeMode={mode} onThemeChange={setMode} />
			<div className="flex flex-1 min-h-0">
				<SmartSidebar />
				<main className="flex-1 p-6 overflow-auto">
					<h1 className="text-xl font-semibold mb-4">Dashboard</h1>
					<div className="flex flex-wrap gap-6">
						<AnalogClock />
					</div>
				</main>
			</div>
		</div>
	)
}

export default function DashBoard() { return <DashboardShell /> }
