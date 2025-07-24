import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePlayers } from '@/contexts/players-context'
import { Team } from '@/hooks/use-balancer'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { SimulatorTeam } from './-simulator-team'

type Props = {
  blue: Team
  red: Team
  setPlayer: (
    team: 'blue' | 'red',
    index: number,
    playerName: string | null
  ) => void
}

export function Simulator({ red, blue, setPlayer }: Props) {
  const [buttonsDisabled, setButtonsDisabled] = useState(false)
  const [playerToCreate, setPlayerToCreate] = useState('')

  const { players, computeResult, addPlayer } = usePlayers()

  const selectedPlayers = [...blue, ...red].filter((p) => p !== null)

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
    <div className="shadow-sm rounded-lg flex flex-col gap-6 p-4 w-fit border-gray-200 border bg-white">
      <form onSubmit={handleAddPlayer} className="flex gap-3 justify-end">
        <Input
          type="text"
          placeholder="Type a new player name"
          value={playerToCreate}
          onChange={(e) => setPlayerToCreate(e.target.value)}
          required
        />
        <Button type="submit">
          <Plus /> Add
        </Button>
      </form>
      <div className={twMerge('flex gap-8 justify-center items-center')}>
        <SimulatorTeam
          allPlayers={players}
          selectedPlayers={selectedPlayers}
          team="blue"
          setPlayer={setPlayer}
          teamPlayers={blue}
        />

        <X size="50" />

        <SimulatorTeam
          allPlayers={players}
          selectedPlayers={selectedPlayers}
          team="red"
          setPlayer={setPlayer}
          teamPlayers={red}
        />
      </div>

      <div className="flex gap-2 justify-between">
        <Button
          size="lg"
          onClick={() => handleComputeResult(blue, red)}
          disabled={
            red.some((p) => p === null) ||
            blue.some((p) => p === null) ||
            buttonsDisabled
          }
        >
          Compute Victory
        </Button>
        <Button
          size="lg"
          onClick={() => handleComputeResult(red, blue)}
          disabled={
            red.some((p) => p === null) ||
            blue.some((p) => p === null) ||
            buttonsDisabled
          }
        >
          Compute Victory
        </Button>
      </div>
    </div>
  )
}
