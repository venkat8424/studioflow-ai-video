import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { GenerationForm } from './components/GenerationForm'
import { NavigationTabs } from './components/NavigationTabs'

const workspaceTabs = [
  {
    id: 'create',
    label: 'Create',
    title: 'Create a new shot',
  },
  {
    id: 'library',
    label: 'Library',
    title: 'Library',
    message: 'The generation library is not implemented yet.',
  },
  {
    id: 'review',
    label: 'Review',
    title: 'Review',
    message: 'The review workflow is not implemented yet.',
  },
]

function App() {
  const [activeTab, setActiveTab] = useState('create')

  return (
    <div className="min-h-svh px-(--space-4) py-(--space-4) md:px-(--space-5) lg:px-(--space-6) lg:py-(--space-5)">
      <div className="mx-auto grid max-w-(--content-width) gap-(--space-5)">
        <AppHeader />
        <NavigationTabs tabs={workspaceTabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="mx-auto w-full max-w-(--create-width)">
          {workspaceTabs.map(({ id, title, message }) => (
            <section
              key={id}
              id={'panel-' + id}
              role="tabpanel"
              aria-labelledby={'tab-' + id}
              hidden={activeTab !== id}
              tabIndex={0}
              className="rounded-panel border border-border-subtle bg-surface px-(--space-4) py-(--space-5) shadow-card md:px-(--space-5)"
            >
              <h2 className="text-page-title font-semibold">{title}</h2>
              {id === 'create' ? (
                <GenerationForm />
              ) : (
                <p className="mt-(--space-2) text-text-secondary">{message}</p>
              )}
            </section>
          ))}
        </main>
      </div>
    </div>
  )
}

export default App
