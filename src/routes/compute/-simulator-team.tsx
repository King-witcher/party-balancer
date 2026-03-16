import { Combobox } from '@/components/ui/combobox'
import { PlayersMap } from '@/contexts/players-context'
import { Team } from '@/hooks/use-balancer'

interface Props {
  teamPlayers: Team
  allPlayers: PlayersMap
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
  allPlayers,
  selectedPlayers,
  onSelectPlayer,
  setPlayer,
}: Props) {
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
                onDragOver: (e) => e.preventDefault(),
                onDrop: getDropHandler(playerName || null, team, index),
                onClick: () => handleClickPlayer(playerName),
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
