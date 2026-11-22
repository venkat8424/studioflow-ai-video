import type { Ref } from 'react'
import { generationStatuses, reviewStatuses } from '../types/generation'
import type { LibraryView } from '../types/generation'

export interface LibraryFilters {
  search: string
  project: string
  generationStatus: string
  reviewStatus: string
}

interface LibraryToolbarProps {
  filters: LibraryFilters
  projects: readonly string[]
  view: LibraryView
  searchRef: Ref<HTMLInputElement>
  onFilterChange: (field: keyof LibraryFilters, value: string) => void
  onViewChange: (view: LibraryView) => void
}

interface LibrarySelectProps {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}

const fieldClass = 'min-h-11 w-full min-w-0 rounded-control border border-border bg-input text-body text-text-primary'
const pageSizes = [3, 6, 12]
const viewIcons = {
  grid: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
  list: 'M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01',
}

function selectOptions(values: readonly string[], allLabel: string) {
  return [
    { value: '', label: allLabel },
    ...values.map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) })),
  ]
}

function LibrarySelect({ label, value, options, onChange }: LibrarySelectProps) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass + ' cursor-pointer appearance-none py-1 pr-(--space-6) pl-(--space-3)'}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="pointer-events-none absolute top-1/2 right-(--space-3) size-4 -translate-y-1/2 text-text-secondary">
        <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  )
}

export function LibraryToolbar({
  filters, projects, view, searchRef, onFilterChange, onViewChange,
}: LibraryToolbarProps) {
  return (
    <div className="mb-(--space-5) grid grid-cols-1 gap-(--space-3) sm:grid-cols-2 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:grid-cols-[minmax(0,2.4fr)_repeat(3,minmax(0,1fr))_auto]">
      <label className="relative block min-w-0 sm:col-span-2 md:col-span-4 lg:col-span-1">
        <span className="sr-only">Search by project or shot name</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute top-1/2 left-(--space-3) size-5 -translate-y-1/2 text-text-secondary">
          <path d="m21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <input
          ref={searchRef}
          type="search"
          value={filters.search}
          onChange={(event) => onFilterChange('search', event.target.value)}
          placeholder="Search by project or shot name..."
          className={fieldClass + ' pr-(--space-3) pl-10 placeholder:text-text-secondary'}
        />
      </label>
      <LibrarySelect
        label="Project"
        value={filters.project}
        options={selectOptions(projects, 'All Projects')}
        onChange={(value) => onFilterChange('project', value)}
      />
      <LibrarySelect
        label="Generation status"
        value={filters.generationStatus}
        options={selectOptions(generationStatuses, 'All Statuses')}
        onChange={(value) => onFilterChange('generationStatus', value)}
      />
      <LibrarySelect
        label="Review status"
        value={filters.reviewStatus}
        options={selectOptions(reviewStatuses, 'All Reviews')}
        onChange={(value) => onFilterChange('reviewStatus', value)}
      />
      <div role="group" aria-label="Library view" className="inline-flex self-start justify-self-start rounded-control border border-border-subtle bg-background/30">
        {(['grid', 'list'] as const).map((option) => {
          const label = option === 'grid' ? 'Grid view' : 'List view'
          return (
            <button
              key={option}
              type="button"
              aria-label={label}
              aria-pressed={view === option}
              title={label}
              onClick={() => onViewChange(option)}
              className="grid size-11 cursor-pointer place-items-center rounded-control text-text-secondary hover:bg-surface-elevated aria-pressed:bg-primary aria-pressed:text-text-primary"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5">
                <path d={viewIcons[option]} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface LibraryPaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const pageButtonClass = 'grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-control text-button text-text-secondary hover:bg-surface-elevated disabled:cursor-default disabled:opacity-45 disabled:hover:bg-transparent'

export function LibraryPagination({
  page, pageSize, total, onPageChange, onPageSizeChange,
}: LibraryPaginationProps) {
  const pageCount = Math.ceil(total / pageSize)
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)
  const itemName = total === 1 ? 'generation' : 'generations'

  return (
    <div className="mt-(--space-4) grid items-center gap-(--space-3) border-t border-border-subtle pt-(--space-3) md:grid-cols-[1fr_auto_1fr]">
      <p role="status" className="text-supporting text-text-secondary tabular-nums">
        {total > 0 ? `Showing ${first}–${last} of ${total} ${itemName}` : 'Showing 0 of 0 generations'}
      </p>
      <nav aria-label="Library pagination" className="flex flex-wrap gap-(--space-1)">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={pageButtonClass + ' border border-border-subtle'}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4">
            <path d="m10 4-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {Array.from({ length: pageCount }, (_, index) => {
          const pageNumber = index + 1
          return (
            <button
              key={pageNumber}
              type="button"
              aria-label={`Page ${pageNumber}`}
              aria-current={page === pageNumber ? 'page' : undefined}
              onClick={() => onPageChange(pageNumber)}
              className={pageButtonClass + ' aria-[current=page]:bg-primary aria-[current=page]:text-text-primary'}
            >
              {pageNumber}
            </button>
          )
        })}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className={pageButtonClass + ' border border-border-subtle'}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4">
            <path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </nav>
      <div className="w-32 md:justify-self-end">
        <LibrarySelect
          label="Generations per page"
          value={String(pageSize)}
          options={pageSizes.map((size) => ({ value: String(size), label: `${size} per page` }))}
          onChange={(value) => onPageSizeChange(Number(value))}
        />
      </div>
    </div>
  )
}
