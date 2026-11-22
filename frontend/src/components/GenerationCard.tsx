import type { LibraryGeneration } from '../types/generation'
import { StatusBadge } from './StatusBadge'

interface GenerationCardProps {
  generation: LibraryGeneration
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

function ThumbnailPlaceholder({ status }: { status: LibraryGeneration['status'] }) {
  if (status === 'processing') {
    return (
      <span
        aria-hidden="true"
        className="size-7 rounded-full border-2 border-warning/25 border-t-warning motion-safe:animate-spin"
      />
    )
  }

  if (status === 'failed') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-7 text-error">
        <path d="M12 8v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-7 text-text-muted">
      <path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm0 0 2-5h16l-2 5M9 3 7 8m8-5-2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GenerationCard({ generation }: GenerationCardProps) {
  const {
    shot_name, project_name, duration, created_at, status, review_status, thumbnail, error_message,
  } = generation
  const seconds = duration % 60
  const runtime = Math.floor(duration / 60) + ':' + String(seconds).padStart(2, '0')

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-border-subtle bg-background/30">
      <div className="relative grid aspect-[14/5] place-items-center overflow-hidden rounded-card bg-background">
        {status === 'completed' && thumbnail ? (
          <img src={thumbnail} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
        ) : (
          <ThumbnailPlaceholder status={status} />
        )}
        <span
          className="absolute right-(--space-2) bottom-(--space-2) rounded-control bg-background/90 px-(--space-2) py-0.5 text-supporting font-semibold text-text-primary tabular-nums"
        >
          <span aria-hidden="true">{runtime}</span>
          <span className="sr-only">Duration {duration} seconds</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-(--space-2) px-(--space-3) py-(--space-2)">
        <div className="min-w-0">
          <h3 className="text-card-heading leading-tight font-semibold wrap-anywhere">{shot_name}</h3>
          <p className="mt-0.5 text-supporting wrap-anywhere text-text-secondary">{project_name}</p>
        </div>
        {status === 'failed' && (
          <p className="text-supporting text-error">{error_message || 'Video generation failed.'}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-(--space-3) gap-y-(--space-2)">
          <div className="flex flex-wrap gap-(--space-2)">
            <StatusBadge status={status} />
            <StatusBadge status={review_status} />
          </div>
          <time dateTime={created_at} className="text-supporting whitespace-nowrap text-text-muted">
            {dateFormat.format(new Date(created_at))}
          </time>
        </div>
      </div>
    </article>
  )
}
