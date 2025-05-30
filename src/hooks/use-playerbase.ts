import type { Team } from '../routes/compute'
import { useLocalStorage } from './use-local-storage'

export type Player = {
  name: string
  k: number
  score: number
}

const INITIAL_K_FACTOR = 150 // K-factor for Elo rating
const FINAL_K_FACTOR = 40 // Final K-factor for Elo rating

export function usePlayerbase() {
  const [players, setPlayers] = useLocalStorage<Record<string, Player>>(
    'playerbase',
    {}
  )

  function addPlayer(name: string) {
    if (players[name]) {
      console.log(`Player with name "${name}" already exists.`)
      return
    }

    setPlayers((prev) => ({
      ...prev,
      [name]: {
        name,
        k: INITIAL_K_FACTOR,
        score: 1500,
      },
    }))
  }

  function removePlayer(name: string) {
    setPlayers((prev) => {
      const { [name]: _, ...rest } = prev
      return rest
    })
  }

  function getList(): string {
    const unsorted = Object.values(players)
    const sorted = unsorted.sort((a, b) => b.score - a.score)
    return sorted.reduce((prev, current, index) => {
      return `${prev}\n#${index + 1}: ${current.name} - ${Math.round(current.score)}`
    }, '')
  }

  function odds(winner: Team, loser: Team): number {
    const winnerAverage =
      winner.reduce((sum, playerName) => {
        if (playerName === null) return sum
        const player = players[playerName]
        return sum + player.score
      }, 0) / 5

    const loserAverage =
      loser.reduce((sum, playerName) => {
        if (playerName === null) return sum
        const player = players[playerName]
        return sum + player.score
      }, 0) / 5

    const odds = 1 / (1 + 10 ** ((loserAverage - winnerAverage) / 400))
    return odds
  }

  function computeResult(winners: Team, losers: Team) {
    if (
      winners.find((playerName) => playerName === null) ||
      losers.find((playerName) => playerName === null)
    )
      throw new Error('Both teams must have 5 players each.')

    const expectedWinners = odds(winners, losers)
    const delta = 1 - expectedWinners

    for (const playerName of winners) {
      const player = players[playerName!]
      player.score += player.k * delta
      player.k = FINAL_K_FACTOR * 0.2 + player.k * 0.8 // Adjust K-factor over time
    }

    for (const playerName of losers) {
      const player = players[playerName!]
      player.score -= player.k * delta
      player.k = FINAL_K_FACTOR * 0.2 + player.k * 0.8 // Adjust K-factor over time
    }

    setPlayers({ ...players })
  }

  function resetPlayer(playerName: string) {
    setPlayers((prev) => ({
      ...prev,
      [playerName]: {
        ...prev[playerName],
        score: 1500,
        k: INITIAL_K_FACTOR,
      },
    }))
  }

  function resetAllPlayers() {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 1500 })))
  }

  return {
    players,
    addPlayer,
    removePlayer,
    computeResult,
    resetPlayer,
    odds,
    resetAllPlayers,
    getList,
  }
}
