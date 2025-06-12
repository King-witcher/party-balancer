import { createContext, useContext, type ReactNode } from 'react'
import type { Team } from '../hooks/use-balancer'
import { useLocalStorage } from '../hooks/use-local-storage'

export type Player = {
  name: string
  k: number
  score: number
}

const INITIAL_K_FACTOR = 150 // K-factor for Elo rating
const FINAL_K_FACTOR = 32 // Final K-factor for Elo rating

type PlayersData = {
  players: Record<string, Player>
  addPlayer: (name: string) => void
  removePlayer: (name: string) => void
  getList: () => string
  odds: (winner: Team, loser: Team) => number
  computeResult: (winners: Team, losers: Team) => void
  resetPlayer: (playerName: string) => void
}

interface Props {
  children?: ReactNode
}

const PlayersContext = createContext<PlayersData>({} as PlayersData)

export function PlayersProvider({ children }: Props) {
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
      let line = `${prev}\n#${index + 1}: ${current.name} - ${Math.round(current.score)}`
      if (current.k > 100) line += ' (?)'
      return line
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

  return (
    <PlayersContext.Provider
      value={{
        players,
        addPlayer,
        removePlayer,
        getList,
        odds,
        computeResult,
        resetPlayer,
      }}
    >
      {children}
    </PlayersContext.Provider>
  )
}

export const usePlayers = () => useContext(PlayersContext)
