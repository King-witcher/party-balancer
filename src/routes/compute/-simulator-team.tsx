import { Combobox } from '@/components/ui/combobox'
import { PlayerSet } from '@/contexts/players-context'
import { Team } from '@/hooks/use-balancer'

interface Props {
  teamPlayers: Team
  allPlayers: PlayerSet
  team: 'blue' | 'red'
  selectedPlayers: string[]
  setPlayer: (
    team: 'blue' | 'red',
    index: number,
    playerName: string | null
  ) => void
}

export function SimulatorTeam({
  teamPlayers,
  team,
  allPlayers,
  selectedPlayers,
  setPlayer,
}: Props) {
  function getDropHandler(
    currentPlayer: string | null,
    currentTeam: 'blue' | 'red',
    currentIndex: number
  ) {
    return (e: React.DragEvent<HTMLButtonElement>) => {
      const droppedPlayer = e.dataTransfer.getData('player')
      const droppedTeam = e.dataTransfer.getData('team') as 'blue' | 'red'
      const droppedIndex = Number(e.dataTransfer.getData('index'))

      setPlayer(currentTeam, currentIndex, droppedPlayer || null)
      setPlayer(droppedTeam, droppedIndex, currentPlayer || null)
    }
  }

  function handleChangeSelect(
    team: 'blue' | 'red',
    playerIndex: number,
    playerName: string | null
  ) {
    setPlayer(team, playerIndex, playerName)
  }

  return (
    <div className="flex flex-col gap-3">
      {teamPlayers.map((playerName, index) => {
        const availablePlayerNames = Object.keys(allPlayers).filter(
          (name) => playerName === name || !selectedPlayers.includes(name)
        )

        const currentPlayer =
          Object.values(allPlayers).find((p) => p.name === playerName) || null

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
              buttonProps={{
                draggable: true,
                onDragStart: (e) => {
                  e.dataTransfer.setData('player', playerName || '')
                  e.dataTransfer.setData('team', team)
                  e.dataTransfer.setData('index', index.toString())
                },
                onDrop: getDropHandler(playerName || null, team, index),
              }}
              onChange={(value) => handleChangeSelect(team, index, value)}
            />
            <span className="w-[40px] font-semibold text-end">
              {Math.round(currentPlayer?.score || 0) || ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}
