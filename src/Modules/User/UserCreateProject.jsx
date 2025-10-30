import React from 'react'
import SmartCreateProjectForm from '../../components/Forms/SmartCreateProjectForm'
import { PageHeading } from './components'

export default function UserCreateProject() {
  return (
    <div>
      <PageHeading title="Create Project" subtitle="Launch a new initiative" />
      <div className="rounded-2xl border border-orange-500/20 dark:border-orange-500/40 bg-white dark:bg-neutral-900 p-4 md:p-6">
        <SmartCreateProjectForm onCreated={(p) => {/* eslint-disable-next-line no-console */ console.log('User created project', p)}} />
      </div>
    </div>
  )
}
