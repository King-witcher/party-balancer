import { createFileRoute } from '@tanstack/react-router'
import { PlayersPanel } from '../components/panels/players'
import { SimulatorPanel } from '../components/panels/simulator/simulator'
import { BalancePanel } from '../components/panels/balance'
import { useMatchBalancer } from '@/hooks/use-balancer'
import { useState } from 'react'
import { InspectorPanel } from '@/components/panels/inspector'
import { JsonSerializer } from '@/lib/serialization/json-serializer'
import { VersionedSerializer } from '@/lib/serialization/versioned-serializer'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

const ioSerializer = new VersionedSerializer(
  new JsonSerializer({
    prettyPrint: true,
  })
)

function RouteComponent() {
  const { blue, red, isFull, setPlayer, hardBalance, softBalance, shuffle } =
    useMatchBalancer()
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
    <div className="w-full h-dvh p-4 flex gap-4 bg-background text-foreground">
      {/* Players list */}
      <div className="self-stretch shrink-0">
        <PlayersPanel
          selectedPlayers={selectedPlayers}
          onDropFromTeam={handleDropOnSidebar}
          onSelectPlayer={(playerId) => setSelectedPlayerId(playerId)}
          serializer={ioSerializer}
        />
      </div>

      {/* Center container */}
      <div className="flex flex-1 justify-center items-center">
        <div className="flex flex-col gap-4">
          <BalancePanel
            blue={blue}
            red={red}
            softBalance={softBalance}
            hardBalance={hardBalance}
            isFull={isFull}
          />

          <SimulatorPanel
            red={red}
            blue={blue}
            selectedPlayers={selectedPlayers}
            setPlayer={setPlayer}
            shuffle={shuffle}
            onSelectPlayer={setSelectedPlayerId}
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
