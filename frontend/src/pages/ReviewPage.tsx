import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { getGenerationStatus, submitGenerationReview } from '../api/generations'
import { StatusBadge } from '../components/StatusBadge'
import { InlineVideoPlayer } from '../components/VideoPlayer'
import type { GenerationCatalog } from '../hooks/useLibraryGenerations'
import type { GenerationResponse, GenerationStatusResponse, ReviewRequest, ReviewResponse, ReviewStatus } from '../types/generation'

const reviewFilters = [
  { status: 'unreviewed', label: 'To Review' },
  { status: 'approved', label: 'Approved' },
  { status: 'rejected', label: 'Rejected' },
] as const
const commentLimit = 2000
const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

type ReviewDecision = Exclude<ReviewStatus, 'unreviewed'>

interface ReviewPageProps {
  isActive: boolean
  catalog: GenerationCatalog
  onReviewSaved: (review: ReviewResponse) => void
}

type SubmissionState =
  | { id: string; phase: 'saving'; decision: ReviewDecision }
  | { id: string; phase: 'saved' }
  | { id: string; phase: 'error'; message: string }

type DetailState =
  | { id: string; attempt: number; data: GenerationStatusResponse }
  | { id: string; attempt: number; error: string }

interface QueueCardProps {
  generation: GenerationResponse
  selected: boolean
  onSelect: () => void
}

function QueueCard({ generation, selected, onSelect }: QueueCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-controls="review-details"
      onClick={onSelect}
      className="grid w-full cursor-pointer grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-(--space-3) rounded-card border border-transparent bg-background/30 p-(--space-2) text-left hover:bg-surface-elevated aria-pressed:border-primary-hover aria-pressed:bg-primary/15"
    >
      <span className="relative grid aspect-video place-items-center overflow-hidden rounded-control bg-background">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-6 text-text-muted">
          <path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm0 0 2-5h16l-2 5M9 3 7 8m8-5-2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <img
          key={generation.reference_image_url}
          src={generation.reference_image_url}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => { event.currentTarget.hidden = true }}
          className="absolute inset-0 size-full object-cover"
        />
        <span className="absolute right-1 bottom-1 rounded bg-background/90 px-1.5 text-supporting font-semibold tabular-nums">
          <span className="sr-only">Duration </span>
          {Math.floor(generation.duration / 60)}:{String(generation.duration % 60).padStart(2, '0')}
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-body leading-tight font-semibold wrap-anywhere">{generation.shot_name}</span>
        <span className="mt-0.5 block text-supporting wrap-anywhere text-text-secondary">{generation.project_name}</span>
        <span className="mt-(--space-2) flex flex-wrap gap-1">
          <StatusBadge status={generation.status} />
          <StatusBadge status={generation.review_status} />
        </span>
      </span>
    </button>
  )
}

function MetadataItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-start gap-(--space-3)">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="min-w-0 wrap-anywhere">{children}</dd>
    </div>
  )
}

function GenerationMetadata({ generation }: { generation: GenerationResponse }) {
  const aspectRatio = generation.ratio === '1280:720' ? '16:9 (1280 × 720)' : generation.ratio

  return (
    <div className="min-w-0">
      <h3 className="text-section-heading font-semibold wrap-anywhere">{generation.shot_name}</h3>
      <p className="mt-0.5 text-text-secondary">{generation.project_name}</p>
      <dl className="mt-(--space-4) grid gap-(--space-2) text-supporting">
        <MetadataItem label="Generation ID">{generation.generation_id}</MetadataItem>
        <MetadataItem label="Aspect ratio">{aspectRatio}</MetadataItem>
        <MetadataItem label="Duration">{generation.duration} seconds</MetadataItem>
        <MetadataItem label="Generation status"><StatusBadge status={generation.status} /></MetadataItem>
        <MetadataItem label="Review status"><StatusBadge status={generation.review_status} /></MetadataItem>
        <MetadataItem label="Created">
          <time dateTime={generation.created_at}>{dateFormat.format(new Date(generation.created_at))}</time>
        </MetadataItem>
      </dl>
    </div>
  )
}

