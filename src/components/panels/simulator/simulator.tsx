import { Team } from '@/hooks/use-balancer'
import { Crosshair, Flame, ShieldPlus, Swords, TreePine } from 'lucide-react'
import { SimulatorTeam } from './team'
import { Panel } from '@/components/panel'

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

export function SimulatorPanel({
  red,
  blue,
  selectedPlayers,
  setPlayer,
  onSelectPlayer,
}: Props) {
  return (
    <Panel className="flex flex-col gap-6 p-6 w-fit">
      {/* Teams grid: Blue | Roles | Red */}
      <div className="flex gap-4 justify-center items-start">
        {/* Blue team header + players */}
        <div className="flex flex-col items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">
            Ordem
          </h3>
          <SimulatorTeam
            selectedPlayers={selectedPlayers}
            team="blue"
            setPlayer={setPlayer}
            teamPlayers={blue}
            onSelectPlayer={onSelectPlayer}
          />
        </div>

        {/* Roles column */}
        <div className="flex flex-col items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Lane
          </h3>
          {ROLES.map((role) => (
            <div
              key={role.name}
              className="h-10 flex items-center justify-center gap-1.5 text-muted-foreground"
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
            Caos
          </h3>
          <SimulatorTeam
            selectedPlayers={selectedPlayers}
            team="red"
            setPlayer={setPlayer}
            teamPlayers={red}
            onSelectPlayer={onSelectPlayer}
          />
        </div>
      </div>
    </Panel>
  )
}
