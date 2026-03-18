import { Combobox } from '@/components/ui/combobox'
import { usePlayerStore } from '@/contexts/player-store/player-store-context'
import { useRatingSystem } from '@/contexts/rating-system-context'
import { Team } from '@/hooks/use-balancer'
import { useMemo } from 'react'

function getScoreColor(score: number): string {
  if (score > 1700) return 'text-red-500'
  if (score > 1650) return 'text-orange-400'
  if (score > 1600) return 'text-yellow-400'
  if (score < 1400) return 'text-amber-900'
  return 'text-foreground/80'
}

interface Props {
  teamPlayers: Team
  team: 'blue' | 'red'
  selectedPlayers: string[]
  onSelectPlayer: (playerId: string) => void
  setPlayer: (
    team: 'blue' | 'red',
    index: number,
    playerName: string | null
  ) => void
}

export function SimulatorTeam({
  teamPlayers,
  team,
  selectedPlayers,
  onSelectPlayer,
  setPlayer,
}: Props) {
  const playerStore = usePlayerStore()
  const ratingSystem = useRatingSystem()

  const initialRating = useMemo(() => {
    return ratingSystem.getInitialRating()
  }, [])

  function getDropHandler(
    currentPlayer: string | null,
    currentTeam: 'blue' | 'red',
    currentIndex: number
  ) {
    return (e: React.DragEvent<HTMLButtonElement>) => {
      const droppedPlayer = e.dataTransfer.getData('player')
      const droppedTeam = e.dataTransfer.getData('team')
      const droppedIndex = Number(e.dataTransfer.getData('index'))

      setPlayer(currentTeam, currentIndex, droppedPlayer || null)

      // Only swap back if the source was a team slot, not the sidebar
      if (droppedTeam === 'blue' || droppedTeam === 'red') {
        setPlayer(droppedTeam, droppedIndex, currentPlayer || null)
      }
    }
  }

  function handleChangeSelect(
    team: 'blue' | 'red',
    playerIndex: number,
    playerName: string | null
  ) {
    setPlayer(team, playerIndex, playerName)
  }

  function handleClickPlayer(playerName: string | null) {
    if (playerName) {
      onSelectPlayer(playerName)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {teamPlayers.map((playerName, index) => {
        const availablePlayerNames = playerStore.playersList
          .filter(
            (player) =>
              playerName === player.name ||
              !selectedPlayers.includes(player.name)
          )
          .map((p) => p.name)

        const currentPlayer = playerName
          ? (playerStore.playersMap[playerName] ?? null)
          : null

        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: Does not change order
            key={`${team}-${index}`}
            data-team={team}
            className="flex gap-2 items-center data-[team=red]:flex-row-reverse"
          >
            <Combobox
              options={availablePlayerNames.map((player) => ({
                id: player,
                label: player,
              }))}
              value={playerName || ''}
              onCreateOption={(name) => {
                playerStore.create({
                  name,
                  score: initialRating.power,
                  k: initialRating.kFactor,
                })
                setPlayer(team, index, name)
              }}
              buttonProps={{
                draggable: true,
                onDragStart: (e) => {
                  e.dataTransfer.setData('player', playerName || '')
                  e.dataTransfer.setData('team', team)
                  e.dataTransfer.setData('index', index.toString())
                },
                onDragOver: (e) => e.preventDefault(),
                onDrop: getDropHandler(playerName || null, team, index),
                onClick: () => handleClickPlayer(playerName),
              }}
              onChange={(value) => handleChangeSelect(team, index, value)}
            />
            <span
              className={`w-[40px] font-semibold text-end ${currentPlayer ? getScoreColor(currentPlayer.score) : ''}`}
            >
              {currentPlayer ? Math.round(currentPlayer.score) : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}