function ReviewError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mb-(--space-4) flex flex-wrap items-center justify-between gap-(--space-3) rounded-control border border-error/40 bg-error/5 p-(--space-3)">
      <p role="alert" className="text-error">{message}</p>
      <button type="button" onClick={onRetry} className="min-h-11 cursor-pointer rounded-control border border-border px-(--space-3) text-button hover:bg-surface-elevated">
        Retry
      </button>
    </div>
  )
}

export function ReviewPage({ isActive, catalog, onReviewSaved }: ReviewPageProps) {
  const { generations, hasLoaded, isLoading, error, retry } = catalog
  const [{ filter, project: selectedProject, selection }, setView] = useState<{
    filter: ReviewStatus; project: string; selection: string | null
  }>({ filter: 'unreviewed', project: '', selection: null })
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [submission, setSubmission] = useState<SubmissionState | null>(null)
  const [detail, setDetail] = useState<DetailState | null>(null)
  const [detailAttempt, setDetailAttempt] = useState(0)
  const submissionPending = useRef(false)

  const completedGenerations = generations.filter(({ status }) => status === 'completed')
  const projectNames = [...new Set(completedGenerations.map(({ project_name }) => project_name))].sort()
  const project = projectNames.includes(selectedProject) ? selectedProject : ''
  const projectGenerations = completedGenerations.filter((generation) => !project || generation.project_name === project)
  const queue = projectGenerations.filter((generation) => generation.review_status === filter)
  const selected = queue.find(({ generation_id }) => generation_id === selection) ?? queue[0]
  const selectedId = selected?.generation_id
  const selectedDetail = detail && detail.id === selectedId && detail.attempt === detailAttempt ? detail : null
  const liveGeneration = selectedDetail && 'data' in selectedDetail ? selectedDetail.data : null
  const videoUrl = liveGeneration ? liveGeneration.output_url : selected?.output_url
  const draft = selectedId ? drafts[selectedId] : undefined
  const comments = draft ?? selected?.review_comments ?? ''
  const selectedSubmission = submission?.id === selectedId ? submission : null
  const isCompleted = selected?.status === 'completed' && (!liveGeneration || liveGeneration.status === 'completed')
  const actionsDisabled = !isCompleted || !selectedDetail || submission?.phase === 'saving'
    || comments.length > commentLimit

  useEffect(() => {
    if (!isActive || !selectedId) return
    const controller = new AbortController()
    const { signal } = controller
    void getGenerationStatus(selectedId, signal).then((data) => {
      if (signal.aborted) return
      setDetail({ id: selectedId, attempt: detailAttempt, data })
      if (data.status !== 'completed') retry()
    }, (cause: unknown) => {
      if (signal.aborted) return
      setDetail({
        id: selectedId,
        attempt: detailAttempt,
        error: cause instanceof Error ? cause.message : 'Could not load the generation details.',
      })
    })
    return () => controller.abort()
  }, [isActive, selectedId, detailAttempt, retry])

  function updateFilters(nextFilter: ReviewStatus, nextProject: string) {
    const nextQueue = completedGenerations.filter((generation) => generation.review_status === nextFilter
      && (!nextProject || generation.project_name === nextProject))
    const nextSelection = nextQueue.find(({ generation_id }) => generation_id === selected?.generation_id)
      ?? nextQueue[0]
    setView({ filter: nextFilter, project: nextProject, selection: nextSelection?.generation_id ?? null })
  }

  async function handleReview(decision: ReviewDecision) {
    if (!selected || actionsDisabled || submissionPending.current) return

    const id = selected.generation_id
    submissionPending.current = true
    setView((current) => ({ ...current, selection: id }))
    setSubmission({ id, phase: 'saving', decision })
    try {
      const request: ReviewRequest = { review_status: decision }
      if (draft !== undefined) request.comments = draft.trim() ? draft : null
      const saved = await submitGenerationReview(id, request)
      onReviewSaved(saved)
      setDrafts((current) => {
        const remaining = { ...current }
        delete remaining[id]
        return remaining
      })
      setView((current) => current.selection === id ? { ...current, filter: saved.review_status } : current)
      setSubmission({ id, phase: 'saved' })
    } catch (error) {
      setSubmission({
        id,
        phase: 'error',
        message: error instanceof Error ? error.message : 'Unable to save the review.',
      })
    } finally {
      submissionPending.current = false
    }
  }

  return (
    <>
      <header className="mb-(--space-4) grid gap-(--space-4) border-b border-border-subtle pb-(--space-4) lg:flex lg:items-start lg:justify-between">
        <div>
          <h2 className="text-page-title font-semibold">Review Queue</h2>
          <p className="mt-(--space-1) text-text-secondary">Review and approve your generated videos</p>
        </div>

        <div className="grid min-w-0 gap-(--space-3) sm:flex sm:items-center">
          <div role="group" aria-label="Review status" className="grid grid-cols-3 rounded-control border border-border bg-background/30 p-0.5">
            {reviewFilters.map(({ status, label }) => (
              <button
                key={status}
                type="button"
                aria-pressed={filter === status}
                onClick={() => updateFilters(status, project)}
                className="min-h-11 cursor-pointer rounded-control px-(--space-2) text-supporting font-semibold text-text-secondary hover:bg-surface-elevated aria-pressed:bg-primary aria-pressed:text-text-primary sm:px-(--space-3) sm:text-button"
              >
                {label} ({projectGenerations.filter((generation) => generation.review_status === status).length})
              </button>
            ))}
          </div>
          <label className="relative block min-w-0 sm:min-w-36">
            <span className="sr-only">Filter by project</span>
            <select
              value={project}
              onChange={(event) => updateFilters(filter, event.target.value)}
              className="min-h-11 w-full cursor-pointer appearance-none rounded-control border border-border bg-input pr-(--space-6) pl-(--space-3)"
            >
              <option value="">All Projects</option>
              {projectNames.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="pointer-events-none absolute top-1/2 right-(--space-3) size-4 -translate-y-1/2 text-text-secondary">
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
        </div>
      </header>

      {error && <ReviewError message={error} onRetry={retry} />}
      <div className="grid min-w-0 gap-(--space-4) lg:grid-cols-[minmax(0,2fr)_minmax(0,4.6fr)] lg:gap-0">
        <div className="min-w-0 border-b border-border-subtle pb-(--space-4) lg:border-r lg:border-b-0 lg:pr-(--space-4) lg:pb-0">
          <ul aria-label="Generations to review" className="grid max-h-80 content-start gap-(--space-2) overflow-y-auto p-1 lg:max-h-125">
            {queue.map((generation) => (
              <li key={generation.generation_id}>
                <QueueCard
                  generation={generation}
                  selected={generation === selected}
                  onSelect={() => setView((current) => ({ ...current, selection: generation.generation_id }))}
                />
              </li>
            ))}
          </ul>
          {isLoading && <p role="status" className="px-(--space-2) text-text-secondary">Loading generations...</p>}
          {hasLoaded && !queue.length && (
            <p role="status" className="px-(--space-2) text-text-secondary">
              {completedGenerations.length ? 'No generations match these filters.' : 'Completed generations will appear here.'}
            </p>
          )}
        </div>

        <section id="review-details" aria-label="Selected generation" className="min-w-0 lg:pl-(--space-4)">
          {selected && (
            <div className="grid min-w-0 gap-(--space-5)">
              {selectedDetail && 'error' in selectedDetail && (
                <ReviewError message={selectedDetail.error} onRetry={() => setDetailAttempt((attempt) => attempt + 1)} />
              )}
              <div className="grid min-w-0 items-start gap-(--space-4) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                {isActive && (selectedDetail && videoUrl && isCompleted ? (
                  <InlineVideoPlayer key={selected.generation_id + videoUrl} src={videoUrl} label={`${selected.shot_name} video`} />
                ) : (
                  <p role="status" className="grid aspect-video place-items-center rounded-control bg-background p-(--space-4) text-center text-text-secondary">
                    {selectedDetail ? 'Video preview is unavailable.' : 'Loading video details...'}
                  </p>
                ))}
                <GenerationMetadata generation={liveGeneration ? { ...selected, status: liveGeneration.status } : selected} />
              </div>

              <div>
                <h4 className="mb-(--space-2) font-semibold">Creative Prompt</h4>
                <p className="rounded-control border border-border bg-surface-elevated p-(--space-3) whitespace-pre-wrap wrap-anywhere">
                  {selected.prompt_text}
                </p>
              </div>

              <div>
                <label htmlFor="review-comments" className="mb-(--space-2) block font-semibold">
                  Review Comments <span className="font-normal text-text-secondary">(Optional)</span>
                </label>
                <div className="rounded-control border border-border bg-surface-elevated focus-within:border-primary-hover">
                  <textarea
                    id="review-comments"
                    value={comments}
                    onChange={(event) => {
                      const value = event.currentTarget.value
                      setDrafts((current) => ({ ...current, [selected.generation_id]: value }))
                    }}
                    maxLength={commentLimit}
                    readOnly={!isCompleted || selectedSubmission?.phase === 'saving'}
                    placeholder="Add your review feedback..."
                    aria-describedby="review-comment-count"
                    className="block min-h-20 w-full resize-y rounded-control px-(--space-3) py-(--space-2) placeholder:text-text-muted focus-visible:-outline-offset-2"
                  />
                  <p id="review-comment-count" className="px-(--space-3) pb-(--space-2) text-right text-supporting text-text-muted">
                    {comments.length} / {commentLimit}
                  </p>
                </div>
              </div>

              <div>
                <div aria-busy={selectedSubmission?.phase === 'saving'} className="flex flex-wrap justify-end gap-(--space-3)">
                  <button
                    type="button"
                    disabled={actionsDisabled}
                    onClick={() => { void handleReview('rejected') }}
                    className="inline-flex min-h-11 grow cursor-pointer items-center justify-center gap-2 rounded-control border border-error px-(--space-4) text-button font-semibold text-error enabled:hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-60 sm:grow-0"
                  >
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none">
                      <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    {selectedSubmission?.phase === 'saving' && selectedSubmission.decision === 'rejected' ? 'Saving review...' : 'Reject'}
                  </button>
                  <button
                    type="button"
                    disabled={actionsDisabled}
                    onClick={() => { void handleReview('approved') }}
                    className="inline-flex min-h-11 grow cursor-pointer items-center justify-center gap-2 rounded-control bg-primary px-(--space-4) text-button font-semibold text-text-primary enabled:hover:bg-[color-mix(in_srgb,var(--color-primary-hover)_40%,var(--color-primary))] enabled:active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-60 sm:grow-0"
                  >
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none">
                      <path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {selectedSubmission?.phase === 'saving' && selectedSubmission.decision === 'approved' ? 'Saving review...' : 'Approve'}
                  </button>
                </div>
                <div role="status">
                  {selectedSubmission?.phase === 'saving' && <span className="sr-only">Saving review...</span>}
                  {selectedSubmission?.phase === 'saved' && (
                    <p className="mt-(--space-2) text-supporting text-success">Review saved successfully.</p>
                  )}
                  {!isCompleted && (
                    <p className="mt-(--space-2) text-supporting text-text-secondary">
                      Review is available after generation completes.
                    </p>
                  )}
                </div>
                {selectedSubmission?.phase === 'error' && (
                  <p role="alert" className="mt-(--space-2) text-supporting text-error">{selectedSubmission.message}</p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
