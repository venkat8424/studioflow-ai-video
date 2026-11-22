import { generationStatuses, reviewStatuses } from '../types/generation'
import type {
  GenerationAcceptedResponse,
  GenerationListResponse,
  GenerationRequest,
  GenerationResponse,
  GenerationStatusResponse,
} from '../types/generation'

const requestFieldLabels: Record<keyof GenerationRequest, string> = {
  project_name: 'Project',
  shot_name: 'Shot name',
  prompt_text: 'Creative prompt',
  reference_image_url: 'Reference image URL',
  ratio: 'Aspect ratio',
  duration: 'Duration',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getErrorMessage(status: number, body: unknown): string {
  const detail = isRecord(body) ? body.detail : undefined
  if (typeof detail === 'string' && detail.trim()) return detail

  if (status === 422 && Array.isArray(detail)) {
    const messages = detail.flatMap((issue: unknown) => {
      if (!isRecord(issue) || typeof issue.msg !== 'string') return []
      const field: unknown = Array.isArray(issue.loc) ? issue.loc[1] : undefined
      const label = typeof field === 'string' && Object.hasOwn(requestFieldLabels, field)
        ? requestFieldLabels[field as keyof GenerationRequest]
        : null
      return [label ? `${label}: ${issue.msg}` : issue.msg]
    })
    if (messages.length) return messages.join('. ')
  }

  if (status === 400 || status === 422) return 'Check the generation form and try again.'
  if (status === 429) return 'Too many requests. Wait before submitting again.'
  if (status === 503) return 'The generation service is unavailable. Check that FastAPI is running.'
  return `Could not confirm the generation request (HTTP ${status}).`
}

function isAcceptedResponse(body: unknown): body is GenerationAcceptedResponse {
  return isRecord(body)
    && typeof body.generation_id === 'string'
    && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(body.generation_id)
    && generationStatuses.some((status) => status === body.status)
    && typeof body.created_at === 'string'
    && Number.isFinite(Date.parse(body.created_at))
}

export async function submitGeneration(request: GenerationRequest): Promise<GenerationAcceptedResponse> {
  let response: Response
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(request),
    })
  } catch {
    throw new Error('Could not reach the generation API. Check your connection before submitting again.')
  }

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) throw new Error(getErrorMessage(response.status, body))
  if (!isAcceptedResponse(body)) {
    throw new Error('The generation API returned an unexpected response. Submission could not be confirmed.')
  }
  return body
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || value === null || typeof value === 'string'
}

function isStatusResponse(body: unknown): body is GenerationStatusResponse {
  return isRecord(body)
    && isAcceptedResponse(body)
    && isOptionalString(body.output_url)
    && isOptionalString(body.error_message)
}

function isGenerationResponse(body: unknown): body is GenerationResponse {
  return isRecord(body)
    && isStatusResponse(body)
    && typeof body.project_name === 'string'
    && typeof body.shot_name === 'string'
    && typeof body.prompt_text === 'string'
    && typeof body.reference_image_url === 'string'
    && typeof body.ratio === 'string'
    && Number.isInteger(body.duration)
    && reviewStatuses.some((status) => status === body.review_status)
    && isOptionalString(body.completed_at)
}

function isListResponse(body: unknown): body is GenerationListResponse {
  return isRecord(body)
    && Array.isArray(body.generations)
    && body.generations.every(isGenerationResponse)
    && typeof body.total === 'number'
    && Number.isInteger(body.total)
    && body.total >= 0
}

async function readGenerationApi(path: string, signal: AbortSignal): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(path, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal,
    })
  } catch (error) {
    if (signal.aborted) throw error
    throw new Error('Could not reach the generation API. Check that the backend is running.', { cause: error })
  }

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = isRecord(body) ? body.detail : undefined
    throw new Error(typeof detail === 'string' && detail.trim()
      ? detail
      : `Could not load generation records (HTTP ${response.status}).`)
  }
  return body
}

export async function listGenerations(signal: AbortSignal): Promise<GenerationResponse[]> {
  const generations = new Map<string, GenerationResponse>()
  const limit = 100
  let offset = 0

  while (true) {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    const body = await readGenerationApi('/api/generations?' + params, signal)
    if (!isListResponse(body)) {
      throw new Error('The generation API returned an unexpected list response.')
    }

    for (const generation of body.generations) {
      generations.set(generation.generation_id, generation)
    }
    offset += body.generations.length
    if (body.generations.length === 0 || offset >= body.total) {
      return [...generations.values()]
    }
  }
}

export async function getGenerationStatus(id: string, signal: AbortSignal): Promise<GenerationStatusResponse> {
  const body = await readGenerationApi('/api/generations/' + encodeURIComponent(id), signal)
  if (!isStatusResponse(body)) {
    throw new Error('The generation API returned an unexpected status response.')
  }
  return body
}
