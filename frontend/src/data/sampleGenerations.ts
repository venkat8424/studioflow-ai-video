import productThumbnail from '../assets/library/product-closeup.jpg'
import aerialThumbnail from '../assets/library/opening-aerial.jpg'
import neonThumbnail from '../assets/library/city-street.jpg'
import creekThumbnail from '../assets/library/forest-creek.jpg'
import type { LibraryGeneration } from '../types/generation'

export const sampleGenerations: readonly LibraryGeneration[] = [
  {
    generation_id: 'sample-product',
    shot_name: 'Product Close-up',
    project_name: 'Project Aurora',
    status: 'completed',
    review_status: 'unreviewed',
    created_at: '2026-11-21T15:00:00Z',
    duration: 5,
    thumbnail: productThumbnail,
  },
  {
    generation_id: 'sample-aerial',
    shot_name: 'Opening Aerial',
    project_name: 'Project Aurora',
    status: 'completed',
    review_status: 'approved',
    created_at: '2026-11-20T17:00:00Z',
    duration: 10,
    thumbnail: aerialThumbnail,
  },
  {
    generation_id: 'sample-mountain',
    shot_name: 'Mountain Establishing',
    project_name: 'Project Horizon',
    status: 'processing',
    review_status: 'unreviewed',
    created_at: '2026-11-20T14:00:00Z',
    duration: 5,
  },
  {
    generation_id: 'sample-astronaut',
    shot_name: 'Astronaut in Space',
    project_name: 'Project Odyssey',
    status: 'failed',
    review_status: 'unreviewed',
    created_at: '2026-11-19T18:00:00Z',
    duration: 10,
  },
  {
    generation_id: 'sample-neon',
    shot_name: 'City Street — Night',
    project_name: 'Project Aurora',
    status: 'completed',
    review_status: 'rejected',
    created_at: '2026-11-19T15:00:00Z',
    duration: 5,
    thumbnail: neonThumbnail,
  },
  {
    generation_id: 'sample-creek',
    shot_name: 'Forest Creek',
    project_name: 'Project Horizon',
    status: 'completed',
    review_status: 'unreviewed',
    created_at: '2026-11-18T15:00:00Z',
    duration: 5,
    thumbnail: creekThumbnail,
  },
]
