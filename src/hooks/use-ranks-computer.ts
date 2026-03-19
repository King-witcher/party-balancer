import { usePlayerStore } from '@/contexts/player-store/player-store-context'
import { useRatingSystem } from '@/contexts/rating-system-context'
import { DynamicKRating } from '@/lib/rating-system/dynamic-k-elo-system'
import { Team } from './use-balancer'
import { toast } from 'sonner'

export function useComputeResult() {
  const playerStore = usePlayerStore()
  const ratingSystem = useRatingSystem()

  return async function computeResult(winners: Team, losers: Team) {
    function getRatings(team: Team): DynamicKRating[] {
      const ratings = team
        .filter((id) => id !== null)
        .map((id): DynamicKRating => {
          const player = playerStore.playersMap[id]
          return {
            power: player.score,
            kFactor: player.k,
          }
        })

      if (ratings.length !== 5) {
        throw new Error(
          'Each team must have exactly 5 players to compute results.'
        )
      }
      return ratings
    }

    const winnerPlayers = getRatings(winners)
    const loserPlayers = getRatings(losers)

    const [newWinners, newLosers] = ratingSystem.computeTeams(
      winnerPlayers,
      loserPlayers,
      1
    )

    await Promise.all([
      ...winners.map((id, index) => {
        if (id === null) return Promise.resolve()
        const player = playerStore.playersMap[id]
        const newRating = newWinners[index]
        return playerStore.update(id, {
          ...player,
          score: newRating.power,
          k: newRating.kFactor,
          date: new Date(),
        })
      }),

      ...losers.map((id, index) => {
        if (id === null) return Promise.resolve()
        const player = playerStore.playersMap[id]
        const newRating = newLosers[index]
        return playerStore.update(id, {
          ...player,
          score: newRating.power,
          k: newRating.kFactor,
          date: new Date(),
        })
      }),
    ])

    toast.success('Match result computed successfully!')
  }
}
