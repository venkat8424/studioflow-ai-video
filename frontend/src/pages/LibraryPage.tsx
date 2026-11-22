import { useRef, useState } from 'react'
import { GenerationCard } from '../components/GenerationCard'
import { LibraryPagination, LibraryToolbar } from '../components/LibraryControls'
import type { LibraryFilters } from '../components/LibraryControls'
import { useLibraryGenerations } from '../hooks/useLibraryGenerations'
import type { LibraryView } from '../types/generation'

interface LibraryPageProps {
  onCreateShot: () => void
  isActive: boolean
}

interface CreateShotButtonProps {
  onClick: () => void
  label: string
}

function CreateShotButton({ onClick, label }: CreateShotButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-(--space-2) rounded-control bg-primary px-(--space-4) text-button font-semibold text-text-primary hover:bg-[color-mix(in_srgb,var(--color-primary-hover)_40%,var(--color-primary))] active:bg-primary-active"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
        <path d="m7 3 1.6 4.4L13 9l-4.4 1.6L7 15l-1.6-4.4L1 9l4.4-1.6L7 3Zm8 7 1 2.6 2.5.9-2.5 1L15 17l-.9-2.5-2.6-1 2.6-.9L15 10Z" />
      </svg>
      {label}
    </button>
  )
}

const gridClass = 'grid grid-cols-1 gap-(--space-4) md:grid-cols-2 lg:grid-cols-3'
const listClass = 'grid grid-cols-1 gap-(--space-3)'
const initialFilters: LibraryFilters = { search: '', project: '', generationStatus: '', reviewStatus: '' }

function LibraryLoading({ view }: { view: LibraryView }) {
  return (
    <div role="status">
      <p className="sr-only">Loading generations...</p>
      <div aria-hidden="true" className={view === 'grid' ? gridClass : listClass}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={'overflow-hidden rounded-card border border-border-subtle bg-background/30' + (view === 'list' ? ' flex' : '')}>
            <div className={'bg-surface-elevated motion-safe:animate-pulse ' + (view === 'grid' ? 'aspect-[14/5]' : 'min-h-24 w-20 shrink-0 sm:w-44 lg:w-56')} />
            <div className="grid flex-1 gap-(--space-2) p-(--space-3) motion-safe:animate-pulse">
              <div className="h-4 w-3/5 rounded bg-input" />
              <div className="h-3 w-2/5 rounded bg-input" />
              <div className="h-5 w-1/2 rounded-full bg-input" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LibraryEmptyProps {
  onCreateShot: () => void
  onClearFilters?: () => void
}

function LibraryEmpty({ onCreateShot, onClearFilters }: LibraryEmptyProps) {
  return (
    <div className="grid justify-items-center gap-(--space-3) rounded-card border border-dashed border-border px-(--space-4) py-(--space-7) text-center">
      <h3 className="text-section-heading font-semibold">
        {onClearFilters ? 'No matching generations' : 'No generations yet'}
      </h3>
      <p className="text-text-secondary">
        {onClearFilters ? 'Try a different search or clear your filters.' : 'Create your first AI-generated video shot to get started.'}
      </p>
      {onClearFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="min-h-11 cursor-pointer rounded-control border border-border px-(--space-4) text-button font-semibold hover:bg-surface-elevated"
        >
          Clear filters
        </button>
      ) : <CreateShotButton onClick={onCreateShot} label="Create a shot" />}
    </div>
  )
}

interface LibraryErrorProps {
  message: string
  onRetry: () => void
}

function LibraryError({ message, onRetry }: LibraryErrorProps) {
  return (
    <div className="mb-(--space-4) flex flex-wrap items-center justify-between gap-(--space-3) rounded-card border border-error/40 bg-error/5 p-(--space-4)">
      <p role="alert" className="text-error">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 cursor-pointer rounded-control border border-border px-(--space-4) text-button font-semibold hover:bg-surface-elevated"
      >
        Retry
      </button>
    </div>
  )
}

export function LibraryPage({ onCreateShot, isActive }: LibraryPageProps) {
  const { generations, hasLoaded, isLoading, error, retry } = useLibraryGenerations(isActive)
  const searchRef = useRef<HTMLInputElement>(null)
  const [filters, setFilters] = useState(initialFilters)
  const [view, setView] = useState<LibraryView>('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const projects = [...new Set(generations.map(({ project_name }) => project_name))]
    .sort((first, second) => first.localeCompare(second))
  const query = filters.search.trim().toLowerCase()
  const matches = generations.filter((generation) => (
    (!query || generation.project_name.toLowerCase().includes(query) || generation.shot_name.toLowerCase().includes(query))
    && (!filters.project || generation.project_name === filters.project)
    && (!filters.generationStatus || generation.status === filters.generationStatus)
    && (!filters.reviewStatus || generation.review_status === filters.reviewStatus)
  ))
  const currentPage = Math.min(page, Math.max(1, Math.ceil(matches.length / pageSize)))
  const start = (currentPage - 1) * pageSize
  const visibleGenerations = matches.slice(start, start + pageSize)

  function updateFilter(field: keyof LibraryFilters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }))
    setPage(1)
  }

  function clearFilters() {
    setFilters(initialFilters)
    setPage(1)
    searchRef.current?.focus()
  }

  return (
    <>
      <div className="mb-(--space-5) flex flex-col gap-(--space-4) border-b border-border-subtle pb-(--space-4) sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-page-title font-semibold">Generation Library</h2>
          <p className="mt-(--space-1) text-text-secondary">All your AI video generations</p>
        </div>
        <CreateShotButton onClick={onCreateShot} label="Create New Shot" />
      </div>
      <LibraryToolbar
        filters={filters}
        projects={projects}
        view={view}
        searchRef={searchRef}
        onFilterChange={updateFilter}
        onViewChange={setView}
      />
      {error && <LibraryError message={error} onRetry={retry} />}
      {isLoading && <LibraryLoading view={view} />}
      {hasLoaded && (matches.length === 0 ? (
        <LibraryEmpty
          onCreateShot={onCreateShot}
          onClearFilters={generations.length > 0 ? clearFilters : undefined}
        />
      ) : (
        <ul aria-label="Generations" className={view === 'grid' ? gridClass : listClass}>
          {visibleGenerations.map((generation) => (
            <li key={generation.generation_id}>
              <GenerationCard generation={generation} view={view} />
            </li>
          ))}
        </ul>
      ))}
      {hasLoaded && (
        <LibraryPagination
          page={currentPage}
          pageSize={pageSize}
          total={matches.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      )}
    </>
  )
}
