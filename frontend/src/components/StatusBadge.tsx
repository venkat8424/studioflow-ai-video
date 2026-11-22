import type { GenerationStatus, ReviewStatus } from '../types/generation'

interface StatusBadgeProps {
  status: GenerationStatus | ReviewStatus
}

const statusStyle = {
  pending: 'bg-warning/15 text-warning',
  processing: 'bg-warning/15 text-warning',
  completed: 'bg-success/15 text-success',
  failed: 'bg-error/15 text-error',
  unreviewed: 'bg-input text-text-secondary',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-error/15 text-error',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const icon = {
    pending: 'M8 4v4l2.5 1.5M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z',
    processing: 'M8 2a6 6 0 1 1-6 6',
    completed: 'm5 8 2 2 4-4m3 2a6 6 0 1 1-3-5.2',
    failed: 'm4 4 8 8m0-8-8 8',
    unreviewed: null,
    approved: 'm3 8 3 3 7-7',
    rejected: 'm4 4 8 8m0-8-8 8',
  }[status]

  return (
    <span className={'inline-flex items-center gap-(--space-1) rounded-full px-(--space-2) py-0.5 text-supporting font-medium capitalize ' + statusStyle[status]}>
      {icon && (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-3 shrink-0">
          <path d={icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {status}
    </span>
  )
}
