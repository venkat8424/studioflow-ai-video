import { useRef } from 'react'
import type { KeyboardEvent } from 'react'

interface NavigationTab {
  id: string
  label: string
}

interface NavigationTabsProps {
  tabs: readonly NavigationTab[]
  activeTab: string
  onTabChange: (id: string) => void
}

export function NavigationTabs({ tabs, activeTab, onTabChange }: NavigationTabsProps) {
  const tabButtons = useRef<Array<HTMLButtonElement | null>>([])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number

    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = (index - 1 + tabs.length) % tabs.length
        break
      case 'ArrowRight':
        nextIndex = (index + 1) % tabs.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = tabs.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    onTabChange(tabs[nextIndex].id)
    tabButtons.current[nextIndex]?.focus()
  }

  return (
    <nav aria-label="Workspace navigation">
      <div
        role="tablist"
        aria-label="StudioFlow workspace"
        className="grid grid-flow-col auto-cols-fr gap-(--space-1) rounded-panel border border-border-subtle bg-surface/55 p-(--space-1)"
      >
        {tabs.map(({ id, label }, index) => {
          const isActive = id === activeTab

          return (
            <button
              key={id}
              ref={(button) => {
                tabButtons.current[index] = button
              }}
              type="button"
              role="tab"
              id={'tab-' + id}
              aria-controls={'panel-' + id}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className="min-h-11 rounded-control px-(--space-2) text-button font-semibold text-text-secondary hover:bg-surface-elevated aria-selected:bg-primary aria-selected:text-text-primary"
            >
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
