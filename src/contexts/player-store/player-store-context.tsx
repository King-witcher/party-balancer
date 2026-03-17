import { PlayerRow } from '@/types/player'
import { createContext, use } from 'react'

export type PlayersMap = Record<string, PlayerRow>

export type PlayerRepositoryData = {
  playersMap: PlayersMap
  playersList: PlayerRow[]
  create: (player: PlayerRow) => Promise<void>
  delete: (name: string) => Promise<void>
  update: (name: string, newData: PlayerRow) => Promise<void>
  import: (players: PlayerRow[]) => Promise<void>
}

export const PlayerStoreContext = createContext<PlayerRepositoryData | null>(
  null
)

export function usePlayerStore() {
  const context = use(PlayerStoreContext)
  if (!context) {
    throw new Error('usePlayerStore must be used within a PlayerStoreProvider')
  }
  return context
}
