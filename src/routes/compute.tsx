import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMatchBalancer, type Team } from '../hooks/use-balancer'
import { usePlayers } from '../contexts/players-context'
import { WinProbabilities } from '../components/win-probabilities'
import { Combobox } from '@/components/ui/combobox'
import { PageContainer } from '@/components/page-container'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'

export const Route = createFileRoute('/compute')({
  component: RouteComponent,
})

function RouteComponent() {
  const { blue, red, isFull, setPlayer, hardBalance, softBalance } =
    useMatchBalancer()

  const [buttonsDisabled, setButtonsDisabled] = useState(false)

  const [playerToCreate, setPlayerToCreate] = useState('')

  const { players, computeResult, addPlayer } = usePlayers()

  const selectedPlayers = [...blue, ...red].filter((p) => p !== null)

  function handleChangeSelect(
    team: 'blue' | 'red',
    playerIndex: number,
    playerName: string | null
  ) {
    setPlayer(team, playerIndex, playerName)
  }

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
    <PageContainer className="items-center">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">
        Match Simulator
      </h1>

      <div>
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
            <div className="flex flex-col gap-3">
              {blue.map((bluePlayer, index) => {
                const availablePlayers = Object.values(players).filter(
                  (player) =>
                    bluePlayer === player.name ||
                    !selectedPlayers.includes(player.name)
                )

                const currentPlayer =
                  Object.values(players).find((p) => p.name === bluePlayer) ||
                  null

                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Does not change order
                  <div
                    key={`blue-${index}`}
                    className="flex gap-2 items-center"
                  >
                    <Combobox
                      options={availablePlayers.map((player) => ({
                        id: player.name,
                        label: player.name,
                      }))}
                      value={bluePlayer || ''}
                      onChange={(value) =>
                        handleChangeSelect('blue', index, value)
                      }
                    />
                    <span className="w-[40px] font-semibold">
                      {Math.round(currentPlayer?.score || 0) || ''}
                    </span>
                  </div>
                )
              })}
            </div>
            <X size="50" />

            <div className="flex flex-col gap-3">
              {red.map((bluePlayer, index) => {
                const availablePlayers = Object.values(players).filter(
                  (player) =>
                    bluePlayer === player.name ||
                    !selectedPlayers.includes(player.name)
                )

                const currentPlayer =
                  Object.values(players).find((p) => p.name === bluePlayer) ||
                  null

                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Does not change order
                  <div
                    key={`blue-${index}`}
                    className="flex gap-2 items-center"
                  >
                    <span className="w-[40px] font-semibold text-end">
                      {Math.round(currentPlayer?.score || 0) || ''}
                    </span>
                    <Combobox
                      options={availablePlayers.map((player) => ({
                        id: player.name,
                        label: player.name,
                      }))}
                      value={bluePlayer || ''}
                      onChange={(value) =>
                        handleChangeSelect('red', index, value)
                      }
                    />
                  </div>
                )
              })}
            </div>
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

        <WinProbabilities
          blue={blue}
          red={red}
          softBalance={softBalance}
          hardBalance={hardBalance}
          isFull={isFull}
        />
      </div>
    </PageContainer>
  )
}
