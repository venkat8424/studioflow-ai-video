import { useEffect, useState } from 'react'
import { getGenerationStatus, listGenerations } from '../api/generations'
import type { GenerationResponse } from '../types/generation'

const pollDelay = 5000

export function useLibraryGenerations(isActive: boolean) {
  const [generations, setGenerations] = useState<GenerationResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const controller = new AbortController()
    const { signal } = controller
    let timer: number | undefined

    function schedule(activeJobs: readonly GenerationResponse[]) {
      if (activeJobs.length && !signal.aborted) {
        timer = window.setTimeout(() => { void refresh(activeJobs) }, pollDelay)
      }
    }

    async function refresh(activeJobs: readonly GenerationResponse[] = []) {
      try {
        // The list reads SQLite. Checking each task updates its stored status from Runway.
        const checks = await Promise.allSettled(
          activeJobs.map((job) => getGenerationStatus(job.generation_id, signal)),
        )
        if (signal.aborted) return

        const records = await listGenerations(signal)
        if (signal.aborted) return

        setGenerations(records)
        setError(checks.some((check) => check.status === 'rejected')
          ? 'Some generation statuses could not be refreshed. The Library is showing the last saved statuses.'
          : null)
        schedule(records.filter(({ status }) => status === 'pending' || status === 'processing'))
      } catch (cause) {
        if (signal.aborted) return

        setError(cause instanceof Error ? cause.message : 'Could not load generation records.')
        schedule(activeJobs)
      }
    }

    void refresh()
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [isActive, loadAttempt])

  function retry() {
    setError(null)
    setLoadAttempt((attempt) => attempt + 1)
  }

  return {
    generations: generations ?? [],
    hasLoaded: generations !== null,
    isLoading: generations === null && error === null,
    error,
    retry,
  }
}
