import openingThumbnail from '../assets/library/opening-aerial.jpg'
import forestThumbnail from '../assets/library/forest-creek.jpg'
import cityThumbnail from '../assets/library/city-street.jpg'
import openingVideo from '../assets/review/opening-aerial.webm'
import forestVideo from '../assets/review/forest-creek.webm'
import cityVideo from '../assets/review/city-street.webm'
import type { GenerationResponse } from '../types/generation'

export interface ReviewGeneration extends Pick<
  GenerationResponse,
  'generation_id' | 'project_name' | 'shot_name' | 'status' | 'review_status' | 'ratio' | 'duration' | 'created_at' | 'prompt_text'
> {
  thumbnail: string
  video?: string
  review_comments?: string | null
}

const shots = {
  aerial: {
    shot_name: 'Opening Aerial',
    project_name: 'Project Aurora',
    prompt_text: 'A cinematic aerial camera moves slowly over a futuristic city at sunrise, with golden light reflecting off skyscrapers.',
    duration: 10,
    thumbnail: openingThumbnail,
    video: openingVideo,
  },
  forest: {
    shot_name: 'Forest Creek',
    project_name: 'Project Horizon',
    prompt_text: 'The camera glides low along a forest creek, following sunlight as it shimmers on the water between moss-covered rocks.',
    duration: 5,
    thumbnail: forestThumbnail,
    video: forestVideo,
  },
  city: {
    shot_name: 'City Street — Night',
    project_name: 'Project Aurora',
    prompt_text: 'Track slowly down a rain-soaked city street at night, with magenta and cyan signs reflected in the pavement.',
    duration: 5,
    thumbnail: cityThumbnail,
    video: cityVideo,
  },
}

interface SampleTake {
  shot: keyof typeof shots
  review: ReviewGeneration['review_status']
  title?: string
  comments?: string
}

const takes: readonly SampleTake[] = [
  { shot: 'aerial', review: 'unreviewed' },
  { shot: 'forest', review: 'unreviewed' },
  { shot: 'city', review: 'unreviewed' },
  { shot: 'aerial', review: 'approved', title: 'Skyline Reveal', comments: 'The framing and pacing work well for the opening.' },
  { shot: 'forest', review: 'approved', title: 'Creek Establishing' },
  { shot: 'city', review: 'approved', title: 'Neon Reflections' },
  { shot: 'aerial', review: 'approved', title: 'Opening Aerial — Take 2' },
  { shot: 'forest', review: 'approved', title: 'Water Detail' },
  { shot: 'city', review: 'rejected', title: 'City Street — Take 1', comments: 'Slow down the camera move and keep the pedestrian in frame.' },
  { shot: 'aerial', review: 'rejected', title: 'Skyline — First Pass' },
]

export const sampleReviews: readonly ReviewGeneration[] = takes.map(({ shot, review, title, comments }, index) => ({
  ...shots[shot],
  generation_id: '550e8400-e29b-41d4-a716-' + String(446655440000 + index),
  shot_name: title ?? shots[shot].shot_name,
  status: 'completed',
  review_status: review,
  review_comments: comments ?? null,
  ratio: '1280:720',
  created_at: new Date(Date.UTC(2026, 10, 20, 15 - index, 24)).toISOString(),
}))
