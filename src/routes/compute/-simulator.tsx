import { Button } from '@/components/ui/button'
import { usePlayers } from '@/contexts/players-context'
import { Team } from '@/hooks/use-balancer'
import { Crosshair, Flame, ShieldPlus, Swords, TreePine } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SimulatorTeam } from './-simulator-team'

export const ROLES = [
  { name: 'Top', icon: Swords },
  { name: 'Jungle', icon: TreePine },
  { name: 'Mid', icon: Flame },
  { name: 'ADC', icon: Crosshair },
  { name: 'Support', icon: ShieldPlus },
]

type Props = {
  blue: Team
  red: Team
  selectedPlayers: string[]
  setPlayer: (
    team: 'blue' | 'red',
    index: number,
    playerName: string | null
  ) => void
  shuffle: () => void
  onSelectPlayer: (playerId: string) => void
}

export function Simulator({
  red,
  blue,
  selectedPlayers,
  setPlayer,
  shuffle,
  onSelectPlayer,
}: Props) {
  const [buttonsDisabled, setButtonsDisabled] = useState(false)
  const [playerToCreate, setPlayerToCreate] = useState('')

  const { playersMap: players, computeResult, addPlayer } = usePlayers()

  const hasPlayers = selectedPlayers.length >= 2

  function handleAddPlayer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    addPlayer(playerToCreate)
    setPlayerToCreate('')
  }

  function handleComputeResult(winners: Team, losers: Team) {
    setButtonsDisabled(true)
    computeResult(winners, losers)
    toast.success('Match result computed successfully!')
    setTimeout(() => {
      setButtonsDisabled(false)
    }, 1000)
  }

  return (
    <div className="rounded-xl flex flex-col gap-6 p-6 w-fit border border-gray-200 bg-white shadow-md">
      {/* Add player form + shuffle */}
      {/* <div className="flex gap-3 items-center">
        <form onSubmit={handleAddPlayer} className="flex gap-3 flex-1">
          <Input
            type="text"
            placeholder="Type a new player name"
            value={playerToCreate}
            onChange={(e) => setPlayerToCreate(e.target.value)}
            required
          />
          <Button type="submit">
            <Plus /> Adicionar
          </Button>
        </form>
        <Button
          variant="outline"
          onClick={shuffle}
          disabled={!hasPlayers}
          title="Embaralhar jogadores entre os times"
        >
          <Shuffle /> Embaralhar
        </Button>
      </div> */}

      {/* Teams grid: Blue | Roles | Red */}
      <div className="flex gap-4 justify-center items-start">
        {/* Blue team header + players */}
        <div className="flex flex-col items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Ordem
          </h3>
          <SimulatorTeam
            allPlayers={players}
            selectedPlayers={selectedPlayers}
            team="blue"
            setPlayer={setPlayer}
            teamPlayers={blue}
            onSelectPlayer={onSelectPlayer}
          />
        </div>

        {/* Roles column */}
        <div className="flex flex-col items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Lane
          </h3>
          {ROLES.map((role) => (
            <div
              key={role.name}
              className="h-10 flex items-center justify-center gap-1.5 text-gray-500"
            >
              <role.icon size={18} className="shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wide min-w-[42px] text-center">
                {role.name}
              </span>
            </div>
          ))}
        </div>

        {/* Red team header + players */}
        <div className="flex flex-col items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-red-600">
            Caos
          </h3>
          <SimulatorTeam
            allPlayers={players}
            selectedPlayers={selectedPlayers}
            team="red"
            setPlayer={setPlayer}
            teamPlayers={red}
            onSelectPlayer={onSelectPlayer}
          />
        </div>
      </div>

      {/* Compute victory buttons */}
      <div className="flex gap-4 justify-between">
        <Button
          size="lg"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          onClick={() => handleComputeResult(blue, red)}
          disabled={
            red.some((p) => p === null) ||
            blue.some((p) => p === null) ||
            buttonsDisabled
          }
        >
          Vitória Azul
        </Button>
        <Button
          size="lg"
          className="flex-1 bg-red-600 hover:bg-red-700"
          onClick={() => handleComputeResult(red, blue)}
          disabled={
            red.some((p) => p === null) ||
            blue.some((p) => p === null) ||
            buttonsDisabled
          }
        >
          Vitória Vermelha
        </Button>
      </div>
    </div>
  )
}
