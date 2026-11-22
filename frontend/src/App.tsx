import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { GenerationForm } from './components/GenerationForm'
import { NavigationTabs } from './components/NavigationTabs'
import { LibraryPage } from './pages/LibraryPage'
import { ReviewPage } from './pages/ReviewPage'

const workspaceTabs = [
  {
    id: 'create',
    label: 'Create',
  },
  {
    id: 'library',
    label: 'Library',
  },
  {
    id: 'review',
    label: 'Review',
  },
]

function App() {
  const [activeTab, setActiveTab] = useState('create')

  function openCreateTab() {
    setActiveTab('create')
    requestAnimationFrame(() => document.getElementById('panel-create')?.focus())
  }

  return (
    <div className="min-h-svh px-(--space-4) py-(--space-4) md:px-(--space-5) lg:px-(--space-6) lg:py-(--space-5)">
      <div className="mx-auto grid max-w-(--content-width) gap-(--space-5)">
        <AppHeader />
        <NavigationTabs tabs={workspaceTabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="w-full min-w-0">
          {workspaceTabs.map(({ id }) => (
            <section
              key={id}
              id={'panel-' + id}
              role="tabpanel"
              aria-labelledby={'tab-' + id}
              hidden={activeTab !== id}
              tabIndex={0}
              className={'rounded-panel border border-border-subtle bg-surface px-(--space-4) py-(--space-5) shadow-card md:px-(--space-5)' + (id === 'create' ? ' mx-auto max-w-(--create-width)' : '')}
            >
              {id === 'library' ? (
                <LibraryPage onCreateShot={openCreateTab} isActive={activeTab === id} />
              ) : id === 'review' ? (
                <ReviewPage isActive={activeTab === id} />
              ) : (
                <>
                  <h2 className="text-page-title font-semibold">Create a new shot</h2>
                  <GenerationForm />
                </>
              )}
            </section>
          ))}
        </main>
      </div>
    </div>
  )
}

export default App
