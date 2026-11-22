export type GenerationRatio =
  | '1280:720'
  | '720:1280'
  | '1104:832'
  | '832:1104'
  | '960:960'
  | '1584:672'
  | '16:9'

export const generationStatuses = ['pending', 'processing', 'completed', 'failed'] as const
export type GenerationStatus = (typeof generationStatuses)[number]
export const reviewStatuses = ['unreviewed', 'approved', 'rejected'] as const
export type ReviewStatus = (typeof reviewStatuses)[number]
export type LibraryView = 'grid' | 'list'

export interface GenerationRequest {
  project_name: string
  shot_name: string
  prompt_text: string
  reference_image_url: string
  ratio?: GenerationRatio
  duration?: number
}

export interface GenerationAcceptedResponse {
  generation_id: string
  status: GenerationStatus
  created_at: string
}

export interface GenerationStatusResponse extends GenerationAcceptedResponse {
  output_url?: string | null
  error_message?: string | null
}

export interface GenerationResponse extends GenerationStatusResponse {
  project_name: string
  shot_name: string
  prompt_text: string
  reference_image_url: string
  ratio: string
  review_status: ReviewStatus
  duration: number
  completed_at?: string | null
}

export interface GenerationListResponse {
  generations: GenerationResponse[]
  total: number
}

export interface LibraryGeneration extends Pick<
  GenerationResponse,
  'generation_id' | 'status' | 'created_at' | 'project_name' | 'shot_name' | 'review_status' | 'duration' | 'error_message' | 'output_url'
> {
  thumbnail?: string
}
