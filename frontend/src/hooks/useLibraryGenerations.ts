import { useCallback, useEffect, useRef, useState } from 'react'
import { getGenerationStatus, listGenerations } from '../api/generations'
import type { GenerationResponse, ReviewResponse } from '../types/generation'

const pollDelay = 5000

export interface GenerationCatalog {
  generations: GenerationResponse[]
  hasLoaded: boolean
  isLoading: boolean
  error: string | null
  retry: () => void
}

export function useLibraryGenerations(isActive: boolean, shouldPoll: boolean) {
  const [generations, setGenerations] = useState<GenerationResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const reviewRevision = useRef(0)

  useEffect(() => {
    if (!isActive) return

    const controller = new AbortController()
    const { signal } = controller
    let timer: number | undefined

    function schedule(activeJobs: readonly GenerationResponse[]) {
      if (shouldPoll && activeJobs.length && !signal.aborted) {
        timer = window.setTimeout(() => { void refresh(activeJobs) }, pollDelay)
      }
    }

    async function refresh(activeJobs: readonly GenerationResponse[] = []) {
      const revision = reviewRevision.current
      try {
        // The list reads SQLite. Checking each task updates its stored status from Runway.
        const checks = await Promise.allSettled(
          activeJobs.map((job) => getGenerationStatus(job.generation_id, signal)),
        )
        if (signal.aborted || revision !== reviewRevision.current) return

        const records = await listGenerations(signal)
        if (signal.aborted || revision !== reviewRevision.current) return

        setGenerations(records)
        setError(checks.some((check) => check.status === 'rejected')
          ? 'Some generation statuses could not be refreshed. The Library is showing the last saved statuses.'
          : null)
        schedule(records.filter(({ status }) => status === 'pending' || status === 'processing'))
      } catch (cause) {
        if (signal.aborted || revision !== reviewRevision.current) return

        setError(cause instanceof Error ? cause.message : 'Could not load generation records.')
        schedule(activeJobs)
      }
    }

    void refresh()
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [isActive, loadAttempt, shouldPoll])

  const retry = useCallback(() => {
    setError(null)
    setLoadAttempt((attempt) => attempt + 1)
  }, [])

  function applyReview(review: ReviewResponse) {
    reviewRevision.current += 1
    setGenerations((records) => records?.map((generation) => generation.generation_id === review.generation_id
      ? { ...generation, review_status: review.review_status, review_comments: review.comments ?? null }
      : generation) ?? null)
    retry()
  }

  return {
    generations: generations ?? [],
    hasLoaded: generations !== null,
    isLoading: generations === null && error === null,
    error,
    retry,
    applyReview,
  }
}
