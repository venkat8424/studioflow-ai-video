import { GenerationCard } from '../components/GenerationCard'
import { sampleGenerations } from '../data/sampleGenerations'
import type { LibraryGeneration } from '../types/generation'

interface LibraryPageProps {
  onCreateShot: () => void
  generations?: readonly LibraryGeneration[]
  isLoading?: boolean
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

function LibraryLoading() {
  return (
    <div role="status">
      <p className="sr-only">Loading generations...</p>
      <div aria-hidden="true" className={gridClass}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-card border border-border-subtle bg-background/30">
            <div className="aspect-[14/5] bg-surface-elevated motion-safe:animate-pulse" />
            <div className="grid gap-(--space-2) p-(--space-3) motion-safe:animate-pulse">
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

function LibraryEmpty({ onCreateShot }: Pick<LibraryPageProps, 'onCreateShot'>) {
  return (
    <div className="grid justify-items-center gap-(--space-3) rounded-card border border-dashed border-border px-(--space-4) py-(--space-7) text-center">
      <h3 className="text-section-heading font-semibold">No generations yet</h3>
      <p className="text-text-secondary">Create your first AI-generated video shot to get started.</p>
      <CreateShotButton onClick={onCreateShot} label="Create a shot" />
    </div>
  )
}

export function LibraryPage({
  onCreateShot,
  generations = sampleGenerations,
  isLoading = false,
}: LibraryPageProps) {
  return (
    <>
      <div className="mb-(--space-5) flex flex-col gap-(--space-4) border-b border-border-subtle pb-(--space-4) sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-page-title font-semibold">Generation Library</h2>
          <p className="mt-(--space-1) text-text-secondary">
            {generations === sampleGenerations ? 'Sample AI video generations' : 'All your AI video generations'}
          </p>
        </div>
        <CreateShotButton onClick={onCreateShot} label="Create New Shot" />
      </div>
      {isLoading ? <LibraryLoading /> : generations.length === 0 ? (
        <LibraryEmpty onCreateShot={onCreateShot} />
      ) : (
        <ul aria-label="Generations" className={gridClass}>
          {generations.map((generation) => (
            <li key={generation.generation_id}>
              <GenerationCard generation={generation} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
