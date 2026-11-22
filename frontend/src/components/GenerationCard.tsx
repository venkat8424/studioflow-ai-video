import { useState } from 'react'
import type { LibraryGeneration, LibraryView } from '../types/generation'
import { StatusBadge } from './StatusBadge'
import { VideoPlayer } from './VideoPlayer'

interface GenerationCardProps {
  generation: LibraryGeneration
  view?: LibraryView
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

function getVideoUrl({ status, output_url }: LibraryGeneration) {
  if (status !== 'completed' || !output_url || !URL.canParse(output_url)) return null

  const { protocol } = new URL(output_url)
  return protocol === 'https:' || protocol === 'http:' ? output_url : null
}

export function GenerationCard({ generation, view = 'grid' }: GenerationCardProps) {
  const {
    shot_name, project_name, duration, created_at, status, review_status, error_message,
  } = generation
  const [readyPreview, setReadyPreview] = useState<string | null>(null)
  const [failedPreview, setFailedPreview] = useState<string | null>(null)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const videoUrl = getVideoUrl(generation)
  const previewUrl = videoUrl === failedPreview ? null : videoUrl
  const seconds = duration % 60
  const runtime = Math.floor(duration / 60) + ':' + String(seconds).padStart(2, '0')
  const cardLayout = view === 'list' ? 'flex-row' : 'flex-col'
  const thumbnailLayout = view === 'list' ? 'min-h-24 w-20 shrink-0 sm:w-44 lg:w-56' : 'aspect-[14/5]'

  return (
    <article className={'flex h-full min-w-0 overflow-hidden rounded-card border border-border-subtle bg-background/30 ' + cardLayout}>
      <div className={'relative grid place-items-center overflow-hidden rounded-card bg-background ' + thumbnailLayout}>
        <ThumbnailPlaceholder status={status} />
        {status === 'completed' && !previewUrl && <span className="sr-only">Video preview unavailable</span>}
        {previewUrl && (
          <button
            type="button"
            aria-label={`Play ${shot_name} from ${project_name}`}
            aria-haspopup="dialog"
            onClick={(event) => {
              event.currentTarget.focus()
              setPlayingUrl(previewUrl)
            }}
            className="group absolute inset-0 grid cursor-pointer place-items-center focus-visible:-outline-offset-4"
          >
            <video
              key={previewUrl}
              src={previewUrl}
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
              onLoadedData={() => setReadyPreview(previewUrl)}
              onError={() => setFailedPreview(previewUrl)}
              className={'pointer-events-none absolute inset-0 size-full object-cover' + (readyPreview === previewUrl ? '' : ' opacity-0')}
            />
            <span className="relative grid size-11 place-items-center rounded-full border border-text-primary/35 bg-background/80 text-text-primary group-hover:bg-primary-active group-focus-visible:bg-primary-active">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path d="M6 4.2a.7.7 0 0 1 1.06-.6l9 5.8a.7.7 0 0 1 0 1.18l-9 5.8A.7.7 0 0 1 6 15.8z" />
              </svg>
            </span>
          </button>
        )}
        <span
          className="pointer-events-none absolute right-(--space-2) bottom-(--space-2) rounded-control bg-background/90 px-(--space-2) py-0.5 text-supporting font-semibold text-text-primary tabular-nums"
        >
          <span aria-hidden="true">{runtime}</span>
          <span className="sr-only">Duration {duration} seconds</span>
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-(--space-2) px-(--space-3) py-(--space-2)">
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
      {playingUrl && (
        <VideoPlayer
          src={playingUrl}
          shotName={shot_name}
          projectName={project_name}
          onClose={() => setPlayingUrl(null)}
        />
      )}
    </article>
  )
}
