import { generationStatuses } from '../types/generation'
import type { GenerationAcceptedResponse, GenerationRequest } from '../types/generation'

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
