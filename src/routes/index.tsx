import { createFileRoute } from '@tanstack/react-router'
import { PlayersPanel } from '../components/panels/players'
import { SimulatorPanel } from '../components/panels/simulator/simulator'
import { BalancePanel } from '../components/panels/balance'
import { useMatchBalancer } from '@/hooks/use-balancer'
import { usePlayers } from '@/contexts/players-context'
import { useState } from 'react'
import { InspectorPanel } from '@/components/panels/inspector'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { blue, red, isFull, setPlayer, hardBalance, softBalance, shuffle } =
    useMatchBalancer()
  const { playersMap: players } = usePlayers()
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const selectedPlayers = [...blue, ...red].filter((p) => p !== null)

  function handleDropOnSidebar(
    _playerName: string,
    sourceTeam: 'blue' | 'red',
    sourceIndex: number
  ) {
    setPlayer(sourceTeam, sourceIndex, null)
  }

  return (
    <div className="w-full h-dvh p-4 flex gap-4">
      {/* Players list */}
      <div className="self-stretch shrink-0">
        <PlayersPanel
          players={players}
          selectedPlayers={selectedPlayers}
          onDropFromTeam={handleDropOnSidebar}
          onSelectPlayer={(playerId) => setSelectedPlayerId(playerId)}
        />
      </div>

      {/* Center container */}
      <div className="flex flex-1 justify-center items-center">
        <div className="flex-col gap-4">
          <SimulatorPanel
            red={red}
            blue={blue}
            selectedPlayers={selectedPlayers}
            setPlayer={setPlayer}
            shuffle={shuffle}
            onSelectPlayer={setSelectedPlayerId}
          />

          <BalancePanel
            blue={blue}
            red={red}
            softBalance={softBalance}
            hardBalance={hardBalance}
            isFull={isFull}
          />
        </div>
      </div>

      <div className="self-stretch shrink-0">
        <InspectorPanel
          selectedPlayerId={selectedPlayerId}
          className="h-full"
        />
      </div>
    </div>
  )
}
