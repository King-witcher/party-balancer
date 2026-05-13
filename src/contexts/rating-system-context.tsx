import {
  DynamicKRating,
  DynamicKSystem,
} from '@/lib/rating-system/dynamic-k-elo-system'
import { IRatingSystem } from '@/lib/rating-system/i-rating-system'
import { createContext, use } from 'react'

export const RatingSystemContext = createContext<IRatingSystem<DynamicKRating>>(
  new DynamicKSystem({
    initialK: 100,
    initialPower: 1500,
    kDecayFactor: 0.11,
    leastKValue: 40,
    kThreshold: 45,
  })
)

export function useRatingSystem() {
  return use(RatingSystemContext)
}
