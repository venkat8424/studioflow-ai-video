import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { StatusBadge } from '../components/StatusBadge'
import { InlineVideoPlayer } from '../components/VideoPlayer'
import { sampleReviews } from '../data/sampleReviews'
import type { ReviewGeneration } from '../data/sampleReviews'
import type { ReviewStatus } from '../types/generation'

const reviewFilters = [
  { status: 'unreviewed', label: 'To Review' },
  { status: 'approved', label: 'Approved' },
  { status: 'rejected', label: 'Rejected' },
] as const
const commentLimit = 2000
const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

type ReviewDecision = Exclude<ReviewStatus, 'unreviewed'>

interface ReviewSubmission {
  review_status: ReviewDecision
  comments: string | null
}

interface ReviewPageProps {
  isActive: boolean
  generations?: readonly ReviewGeneration[]
  submitReview?: (generationId: string, review: ReviewSubmission) => Promise<unknown>
}

type SubmissionState =
  | { id: string; phase: 'saving'; decision: ReviewDecision }
  | { id: string; phase: 'error'; message: string }

function submitPreviewReview(): Promise<never> {
  return Promise.reject(new Error('Review submission is unavailable in this preview.'))
}

interface QueueCardProps {
  generation: ReviewGeneration
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
      <span className="relative block aspect-video overflow-hidden rounded-control bg-background">
        <img src={generation.thumbnail} alt="" className="size-full object-cover" />
        <span className="absolute right-1 bottom-1 rounded bg-background/90 px-1.5 text-supporting font-semibold tabular-nums">
          <span className="sr-only">Duration </span>
          0:{String(generation.duration).padStart(2, '0')}
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

function GenerationMetadata({ generation }: { generation: ReviewGeneration }) {
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

export function ReviewPage({
  isActive, generations = sampleReviews, submitReview = submitPreviewReview,
}: ReviewPageProps) {
  const [filter, setFilter] = useState<ReviewStatus>('unreviewed')
  const [project, setProject] = useState('')
  const [selection, setSelection] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [submission, setSubmission] = useState<SubmissionState | null>(null)
  const submissionPending = useRef(false)

  const projectNames = [...new Set(generations.map(({ project_name }) => project_name))].sort()
  const projectGenerations = generations.filter((generation) => !project || generation.project_name === project)
  const queue = projectGenerations.filter((generation) => generation.review_status === filter)
  const selected = queue.find(({ generation_id }) => generation_id === selection) ?? queue[0]
  const comments = selected ? drafts[selected.generation_id] ?? selected.review_comments ?? '' : ''
  const selectedSubmission = submission?.id === selected?.generation_id ? submission : null
  const actionsDisabled = selected?.status !== 'completed' || submission?.phase === 'saving'
    || comments.length > commentLimit

  function updateFilters(nextFilter: ReviewStatus, nextProject: string) {
    const nextQueue = generations.filter((generation) => generation.review_status === nextFilter
      && (!nextProject || generation.project_name === nextProject))
    const nextSelection = nextQueue.find(({ generation_id }) => generation_id === selected?.generation_id)
      ?? nextQueue[0]
    setFilter(nextFilter)
    setProject(nextProject)
    setSelection(nextSelection?.generation_id ?? null)
  }

  async function handleReview(decision: ReviewDecision) {
    if (!selected || actionsDisabled || submissionPending.current) return

    const id = selected.generation_id
    submissionPending.current = true
    setSubmission({ id, phase: 'saving', decision })
    try {
      await submitReview(id, { review_status: decision, comments: comments.trim() ? comments : null })
      setSubmission(null)
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
          <p className="mt-(--space-1) text-supporting text-text-muted">Sample generations</p>
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

      <div className="grid min-w-0 gap-(--space-4) lg:grid-cols-[minmax(0,2fr)_minmax(0,4.6fr)] lg:gap-0">
        <div className="min-w-0 border-b border-border-subtle pb-(--space-4) lg:border-r lg:border-b-0 lg:pr-(--space-4) lg:pb-0">
          <ul aria-label="Generations to review" className="grid max-h-80 content-start gap-(--space-2) overflow-y-auto p-1 lg:max-h-125">
            {queue.map((generation) => (
              <li key={generation.generation_id}>
                <QueueCard
                  generation={generation}
                  selected={generation === selected}
                  onSelect={() => setSelection(generation.generation_id)}
                />
              </li>
            ))}
          </ul>
          {!queue.length && <p role="status" className="px-(--space-2) text-text-secondary">No generations match these filters.</p>}
        </div>

        <section id="review-details" aria-label="Selected generation" className="min-w-0 lg:pl-(--space-4)">
          {selected && (
            <div className="grid min-w-0 gap-(--space-5)">
              <div className="grid min-w-0 items-start gap-(--space-4) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                {isActive && (selected.video ? (
                  <InlineVideoPlayer key={selected.generation_id} src={selected.video} poster={selected.thumbnail} label={`${selected.shot_name} video`} />
                ) : (
                  <p className="grid aspect-video place-items-center rounded-control bg-background p-(--space-4) text-center text-text-secondary">
                    Video preview is unavailable.
                  </p>
                ))}
                <GenerationMetadata generation={selected} />
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
                    readOnly={selected.status !== 'completed' || selectedSubmission?.phase === 'saving'}
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
                  {selected.status !== 'completed' && (
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
