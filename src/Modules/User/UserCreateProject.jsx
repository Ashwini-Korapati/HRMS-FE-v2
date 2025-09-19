import React from 'react'
import SmartCreateProjectForm from '../../components/Forms/SmartCreateProjectForm'
import { PageHeading } from './components'

export default function UserCreateProject() {
  return (
    <div>
      <PageHeading title="Create Project" subtitle="Launch a new initiative" />
      <div className="rounded-2xl border border-orange-500/30 bg-white/70 dark:bg-neutral-900/40 backdrop-blur p-4 md:p-6">
        <SmartCreateProjectForm onCreated={(p) => {/* eslint-disable-next-line no-console */ console.log('User created project', p)}} />
      </div>
    </div>
  )
}
