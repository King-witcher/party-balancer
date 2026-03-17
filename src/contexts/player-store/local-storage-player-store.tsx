import { ISerializer } from '@/lib/serialization'
import { PlayerRow } from '@/types/player'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { PlayerStoreContext } from './player-store-context'
import z from 'zod'

export type PlayersMap = Record<string, PlayerRow>

type Props = {
  serializer: ISerializer<PlayerRow[]>
  children?: ReactNode
}

const PLAYERS_KEY = 'players'

const playerSchema = z.object({
  name: z.string(),
  k: z.number(),
  score: z.number(),
})

const schema = z.array(playerSchema)

export function LocalStoragePlayerStoreProvider({
  children,
  serializer,
}: Props) {
  const [playersMap, setPlayersMap] = useState<PlayersMap>(() => {
    try {
      const stored = localStorage.getItem(PLAYERS_KEY)
      const parsed = stored ? serializer.deserialize(stored) : []
      const validated = schema.parse(parsed)
      return Object.fromEntries(
        validated.map((player) => [player.name, player])
      )
    } catch (e) {
      console.error(e)
      alert(
        'Failed to load players from localStorage. Starting with an empty list.'
      )
      localStorage.removeItem(PLAYERS_KEY)
      return {}
    }
  })

  const playersList = useMemo(() => Object.values(playersMap), [playersMap])

  useEffect(
    function syncToLocalStorage() {
      localStorage.setItem(PLAYERS_KEY, serializer.serialize(playersList))
    },
    [playersList]
  )

  async function create(row: PlayerRow) {
    if (playersMap[row.name]) {
      console.log(`Player with name "${row.name}" already exists.`)
      return
    }

    setPlayersMap((prev) => ({
      ...prev,
      [row.name]: row,
    }))
  }

  async function update(name: string, newData: PlayerRow) {
    if (name === newData.name) {
      setPlayersMap((prev) => ({
        ...prev,
        [name]: newData,
      }))
    }

    if (name !== newData.name) {
      setPlayersMap((prev) => {
        const { [name]: _, ...withoutOld } = prev
        return {
          ...withoutOld,
          [newData.name]: newData,
        }
      })
    }
  }

  async function deletePlayer(name: string) {
    setPlayersMap((prev) => {
      const { [name]: _, ...rest } = prev
      return rest
    })
  }

  async function importPlayers(players: PlayerRow[]) {
    const validated = z.array(playerSchema).parse(players)
    const newMap = Object.fromEntries(
      validated.map((player) => [player.name, player])
    )
    setPlayersMap(newMap)
  }

  return (
    <PlayerStoreContext
      value={{
        playersMap,
        playersList,
        create,
        update,
        delete: deletePlayer,
        import: importPlayers,
      }}
    >
      {children}
    </PlayerStoreContext>
  )
}
